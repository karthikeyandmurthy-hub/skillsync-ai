/**
 * Purpose: ATS scoring weights. Single source of truth.
 * Responsibilities: Map category → weight (sums to 100).
 * Dependencies: src/types
 */

import type { ScoreCategory } from "@/types";

export const SCORING_WEIGHTS: Record<ScoreCategory["key"], number> = {
  skills: 30,
  projects: 20,
  experience: 20,
  education: 10,
  keywords: 10,
  formatting: 10,
};

export const CATEGORY_LABELS: Record<ScoreCategory["key"], string> = {
  skills: "Skills Match",
  projects: "Projects Match",
  experience: "Experience Match",
  education: "Education Match",
  keywords: "Keyword Relevance",
  formatting: "Formatting",
};
