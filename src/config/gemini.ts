/**
 * Purpose: Gemini API Configuration details.
 * Responsibilities: Holds Gemini model name and reads the API key from environment.
 *
 * Set VITE_GEMINI_API_KEY in your local .env file (never commit that file).
 * Example .env:
 *   VITE_GEMINI_API_KEY=your_key_here
 */

export const GEMINI_CONFIG = {
  // Read API key from Vite environment variable (set in .env — never committed)
  API_KEY: import.meta.env.VITE_GEMINI_API_KEY ?? "",
  MODEL: "gemini-3.5-flash",
  API_URL: "https://generativelanguage.googleapis.com/v1beta/models",
};
