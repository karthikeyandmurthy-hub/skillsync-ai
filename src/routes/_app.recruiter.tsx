/**
 * Purpose: Recruiter View (placeholder).
 * Responsibilities: Reserve route + render coming-soon state.
 * Dependencies: components/PageHeader
 */

import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/recruiter")({
  head: () => ({ meta: [{ title: "Recruiter View — SkillSync AI" }] }),
  component: () => (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Coming soon" title="Recruiter View" description="Shortlisting probability, strong points, and red flags — seen from a recruiter's perspective." />
      <div className="rounded-2xl bg-card p-12 text-center hairline">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-primary">
          <Briefcase className="size-5" />
        </div>
        <p className="mt-5 text-sm text-muted-foreground">This module is being crafted next.</p>
      </div>
    </div>
  ),
});
