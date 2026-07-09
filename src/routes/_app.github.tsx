/**
 * Purpose: GitHub Verification page.
 * Responsibilities: Accept profile URL → run analyzer → show verification.
 * Dependencies: services/githubAnalyzer, components/*
 */

import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Github, Star, XCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ScoreRing } from "@/components/ScoreRing";
import { parseGithubUrl } from "@/services/githubAnalyzer";
import { analyzeGithubAI } from "@/lib/ai.functions";
import type { GithubAnalysis } from "@/types";
import { AppError } from "@/utils/errors";

export const Route = createFileRoute("/_app/github")({
  head: () => ({
    meta: [
      { title: "GitHub Verification — SkillSync AI" },
      { name: "description", content: "Verify your resume's skills against your real GitHub activity." },
    ],
  }),
  component: GithubPage,
});

function GithubPage() {
  const [url, setUrl] = useState("https://github.com/torvalds");
  const [result, setResult] = useState<GithubAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const runAI = useServerFn(analyzeGithubAI);

  async function run() {
    setError(null);
    setRunning(true);
    try {
      const username = parseGithubUrl(url);
      const ai = await runAI({ data: { username } });
      setResult(ai as GithubAnalysis);
    } catch (e) {
      setError(e instanceof AppError ? e.userMessage : e instanceof Error ? e.message : "Something went wrong.");
      setResult(null);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="GitHub Verification"
        title="Prove what's on your resume."
        description="We analyze your public repositories to verify claimed skills with real evidence."
      />

      <div className="rounded-2xl bg-card p-6 hairline">
        <label htmlFor="gh" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          GitHub profile URL
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5">
            <Github className="size-4 text-muted-foreground" />
            <input
              id="gh"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/username"
              className="flex-1 bg-transparent text-sm text-foreground focus:outline-none"
            />
          </div>
          <button
            onClick={run}
            disabled={running}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {running ? "Scanning…" : <>Verify profile <ArrowRight className="size-4" /></>}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </div>

      {result && (
        <div className="fade-in-up mt-10 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl bg-card p-8 hairline lg:col-span-1">
              <p className="text-sm font-medium text-muted-foreground">Verification Score</p>
              <div className="mt-6 flex justify-center">
                <ScoreRing value={result.verificationScore} size={180} />
              </div>
              <p className="mt-6 text-center text-sm">
                <a href={result.profileUrl} target="_blank" rel="noreferrer" className="font-medium text-accent hover:underline">
                  @{result.username}
                </a>
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-2">
              <div className="rounded-2xl bg-card p-6 hairline">
                <p className="text-sm font-medium text-muted-foreground">Code Consistency</p>
                <p className="mt-3 font-display text-4xl font-semibold text-foreground">{result.codeConsistency}<span className="text-base text-muted-foreground">/100</span></p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${result.codeConsistency}%` }} />
                </div>
              </div>
              <div className="rounded-2xl bg-card p-6 hairline">
                <p className="text-sm font-medium text-muted-foreground">Project Quality</p>
                <p className="mt-3 font-display text-4xl font-semibold text-foreground">{result.projectQuality}<span className="text-base text-muted-foreground">/100</span></p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-success" style={{ width: `${result.projectQuality}%` }} />
                </div>
              </div>
              <div className="rounded-2xl bg-primary p-6 text-primary-foreground sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground/70">Portfolio strength</p>
                <p className="mt-3 font-display text-3xl">{result.portfolioStrength}</p>
                <p className="mt-2 text-sm text-primary-foreground/80">
                  Based on README quality, repository diversity, and commit cadence.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-card p-6 hairline">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-success" />
                <h2 className="font-display text-lg font-semibold">Verified skills</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Evidence pulled from your repositories.</p>
              <ul className="mt-5 flex flex-col gap-3">
                {result.verifiedSkills.map((s) => (
                  <li key={s.skill} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{s.skill}</span>
                      <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">Verified</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{s.evidenceRepo}</span> · {s.commits} commits
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-2xl bg-card p-6 hairline">
                <div className="flex items-center gap-2">
                  <XCircle className="size-4 text-warning" />
                  <h2 className="font-display text-lg font-semibold">Unverified claims</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Listed on your resume but no GitHub evidence yet.
                </p>
                {result.unverifiedSkills.length === 0 ? (
                  <p className="mt-5 text-sm text-foreground">Nothing flagged — strong alignment.</p>
                ) : (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {result.unverifiedSkills.map((s) => (
                      <span key={s} className="rounded-full bg-warning/15 px-3 py-1 text-xs font-medium text-warning">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-2xl bg-card p-6 hairline">
                <h2 className="font-display text-lg font-semibold">Top repositories</h2>
                <ul className="mt-4 divide-y divide-border">
                  {result.topRepos.map((r) => (
                    <li key={r.name} className="flex items-start justify-between gap-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.description}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                        <span className="rounded-full bg-secondary px-2 py-0.5">{r.language}</span>
                        <span className="inline-flex items-center gap-1"><Star className="size-3" />{r.stars}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
