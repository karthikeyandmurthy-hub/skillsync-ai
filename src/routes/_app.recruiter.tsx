/**
 * Purpose: Recruiter View — shortlisting probability, strengths, red flags.
 * Responsibilities: Present candidate viability from a recruiter's lens with
 *   role-aware mock data, an animated match gauge, evaluation grid, and
 *   AI-generated summary. Share/export actions trigger toast feedback.
 * Dependencies: services/recruiterData, config/roles, sonner, components/*
 */

import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  FileDown,
  Lightbulb,
  Sparkles,
  Wand2,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { ROLES } from "@/config/roles";
import { getRecruiterEvaluation } from "@/services/recruiterData";
import type { RoleId } from "@/types";

export const Route = createFileRoute("/_app/recruiter")({
  head: () => ({
    meta: [
      { title: "Recruiter View — SkillSync AI" },
      {
        name: "description",
        content:
          "Shortlisting probability, strong points, and red flags — seen from a recruiter's perspective.",
      },
    ],
  }),
  component: RecruiterPage,
});

function RecruiterPage() {
  const [roleId, setRoleId] = useState<RoleId>("ai-engineer");
  const role = useMemo(() => ROLES.find((r) => r.id === roleId)!, [roleId]);
  const evaluation = useMemo(() => getRecruiterEvaluation(roleId), [roleId]);

  const handleExport = () =>
    toast.success("Report queued", {
      description: "PDF export is being prepared and will download shortly.",
    });
  const handleShare = () => {
    const link = `https://skillsync.ai/candidate/${evaluation.candidateId}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => {});
    }
    toast("Shareable link copied", { description: link });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Recruiter"
        title="Recruiter View"
        description="Shortlisting probability, strong points, and red flags — seen from a recruiter's perspective."
        actions={
          <div className="flex items-center gap-2">
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value as RoleId)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
              aria-label="Target role"
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleShare}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Copy className="size-4" />
              Copy link
            </button>
            <button
              onClick={handleExport}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <FileDown className="size-4" />
              Export PDF
            </button>
          </div>
        }
      />

      {/* Hero: match probability + quick facts */}
      <div className="fade-in-up grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="rounded-2xl bg-card p-8 hairline">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Shortlisting probability
          </p>
          <MatchGauge value={evaluation.matchProbability} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            for <span className="font-medium text-foreground">{role.label}</span> roles
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard label="Candidate">
            <p className="font-display text-2xl text-foreground">{evaluation.candidateName}</p>
            <p className="mt-1 text-xs text-muted-foreground">{evaluation.headline}</p>
          </MetricCard>
          <MetricCard label="Experience fit">
            <p className="font-display text-3xl text-foreground">{evaluation.experienceFit}%</p>
            <p className="mt-1 text-xs text-muted-foreground">vs. role requirements</p>
          </MetricCard>
          <MetricCard label="Recruiter signal">
            <p className="font-display text-2xl text-foreground">{evaluation.recruiterSignal}</p>
            <p className="mt-1 text-xs text-muted-foreground">Overall screening call</p>
          </MetricCard>
          <MetricCard label="Verified skills" className="sm:col-span-3">
            <div className="flex flex-wrap gap-2">
              {evaluation.topSkills.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </MetricCard>
        </div>
      </div>

      {/* Evaluation grid */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-card p-6 hairline">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]">
              <CheckCircle2 className="size-4" />
            </div>
            <h2 className="font-display text-xl text-foreground">Strong points & standout signals</h2>
          </div>
          <ul className="mt-5 space-y-4">
            {evaluation.strongPoints.map((p) => (
              <li key={p.title} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[color:var(--color-success)]" />
                <div>
                  <p className="text-sm font-medium text-foreground">{p.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{p.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-card p-6 hairline">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-[color:var(--color-warning)]/10 text-[color:var(--color-warning)]">
              <AlertTriangle className="size-4" />
            </div>
            <h2 className="font-display text-xl text-foreground">Red flags & risk mitigation</h2>
          </div>
          <ul className="mt-5 space-y-4">
            {evaluation.redFlags.map((p) => (
              <li key={p.title} className="rounded-xl border border-border/70 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[color:var(--color-warning)]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{p.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{p.detail}</p>
                    <div
                      className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground"
                      title={p.fix}
                    >
                      <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-accent" />
                      <span>
                        <span className="font-medium text-foreground">How to fix: </span>
                        {p.fix}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* AI Summary */}
      <section className="mt-10 rounded-2xl bg-card p-6 hairline">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-accent/10 text-accent">
              <Sparkles className="size-4" />
            </div>
            <h2 className="font-display text-xl text-foreground">AI-generated recruiter summary</h2>
          </div>
          <button
            onClick={() =>
              toast("Summary regenerated", { description: "A fresh assessment has been drafted." })
            }
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Wand2 className="size-3.5" />
            Regenerate
          </button>
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">{evaluation.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {evaluation.summaryTags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * Animated radial gauge used for the shortlisting probability score.
 */
function MatchGauge({ value }: { value: number }) {
  const size = 220;
  const stroke = 16;
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  const color =
    clamped >= 80
      ? "var(--color-success)"
      : clamped >= 60
        ? "var(--color-accent)"
        : clamped >= 40
          ? "var(--color-warning)"
          : "var(--color-destructive)";

  return (
    <div className="mt-4 flex items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="var(--color-border)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1000ms cubic-bezier(0.2,0.7,0.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-5xl font-semibold tracking-tight text-foreground">
            {clamped}%
          </span>
          <span className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
            Match probability
          </span>
        </div>
      </div>
    </div>
  );
}
