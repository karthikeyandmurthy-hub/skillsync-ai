/**
 * Purpose: Centralized domain types for SkillSync AI.
 * Responsibilities: Define resume, GitHub, scoring, and role contracts.
 * Dependencies: none (pure types).
 */

export type RoleId =
  | "ai-engineer"
  | "python-developer"
  | "data-scientist"
  | "frontend-engineer"
  | "fullstack-engineer";

export interface Role {
  id: RoleId;
  label: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  keywords: string[];
}

export interface ScoreCategory {
  key: "skills" | "projects" | "experience" | "education" | "keywords" | "formatting";
  label: string;
  weight: number; // 0-100
  score: number;  // 0-100
  notes: string[];
}

export interface ATSResult {
  overall: number; // 0-100
  role: Role;
  categories: ScoreCategory[];
  improvements: Improvement[];
}

export interface Improvement {
  id: string;
  area: string;
  severity: "low" | "medium" | "high";
  before: string;
  after: string;
  rationale: string;
}

export type PortfolioStrength = "Beginner" | "Intermediate" | "Advanced";

export interface GithubAnalysis {
  username: string;
  profileUrl: string;
  codeConsistency: number;     // 0-100
  projectQuality: number;      // 0-100
  portfolioStrength: PortfolioStrength;
  verificationScore: number;   // 0-100
  verifiedSkills: VerifiedSkill[];
  unverifiedSkills: string[];
  topRepos: RepoSummary[];
}

export interface VerifiedSkill {
  skill: string;
  evidenceRepo: string;
  commits: number;
  detail: string;
}

export interface RepoSummary {
  name: string;
  description: string;
  language: string;
  stars: number;
  hasReadme: boolean;
}

export interface DashboardSummary {
  careerReadiness: number;
  atsCompatibility: number;
  githubVerification: number;
  portfolioStrength: PortfolioStrength;
  skillGaps: string[];
  recentActivity: ActivityItem[];
  nextStep: string;
}

export interface ActivityItem {
  id: string;
  label: string;
  timestamp: string;
  kind: "resume" | "github" | "system";
}

// ── Skill Gap ──────────────────────────────────────────────────────────────

export interface SkillGap {
  skill: string;
  category: string;
  priority: "critical" | "high" | "medium" | "low";
  currentLevel: number; // 0-100
  targetLevel: number;  // 0-100
  rationale: string;
}

export interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  skills: string[];
  resources: LearningResource[];
  durationWeeks: number;
  phase: "30-day" | "60-day" | "90-day";
}

export interface LearningResource {
  title: string;
  type: "course" | "project" | "book" | "practice";
  url?: string;
  estimatedHours: number;
}

export interface SkillGapResult {
  role: string;
  overallReadiness: number; // 0-100
  gaps: SkillGap[];
  strengths: string[];
  milestones: LearningMilestone[];
  summary: string;
}

// ── Recruiter View ──────────────────────────────────────────────────────────

export interface RecruiterSignal {
  label: string;
  detail: string;
  impact: "positive" | "negative" | "neutral";
}

export interface ShortlistFactor {
  factor: string;
  score: number; // 0-100
  weight: number; // 0-100
  verdict: "strong" | "average" | "weak";
}

export interface RecruiterViewResult {
  candidateName: string;
  targetRole: string;
  shortlistProbability: number; // 0-100
  firstImpressionScore: number; // 0-100
  shortlistFactors: ShortlistFactor[];
  strongPoints: RecruiterSignal[];
  redFlags: RecruiterSignal[];
  elevatorPitch: string;
  recommendedAction: "strong_yes" | "yes" | "maybe" | "no";
  actionRationale: string;
}

export interface CSVCandidate {
  id: string;
  name: string;
  email: string;
  skills: string[];
  experience: string;
  education: string;
  summary: string;
  matchScore: number;
  verdict: "strong_yes" | "yes" | "maybe" | "no";
  matchedSkills: string[];
  missingSkills: string[];
  isDeepScreened?: boolean;
  deepScreenResult?: RecruiterViewResult;
}
