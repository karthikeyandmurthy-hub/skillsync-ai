/**
 * Purpose: Skill Gap & Career Roadmap (placeholder).
 * Responsibilities: Reserve route + render coming-soon state.
 * Dependencies: components/PageHeader
 */

import { createFileRoute } from "@tanstack/react-router";
import { Target } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/skill-gap")({
  head: () => ({ meta: [{ title: "Skill Gap & Roadmap — SkillSync AI" }] }),
  component: () => (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Coming soon" title="Skill Gap & Career Roadmap" description="A 30 / 60 / 90 day learning plan tailored to your target role." />
      <div className="rounded-2xl bg-card p-12 text-center hairline">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-accent">
          <Target className="size-5" />
        </div>
        <p className="mt-5 text-sm text-muted-foreground">This module is being crafted next. We'll surface prioritized gaps and suggest projects.</p>
      </div>
    </div>
  ),
});
