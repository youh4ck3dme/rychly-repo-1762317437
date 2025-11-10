// src/services/geminiService.ts - Opravená verzia bez top-level await

import type { HairSuggestion } from "../types";

export async function applyVirtualTryOn(
  userImage: string,
  suggestion: HairSuggestion,
): Promise<string> {
  const res = await fetch("/api/hair/virtual-try-on", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userImage, suggestion }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(
      `Virtual try-on failed (${res.status}): ${msg || "unknown error"}`,
    );
  }
  const data = await res.json();
  if (!data?.image)
    throw new Error("Invalid response from virtual try-on API.");
  return data.image;
}

export type ChatSession = {
  send: (message: string) => Promise<string>;
  close: () => void;
};

export function createChatSession(): ChatSession {
  let closed = false;

  return {
    async send(message: string) {
      if (closed) throw new Error("Chat session closed.");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(
          `Chat failed (${res.status}): ${msg || "unknown error"}`,
        );
      }
      const data = await res.json();
      return data?.reply ?? "";
    },
    close() {
      closed = true;
    },
  };
}

// Enhanced retry logic with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain errors
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (
          message.includes("safety") ||
          message.includes("blocked") ||
          message.includes("invalid") ||
          message.includes("quota") ||
          message.includes("authentication")
        ) {
          throw error; // Don't retry these errors
        }
      }

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

// Kompatibilný export pre AnalysisScreen.tsx - bez top-level await
export async function analyzeHairImage(
  imageUrl: string,
  consultationStyle?: string,
  hairstylePreference?: string,
) {
  return retryWithBackoff(
    async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const res = await fetch("/api/hair/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl,
            lang: "sk",
            goals: [consultationStyle, hairstylePreference].filter(Boolean),
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errorText = await res.text().catch(() => "");
          let errorMessage = `Analysis failed: ${res.status}`;

          // Try to parse error response
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // Use raw error text if JSON parsing fails
            if (errorText) {
              errorMessage = errorText;
            }
          }

          throw new Error(errorMessage);
        }

        const data = await res.json();

        // Validate response structure
        if (!data || typeof data !== "object") {
          throw new Error("Invalid response format from analysis API");
        }

        return data;
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error) {
          if (error.name === "AbortError") {
            throw new Error("Request timeout - please try again");
          }
          throw error;
        }

        throw new Error("Unknown error occurred during analysis");
      }
    },
    3,
    1000,
  ); // 3 retries with 1 second base delay
}

// Add isAiAvailable function
export const isAiAvailable = true; // Always available for now, can be made dynamic later
