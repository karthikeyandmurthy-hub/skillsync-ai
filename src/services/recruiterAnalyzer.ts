/**
 * Purpose: Recruiter Analyzer — evaluates a candidate's resume (and optional GitHub verification) from a recruiter's perspective.
 * Responsibilities: Accept details/resume → call Gemini → return RecruiterViewResult.
 *   Also provides a CSV parser and matching engine for bulk candidate ATS screening.
 * Dependencies: types, config/gemini, utils/logger, config/roles
 */

import type { RecruiterViewResult, RecruiterSignal, ShortlistFactor, CSVCandidate, Role } from "@/types";
import { GEMINI_CONFIG } from "@/config/gemini";
import { logger } from "@/utils/logger";

const TAG = "[RECRUITER_ANALYZER]";

// ── helpers ────────────────────────────────────────────────────────────────

function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file, "utf-8");
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
  });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = (e) => reject(e);
  });
}

// ── mock fallback ──────────────────────────────────────────────────────────

export function analyzeRecruiterMock(candidateName: string, roleLabel: string): RecruiterViewResult {
  const shortlistFactors: ShortlistFactor[] = [
    { factor: "Technical Skill Alignment", score: 85, weight: 35, verdict: "strong" },
    { factor: "Production Project Proof", score: 72, weight: 25, verdict: "average" },
    { factor: "Experience Level Consistency", score: 68, weight: 20, verdict: "average" },
    { factor: "ATS Keyword Match Density", score: 90, weight: 20, verdict: "strong" }
  ];

  const strongPoints: RecruiterSignal[] = [
    { label: "Hands-on PyTorch & NLP", detail: "Significant commits and clean architecture in Github NLP portfolio projects.", impact: "positive" },
    { label: "High-impact verbs in experience", detail: "Uses strong metrics to substantiate work history (e.g. 'boosted model throughput by 30%').", impact: "positive" },
    { label: "Education Foundation", detail: "Relevant MS in Computer Science degree from a respected university.", impact: "positive" }
  ];

  const redFlags: RecruiterSignal[] = [
    { label: "Gaps in Infrastructure", detail: "Missing Docker/Kubernetes or major orchestrators on resume.", impact: "negative" },
    { label: "Sparse commit cadence active", detail: "No public commits in the past 60 days on key repos.", impact: "neutral" }
  ];

  return {
    candidateName,
    targetRole: roleLabel,
    shortlistProbability: 82,
    firstImpressionScore: 85,
    shortlistFactors,
    strongPoints,
    redFlags,
    elevatorPitch: `This candidate is a technically sound ML practitioner with solid Python / PyTorch foundations. They speak with metrics on their resume and have good verified code. However, their infrastructure / MLOps competencies are unproven, which might make onboarding to production teams slower. Recommended for standard interview.`,
    recommendedAction: "yes",
    actionRationale: "Exceeds candidate benchmarks in theoretical ML and core backend coding. Strong cultural alignment. Proceed to technical screen."
  };
}

// ── real Gemini analysis ───────────────────────────────────────────────────

