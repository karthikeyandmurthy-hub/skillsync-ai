/**
 * Purpose: Mock dashboard summary so the home view is fully populated.
 * Responsibilities: Provide a realistic DashboardSummary snapshot.
 * Dependencies: types
 */

import type { DashboardSummary } from "@/types";

export function getDashboardSummary(): DashboardSummary {
  return {
    careerReadiness: 78,
    atsCompatibility: 82,
    githubVerification: 71,
    portfolioStrength: "Intermediate",
    skillGaps: ["MLOps", "System Design", "AWS", "Kubernetes"],
    recentActivity: [
      { id: "1", label: "Resume analyzed against AI Engineer", timestamp: "2h ago", kind: "resume" },
      { id: "2", label: "GitHub profile re-scanned", timestamp: "Yesterday", kind: "github" },
      { id: "3", label: "Recommended: deepen MLOps fundamentals", timestamp: "2d ago", kind: "system" },
    ],
    nextStep: "Strengthen your MLOps section — it's the highest-leverage gap for AI Engineer roles.",
  };
}
