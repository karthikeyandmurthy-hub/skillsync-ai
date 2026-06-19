/**
 * Purpose: Dashboard Home — executive summary.
 * Responsibilities: Surface career readiness, ATS, GitHub, portfolio, gaps.
 * Dependencies: services/mockDashboard, components/*
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  FileText,
  Github,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { ScoreRing } from "@/components/ScoreRing";
import { getDashboardSummary } from "@/services/mockDashboard";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SkillSync AI" },
      { name: "description", content: "Your career readiness at a glance: ATS, GitHub, and skill gaps." },
    ],
  }),
  component: DashboardPage,
});

function tone(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-accent";
  if (score >= 40) return "text-warning";
  return "text-destructive";
}

function DashboardPage() {
  const data = getDashboardSummary();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Overview"
        title="Welcome back."
        description="Here's where you stand for the roles you're targeting."
        actions={
          <Link
            to="/resume"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Analyze new resume <ArrowRight className="size-4" />
          </Link>
        }
      />

      {/* Hero row */}
      <div className="fade-in-up grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-card p-8 hairline lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Career Readiness Score</p>
            <Sparkles className="size-4 text-accent" />
          </div>
          <div className="mt-6 flex justify-center">
            <ScoreRing value={data.careerReadiness} size={180} />
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Composite of resume, GitHub, and skill coverage.
          </p>
        </div>

        <div className="rounded-2xl bg-primary p-8 text-primary-foreground lg:col-span-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground/70">
            <TrendingUp className="size-4" /> Next recommended step
          </div>
          <p className="mt-4 font-display text-2xl leading-snug text-balance sm:text-3xl">
            {data.nextStep}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/skill-gap"
              className="inline-flex items-center gap-2 rounded-full bg-primary-foreground px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary-foreground/90"
            >
              View roadmap <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/github"
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Re-scan GitHub
            </Link>
          </div>
        </div>
      </div>

      {/* Metric grid */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={ShieldCheck} label="ATS Compatibility" hint="vs last scan">
          <div className="flex items-baseline gap-2">
            <span className={`font-display text-4xl font-semibold ${tone(data.atsCompatibility)}`}>
              {data.atsCompatibility}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${data.atsCompatibility}%` }} />
          </div>
        </MetricCard>

        <MetricCard icon={Github} label="GitHub Verification">
          <div className="flex items-baseline gap-2">
            <span className={`font-display text-4xl font-semibold ${tone(data.githubVerification)}`}>
              {data.githubVerification}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">5 verified skills · 3 unverified</p>
        </MetricCard>

        <MetricCard icon={Sparkles} label="Portfolio Strength">
          <span className="font-display text-3xl font-semibold text-foreground">
            {data.portfolioStrength}
          </span>
          <p className="mt-3 text-xs text-muted-foreground">Based on 4 top repositories.</p>
        </MetricCard>

        <MetricCard icon={Target} label="Skill Gaps" hint={`${data.skillGaps.length} found`}>
          <div className="flex flex-wrap gap-1.5">
            {data.skillGaps.slice(0, 3).map((s) => (
              <span key={s} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary">
                {s}
              </span>
            ))}
            {data.skillGaps.length > 3 && (
              <span className="rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground">
                +{data.skillGaps.length - 3} more
              </span>
            )}
          </div>
        </MetricCard>
      </div>

      {/* Activity + Quick actions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-card p-6 hairline lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">Recent activity</h2>
            <Activity className="size-4 text-muted-foreground" />
          </div>
          <ul className="mt-5 divide-y divide-border">
            {data.recentActivity.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className={`grid size-8 place-items-center rounded-full ${
                    a.kind === "resume" ? "bg-accent/10 text-accent"
                    : a.kind === "github" ? "bg-primary/10 text-primary"
                    : "bg-secondary text-muted-foreground"
                  }`}>
                    {a.kind === "resume" ? <FileText className="size-4" />
                      : a.kind === "github" ? <Github className="size-4" />
                      : <Sparkles className="size-4" />}
                  </span>
                  <span className="text-sm text-foreground">{a.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{a.timestamp}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-card p-6 hairline">
          <h2 className="font-display text-lg font-semibold text-foreground">Quick actions</h2>
          <div className="mt-5 flex flex-col gap-3">
            <Link to="/resume" className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:border-accent hover:bg-secondary">
              <span className="flex items-center gap-3 font-medium text-foreground"><FileText className="size-4 text-accent" /> Analyze resume</span>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
            <Link to="/github" className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:border-accent hover:bg-secondary">
              <span className="flex items-center gap-3 font-medium text-foreground"><Github className="size-4 text-primary" /> Verify GitHub</span>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
            <Link to="/skill-gap" className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:border-accent hover:bg-secondary">
              <span className="flex items-center gap-3 font-medium text-foreground"><Target className="size-4 text-warning" /> View skill gaps</span>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
