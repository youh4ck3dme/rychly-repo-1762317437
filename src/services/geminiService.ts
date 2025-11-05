// src/services/geminiService.ts - Opravená verzia bez top-level await

import type { HairSuggestion } from "../types";

export async function applyVirtualTryOn(userImage: string, suggestion: HairSuggestion): Promise<string> {
  const res = await fetch("/api/hair/virtual-try-on", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userImage, suggestion }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Virtual try-on failed (${res.status}): ${msg || "unknown error"}`);
  }
  const data = await res.json();
  if (!data?.image) throw new Error("Invalid response from virtual try-on API.");
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
        throw new Error(`Chat failed (${res.status}): ${msg || "unknown error"}`);
      }
      const data = await res.json();
      return data?.reply ?? "";
    },
    close() {
      closed = true;
    },
  };
}

// Kompatibilný export pre AnalysisScreen.tsx - bez top-level await
export async function analyzeHairImage(
  imageUrl: string,
  consultationStyle?: string,
  hairstylePreference?: string
) {
  const res = await fetch("/api/hair/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      imageUrl, 
      lang: "sk",
      goals: [consultationStyle, hairstylePreference].filter(Boolean)
    }),
  });
  if (!res.ok) throw new Error(`Analysis failed: ${res.status}`);
  return res.json();
}
