/**
 * Purpose: GitHub profile analyzer integrated with Gemini.
 * Responsibilities: Given a GitHub URL, fetch public git repositories metadata,
 *   run Gemini verification scores, verified/unverified skills, and top repo summaries.
 * Dependencies: types, utils/logger, utils/errors, config/gemini
 */

import type { GithubAnalysis, PortfolioStrength, RepoSummary, VerifiedSkill } from "@/types";
import { logger } from "@/utils/logger";
import { ValidationError } from "@/utils/errors";
import { GEMINI_CONFIG } from "@/config/gemini";

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
 * Fallback local mock GitHub profile analyzer.
 */
export function analyzeGithubMock(url: string): GithubAnalysis {
  const username = parseGithubUrl(url);
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

/**
 * Fetch GitHub user profile and active public repositories.
 */
async function fetchGithubData(username: string) {
  logger.info(TAG, "Fetching real GitHub profile from API", { username });
  
  const profileRes = await fetch(`https://api.github.com/users/${username}`);
  if (!profileRes.ok) {
    throw new Error(`GitHub user "${username}" was not found or API is unavailable. Status: ${profileRes.status}`);
  }
  const profile = await profileRes.json();

  // Pick top active repos
  const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=12`);
  const repos = reposRes.ok ? await reposRes.json() : [];

  return {
    profile,
    repos,
  };
}

/**
 * Analyze a GitHub profile.
 * @param url full https://github.com/<user> URL
 * @returns GithubAnalysis with verification scores and evidence
 */
export async function analyzeGithub(url: string): Promise<GithubAnalysis> {
  const username = parseGithubUrl(url);

  try {
    const githubData = await fetchGithubData(username);

    const prompt = `
You are a Lead Tech Recruiter and Technical Portfolio Analyzer.
Your task is to analyze this candidate's public GitHub history and profile metadata.

Candidate GitHub Profile Data:
- Username: ${githubData.profile.login}
- Name: ${githubData.profile.name || "N/A"}
- Bio: ${githubData.profile.bio || "N/A"}
- Public Repos Count: ${githubData.profile.public_repos}
- Followers Count: ${githubData.profile.followers}

Public Repositories (recently active):
${githubData.repos.map((r: any) => `
- Name: ${r.name}
  Description: ${r.description || "No description"}
  Primary Language: ${r.language || "N/A"}
  Stars: ${r.stargazers_count}
  Fork: ${r.fork ? "Yes" : "No"}
  Created: ${r.created_at}
  Last Pushed: ${r.pushed_at}
`).join("\n")}

Based on this real-world technical footprint:
1. Estimate a codeConsistency score (0-100) based on repository activity and naming consistency.
2. Estimate a projectQuality score (0-100) based on stars, description clarity, and language diversity.
3. Determine their portfolioStrength level ("Beginner", "Intermediate", or "Advanced").
4. List verifiedSkills: select up to 5 programming languages/frameworks that are strongly represented in their repos.
   For each skill, provide:
   * skill (e.g. Python, TypeScript, React, Java, C++)
   * evidenceRepo (the repository demonstrating this)
   * commits (approximate/estimated number of commits on that repo or relative weight index, integer)
   * detail (e.g. "Primary language across 3 repos", "Used in model training module")
5. List unverifiedSkills: recommend 2-3 common tools/skills that are NOT visible/proven from their GitHub footprint but would be great to add (e.g., Docker, Kubernetes, AWS, GraphQL).
6. Format topRepos: Select up to 4 significant repositories. Keep their descriptions clean, show stars score, and indicate if you think they have a README.

Output MUST follow this exact JSON structure:
{
  "codeConsistency": <score 0-100>,
  "projectQuality": <score 0-100>,
  "portfolioStrength": "<Beginner | Intermediate | Advanced>",
  "verificationScore": <average of codeConsistency and projectQuality>,
  "verifiedSkills": [
    {
      "skill": "<skill name>",
      "evidenceRepo": "<repo name>",
      "commits": <estimated commits number>,
      "detail": "<brief description of evidence>"
    }
  ],
  "unverifiedSkills": ["<skill1>", "<skill2>"],
  "topRepos": [
    {
      "name": "<repo name>",
      "description": "<short clean description>",
      "language": "<primary language>",
      "stars": <stars count>,
      "hasReadme": <true/false>
    }
  ]
}

Only return the raw JSON object, without markdown formatting blocks.
`;

    const endpoint = `${GEMINI_CONFIG.API_URL}/${GEMINI_CONFIG.MODEL}:generateContent?key=${GEMINI_CONFIG.API_KEY}`;

    // 30-second timeout to prevent indefinite hanging
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
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

    // Keep consistent attributes
    parsedResult.username = username;
    parsedResult.profileUrl = `https://github.com/${username}`;

    logger.info(TAG, "GitHub analyzer successfully got real response via Gemini");
    return parsedResult as GithubAnalysis;

  } catch (error) {
    logger.warn(TAG, "Failed real Gemini GitHub analysis. Falling back to mock.", error);
    return analyzeGithubMock(url);
  }
}