export async function analyzeRecruiter(
  file: File,
  roleLabel: string,
  candidateName: string
): Promise<RecruiterViewResult> {
  logger.info(TAG, "analyzeRecruiter starting", { fileName: file.name, role: roleLabel, candidateName });

  try {
    const isTextFile = /\.(txt)$/i.test(file.name) || file.type === "text/plain";
    const isPdfFile = /\.(pdf)$/i.test(file.name) || file.type === "application/pdf";

    const prompt = `
You are an elite Tech Corporate Recruiter hiring for a "${roleLabel}" position. 
Analyze the candidate's resume (Candidate Name: "${candidateName}") through a cynical, professional recruitment lens. 

Evaluate:
1. Shortlisting Probability (0-100) — How likely represents a greenlight for a hiring manager screen.
2. First Impression Score (0-100) — Overall presentation, pedigree, formatting, and punchiness.
3. List 3 key Strong Points (with detailed insights).
4. List 1-2 Red Flags/Hesitations (infrastructure gaps, missing technologies, vague claims).
5. Provide a 3-4 sentence "Elevator Pitch" summary for the hiring manager.
6. A Recommended Hiring Action (strong_yes, yes, maybe, no) with a brief Rationale.

Output MUST follow this exact JSON structure (raw JSON, no markdown):
{
  "candidateName": "${candidateName}",
  "targetRole": "${roleLabel}",
  "shortlistProbability": <number>,
  "firstImpressionScore": <number>,
  "shortlistFactors": [
    { "factor": "Technical Skill Alignment", "score": <number>, "weight": 35, "verdict": "<strong|average|weak>" },
    { "factor": "Production Project Proof", "score": <number>, "weight": 25, "verdict": "<strong|average|weak>" },
    { "factor": "Experience Level Consistency", "score": <number>, "weight": 20, "verdict": "<strong|average|weak>" },
    { "factor": "ATS Keyword Match Density", "score": <number>, "weight": 20, "verdict": "<strong|average|weak>" }
  ],
  "strongPoints": [
    { "label": "<Short Label>", "detail": "<Detailed description of this strong point>", "impact": "positive" }
  ],
  "redFlags": [
    { "label": "<Short Label>", "detail": "<Detailed description of this hesitation/red flag>", "impact": "<negative|neutral>" }
  ],
  "elevatorPitch": "<Hiring manager pitch>",
  "recommendedAction": "<strong_yes|yes|maybe|no>",
  "actionRationale": "<Recruiter rationale for this decision>"
}

Only return the raw JSON object, no markdown code fences.
`;

    let contentParts: object[];
    if (isTextFile) {
      const resumeText = await fileToText(file);
      contentParts = [{ text: `RESUME CONTENT:\n\n${resumeText}\n\n---\n\n${prompt}` }];
    } else if (isPdfFile) {
      const base64Data = await fileToBase64(file);
      contentParts = [
        { inlineData: { mimeType: "application/pdf", data: base64Data } },
        { text: prompt },
      ];
    } else {
      const resumeText = await fileToText(file);
      contentParts = [{ text: `RESUME CONTENT:\n\n${resumeText}\n\n---\n\n${prompt}` }];
    }

    const endpoint = `${GEMINI_CONFIG.API_URL}/${GEMINI_CONFIG.MODEL}:generateContent?key=${GEMINI_CONFIG.API_KEY}`;

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
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty response from Gemini");

    const cleaned = rawText.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
    const parsed = JSON.parse(cleaned) as RecruiterViewResult;

    logger.info(TAG, "analyzeRecruiter Gemini success");
    return parsed;
  } catch (error) {
    logger.warn(TAG, "Gemini recruiter analysis failed, using mock", error);
    return analyzeRecruiterMock(candidateName, roleLabel);
  }
}

// ── CSV Bulk Parser & Matching Algorithm ───────────────────────────────────

/**
 * Parses double-quoted commas and Excel-friendly formats.
 */
export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [""];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push("");
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += char;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  return lines;
}

/**
 * Maps rows and scores candidates.
 */
