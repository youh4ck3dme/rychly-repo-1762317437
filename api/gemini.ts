import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Simple in-memory rate limit (IP based) - replace with durable store for production
const rateMap = new Map<string, { count: number; ts: number }>();
const WINDOW_MS = 60_000;
const MAX = 30;

function rateLimit(key: string): boolean {
  const now = Date.now();
  const rec = rateMap.get(key);
  if (!rec || now - rec.ts > WINDOW_MS) {
    rateMap.set(key, { count: 1, ts: now });
    return true;
  }
  if (rec.count >= MAX) return false;
  rec.count++;
  return true;
}

function json(res: VercelResponse, status: number, body: any) {
  res
    .status(status)
    .setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("referrer-policy", "no-referrer");
  res.setHeader("x-frame-options", "DENY");
  return res.json(body);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("access-control-allow-methods", "POST, OPTIONS");
    res.setHeader(
      "access-control-allow-headers",
      "content-type, authorization",
    );
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  const ip =
    ((req.headers["x-forwarded-for"] as string) || "").split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown";
  if (!rateLimit(ip)) {
    return json(res, 429, { error: "Rate limit exceeded. Try again later." });
  }

  if (!req.body) {
    return json(res, 400, { error: "Missing JSON body" });
  }

  const { action, payload } = req.body as { action?: string; payload?: any };
  if (!action) {
    return json(res, 400, { error: "Missing action" });
  }

  try {
    switch (action) {
      case "analyzeHair": {
        const { imagePart, textPart, schema } = payload;
        const result = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: [{ parts: [imagePart, textPart] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        });
        const candidate = result.candidates?.[0];
        if (!candidate?.content?.parts?.[0]?.text) {
          throw new Error("No response generated");
        }
        const response = JSON.parse(candidate.content.parts[0].text);
        return json(res, 200, response);
      }
      case "virtualTryOn": {
        const { imagePart, textPart } = payload;
        const result = await ai.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: [{ parts: [imagePart, textPart] }],
          config: {
            responseModalities: ["image"],
          },
        });
        const candidate = result.candidates?.[0];
        if (!candidate?.content?.parts?.[0]?.inlineData) {
          throw new Error("No image generated");
        }
        const imageUrl = `data:image/png;base64,${candidate.content.parts[0].inlineData.data}`;
        return json(res, 200, { imageUrl });
      }
      case "editImage": {
        const { imagePart, textPart } = payload;
        const result = await ai.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: [{ parts: [imagePart, textPart] }],
          config: {
            responseModalities: ["image"],
          },
        });
        const candidate = result.candidates?.[0];
        if (!candidate?.content?.parts?.[0]?.inlineData) {
          throw new Error("No image generated");
        }
        const data = candidate.content.parts[0].inlineData.data;
        return json(res, 200, { data });
      }
      case "chat": {
        const { messages, systemInstruction } = payload;
        const chat = ai.chats.create({
          model: "gemini-1.5-flash",
          history: messages.slice(0, -1).map((msg: any) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }],
          })),
          config: {
            systemInstruction,
          },
        });
        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMessage.text);
        const candidate = result.candidates?.[0];
        if (!candidate?.content?.parts?.[0]?.text) {
          throw new Error("No response generated");
        }
        return json(res, 200, { text: candidate.content.parts[0].text });
      }
      default:
        return json(res, 400, { error: "Unknown action" });
    }
  } catch (e: any) {
    console.error("Gemini API error:", e);
    return json(res, 500, { error: e?.message || "Internal error" });
  }
}
