import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;

if (!API_KEY) {
  console.warn(
    "API_KEY environment variable not set. AI features will be disabled.",
  );
} else {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    console.error("Error initializing GoogleGenAI:", error);
    ai = null;
  }
}

export const isAiAvailable = !!ai;

export const editImageWithSofia = async (
  base64ImageData: string,
  prompt: string,
  mimeType: string,
): Promise<{ data: string | null; error: string | null }> => {
  if (!isAiAvailable) {
    return { data: null, error: "api_virtualTryOnUnavailable" };
  }
  try {
    // Log the prompt to verify it's being sent correctly
    console.log("Sending prompt to Gemini API:", prompt);

    const response = await ai!.models.generateContent({
      // FIX: Use the correct model for image editing as per the guidelines.
      model: "gemini-2.0-flash-exp",
      contents: {
        // For this model, `contents` is a single Content object
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        // FIX: The responseModalities array must contain exactly one element: Modality.IMAGE.
        responseModalities: [Modality.IMAGE],
      },
    });

    // FIX: Removed an unnecessary `promptFeedback` check. The subsequent check for `response.candidates` is sufficient to handle successful and blocked responses, simplifying the logic.
    const candidate = response?.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return { data: part.inlineData.data, error: null };
        }
      }
    }

    if (response?.promptFeedback?.blockReason) {
      console.error(
        "Request was blocked by Gemini API:",
        response.promptFeedback,
      );
      const reason = response.promptFeedback.blockReason.toLowerCase();
      if (reason.includes("safety")) {
        return { data: null, error: "api_imageBlockedSafety" };
      }
      return { data: null, error: "api_requestBlocked" };
    }

    console.warn(
      "Gemini API did not return an image. Full response:",
      response,
    );
    return { data: null, error: "api_generationFailed" };
  } catch (error) {
    console.error("Error editing image with Gemini API:", error);
    return { data: null, error: "api_unexpectedError" };
  }
};
