import type { APIRoute } from "astro";
import { secureAPI } from "../../../lib/security";
import { getOpenAIService } from "../../../lib/openaiService";
import type { VirtualTryOnRequest, VirtualTryOnResponse } from "../../../types";

export const POST: APIRoute = secureAPI(
  async (request: Request, sanitizedBody: VirtualTryOnRequest) => {
    const { userImage, suggestion } = sanitizedBody;

    // Enhanced input validation
    if (!userImage || typeof userImage !== "string") {
      return new Response(
        JSON.stringify({
          error: "userImage is required and must be a valid string",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!suggestion || typeof suggestion !== "object") {
      return new Response(
        JSON.stringify({
          error: "suggestion is required and must be a valid object",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate image URL format
    try {
      const url = new URL(userImage);
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

    try {
      // Check if OpenAI service is available
      if (
        !process.env.OPENAI_API_KEY ||
        process.env.OPENAI_API_KEY.includes("your-") ||
        process.env.OPENAI_API_KEY.includes("sk-")
      ) {
        // Generate fallback virtual try-on image using canvas
        const fallbackImage = await generateFallbackTryOn(
          userImage,
          suggestion,
        );
        return new Response(
          JSON.stringify({
            image: fallbackImage,
            method: "fallback",
            note: "Using fallback virtual try-on due to API configuration",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Get OpenAI service instance and generate virtual try-on
      const openaiService = getOpenAIService();
      const virtualTryOnResult = await openaiService.generateVirtualTryOn(
        userImage,
        suggestion,
      );

      const response: VirtualTryOnResponse = {
        image: virtualTryOnResult.image,
        confidence: virtualTryOnResult.confidence,
        method: "ai",
        processingTime: virtualTryOnResult.processingTime,
      };

      // Detailed logging for successful API responses
      console.log("Virtual try-on API success:", {
        method: "ai",
        confidence: virtualTryOnResult.confidence,
        processingTime: virtualTryOnResult.processingTime,
        imageSize: virtualTryOnResult.image?.length || 0,
        suggestion: suggestion.name || "unknown",
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get("user-agent"),
      });

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    } catch (error: any) {
      // Enhanced error logging with detailed information
      console.error("Virtual try-on API error:", {
        error: error.message,
        stack: error.stack,
        userImage: userImage.substring(0, 100) + "...", // Truncate for logging
        suggestion: JSON.stringify(suggestion),
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get("user-agent"),
        ip: request.headers.get("x-forwarded-for") || "unknown",
      });

      // Generate validated fallback image on error
      try {
        const fallbackImage = await generateFallbackTryOn(
          userImage,
          suggestion,
        );

        // Validate fallback data
        if (!fallbackImage || typeof fallbackImage !== "string" || !fallbackImage.startsWith("data:")) {
          throw new Error("Invalid fallback image generated");
        }

        console.log("Using fallback virtual try-on due to API error:", {
          originalError: error.message,
          fallbackMethod: "canvas-overlay",
          timestamp: new Date().toISOString(),
        });

        return new Response(
          JSON.stringify({
            image: fallbackImage,
            method: "fallback",
            note: `AI service unavailable: ${error.message}`,
            errorDetails: process.env.NODE_ENV === "development" ? error.stack : undefined,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      } catch (fallbackError: any) {
        console.error("Fallback generation failed:", {
          fallbackError: fallbackError.message,
          originalError: error.message,
          timestamp: new Date().toISOString(),
        });

        return new Response(
          JSON.stringify({
            error: "Virtual try-on service temporarily unavailable",
            details: process.env.NODE_ENV === "development" ? fallbackError.message : undefined,
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }
  },
  {
    requiredFields: ["userImage", "suggestion"],
    requireAuth: false,
    rateLimitBy: "ip",
    rateLimitMax: 5,
    rateLimitWindowMs: 60000, // 1 minute - more restrictive for AI operations
    maxBodyBytes: 1024 * 100, // 100KB max body size
  },
);

// Fallback virtual try-on generator - server-compatible
async function generateFallbackTryOn(
  userImage: string,
  suggestion: any,
): Promise<string> {
  try {
    // Validate inputs
    if (!userImage || typeof userImage !== "string") {
      throw new Error("Invalid user image URL");
    }

    if (!suggestion || typeof suggestion !== "object") {
      throw new Error("Invalid suggestion object");
    }

    // For server-side, return a placeholder with suggestion info
    // In production, this could be replaced with a proper image processing library
    const placeholderData = {
      originalImage: userImage,
      suggestion: suggestion,
      generatedAt: new Date().toISOString(),
      method: "server-fallback",
    };

    // Create a simple SVG placeholder that can be displayed as an image
    const svgContent = `
      <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="40%" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#6b7280">
          Virtual Try-On Preview
        </text>
        <text x="50%" y="50%" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#9ca3af">
          ${suggestion.name || "Hair Style"}
        </text>
        ${suggestion.hex ? `<rect x="45%" y="60%" width="10%" height="5%" fill="${suggestion.hex}"/>` : ""}
        <text x="50%" y="80%" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
          PAPI Hair Design
        </text>
      </svg>
    `;

    // Convert SVG to data URL
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`;

    console.log("Generated fallback image:", {
      method: "svg-placeholder",
      suggestionName: suggestion.name,
      hasColor: !!suggestion.hex,
      timestamp: new Date().toISOString(),
    });

    return svgDataUrl;
  } catch (error) {
    console.error("Error generating fallback image:", error);
    // Return a minimal fallback
    return `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#6b7280">
          Preview Unavailable
        </text>
      </svg>
    `).toString("base64")}`;
  }
}
