/**
 * Purpose: Application error classes with user + developer messages.
 * Responsibilities: Distinguish recoverable, validation, and not-implemented errors.
 * Dependencies: none.
 */

export class AppError extends Error {
  readonly userMessage: string;
  readonly debug?: unknown;
  constructor(userMessage: string, debug?: unknown) {
    super(userMessage);
    this.name = "AppError";
    this.userMessage = userMessage;
    this.debug = debug;
  }
}

export class ValidationError extends AppError {
  constructor(userMessage: string, debug?: unknown) {
    super(userMessage, debug);
    this.name = "ValidationError";
  }
}

export class NotImplementedError extends AppError {
  constructor(feature: string) {
    super(`${feature} is coming soon.`, { feature });
    this.name = "NotImplementedError";
  }
}
