/**
 * Purpose: Mock recruiter-perspective evaluation for a candidate per target role.
 * Responsibilities: Deterministic role-aware match probability, strengths,
 *   red flags, and AI summary text used by the Recruiter View.
 * Dependencies: types
 */

import type { RoleId } from "@/types";

export interface StrongPoint {
  title: string;
  detail: string;
}

export interface RedFlag {
  title: string;
  detail: string;
  fix: string;
}

export interface RecruiterEvaluation {
  candidateId: string;
  candidateName: string;
  headline: string;
  matchProbability: number;
  experienceFit: number;
  recruiterSignal: "Strong hire" | "Advance" | "Borderline" | "Pass";
  topSkills: string[];
  strongPoints: StrongPoint[];
  redFlags: RedFlag[];
  summary: string;
  summaryTags: string[];
}

const BASE_STRONG: StrongPoint[] = [
  {
    title: "Production-ready GitHub repositories",
    detail: "Multiple repos ship with CI, tests, and clear READMEs — signals shipping discipline.",
  },
  {
    title: "Strong technical documentation",
    detail: "Architecture diagrams and setup guides show communication maturity.",
  },
  {
    title: "Consistent contribution cadence",
    detail: "Steady commit history over the last 9 months, no long gaps.",
  },
];

const BASE_FLAGS: RedFlag[] = [
  {
    title: "Few deployed live links",
    detail: "Most projects are code-only; recruiters can't try them in-browser.",
    fix: "Deploy 1–2 flagship projects to Vercel and link them from the resume header.",
  },
  {
    title: "Imbalanced commit history",
    detail: "80% of activity concentrated in two repos — depth is clear, breadth less so.",
    fix: "Diversify with a small side project in an adjacent domain to signal range.",
  },
];

const ROLE_OVERRIDES: Record<
  RoleId,
  {
    match: number;
    experienceFit: number;
    signal: RecruiterEvaluation["recruiterSignal"];
    headline: string;
    topSkills: string[];
    extraStrong: StrongPoint;
    extraFlag: RedFlag;
    summary: string;
    tags: string[];
  }
> = {
  "ai-engineer": {
    match: 87,
    experienceFit: 82,
    signal: "Advance",
    headline: "Applied ML engineer with production RAG experience",
    topSkills: ["Python", "PyTorch", "LangChain", "FastAPI", "Docker"],
    extraStrong: {
      title: "Validated skills in core AI stack",
      detail: "RAG chatbot repo demonstrates end-to-end LLM app engineering.",
    },
    extraFlag: {
      title: "Missing cloud infrastructure experience",
      detail: "No evidence of AWS/GCP deployment or IaC (Terraform).",
      fix: "Add one project that deploys a model behind an AWS Lambda or SageMaker endpoint.",
    },
    summary:
      "Strong applied-AI candidate with a working RAG pipeline and clean Python fundamentals. Communication and repo hygiene are above bar for a mid-level AI engineer role, though cloud production experience is thin and worth probing on a screen. Recommend advancing to a technical phone screen focused on deployment and evaluation.",
    tags: ["Above bar: engineering", "Watch: cloud depth", "Signal: shipping"],
  },
  "python-developer": {
    match: 83,
    experienceFit: 78,
    signal: "Advance",
    headline: "Backend-leaning Python developer, API-first",
    topSkills: ["Python", "FastAPI", "PostgreSQL", "Docker", "Pytest"],
    extraStrong: {
      title: "Robust API design patterns",
      detail: "FastAPI service uses Pydantic models, dependency injection, and typed responses.",
    },
    extraFlag: {
      title: "Limited async / concurrency evidence",
      detail: "No async workers, queues, or streaming endpoints in the portfolio.",
      fix: "Ship a small project using Celery or asyncio to demonstrate concurrent workloads.",
    },
    summary:
      "Solid mid-level Python developer with clean API patterns and testing habits. Portfolio leans synchronous CRUD; advancing to screen is warranted with a probe on async, background jobs, and observability.",
    tags: ["Above bar: APIs", "Watch: async", "Signal: testing"],
  },
  "data-scientist": {
    match: 74,
    experienceFit: 71,
    signal: "Borderline",
    headline: "Analytical DS with ML fundamentals, weak on stats depth",
    topSkills: ["Python", "Pandas", "scikit-learn", "SQL", "Jupyter"],
    extraStrong: {
      title: "Clear notebook storytelling",
      detail: "EDA notebooks read like reports — good business communication signal.",
    },
    extraFlag: {
      title: "Statistical rigor is light",
      detail: "Little evidence of hypothesis testing, causal inference, or experiment design.",
      fix: "Publish a case study running an A/B test with confidence intervals and effect sizes.",
    },
    summary:
      "Competent DS candidate on modeling and storytelling but lighter on inferential statistics and experimentation. Consider a take-home focused on A/B analysis before advancing to on-site.",
    tags: ["Watch: statistics", "Above bar: communication"],
  },
  "frontend-engineer": {
    match: 89,
    experienceFit: 85,
    signal: "Strong hire",
    headline: "Design-sensitive frontend engineer, React/TS strong",
    topSkills: ["TypeScript", "React", "Tailwind", "Next.js", "Vitest"],
    extraStrong: {
      title: "Design fidelity is exceptional",
      detail: "Portfolio site reflects strong visual craft and accessibility awareness.",
    },
    extraFlag: {
      title: "Limited backend touchpoints",
      detail: "Most projects consume APIs; fewer show BFF or edge-function work.",
      fix: "Ship one project using server functions or a small tRPC/BFF layer.",
    },
    summary:
      "High-signal frontend candidate with strong TypeScript, React, and design chops. Ready to advance to on-site — recommend pairing on a component architecture problem to confirm depth.",
    tags: ["Strong hire", "Above bar: craft", "Watch: backend touch"],
  },
  "fullstack-engineer": {
    match: 81,
    experienceFit: 76,
    signal: "Advance",
    headline: "Full-stack generalist, stronger on frontend",
    topSkills: ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker"],
    extraStrong: {
      title: "End-to-end feature delivery",
      detail: "Two repos show UI + API + schema shipped together — real ownership signal.",
    },
    extraFlag: {
      title: "Systems design breadth unclear",
      detail: "Portfolio doesn't yet show caching, queues, or multi-service coordination.",
      fix: "Add a project with Redis caching or a background worker to broaden the story.",
    },
    summary:
      "Well-rounded full-stack candidate with clear end-to-end delivery. Frontend depth is above bar; backend depth is credible but not yet senior. Advance to a systems-design screen.",
    tags: ["Above bar: delivery", "Watch: systems design"],
  },
};

/**
 * Return a role-aware recruiter evaluation.
 */
export function getRecruiterEvaluation(roleId: RoleId): RecruiterEvaluation {
  const o = ROLE_OVERRIDES[roleId];
  return {
    candidateId: "cand_84f2a1",
    candidateName: "Alex Morgan",
    headline: o.headline,
    matchProbability: o.match,
    experienceFit: o.experienceFit,
    recruiterSignal: o.signal,
    topSkills: o.topSkills,
    strongPoints: [...BASE_STRONG, o.extraStrong],
    redFlags: [...BASE_FLAGS, o.extraFlag],
    summary: o.summary,
    summaryTags: o.tags,
  };
}
