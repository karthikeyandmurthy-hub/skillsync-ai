/**
 * Purpose: ATS scoring engine integrated with Gemini.
 * Responsibilities: Given a file + role, return a weighted ATS breakdown
 *   and Before/After improvement suggestions. Uses Gemini for real parsing,
 *   with a deterministic mock fallback.
 * Dependencies: types, config, utils/logger
 */

import type { ATSResult, Improvement, Role, ScoreCategory } from "@/types";
import { CATEGORY_LABELS, SCORING_WEIGHTS } from "@/config/scoringWeights";
import { logger } from "@/utils/logger";
import { GEMINI_CONFIG } from "@/config/gemini";

const TAG = "[ATS_ENGINE]";

/**
 * Cheap deterministic hash so the same filename + role yield stable scores.
 * @param input string to hash
 * @returns unsigned 32-bit int
 */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function band(seed: number, min: number, max: number): number {
  return min + (seed % (max - min + 1));
}

/**
 * Helper to convert file to base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Run the mock ATS analysis.
 * @param fileName uploaded resume file name
 * @param role target role definition
 * @returns structured ATSResult
 */
export function analyzeResumeMock(fileName: string, role: Role): ATSResult {
  const seed = hash(`${fileName}::${role.id}`);

  const baseScores: Record<ScoreCategory["key"], number> = {
    skills: band(seed >> 1, 55, 92),
    projects: band(seed >> 3, 50, 90),
    experience: band(seed >> 5, 40, 88),
    education: band(seed >> 7, 70, 98),
    keywords: band(seed >> 9, 45, 90),
    formatting: band(seed >> 11, 60, 95),
  };

  const categories: ScoreCategory[] = (Object.keys(SCORING_WEIGHTS) as ScoreCategory["key"][]).map(
    (key) => ({
      key,
      label: CATEGORY_LABELS[key],
      weight: SCORING_WEIGHTS[key],
      score: baseScores[key],
      notes: notesFor(key, baseScores[key], role),
    }),
  );

  const overall = Math.round(
    categories.reduce((acc, c) => acc + (c.score * c.weight) / 100, 0),
  );

  return {
    overall,
    role,
    categories,
    improvements: improvementsFor(seed, role, baseScores),
  };
}

/**
 * Read a File as plain UTF-8 text.
 */
function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file, "utf-8");
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Run real ATS analysis using Gemini 3.5 Flash (thinking disabled for speed).
 */
