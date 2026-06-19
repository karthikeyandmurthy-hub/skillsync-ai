/**
 * Purpose: Placeholder interface for future AI Interview module.
 * Responsibilities: Stable contract for question generation + answer scoring.
 * Dependencies: utils/errors
 */

import { NotImplementedError } from "@/utils/errors";

export interface InterviewQuestion {
  id: string;
  prompt: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
}

export interface InterviewProvider {
  generateQuestions(role: string, count: number): Promise<InterviewQuestion[]>;
  scoreAnswer(questionId: string, answer: string): Promise<{ score: number; feedback: string }>;
}

export const interviewProvider: InterviewProvider = {
  async generateQuestions() { throw new NotImplementedError("AI Interview"); },
  async scoreAnswer() { throw new NotImplementedError("AI Interview"); },
};
