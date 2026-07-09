/**
 * Purpose: Public landing page — pre-login marketing surface.
 * Responsibilities: Hero, value pillars, secondary CTA. Apple-style minimal.
 * Dependencies: TanStack Router
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Github, ShieldCheck, Target } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillSync AI — Resume & Career Readiness Analyzer" },
      { name: "description", content: "Analyze your resume, verify your GitHub skills, identify gaps, and prepare for industry roles." },
      { property: "og:title", content: "SkillSync AI — Resume & Career Readiness Analyzer" },
      { property: "og:description", content: "Transform your resume into career readiness." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SkillSync logo" className="size-8 rounded-lg object-contain" />
            <span className="font-display text-lg font-semibold tracking-tight">SkillSync</span>
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Open dashboard <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-24 sm:pt-32">
        <div className="fade-in-up mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent">
            Career Readiness Platform
          </p>
          <h1 className="mt-5 font-display text-5xl text-balance tracking-tight text-foreground sm:text-6xl md:text-7xl">
            Transform your resume into <span className="text-accent">career readiness</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Analyze your resume, verify your GitHub skills, identify gaps, and prepare for industry roles — all in one calm, focused workspace.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/resume"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[var(--shadow-lift)]"
            >
              Analyze resume <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/github"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Github className="size-4" /> Verify GitHub profile
            </Link>
          </div>
        </div>

        {/* Preview card */}
        <div className="fade-in-up mx-auto mt-20 max-w-4xl rounded-3xl bg-card p-2 hairline">
          <div className="rounded-2xl border border-border bg-background p-8 sm:p-12">
            <div className="grid gap-8 sm:grid-cols-3">
              <Stat label="Career readiness" value="78" tone="text-accent" />
              <Stat label="ATS compatibility" value="82" tone="text-success" />
              <Stat label="Skills verified" value="12 / 17" tone="text-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl text-balance text-foreground sm:text-5xl">
              Built for the entire readiness loop.
            </h2>
            <p className="mt-4 text-muted-foreground">
              From resume polish to GitHub proof to a personal learning roadmap.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Pillar icon={FileText} title="Resume Analyzer" body="Transparent, weighted ATS scoring with Before → After rewrites." />
            <Pillar icon={Github} title="GitHub Verification" body="Match claimed skills to real repos, commits, and project quality." />
            <Pillar icon={Target} title="Skill Gap Engine" body="Prioritized gaps with a 30 / 60 / 90 day learning plan." />
            <Pillar icon={ShieldCheck} title="Recruiter View" body="See yourself the way a hiring manager would." />
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="font-display text-4xl text-balance text-foreground sm:text-5xl">
          Ready when you are.
        </h2>
        <p className="mt-4 text-muted-foreground">No setup. Drop in a resume to begin.</p>
        <div className="mt-8 flex justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[var(--shadow-lift)]"
          >
            Enter dashboard <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} SkillSync AI</span>
          <span>Crafted for university placement cells & recruiters.</span>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="text-center">
      <p className={`font-display text-5xl font-semibold tracking-tight ${tone}`}>{value}</p>
      <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function Pillar({
  icon: Icon, title, body,
}: { icon: typeof FileText; title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-background p-6 hairline transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]">
      <div className="grid size-10 place-items-center rounded-lg bg-secondary text-accent">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
