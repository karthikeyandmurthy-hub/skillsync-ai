/**
 * Purpose: Deterministic mock ATS scoring engine.
 * Responsibilities: Given a file + role, return a weighted ATS breakdown
 *   and Before/After improvement suggestions. Pure logic, no I/O.
 * Dependencies: types, config, utils/logger
 *
 * NOTE: This is a transparent mock so the UI is fully populated without
 *   server-side parsing. Real PDF/DOCX parsing plugs in here later behind
 *   the same return contract.
 */

import type { ATSResult, Improvement, Role, ScoreCategory } from "@/types";
import { CATEGORY_LABELS, SCORING_WEIGHTS } from "@/config/scoringWeights";
import { logger } from "@/utils/logger";

const TAG = "[ATS_ENGINE]";

/**
 * Cheap deterministic hash so the same filename + role yield stable scores.
 * @param input string to hash
 * @returns unsigned 32-bit int
 */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function band(seed: number, min: number, max: number): number {
  return min + (seed % (max - min + 1));
}

/**
 * Run the mock ATS analysis.
 * @param fileName uploaded resume file name
 * @param role target role definition
 * @returns structured ATSResult
 */
export function analyzeResume(fileName: string, role: Role): ATSResult {
  logger.info(TAG, "analyzeResume", { fileName, role: role.id });

  const seed = hash(`${fileName}::${role.id}`);

  const baseScores: Record<ScoreCategory["key"], number> = {
    skills: band(seed >> 1, 55, 92),
    projects: band(seed >> 3, 50, 90),
    experience: band(seed >> 5, 40, 88),
    education: band(seed >> 7, 70, 98),
    keywords: band(seed >> 9, 45, 90),
    formatting: band(seed >> 11, 60, 95),
  };

  const categories: ScoreCategory[] = (Object.keys(SCORING_WEIGHTS) as ScoreCategory["key"][]).map(
    (key) => ({
      key,
      label: CATEGORY_LABELS[key],
      weight: SCORING_WEIGHTS[key],
      score: baseScores[key],
      notes: notesFor(key, baseScores[key], role),
    }),
  );

  const overall = Math.round(
    categories.reduce((acc, c) => acc + (c.score * c.weight) / 100, 0),
  );

  return {
    overall,
    role,
    categories,
    improvements: improvementsFor(seed, role, baseScores),
  };
}

function notesFor(
  key: ScoreCategory["key"],
  score: number,
  role: Role,
): string[] {
  if (score >= 85) return [`Strong ${CATEGORY_LABELS[key].toLowerCase()} for ${role.label}.`];
  if (score >= 70) return [`Solid baseline — minor improvements possible.`];
  return [`Below the bar for ${role.label}. Prioritize this section.`];
}

function improvementsFor(
  seed: number,
  role: Role,
  scores: Record<ScoreCategory["key"], number>,
): Improvement[] {
  const items: Improvement[] = [
    {
      id: "verbs",
      area: "Action Verbs",
      severity: scores.experience < 75 ? "high" : "medium",
      before: "Responsible for building data pipelines for the team.",
      after: "Architected and shipped 6 production data pipelines processing 12M events/day.",
      rationale: "Replace passive phrasing with quantified, outcome-driven verbs.",
    },
    {
      id: "skills",
      area: "Skills Alignment",
      severity: scores.skills < 75 ? "high" : "low",
      before: "Familiar with Python and some ML tools.",
      after: `Proficient in ${role.requiredSkills.slice(0, 3).join(", ")} with 2+ years of applied experience.`,
      rationale: `Mirror the language of a ${role.label} job description.`,
    },
    {
      id: "format",
      area: "Formatting",
      severity: scores.formatting < 80 ? "medium" : "low",
      before: "Multi-column layout with embedded tables and graphics.",
      after: "Single-column, ATS-safe layout with standard section headings.",
      rationale: "Most ATS parsers strip tables and columns, losing content.",
    },
    {
      id: "keywords",
      area: "Keywords",
      severity: scores.keywords < 70 ? "high" : "low",
      before: "Built a few ML side projects.",
      after: `Delivered ${role.keywords[0]} project using ${role.requiredSkills[0]} and ${role.requiredSkills[1]}.`,
      rationale: "Targeted keywords lift recruiter-search recall.",
    },
  ];
  return items.filter((_, i) => (seed >> i) % 5 !== 0 || i < 2);
}
