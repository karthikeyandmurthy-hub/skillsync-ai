/**
 * Purpose: Deterministic mock GitHub profile analyzer.
 * Responsibilities: Given a GitHub URL, return verification scores,
 *   verified/unverified skills, and top repo summaries. Pure logic.
 * Dependencies: types, utils/logger, utils/errors
 *
 * NOTE: Real GitHub REST/GraphQL integration will replace the mock body.
 *   Function signature MUST remain stable.
 */

import type { GithubAnalysis, PortfolioStrength, RepoSummary, VerifiedSkill } from "@/types";
import { logger } from "@/utils/logger";
import { ValidationError } from "@/utils/errors";

const TAG = "[GITHUB_ANALYZER]";

const URL_RE = /^https?:\/\/(www\.)?github\.com\/([A-Za-z0-9-]{1,39})\/?$/;

/**
 * Extract a username from a GitHub profile URL.
 * @throws ValidationError when URL is not a valid github.com/<user> URL.
 */
export function parseGithubUrl(url: string): string {
  const trimmed = url.trim();
  const m = trimmed.match(URL_RE);
  if (!m) throw new ValidationError("Enter a valid GitHub profile URL, e.g. https://github.com/torvalds");
  return m[2];
}

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

const MOCK_REPOS: Omit<RepoSummary, "stars">[] = [
  { name: "ml-pipeline", description: "End-to-end ML training pipeline with Airflow.", language: "Python", hasReadme: true },
  { name: "next-portfolio", description: "Personal site built with Next.js + Tailwind.", language: "TypeScript", hasReadme: true },
  { name: "rag-chatbot", description: "Retrieval-augmented chatbot over PDFs.", language: "Python", hasReadme: true },
  { name: "leetcode-notes", description: "DSA practice solutions.", language: "C++", hasReadme: false },
  { name: "api-server", description: "FastAPI service with JWT auth.", language: "Python", hasReadme: true },
];

const SKILL_POOL: Array<{ skill: string; repo: string; commits: number; detail: string }> = [
  { skill: "Python", repo: "ml-pipeline", commits: 142, detail: "Primary language across 3 repos." },
  { skill: "PyTorch", repo: "rag-chatbot", commits: 38, detail: "Used in model fine-tuning module." },
  { skill: "TypeScript", repo: "next-portfolio", commits: 64, detail: "Strict mode, full type coverage." },
  { skill: "React", repo: "next-portfolio", commits: 51, detail: "Hooks + server components." },
  { skill: "FastAPI", repo: "api-server", commits: 47, detail: "REST endpoints with Pydantic models." },
  { skill: "Docker", repo: "ml-pipeline", commits: 22, detail: "Containerized training + serving." },
];

/**
 * Analyze a GitHub profile.
 * @param url full https://github.com/<user> URL
 * @returns GithubAnalysis with verification scores and evidence
 */
export function analyzeGithub(url: string): GithubAnalysis {
  const username = parseGithubUrl(url);
  logger.info(TAG, "analyzeGithub", { username });

  const seed = hash(username);
  const codeConsistency = band(seed >> 1, 55, 95);
  const projectQuality = band(seed >> 3, 50, 92);
  const verificationScore = Math.round((codeConsistency + projectQuality) / 2);

  const strength: PortfolioStrength =
    verificationScore >= 80 ? "Advanced" : verificationScore >= 65 ? "Intermediate" : "Beginner";

  const verifiedSkills: VerifiedSkill[] = SKILL_POOL
    .filter((_, i) => (seed >> i) % 3 !== 0)
    .slice(0, 5)
    .map((s) => ({ skill: s.skill, evidenceRepo: s.repo, commits: s.commits, detail: s.detail }));

  const unverifiedSkills = ["AWS", "Kubernetes", "GraphQL"].filter(
    (_, i) => (seed >> (i + 2)) % 2 === 0,
  );

  const topRepos: RepoSummary[] = MOCK_REPOS.slice(0, 4).map((r, i) => ({
    ...r,
    stars: band(seed >> (i + 1), 4, 220),
  }));

  return {
    username,
    profileUrl: `https://github.com/${username}`,
    codeConsistency,
    projectQuality,
    portfolioStrength: strength,
    verificationScore,
    verifiedSkills,
    unverifiedSkills,
    topRepos,
  };
}
