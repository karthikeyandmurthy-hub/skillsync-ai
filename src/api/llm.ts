/**
 * Purpose: Placeholder interface for future LLM-powered resume review.
 * Responsibilities: Stable contract so UI can wire to a real provider later.
 * Dependencies: utils/errors
 */

import { NotImplementedError } from "@/utils/errors";

export interface LLMResumeReviewInput {
  resumeText: string;
  targetRole: string;
}

export interface LLMResumeReviewOutput {
  summary: string;
  suggestions: string[];
  rewrittenSections: Record<string, string>;
}

export interface LLMProvider {
  reviewResume(input: LLMResumeReviewInput): Promise<LLMResumeReviewOutput>;
}

export const llmProvider: LLMProvider = {
  async reviewResume() {
    throw new NotImplementedError("LLM Resume Review");
  },
};
