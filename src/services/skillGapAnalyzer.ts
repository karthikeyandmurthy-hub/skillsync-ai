/**
 * Purpose: Skill Gap Analyzer — produces a prioritized gap list + 30/60/90-day roadmap.
 * Responsibilities: Accept a resume file + target role → call Gemini → return SkillGapResult.
 * Dependencies: types, config/gemini, utils/logger
 */

import type { SkillGapResult, LearningMilestone, SkillGap } from "@/types";
import { GEMINI_CONFIG } from "@/config/gemini";
import { logger } from "@/utils/logger";

const TAG = "[SKILL_GAP]";

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

export function analyzeSkillGapMock(roleLabel: string): SkillGapResult {
  const gaps: SkillGap[] = [
    { skill: "MLOps / Model Serving", category: "Infrastructure", priority: "critical", currentLevel: 20, targetLevel: 80, rationale: "Production ML deployment is the #1 gap for senior AI Engineer roles." },
    { skill: "System Design", category: "Architecture", priority: "critical", currentLevel: 35, targetLevel: 85, rationale: "Designing scalable, fault-tolerant ML systems is expected at senior level." },
    { skill: "AWS / Cloud (SageMaker, EC2)", category: "Cloud", priority: "high", currentLevel: 40, targetLevel: 75, rationale: "Most enterprise ML pipelines run on AWS. SageMaker fluency is a fast signal." },
    { skill: "Kubernetes & Docker", category: "DevOps", priority: "high", currentLevel: 30, targetLevel: 70, rationale: "Container orchestration is critical for scalable model deployment." },
    { skill: "LLM Fine-tuning & RLHF", category: "AI/ML", priority: "medium", currentLevel: 45, targetLevel: 80, rationale: "LLM customization is rapidly becoming a differentiator in AI engineering." },
    { skill: "Data Pipeline Engineering", category: "Data", priority: "medium", currentLevel: 55, targetLevel: 80, rationale: "Reliable data pipelines underpin every ML system." },
  ];

  const milestones: LearningMilestone[] = [
    {
      id: "m1",
      title: "Foundation: Cloud & MLOps Basics",
      description: "Build the infrastructure fundamentals that unlock everything else.",
      skills: ["AWS Basics", "Docker", "FastAPI"],
      phase: "30-day",
      durationWeeks: 4,
      resources: [
        { title: "AWS Cloud Practitioner Essentials", type: "course", estimatedHours: 20 },
        { title: "Docker in 1 Hour (YouTube)", type: "course", estimatedHours: 3 },
        { title: "Deploy an ML model with FastAPI + Docker", type: "project", estimatedHours: 12 },
      ],
    },
    {
      id: "m2",
      title: "Accelerate: ML Pipelines & Kubernetes",
      description: "Bridge the gap between prototype notebooks and production systems.",
      skills: ["Kubernetes", "MLflow", "SageMaker"],
      phase: "60-day",
      durationWeeks: 4,
      resources: [
        { title: "Kubernetes for ML Engineers (Coursera)", type: "course", estimatedHours: 15 },
        { title: "MLflow Tracking & Model Registry", type: "practice", estimatedHours: 8 },
        { title: "End-to-end SageMaker Pipeline Project", type: "project", estimatedHours: 20 },
      ],
    },
    {
      id: "m3",
      title: "Differentiate: LLMs & System Design",
      description: "Cement senior-level skills that interviewers explicitly probe.",
      skills: ["LLM Fine-tuning", "System Design", "RLHF Basics"],
      phase: "90-day",
      durationWeeks: 4,
      resources: [
        { title: "Designing ML Systems (Chip Huyen)", type: "book", estimatedHours: 18 },
        { title: "Fine-tune Llama 3 on custom dataset", type: "project", estimatedHours: 15 },
        { title: "Mock System Design: ML Feed Ranking", type: "practice", estimatedHours: 6 },
      ],
    },
  ];

  return {
    role: roleLabel,
    overallReadiness: 58,
    gaps,
    strengths: ["Python & PyTorch", "Deep Learning theory", "NLP & Transformers", "Research paper implementation"],
    milestones,
    summary: `Your foundation in Python and deep learning is solid, but production ML skills — MLOps, cloud infrastructure, and system design — are the critical gaps standing between you and a senior ${roleLabel} role. The 90-day plan below prioritizes the highest-ROI skills first.`,
  };
}

// ── real Gemini analysis ───────────────────────────────────────────────────

export async function analyzeSkillGap(file: File, roleLabel: string): Promise<SkillGapResult> {
  logger.info(TAG, "analyzeSkillGap starting", { fileName: file.name, role: roleLabel });

  try {
    const isTextFile = /\.(txt)$/i.test(file.name) || file.type === "text/plain";
    const isPdfFile = /\.(pdf)$/i.test(file.name) || file.type === "application/pdf";

    const prompt = `
You are a senior career coach and technical recruiter specializing in AI/ML and software engineering roles.
Analyze the following resume for a candidate targeting the role: "${roleLabel}".

Your task is to produce a Skill Gap Analysis and a personalized 30/60/90-day learning roadmap.

Output MUST follow this exact JSON structure (raw JSON, no markdown):
{
  "role": "${roleLabel}",
  "overallReadiness": <0-100 score>,
  "summary": "<2-3 sentence executive summary of the candidate's readiness>",
  "strengths": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>"],
  "gaps": [
    {
      "skill": "<skill name>",
      "category": "<category: AI/ML | Infrastructure | Cloud | DevOps | Data | Soft Skills>",
      "priority": "<critical|high|medium|low>",
      "currentLevel": <0-100>,
      "targetLevel": <0-100>,
      "rationale": "<why this gap matters for the target role>"
    }
  ],
  "milestones": [
    {
      "id": "m1",
      "phase": "30-day",
      "title": "<milestone title>",
      "description": "<what this 30-day sprint achieves>",
      "skills": ["<skill 1>", "<skill 2>"],
      "durationWeeks": 4,
      "resources": [
        { "title": "<resource name>", "type": "<course|project|book|practice>", "estimatedHours": <number> }
      ]
    },
    {
      "id": "m2",
      "phase": "60-day",
      "title": "<milestone title>",
      "description": "<what this 60-day sprint achieves>",
      "skills": ["<skill 1>", "<skill 2>"],
      "durationWeeks": 4,
      "resources": [
        { "title": "<resource name>", "type": "<course|project|book|practice>", "estimatedHours": <number> }
      ]
    },
    {
      "id": "m3",
      "phase": "90-day",
      "title": "<milestone title>",
      "description": "<what this 90-day sprint achieves>",
      "skills": ["<skill 1>", "<skill 2>"],
      "durationWeeks": 4,
      "resources": [
        { "title": "<resource name>", "type": "<course|project|book|practice>", "estimatedHours": <number> }
      ]
    }
  ]
}

Identify 4-6 genuine skill gaps with honest current/target levels.
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
    const parsed = JSON.parse(cleaned) as SkillGapResult;

    logger.info(TAG, "analyzeSkillGap Gemini success");
    return parsed;
  } catch (error) {
    logger.warn(TAG, "Gemini skill gap analysis failed, using mock", error);
    return analyzeSkillGapMock(roleLabel);
  }
}