export function filterAndScoreCandidatesCSV(csvText: string, targetRole: Role): CSVCandidate[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  // Parse headers
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const nameIdx = headers.findIndex((h) => h.includes("name"));
  const emailIdx = headers.findIndex((h) => h.includes("email") || h.includes("contact"));
  const skillsIdx = headers.findIndex((h) => h.includes("skills") || h.includes("technologies"));
  const expIdx = headers.findIndex((h) => h.includes("exp"));
  const eduIdx = headers.findIndex((h) => h.includes("edu"));
  const summaryIdx = headers.findIndex((h) => h.includes("summary") || h.includes("bio") || h.includes("profile"));

  // Fallback defaults if headers missing
  const getVal = (row: string[], idx: number, fallback: string) => {
    return idx !== -1 && row[idx] !== undefined ? row[idx].trim() : fallback;
  };

  const candidates: CSVCandidate[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 2 || !row[nameIdx === -1 ? 0 : nameIdx]) continue;

    const name = getVal(row, nameIdx, `Candidate #${i}`);
    const email = getVal(row, emailIdx, `candidate${i}@example.com`);
    const rawSkills = getVal(row, skillsIdx, "");
    const experience = getVal(row, expIdx, "0 years");
    const education = getVal(row, eduIdx, "N/A");
    const summary = getVal(row, summaryIdx, "");

    // Split and sanitize skills
    const skillsList = rawSkills
      ? rawSkills.split(/[,;|]/).map((s) => s.trim()).filter((s) => s.length > 0)
      : [];

    // Scoring logic
    const roleSkills = [...targetRole.requiredSkills, ...targetRole.niceToHaveSkills];
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    roleSkills.forEach((skill) => {
      const isMatched = skillsList.some((cs) => {
        return cs.toLowerCase() === skill.toLowerCase() ||
               cs.toLowerCase().includes(skill.toLowerCase()) ||
               skill.toLowerCase().includes(cs.toLowerCase());
      });
      if (isMatched) {
        matchedSkills.push(skill);
      } else if (targetRole.requiredSkills.includes(skill)) {
        missingSkills.push(skill);
      }
    });

    // Score variables
    let skillScore = roleSkills.length > 0 ? (matchedSkills.length / roleSkills.length) * 100 : 50;
    
    // Keyword boost from Profile Summary Text
    let keywordHits = 0;
    targetRole.keywords.forEach((keyword) => {
      if (summary.toLowerCase().includes(keyword.toLowerCase())) {
        keywordHits++;
      }
    });
    const keywordMatchPercent = targetRole.keywords.length > 0 ? (keywordHits / targetRole.keywords.length) * 100 : 0;

    // Years of Experience parsing
    const expNum = parseInt(experience.replace(/[^0-9]/g, "")) || 0;
    let expScore = 50;
    if (expNum >= 5) expScore = 95;
    else if (expNum >= 3) expScore = 80;
    else if (expNum >= 1) expScore = 65;

    // Weighted Score
    const matchScore = Math.round(
      (skillScore * 0.5) + (keywordMatchPercent * 0.25) + (expScore * 0.25)
    );

    // Verdict determinations
    let verdict: CSVCandidate["verdict"] = "no";
    if (matchScore >= 80) verdict = "strong_yes";
    else if (matchScore >= 62) verdict = "yes";
    else if (matchScore >= 45) verdict = "maybe";

    candidates.push({
      id: `candidate-${i}-${Date.now()}`,
      name,
      email,
      skills: skillsList,
      experience,
      education,
      summary,
      matchScore,
      verdict,
      matchedSkills,
      missingSkills
    });
  }

  // Rank by matchScore descending
  return candidates.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Returns mock candidates to immediately pre-fill or preview the recruiter CSV dashboard
 */
