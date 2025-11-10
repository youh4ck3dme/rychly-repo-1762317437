import type { APIRoute } from "astro";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Helper function to validate image URL
function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // Check if it's HTTP/HTTPS
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return false;
    }
    // Check if it has a valid hostname
    if (!parsedUrl.hostname) {
      return false;
    }
    // Basic check for image extensions or data URLs
    const imageExtensions = [
      ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp",
      ".tiff", ".tif", ".svg", ".ico", ".heic", ".heif",
      ".raw", ".cr2", ".nef", ".arw", ".dng"
    ];
    const isDataUrl = url.startsWith("data:image/");
    const hasImageExtension = imageExtensions.some((ext) =>
      url.toLowerCase().includes(ext),
    );

    return isDataUrl || hasImageExtension || url.includes("image");
  } catch {
    return false;
  }
}

// Fallback response for when analysis fails
function getFallbackAnalysis(): any {
  return {
    hairType: "unknown",
    hairCondition: "unknown",
    faceShape: "unknown",
    hairLength: "unknown",
    recommendations: [
      "Try taking the photo in better lighting conditions",
      "Ensure the hair is clearly visible in the image",
      "Avoid blurry or low-resolution photos",
      "Consider professional consultation for accurate analysis",
    ],
    colorSuggestions: [
      "Consult with a professional stylist for personalized color recommendations",
    ],
    careRoutine: [
      "Use gentle, sulfate-free shampoos",
      "Apply conditioner regularly",
      "Trim regularly to maintain healthy ends",
      "Protect hair from heat damage",
    ],
    confidence: 0.1,
  };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { imageUrl, locale = "sk" } = body || {};

    // Enhanced validation
    if (!imageUrl || typeof imageUrl !== "string") {
      return new Response(
        JSON.stringify({
          error: "imageUrl is required and must be a valid string",
          code: "INVALID_IMAGE_URL",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!isValidImageUrl(imageUrl)) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid image URL format. Please provide a valid image URL or data URL",
          code: "INVALID_IMAGE_FORMAT",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const systemPrompt = `You are a professional hair stylist and colorist with 15+ years of experience. Analyze the uploaded hair image and provide a comprehensive assessment.

REQUIRED OUTPUT FORMAT: Return ONLY valid JSON with this exact structure:
{
  "hairType": "straight|wavy|curly|coily|kinky",
  "hairCondition": "healthy|damaged|dry|oily|fine|thick|normal",
  "faceShape": "oval|round|square|heart|diamond|triangle|oblong",
  "hairLength": "short|medium|long|shoulder|bob|pixie",
  "recommendations": [
    "Specific styling tip 1",
    "Specific styling tip 2",
    "Specific styling tip 3",
    "Specific styling tip 4",
    "Specific styling tip 5"
  ],
  "colorSuggestions": [
    "Color recommendation 1",
    "Color recommendation 2",
    "Color recommendation 3"
  ],
  "careRoutine": [
    "Daily care step 1",
    "Daily care step 2",
    "Weekly care step 1",
    "Monthly treatment 1"
  ],
  "confidence": 0.85
}

ANALYSIS CRITERIA:
- Hair Type: Based on curl pattern and texture
- Condition: Assess damage, moisture, shine, split ends
- Face Shape: Analyze facial structure for best styles
- Length: Current hair length category
- Recommendations: 3-5 specific, actionable styling suggestions
- Color Suggestions: 2-3 complementary colors for their features
- Care Routine: Daily/weekly hair care steps
- Confidence: Your certainty level (0.0-1.0)

Be specific, professional, and provide salon-quality advice. Language: Slovak (slovenčina).`;

    // Add timeout wrapper for OpenAI API call
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("OpenAI API timeout")), 30000); // 30 second timeout
    });

    const openaiPromise = openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyzuj túto fotku a vráť JSON report s typom vlasov, tvarom tváre a odporúčaniami.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "low",
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = (await Promise.race([
      openaiPromise,
      timeoutPromise,
    ])) as any;

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.warn("No content in OpenAI response, using fallback");
      return new Response(JSON.stringify(getFallbackAnalysis()), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Enhanced JSON parsing with error handling
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError, "Content:", content);
      return new Response(
        JSON.stringify({
          error: "Failed to parse AI response. Please try again.",
          code: "PARSE_ERROR",
          fallback: getFallbackAnalysis(),
        }),
        {
          status: 200, // Return 200 with fallback data instead of 500
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify(parsedContent), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Hair analysis API error:", error);

    // Categorize errors for better handling
    let errorResponse = {
      error:
        "We couldn't analyze your photo. Please try another one with better lighting.",
      code: "ANALYSIS_FAILED",
      details: error.message || "Unknown error",
    };

    let statusCode = 500;

    if (error.message?.includes("timeout")) {
      errorResponse = {
        error: "Analysis took too long. Please try again.",
        code: "TIMEOUT_ERROR",
        details: "OpenAI API timeout",
      };
      statusCode = 408;
    } else if (
      error.message?.includes("rate limit") ||
      error.code === "rate_limit_exceeded"
    ) {
      errorResponse = {
        error: "Service is busy. Please try again in a few moments.",
        code: "RATE_LIMIT_ERROR",
        details: "OpenAI rate limit exceeded",
      };
      statusCode = 429;
    } else if (
      error.message?.includes("insufficient_quota") ||
      error.code === "insufficient_quota"
    ) {
      errorResponse = {
        error: "Service temporarily unavailable. Please try again later.",
        code: "QUOTA_EXCEEDED",
        details: "OpenAI quota exceeded",
      };
      statusCode = 503;
    } else if (
      error.message?.includes("invalid_api_key") ||
      error.code === "invalid_api_key"
    ) {
      errorResponse = {
        error: "Service configuration error. Please contact support.",
        code: "API_KEY_ERROR",
        details: "Invalid API key",
      };
      statusCode = 500;
    } else if (
      error.message?.includes("network") ||
      error.name === "TypeError"
    ) {
      errorResponse = {
        error: "Network error. Please check your connection and try again.",
        code: "NETWORK_ERROR",
        details: "Network connectivity issue",
      };
      statusCode = 503;
    }

    // For client errors, return fallback data instead of error
    if (statusCode >= 400 && statusCode < 500) {
      return new Response(
        JSON.stringify({
          ...getFallbackAnalysis(),
          warning: errorResponse.error,
          code: errorResponse.code,
        }),
        {
          status: 200, // Return success with fallback data
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify(errorResponse), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
};