export async function analyzeResume(file: File, role: Role): Promise<ATSResult> {
  logger.info(TAG, "analyzeResume starting with Gemini integration", { fileName: file.name, role: role.id });

  try {
    const isTextFile = /\.(txt)$/i.test(file.name) || file.type === "text/plain";
    const isPdfFile = /\.(pdf)$/i.test(file.name) || file.type === "application/pdf";

    const prompt = `
You are an expert ATS (Applicant Tracking System) parser and Professional Recruiting Optimizer.
Your job is to analyze the attached resume for the target role: "${role.label}".

Target Role Details:
- Description: ${role.description}
- Required Skills: ${role.requiredSkills.join(", ")}
- Nice to have skills: ${role.niceToHaveSkills.join(", ")}
- Key Keywords: ${role.keywords.join(", ")}

Evaluate the resume on these six categories (scoring each 0-100):
1. skills (weight: 25%) - How well do their skills align with required & nice-to-have skills for the role?
2. projects (weight: 20%) - Do they show strong project evidence with quantifiable outcomes?
3. experience (weight: 20%) - Is their work experience relevant, detailed, and results-oriented?
4. education (weight: 10%) - Does their academic background support this role?
5. keywords (weight: 15%) - Did they use the key keywords of the role correctly?
6. formatting (weight: 10%) - Is the file structure readable, professional, and scannerable?

Also provide 3-4 specific Improvements:
- Each improvement should show:
  * area (must be exact: Action Verbs, Skills Alignment, Formatting, or Keywords)
  * severity (low, medium, or high)
  * before (a poor example quote from the resume, or draft snippet if not found)
  * after (a rewritten, high-impact version of that snippet demonstrating ATS optimization)
  * rationale (explaining why this rewrite helps the ATS score or recruiter appeal)

Output MUST follow this exact JSON structure:
{
  "overall": <overall score, weighted average of the category scores>,
  "categories": [
    {
      "key": "skills",
      "label": "Skills Alignment",
      "weight": 25,
      "score": <score>,
      "notes": ["<brief note about skills matching>"]
    },
    {
      "key": "projects",
      "label": "Project Evidence",
      "weight": 20,
      "score": <score>,
      "notes": ["<brief note about projects>"]
    },
    {
      "key": "experience",
      "label": "Work Experience",
      "weight": 20,
      "score": <score>,
      "notes": ["<brief note about experience>"]
    },
    {
      "key": "education",
      "label": "Education & Creeds",
      "weight": 10,
      "score": <score>,
      "notes": ["<brief note about education>"]
    },
    {
      "key": "keywords",
      "label": "Keyword Match",
      "weight": 15,
      "score": <score>,
      "notes": ["<brief note about keyword matches>"]
    },
    {
      "key": "formatting",
      "label": "File Formatting",
      "weight": 10,
      "score": <score>,
      "notes": ["<brief note about formatting>"]
    }
  ],
  "improvements": [
    {
      "id": "imp-1",
      "area": "Action Verbs",
      "severity": "medium",
      "before": "...",
      "after": "...",
      "rationale": "..."
    }
  ]
}

Only return the raw JSON object, without markdown formatting blocks.
`;

    // Build content parts: plain text inline for .txt, base64 inlineData for PDF
    let contentParts: object[];
    if (isTextFile) {
      const resumeText = await fileToText(file);
      contentParts = [
        { text: `RESUME CONTENT:\n\n${resumeText}\n\n---\n\n${prompt}` },
      ];
    } else if (isPdfFile) {
      const base64Data = await fileToBase64(file);
      contentParts = [
        { inlineData: { mimeType: "application/pdf", data: base64Data } },
        { text: prompt },
      ];
    } else {
      // Fallback: try sending as text
      const resumeText = await fileToText(file);
      contentParts = [
        { text: `RESUME CONTENT:\n\n${resumeText}\n\n---\n\n${prompt}` },
      ];
    }

    const endpoint = `${GEMINI_CONFIG.API_URL}/${GEMINI_CONFIG.MODEL}:generateContent?key=${GEMINI_CONFIG.API_KEY}`;

    // 45-second timeout to prevent indefinite hanging
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: contentParts }],
          generationConfig: {
            responseMimeType: "application/json",
            // Disable thinking mode for fast responses
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new Error(`Gemini API error status: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!rawText) {
      throw new Error("Empty response received from Gemini API");
    }

    const cleanedText = rawText.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
    const parsedResult = JSON.parse(cleanedText);

    // Keep the requested role details
    parsedResult.role = role;

    logger.info(TAG, "analyzeResume successfully finished with Gemini response");
    return parsedResult as ATSResult;
    
  } catch (error) {
    logger.warn(TAG, "Failed real Gemini resume analysis. Falling back to mock.", error);
    return analyzeResumeMock(file.name, role);
  }
}

function notesFor(
  key: ScoreCategory["key"],
  score: number,
  role: Role,
): string[] {
  if (score >= 85) return [`Strong ${CATEGORY_LABELS[key].toLowerCase()} for ${role.label}.`];
  if (score >= 70) return [`Solid baseline — minor improvements possible.`];
  return [`Below the bar for ${role.label}. Prioritize this section.`];
}

function improvementsFor(
  seed: number,
  role: Role,
  scores: Record<ScoreCategory["key"], number>,
): Improvement[] {
  const items: Improvement[] = [
    {
      id: "verbs",
      area: "Action Verbs",
      severity: scores.experience < 75 ? "high" : "medium",
      before: "Responsible for building data pipelines for the team.",
      after: "Architected and shipped 6 production data pipelines processing 12M events/day.",
      rationale: "Replace passive phrasing with quantified, outcome-driven verbs.",
    },
    {
      id: "skills",
      area: "Skills Alignment",
      severity: scores.skills < 75 ? "high" : "low",
      before: "Familiar with Python and some ML tools.",
      after: `Proficient in ${role.requiredSkills.slice(0, 3).join(", ")} with 2+ years of applied experience.`,
      rationale: `Mirror the language of a ${role.label} job description.`,
    },
    {
      id: "format",
      area: "Formatting",
      severity: scores.formatting < 80 ? "medium" : "low",
      before: "Multi-column layout with embedded tables and graphics.",
      after: "Single-column, ATS-safe layout with standard section headings.",
      rationale: "Most ATS parsers strip tables and columns, losing content.",
    },
    {
      id: "keywords",
      area: "Keywords",
      severity: scores.keywords < 70 ? "high" : "low",
      before: "Built a few ML side projects.",
      after: `Delivered ${role.keywords[0]} project using ${role.requiredSkills[0]} and ${role.requiredSkills[1]}.`,
      rationale: "Targeted keywords lift recruiter-search recall.",
    },
  ];
  return items.filter((_, i) => (seed >> i) % 5 !== 0 || i < 2);
}
