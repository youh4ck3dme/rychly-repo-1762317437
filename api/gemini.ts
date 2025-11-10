import type { VercelRequest, VercelResponse } from "@vercel/node";

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
        // Placeholder: would call Google GenAI with schema
        return json(res, 200, {
          currentHair: {
            color: "Dark Brown",
            condition: "Healthy",
            type: "Wavy",
          },
          suggestions: [
            {
              name: "Caramel Dimension",
              hairstyle: "Layered",
              hex: "#B98555",
              description: "Warm caramel layers enhance natural movement.",
              services: ["Farbenie (celých vlasov)"],
            },
            {
              name: "Ash Gloss Upgrade",
              hairstyle: "Current Style",
              hex: "#8A7F74",
              description: "Soft neutral ash tone balances complexion.",
              services: ["Farbenie (odrasty)"],
            },
          ],
        });
      }
      case "virtualTryOn": {
        return json(res, 200, {
          imageUrl: "data:image/png;base64,MOCK_IMAGE_DATA",
        });
      }
      case "editImage": {
        // Placeholder for image editing with prompt
        return json(res, 200, { data: "MOCK_BASE64_DATA" });
      }
      case "chat": {
        const text = payload?.messages?.slice(-1)?.[0]?.text || "Hello";
        return json(res, 200, { text: `Model reply: ${text}` });
      }
      default:
        return json(res, 400, { error: "Unknown action" });
    }
  } catch (e: any) {
    return json(res, 500, { error: e?.message || "Internal error" });
  }
}
