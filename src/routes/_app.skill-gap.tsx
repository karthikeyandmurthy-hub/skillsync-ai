/**
 * Purpose: Skill Gap & Career Roadmap — interactive 30/60/90 day plan.
 * Responsibilities: Role selector, readiness metrics, phased tabs, projects.
 * Dependencies: services/roadmapData, config/roles, components/*
 */

import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Layers,
  Rocket,
  Sparkles,
  Target,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { ROLES } from "@/config/roles";
import { getRoadmap, type RoadmapPhase } from "@/services/roadmapData";
import type { RoleId } from "@/types";

export const Route = createFileRoute("/_app/skill-gap")({
  head: () => ({
    meta: [
      { title: "Skill Gap & Roadmap — SkillSync AI" },
      {
        name: "description",
        content: "A 30 / 60 / 90 day learning plan tailored to your target role.",
      },
    ],
  }),
  component: SkillGapPage,
});

type PhaseId = RoadmapPhase["id"];

function SkillGapPage() {
  const [roleId, setRoleId] = useState<RoleId>("ai-engineer");
  const [phaseId, setPhaseId] = useState<PhaseId>("30");

  const roadmap = useMemo(() => getRoadmap(roleId), [roleId]);
  const activePhase =
    roadmap.phases.find((p) => p.id === phaseId) ?? roadmap.phases[0];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Career planning"
        title="Skill Gap & Career Roadmap"
        description="A 30 / 60 / 90 day learning plan tailored to your target role."
      />

      {/* Role selector */}
      <div className="fade-in-up mb-8 flex flex-col gap-3 rounded-2xl bg-card p-5 hairline sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Target role
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Toggle a role to recalculate your gaps and roadmap.
          </p>
        </div>
        <div className="relative">
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value as RoleId)}
            className="min-w-[260px] appearance-none rounded-xl border border-border bg-background px-4 py-2.5 pr-10 text-sm font-medium text-foreground shadow-sm outline-none transition-colors hover:border-accent focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <MetricCard icon={AlertTriangle} label="Core Gaps Identified">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-semibold text-warning">
              {roadmap.coreGaps.length}
            </span>
            <span className="text-sm text-muted-foreground">critical skills missing</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {roadmap.coreGaps.map((g) => (
              <span
                key={g}
                className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary"
              >
                {g}
              </span>
            ))}
          </div>
        </MetricCard>

        <MetricCard icon={Target} label="Current Readiness Score">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-semibold text-accent">
              {roadmap.readiness}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-accent transition-all duration-700"
              style={{ width: `${roadmap.readiness}%` }}
            />
          </div>
        </MetricCard>

        <MetricCard icon={CalendarClock} label="Estimated Time to Ready">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-semibold text-foreground">
              {roadmap.estimatedDays}
            </span>
            <span className="text-sm text-muted-foreground">days</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Based on ~1 hr/day of focused practice.
          </p>
        </MetricCard>
      </div>

      {/* Roadmap timeline tabs */}
      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            30 / 60 / 90 Day Roadmap
          </h2>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Tailored for {ROLES.find((r) => r.id === roleId)?.label}
          </span>
        </div>

        <div className="rounded-2xl bg-card p-2 hairline">
          <div className="grid grid-cols-3 gap-1">
            {roadmap.phases.map((p) => {
              const active = p.id === phaseId;
              return (
                <button
                  key={p.id}
                  onClick={() => setPhaseId(p.id)}
                  className={`rounded-xl px-4 py-3 text-left transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-[var(--shadow-elegant)]"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
                    <span
                      className={`grid size-5 place-items-center rounded-full text-[10px] font-semibold ${
                        active
                          ? "bg-primary-foreground text-primary"
                          : "bg-secondary text-primary"
                      }`}
                    >
                      {p.id === "30" ? "1" : p.id === "60" ? "2" : "3"}
                    </span>
                    {p.id} Days
                  </div>
                  <p
                    className={`mt-1.5 text-sm font-semibold ${
                      active ? "text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    {p.title}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active phase content */}
        <div key={activePhase.id} className="fade-in-up mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-card p-6 hairline">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-accent">
              <Layers className="size-4" /> Skills to bridge
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{activePhase.subtitle}</p>
            <ul className="mt-5 space-y-2">
              {activePhase.skillsToBridge.map((s) => (
                <li
                  key={s}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <span className="size-1.5 rounded-full bg-accent" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-card p-6 hairline lg:col-span-2">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-accent">
              <CheckCircle2 className="size-4" /> Learning objectives
            </div>
            <ul className="mt-5 space-y-3">
              {activePhase.objectives.map((o, i) => (
                <li key={o} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-xl border border-dashed border-border bg-background p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <Rocket className="size-3.5" /> Recommended micro-project
              </div>
              <p className="mt-2 font-display text-lg font-semibold text-foreground">
                {activePhase.microProject.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {activePhase.microProject.summary}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Suggested projects */}
      <section className="mt-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Suggested capstone projects
          </h2>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-accent" /> Portfolio-grade
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {roadmap.suggestedProjects.map((p) => (
            <article
              key={p.name}
              className="fade-in-up rounded-2xl bg-card p-6 hairline transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              <h3 className="font-display text-xl font-semibold text-foreground">{p.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.summary}</p>

              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Tech stack
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.stack.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Features to implement
                </p>
                <ul className="mt-3 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        className="mt-0.5 size-4 shrink-0 rounded border-border text-accent focus:ring-accent/30"
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