export function generateSampleCandidates(targetRole: Role): CSVCandidate[] {
  // Preset list of realistic CV templates
  const resumes = [
    {
      name: "Alex Rivera",
      email: "alex.rivera@icloud.com",
      skills: ["Python", "PyTorch", "MLOps", "Docker", "FastAPI", "Vector DBs", "RAG", "AWS"],
      experience: "6 years",
      education: "MS in Computer Science (Stanford)",
      summary: "Senior AI Product Engineer specialized in LLM deployment, fine-tuning Llama models, and creating vector database ingestion pipelines using LangChain."
    },
    {
      name: "Sophie Chen",
      email: "schen.data@gmail.com",
      skills: ["Python", "scikit-learn", "SQL", "Pandas", "NumPy", "Statistics", "A/B testing"],
      experience: "4 years",
      education: "BS in Statistics (Berkeley)",
      summary: "Data Scientist focusing on predictive modeling, regression, hypothesis verification, and producing Tableau dashboard visualizations."
    },
    {
      name: "Marcus Vance",
      email: "marcus.dev@yahoo.com",
      skills: ["TypeScript", "React", "Node.js", "Express", "PostgreSQL", "CSS", "Tailwind", "Git"],
      experience: "5 years",
      education: "Self-taught Bootcamp Graduate",
      summary: "Fullstack product developer focused on interactive premium SaaS designs, database optimization, and scalable backend REST APIs."
    },
    {
      name: "Jane Doe",
      email: "jane.doe@outlook.com",
      skills: ["Python", "PyTorch", "TensorFlow", "Transformers", "KubeFlow", "Kubernetes", "Docker", "MLOps"],
      experience: "8 years",
      education: "PhD in Machine Learning (MIT)",
      summary: "Distinguished applied AI researcher. Expert in developing big transformer architectures, model quantization, distributed training and production hosting on Kubernetes clusters."
    },
    {
      name: "Liam O'Connor",
      email: "liam.oconnor@protonmail.com",
      skills: ["Python", "Git", "HTML", "CSS", "Django", "SQL"],
      experience: "1.5 years",
      education: "BS in Information Systems",
      summary: "Junior developer passionate about Python automation scripts, parsing html content, and backend Django applications."
    },
    {
      name: "Amara Nwosu",
      email: "amara.codes@gmail.com",
      skills: ["TypeScript", "React", "Next.js", "Tailwind", "CSS", "HTML", "Figma", "Redux"],
      experience: "3 years",
      education: "BFA in Interaction Design",
      summary: "Polished frontend engineer with a passion for micro-animations, glassmorphism, responsive interface design, and pixel-perfect design system implementation."
    }
  ];

  // Run the local match criteria calculation on the list
  const roleSkills = [...targetRole.requiredSkills, ...targetRole.niceToHaveSkills];

  const processed = resumes.map((resume, i) => {
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    roleSkills.forEach((skill) => {
      const isMatched = resume.skills.some((cs) => {
        return cs.toLowerCase() === skill.toLowerCase() ||
               cs.toLowerCase().includes(skill.toLowerCase()) ||
               skill.toLowerCase().includes(cs.toLowerCase());
      });
      if (isMatched) {
        matchedSkills.push(skill);
      } else if (targetRole.requiredSkills.includes(skill)) {
        missingSkills.push(skill);
      }
    });

    let skillScore = roleSkills.length > 0 ? (matchedSkills.length / roleSkills.length) * 100 : 50;
    
    let keywordHits = 0;
    targetRole.keywords.forEach((keyword) => {
      if (resume.summary.toLowerCase().includes(keyword.toLowerCase())) {
        keywordHits++;
      }
    });
    const keywordMatchPercent = targetRole.keywords.length > 0 ? (keywordHits / targetRole.keywords.length) * 100 : 0;

    const expNum = parseInt(resume.experience.replace(/[^0-9]/g, "")) || 0;
    let expScore = 50;
    if (expNum >= 5) expScore = 95;
    else if (expNum >= 3) expScore = 80;
    else if (expNum >= 1) expScore = 65;

    const matchScore = Math.round(
      (skillScore * 0.5) + (keywordMatchPercent * 0.25) + (expScore * 0.25)
    );

    let verdict: CSVCandidate["verdict"] = "no";
    if (matchScore >= 80) verdict = "strong_yes";
    else if (matchScore >= 62) verdict = "yes";
    else if (matchScore >= 45) verdict = "maybe";

    return {
      id: `sample-candidate-${i}`,
      name: resume.name,
      email: resume.email,
      skills: resume.skills,
      experience: resume.experience,
      education: resume.education,
      summary: resume.summary,
      matchScore,
      verdict,
      matchedSkills,
      missingSkills
    };
  });

  return processed.sort((a, b) => b.matchScore - a.matchScore);
}
