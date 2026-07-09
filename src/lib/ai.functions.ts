/**
 * Purpose: Server-side AI calls via Lovable AI Gateway (Gemini).
 * Responsibilities: Resume + GitHub analysis using google/gemini-2.5-flash.
 */
import { createServerFn } from "@tanstack/react-start";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

async function callGeminiJSON<T>(system: string, user: string): Promise<T> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing on server");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Rate limit reached. Try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in workspace settings.");
    throw new Error(`AI Gateway ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(content) as T;
  } catch {
    const m = content.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]) as T;
    throw new Error("AI returned non-JSON output");
  }
}

const RESUME_SYSTEM = `You are an expert ATS (Applicant Tracking System) and technical recruiter.
Analyze the resume text against the target role and return STRICT JSON matching this schema exactly:
{
  "overall": number 0-100,
  "categories": [
    { "key": "skills"|"projects"|"experience"|"education"|"keywords"|"formatting",
      "score": number 0-100,
      "notes": [string] }
  ],
  "improvements": [
    { "id": string, "area": string,
      "severity": "low"|"medium"|"high",
      "before": string, "after": string, "rationale": string }
  ]
}
Include all 6 categories. Provide 4-6 concrete improvements with real Before/After rewrites drawn from the resume text when possible.`;

export const analyzeResumeAI = createServerFn({ method: "POST" })
  .inputValidator((d: { resumeText: string; roleLabel: string; requiredSkills: string[]; keywords: string[] }) => d)
  .handler(async ({ data }) => {
    const user = `TARGET ROLE: ${data.roleLabel}
REQUIRED SKILLS: ${data.requiredSkills.join(", ")}
KEYWORDS: ${data.keywords.join(", ")}

RESUME TEXT:
"""
${data.resumeText.slice(0, 15000)}
"""

Score the resume for this role and produce the JSON.`;
    return callGeminiJSON<{
      overall: number;
      categories: { key: string; score: number; notes: string[] }[];
      improvements: { id: string; area: string; severity: "low" | "medium" | "high"; before: string; after: string; rationale: string }[];
    }>(RESUME_SYSTEM, user);
  });

const GITHUB_SYSTEM = `You are a senior engineer evaluating a candidate's public GitHub profile.
Return STRICT JSON:
{
  "codeConsistency": number 0-100,
  "projectQuality": number 0-100,
  "verificationScore": number 0-100,
  "portfolioStrength": "Beginner"|"Intermediate"|"Advanced",
  "verifiedSkills": [{"skill":string,"evidenceRepo":string,"commits":number,"detail":string}],
  "unverifiedSkills": [string],
  "summary": string
}
Base assessments on the provided repo metadata only. Never invent repos.`;

export const analyzeGithubAI = createServerFn({ method: "POST" })
  .inputValidator((d: { username: string }) => d)
  .handler(async ({ data }) => {
    const username = data.username.trim();
    if (!/^[A-Za-z0-9-]{1,39}$/.test(username)) throw new Error("Invalid GitHub username");

    const userRes = await fetch(`https://api.github.com/users/${username}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (userRes.status === 404) throw new Error("GitHub user not found");
    if (!userRes.ok) throw new Error(`GitHub API ${userRes.status}`);
    const profile = await userRes.json();

    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=30`,
      { headers: { Accept: "application/vnd.github+json" } },
    );
    if (!reposRes.ok) throw new Error(`GitHub repos API ${reposRes.status}`);
    const repos = (await reposRes.json()) as Array<{
      name: string; description: string | null; language: string | null;
      stargazers_count: number; fork: boolean; size: number; updated_at: string;
      topics?: string[]; has_wiki?: boolean;
    }>;

    const summary = {
      profile: {
        login: profile.login, name: profile.name, bio: profile.bio,
        public_repos: profile.public_repos, followers: profile.followers,
        created_at: profile.created_at,
      },
      repos: repos.filter((r) => !r.fork).slice(0, 20).map((r) => ({
        name: r.name, description: r.description, language: r.language,
        stars: r.stargazers_count, topics: r.topics ?? [], updated_at: r.updated_at,
      })),
    };

    const aiUser = `GITHUB DATA:\n${JSON.stringify(summary, null, 2)}\n\nAnalyze and return JSON.`;
    const ai = await callGeminiJSON<{
      codeConsistency: number; projectQuality: number; verificationScore: number;
      portfolioStrength: "Beginner" | "Intermediate" | "Advanced";
      verifiedSkills: { skill: string; evidenceRepo: string; commits: number; detail: string }[];
      unverifiedSkills: string[]; summary: string;
    }>(GITHUB_SYSTEM, aiUser);

    return {
      ...ai,
      username,
      profileUrl: `https://github.com/${username}`,
      topRepos: summary.repos.slice(0, 6).map((r) => ({
        name: r.name,
        description: r.description ?? "",
        language: r.language ?? "—",
        stars: r.stars,
        hasReadme: true,
      })),
    };
  });
