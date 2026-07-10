/**
 * Purpose: Skill Gap & Career Roadmap.
 * Responsibilities: Allow the user to request a skill gap analysis using their resume & target role,
 *   rendering prioritized gaps, current vs target scores, & interactive 30/60/90-day learning roadmap milestones.
 * Dependencies: components/PageHeader, components/ScoreRing, services/skillGapAnalyzer, config/roles, types
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Compass,
  FileText,
  HelpCircle,
  PlayCircle,
  ShieldAlert,
  Sparkles,
  Target,
  Terminal,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { FileDropzone } from "@/components/FileDropzone";
import { ScoreRing } from "@/components/ScoreRing";
import { ROLES, ROLE_MAP } from "@/config/roles";
import { analyzeSkillGap } from "@/services/skillGapAnalyzer";
import type { SkillGapResult, RoleId } from "@/types";

export const Route = createFileRoute("/_app/skill-gap")({
  head: () => ({
    meta: [
      { title: "Skill Gap & Career Roadmap — SkillSync AI" },
      { name: "description", content: "A customized 30/60/90 day learning plan to bridge your skill gaps for your dream role." },
    ],
  }),
  component: SkillGapPage,
});

function SkillGapPage() {
  const [file, setFile] = useState<File | null>(null);
  const [roleId, setRoleId] = useState<RoleId>("ai-engineer");
  const [result, setResult] = useState<SkillGapResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<"30-day" | "60-day" | "90-day">("30-day");

  async function run() {
    if (!file) {
      setError("Please upload your resume to run the analysis.");
      return;
    }
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await analyzeSkillGap(file, ROLE_MAP[roleId].label);
      setResult(res);
    } catch (e) {
      console.error("[SKILL_GAP_ANALYSIS_ERROR]", e);
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setRunning(false);
    }
  }

  // Priority styling helpers
  function getPriorityColor(priority: string) {
    switch (priority) {
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "high":
        return "bg-warning/15 text-warning border-warning/20";
      case "medium":
        return "bg-accent/10 text-accent border-accent/20";
      default:
        return "bg-secondary text-muted-foreground border-border";
    }
  }

  // Resource Icon helper
  function getResourceIcon(type: string) {
    switch (type) {
      case "course":
        return <PlayCircle className="size-4 text-accent" />;
      case "project":
        return <Terminal className="size-4 text-success" />;
      case "book":
        return <BookOpen className="size-4 text-warning" />;
      default:
        return <HelpCircle className="size-4 text-muted-foreground" />;
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Development Hub"
        title="Bridge your career skill gaps."
        description="Diagnose exactly where you stand against industry standards and unlock a customized 90-day learning curriculum."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FileDropzone
            file={file}
            onFile={(f) => {
              setFile(f);
              setResult(null);
              setError(null);
            }}
          />
        </div>

        <div className="rounded-2xl bg-card p-6 hairline">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Target Job Profile
          </label>
          <select
            value={roleId}
            onChange={(e) => {
              setRoleId(e.target.value as RoleId);
              setResult(null);
              setError(null);
            }}
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <p className="mt-3 text-xs text-muted-foreground">
            {ROLE_MAP[roleId].description}
          </p>

          <button
            onClick={run}
            disabled={!file || running}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running ? "Analyzing Gaps…" : <>Analyze Gaps <ArrowRight className="size-4" /></>}
          </button>

          {running && (
            <p className="mt-3 text-center text-xs text-muted-foreground animate-pulse">
              ⏳ Running gap comparison programmatically — takes 5–15 seconds…
            </p>
          )}
          {error && (
            <p className="mt-3 text-center text-xs text-destructive">{error}</p>
          )}
        </div>
      </div>

      {!result && !running && (
        <div className="mt-8 rounded-2xl bg-card p-12 text-center hairline">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-accent">
            <Compass className="size-6 text-accent" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold">No analysis generated yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Upload your resume, select your target role, and trigger a Skill Gap evaluation to generate your roadmap.
          </p>
        </div>
      )}

      {result && (
        <div className="fade-in-up mt-10 space-y-8">
          {/* Executive Overview */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl bg-card p-8 hairline lg:col-span-1 flex flex-col justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role Readiness Score</p>
                <div className="mt-6 flex justify-center">
                  <ScoreRing value={result.overallReadiness} size={170} />
                </div>
              </div>
              <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
                Aggregated core metrics compared to benchmark competency scores for <span className="font-semibold text-foreground">{ROLE_MAP[roleId].label}</span>.
              </p>
            </div>

            <div className="rounded-2xl bg-card p-6 hairline lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold mb-2">Analysis Executive Summary</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Strengths Badge Row */}
              <div className="mt-6 pt-6 border-t border-border">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">
                  Identified Strengths & Overlap
                </span>
                <div className="flex flex-wrap gap-2">
                  {result.strengths.map((str, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-full bg-success/10 border border-success/15 px-3 py-1 text-xs font-medium text-success"
                    >
                      <CheckCircle className="size-3" />
                      {str}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Gaps Deep Dive */}
          <div className="rounded-2xl bg-card p-6 hairline">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="size-5 text-warning" />
              <h2 className="font-display text-lg font-semibold">Prioritized Skill Gaps</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              The missing technical categories, concepts, and tooling requested in target specifications.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {result.gaps.map((gap, index) => (
                <div key={index} className="rounded-xl border border-border bg-background p-5 hover:shadow-elegant transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                        {gap.category}
                      </span>
                      <h4 className="font-display text-base font-semibold text-foreground">{gap.skill}</h4>
                    </div>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${getPriorityColor(gap.priority)}`}>
                      {gap.priority}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                    {gap.rationale}
                  </p>

                  <div className="mt-4 pt-3 border-t border-border/60">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Competency Delta</span>
                      <span className="font-medium text-foreground">{gap.currentLevel}% → {gap.targetLevel}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="relative h-full w-full">
                        {/* Target level bar */}
                        <div
                          className="absolute inset-y-0 left-0 bg-accent/20 rounded-full"
                          style={{ width: `${gap.targetLevel}%` }}
                        />
                        {/* Current level bar */}
                        <div
                          className="absolute inset-y-0 left-0 bg-accent rounded-full"
                          style={{ width: `${gap.currentLevel}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Learning Plan */}
          <div className="rounded-2xl bg-card p-6 hairline">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-1">
              <div className="flex items-center gap-2">
                <Calendar className="size-5 text-accent" />
                <h2 className="font-display text-lg font-semibold">90-Day Learning Curriculum</h2>
              </div>

              {/* Tabs */}
              <div className="flex rounded-lg bg-secondary p-0.5 border border-border">
                {(["30-day", "60-day", "90-day"] as const).map((phase) => (
                  <button
                    key={phase}
                    onClick={() => setSelectedPhase(phase)}
                    className={`rounded-md px-3.5 py-1 text-xs font-semibold uppercase tracking-wider transition-all ${
                      selectedPhase === phase
                        ? "bg-background text-primary shadow-elegant"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {phase}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Actionable phased plan. Deepen skills, tackle portfolio-ready projects, and study core books.
            </p>

            {/* Render Milestone */}
            {result.milestones
              .filter((m) => m.phase === selectedPhase)
              .map((milestone) => (
                <div key={milestone.id} className="grid md:grid-cols-3 gap-6 fade-in-up">
                  {/* Milestone summary columns */}
                  <div className="md:col-span-1 bg-secondary/40 border border-border rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.1em] text-accent">
                        <Sparkles className="size-4" /> Milestone Target
                      </div>
                      <h3 className="font-display text-lg font-semibold mt-3 text-foreground leading-tight">
                        {milestone.title}
                      </h3>
                      <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed/secondary">
                        {milestone.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {milestone.durationWeeks} weeks</span>
                      <span className="font-semibold text-accent">{milestone.skills.length} target skills</span>
                    </div>
                  </div>

                  {/* Curated Resources */}
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Curated Curriculum & Labs
                    </h4>
                    <div className="divide-y divide-border rounded-xl border border-border bg-background">
                      {milestone.resources.map((val, idx) => (
                        <div key={idx} className="flex items-center justify-between font-medium p-4 text-sm gap-4 transition-colors hover:bg-secondary/20">
                          <div className="flex items-center gap-3">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                              {getResourceIcon(val.type)}
                            </span>
                            <div>
                              <p className="font-medium text-foreground text-sm leading-snug">{val.title}</p>
                              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block mt-0.5">
                                {val.type}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 text-muted-foreground text-xs">
                            <Clock className="size-3" />
                            <span>{val.estimatedHours} hrs</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
