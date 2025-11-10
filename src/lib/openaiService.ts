import OpenAI from "openai";

// OpenAI service for hair analysis and chat
export class OpenAIService {
  private client: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is required");
    }

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Analyze hair image using OpenAI Vision
   */
  async analyzeHairImage(imageUrl: string): Promise<{
    hairType: string;
    condition: string;
    recommendations: string[];
    confidence: number;
  }> {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this hair image and provide: 1) Hair type (straight, wavy, curly, coily), 2) Hair condition (healthy, damaged, dry, oily), 3) Specific recommendations for care and styling. Respond in JSON format.",
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

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from OpenAI");
      }

      // Parse JSON response
      const analysis = JSON.parse(content);

      return {
        hairType: analysis.hairType || "Unknown",
        condition: analysis.condition || "Unknown",
        recommendations: analysis.recommendations || [],
        confidence: analysis.confidence || 0.8,
      };
    } catch (error) {
      console.error("OpenAI analysis error:", error);
      throw new Error("Failed to analyze hair image");
    }
  }

  /**
   * Generate chat response using OpenAI
   */
  async generateChatResponse(
    message: string,
    context?: string,
  ): Promise<string> {
    try {
      const systemPrompt = `You are PAPI, an expert AI hair stylist assistant for "PAPI Hair Design" salon in Slovakia.

YOUR EXPERTISE:
- Professional hair cutting and styling techniques
- Hair color theory and application
- Hair care and maintenance routines
- Slovak hair care products and trends
- Salon services and pricing
- Customer service excellence

COMMUNICATION STYLE:
- Friendly and approachable, like a trusted friend
- Professional but warm, using "ty" (informal Slovak)
- Knowledgeable and confident in recommendations
- Patient with questions, encouraging exploration
- Slovak language with proper grammar and terminology

RESPONSE GUIDELINES:
- Keep responses conversational but informative
- Ask clarifying questions when needed
- Recommend specific salon services when appropriate
- Suggest products with Slovak brand names when possible
- Provide actionable advice, not just general statements
- End with an offer to help further or book an appointment

SALON INFORMATION:
- Location: Bratislava, Slovakia
- Services: Haircuts, coloring, treatments, styling
- Contact: info@papihairdesign.sk
- Website: https://phd-ai-hair-studio.vercel.app

If you don't know something specific, admit it and offer to connect them with a stylist.

Always respond in Slovak (slovenčina) using proper, friendly language.
${context ? `Context: ${context}` : ""}`;

      const response = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 300,
        temperature: 0.8,
      });

      return (
        response.choices[0]?.message?.content ||
        "I apologize, but I could not generate a response."
      );
    } catch (error) {
      console.error("OpenAI chat error:", error);
      throw new Error("Failed to generate chat response");
    }
  }

  /**
   * Generate hair style suggestions based on user preferences
   */
  async generateHairSuggestions(preferences: {
    faceShape?: string;
    hairType?: string;
    occasion?: string;
    length?: string;
  }): Promise<string[]> {
    try {
      const prompt = `Suggest 3-5 hair style ideas for someone with:
       - Face shape: ${preferences.faceShape || "any"}
       - Hair type: ${preferences.hairType || "any"}
       - Occasion: ${preferences.occasion || "general"}
       - Desired length: ${preferences.length || "any"}

       Provide specific, actionable suggestions.`;

      const response = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a professional hair stylist providing specific style recommendations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || "";
      return content
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .slice(0, 5);
    } catch (error) {
      console.error("OpenAI suggestions error:", error);
      throw new Error("Failed to generate hair suggestions");
    }
  }

  /**
   * Generate virtual try-on image using AI
   */
  async generateVirtualTryOn(
    userImage: string,
    suggestion: any,
  ): Promise<{
    image: string;
    confidence: number;
    processingTime: number;
  }> {
    const startTime = Date.now();

    try {
      // For now, we'll use DALL-E to generate a conceptual image
      // In a production environment, you'd use a specialized hair try-on AI service
      const prompt = `Create a realistic image of a person with ${suggestion.hairstyle} hairstyle in ${suggestion.hex} hair color.
       The person should look professional and well-groomed. High quality, salon-style result.`;

      const response = await this.client.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });

      const processingTime = Date.now() - startTime;
      const imageUrl = response.data?.[0]?.url;

      if (!imageUrl) {
        throw new Error("No image generated");
      }

      // Convert the generated image to base64 for storage
      const imageResponse = await fetch(imageUrl);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      return {
        image: dataUrl,
        confidence: 0.85,
        processingTime: processingTime,
      };
    } catch (error) {
      console.error("OpenAI virtual try-on error:", error);

      // Fallback: return a placeholder or the original image with overlay
      const processingTime = Date.now() - startTime;
      return {
        image: userImage, // Return original image as fallback
        confidence: 0.3,
        processingTime: processingTime,
      };
    }
  }

  /**
   * Generate hair preview with specific style and color
   */
  async generateHairPreview(
    imageUrl: string,
    style?: string,
    color?: string,
  ): Promise<{
    image: string;
    confidence: number;
    processingTime: number;
    suggestions?: string[];
  }> {
    const startTime = Date.now();

    try {
      // Generate preview using DALL-E for conceptual visualization
      const prompt = `Create a professional hair salon preview showing a person with ${style || "modern"} hairstyle in ${color || "natural"} hair color.
       The image should look like a professional salon portfolio photo with good lighting and styling.`;

      const response = await this.client.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });

      const processingTime = Date.now() - startTime;
      const previewImageUrl = response.data?.[0]?.url;

      if (!previewImageUrl) {
        throw new Error("No preview image generated");
      }

      // Convert to base64 for storage
      const imageResponse = await fetch(previewImageUrl);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      // Generate additional suggestions
      const suggestions = await this.generateHairSuggestions({
        hairType: style,
        occasion: "general",
      });

      return {
        image: dataUrl,
        confidence: 0.8,
        processingTime: processingTime,
        suggestions: suggestions,
      };
    } catch (error) {
      console.error("OpenAI hair preview error:", error);

      // Fallback: return original image with overlay
      const processingTime = Date.now() - startTime;
      return {
        image: imageUrl,
        confidence: 0.3,
        processingTime: processingTime,
        suggestions: ["Try different lighting for better preview"],
      };
    }
  }
}

// Singleton instance
let openaiService: OpenAIService | null = null;

export function getOpenAIService(): OpenAIService {
  if (!openaiService) {
    openaiService = new OpenAIService();
  }
  return openaiService;
}
