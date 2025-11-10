import type { APIRoute } from "astro";
import { secureAPI } from "../../lib/security";
import { getOpenAIService } from "../../lib/openaiService";

export const POST: APIRoute = secureAPI(
  async (request, sanitizedBody) => {
    const { message } = sanitizedBody;

    try {
      // Get OpenAI service instance
      const openaiService = getOpenAIService();

      // Generate AI response
      const reply = await openaiService.generateChatResponse(message);

      return new Response(
        JSON.stringify({
          reply,
          timestamp: new Date().toISOString(),
          ai: "openai-gpt35",
        }),
        { status: 200 },
      );
    } catch (error) {
      console.error("Chat API error:", error);

      // Fallback to simple echo response if OpenAI fails
      return new Response(
        JSON.stringify({
          reply: `Ahoj! Povedal si: ${message} (AI služba nedostupná)`,
          timestamp: new Date().toISOString(),
          fallback: true,
          error:
            process.env.NODE_ENV === "development"
              ? (error as Error).message
              : undefined,
        }),
        { status: 200 },
      );
    }
  },
  {
    requiredFields: ["message"],
    requireAuth: true,
    rateLimitBy: "ip",
  },
);
