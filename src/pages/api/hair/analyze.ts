import type { APIRoute } from "astro";
import { secureAPI } from "../../../lib/security";
import { getOpenAIService } from "../../../lib/openaiService";
import type { HairAnalysisResponse, HairAnalysisRequest } from "../../../types";

// Hair Analysis API with comprehensive security and error handling
export const POST: APIRoute = secureAPI(
  async (request: Request, sanitizedBody: HairAnalysisRequest) => {
    const { imageUrl, locale = "sk" } = sanitizedBody;

    // Enhanced input validation
    if (!imageUrl || typeof imageUrl !== "string") {
      return new Response(
        JSON.stringify({
          error: "imageUrl is required and must be a valid string",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate image URL format
    try {
      const url = new URL(imageUrl);
      const allowedHosts = [
        "imgur.com",
        "cloudinary.com",
        "unsplash.com",
        "pexels.com",
        "i.ibb.co",
        "postimg.cc",
      ];
      const isAllowedHost =
        allowedHosts.some((host) => url.hostname.includes(host)) ||
        url.hostname === "localhost";

      if (!isAllowedHost && !process.env.ALLOW_ALL_IMAGE_HOSTS) {
        return new Response(
          JSON.stringify({
            error: "Image URL must be from an allowed host",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    } catch (urlError) {
      return new Response(
        JSON.stringify({
          error: "Invalid image URL format",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Generate fallback response function
    const generateFallbackResponse = (
      reason: string,
    ): HairAnalysisResponse => ({
      hairType: "stredne husté, rovné vlasy",
      condition: "zdravé, dobre hydratované",
      faceShape: "oválna",
      recommendations: [
        {
          type: "strih",
          title: "Vrstvený bob s ofinou",
          description:
            "Moderný strih, ktorý dodá objem a dynamiku vašim vlasom. Vhodný pre väčšinu typov tváre.",
          difficulty: "medium",
          maintenance: "medium",
        },
        {
          type: "farba",
          title: "Prirodzené zvýraznenie",
          description:
            "Jemné melírovanie v teplých odtieňoch, ktoré rozjasní váš vzhľad a dodá rozmer.",
          difficulty: "easy",
          maintenance: "low",
        },
        {
          type: "styling",
          title: "Voľné textúrované vlny",
          description:
            "Prírodný styling s použitím texturizačného spraya pre ležérny, ale upravený vzhľad.",
          difficulty: "easy",
          maintenance: "low",
        },
        {
          type: "starostlivost",
          title: "Hydratačná kúra",
          description:
            "Týždenná hydratačná maska pre zachovanie zdravých a lesklých vlasov.",
          difficulty: "easy",
          maintenance: "medium",
        },
      ],
      confidence: 0.75,
      language: locale,
      note: reason,
    });

    try {
      // Check if OpenAI service is available
      if (
        !process.env.OPENAI_API_KEY ||
        process.env.OPENAI_API_KEY.includes("your-") ||
        process.env.OPENAI_API_KEY.trim() === "" ||
        !process.env.OPENAI_API_KEY.startsWith("sk-")
      ) {
        return new Response(
          JSON.stringify(
            generateFallbackResponse("OpenAI API key not configured"),
          ),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Get OpenAI service instance and analyze image
      const openaiService = getOpenAIService();
      const analysis = await openaiService.analyzeHairImage(imageUrl);

      // Transform the analysis result to match our expected format
      const parsedResponse: HairAnalysisResponse = {
        hairType: analysis.hairType,
        condition: analysis.condition,
        faceShape: "oválna", // Default since the service doesn't provide this
        recommendations: analysis.recommendations.map(
          (rec: string, index: number) => ({
            type:
              index % 4 === 0
                ? "strih"
                : index % 4 === 1
                  ? "farba"
                  : index % 4 === 2
                    ? "styling"
                    : "starostlivost",
            title: rec.split(":")[0] || `Odporúčanie ${index + 1}`,
            description: rec.split(":")[1] || rec,
            difficulty: "medium" as const,
            maintenance: "medium" as const,
          }),
        ),
        confidence: analysis.confidence,
        language: locale,
      };

      return new Response(JSON.stringify(parsedResponse), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    } catch (error: any) {
      console.error("Hair analysis error:", error);

      // Return structured fallback response for any errors
      return new Response(
        JSON.stringify(
          generateFallbackResponse(
            `Service temporarily unavailable: ${error.message}`,
          ),
        ),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
  {
    requiredFields: ["imageUrl"],
    requireAuth: false,
    rateLimitBy: "ip",
    rateLimitMax: 10,
    rateLimitWindowMs: 60000, // 1 minute
    maxBodyBytes: 1024 * 50, // 50KB max body size
    image: {
      allowHosts: [
        "imgur.com",
        "cloudinary.com",
        "unsplash.com",
        "pexels.com",
        "i.ibb.co",
        "postimg.cc",
      ],
      allowExt: ["jpg", "jpeg", "png", "webp"],
    },
  },
);
