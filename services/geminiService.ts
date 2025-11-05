import { Type, Modality, Chat } from "@google/genai";
    import type { HairAnalysisResult, ConsultationStyle, HairColorTrend, HairstyleTrend, HairstylePreference, HairSuggestion, ChatMessage } from '../src/types';
    
    // Note: The GoogleGenAI SDK is no longer initialized in the browser.
    // All calls are now routed through our secure Vercel Serverless Function.
    
    const parseDataUrl = (dataUrl: string) => {
        const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (!match || match.length !== 3 || !match[1] || !match[2]) {
            throw new Error("Invalid image data URL format.");
        }
        return { mimeType: match[1], base64ImageData: match[2] };
    };
    
    const analysisSchema = {
      type: Type.OBJECT,
      properties: {
        currentHair: {
          type: Type.OBJECT,
          properties: {
            color: { type: Type.STRING, description: "A descriptive name for the user's current hair color (e.g., 'Dark Brown', 'Ash Blonde')." },
            condition: { type: Type.STRING, description: "A brief assessment of the hair's condition (e.g., 'Healthy', 'Slightly Dry', 'Color-treated')." },
            type: { type: Type.STRING, description: "The hair type (e.g., 'Straight', 'Wavy', 'Curly', 'Coily')." },
          },
          required: ['color', 'condition', 'type'],
        },
        suggestions: {
          type: Type.ARRAY,
          description: "An array of 3-4 recommended hair color and style suggestions.",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "The name of the suggested look (e.g., 'Honey Blonde Wavy Lob')." },
              hairstyle: { type: Type.STRING, description: "The name of the hairstyle (e.g., 'Wavy Lob', 'Current Style')." },
              hex: { type: Type.STRING, description: "A valid CSS hex color code for the primary shade of the look (e.g., '#E6B883')." },
              description: { type: Type.STRING, description: "A concise, appealing description of the look, including WHY it suits the user's facial features." },
              services: {
                type: Type.ARRAY,
                description: "A list of 2-3 specific salon service names from the provided list required to achieve this look. Use exact names from the list. If it is a custom color with no service, return ['N/A'].",
                items: { type: Type.STRING },
              },
            },
            required: ['name', 'hairstyle', 'hex', 'description', 'services'],
          },
        },
      },
      required: ['currentHair', 'suggestions'],
    };
    
    
    const availableServicesList = `
        Dámske – Strih & Styling: Strih, Fúkaná (dlhé vlasy), Fúkaná (polodlhé vlasy), Finálny styling.
        Dámske – Farbenie: Farbenie + strih (odrasty), Farbenie (odrasty), Farbenie (celých vlasov), Farbenie + strih (celých vlasov).
        Dámske – Balayage & Melír: Balayage (celé vlasy), Balayage (doplnenie odrastov), Melír (odrasty), Melír (celé vlasy).
        Dámske – Odfarbovanie & Regenerácia: Čistenie odleskov, Gumovanie farby, Methamorphyc quick, Methamorphyc exclusive, Brazílsky keratín.
        Dámske – Napájanie vlasov & Účesy: Napojenie TAPE IN, Prepojenie TAPE IN, Copíky (braids), Spoločenský účes.
    `;
    
    // Generic function to call our backend proxy
    const API_BASE = (import.meta as any).env?.VITE_API_BASE || '';
    async function callApiProxy(action: string, payload: unknown) {
      const response = await fetch(`${API_BASE}/api/gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
    
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "An unknown error occurred." }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
    
      return response.json();
    }
    
    export const analyzeHairImage = async (
      imageDataUrl: string, 
      consultationStyle: ConsultationStyle,
      hairstylePreference: HairstylePreference
    ): Promise<HairAnalysisResult> => {
      const { mimeType, base64ImageData } = parseDataUrl(imageDataUrl);
    
      const imagePart = {
        inlineData: { mimeType, data: base64ImageData },
      };
    
      const textPart = {
        text: `As an elite AI hair consultant for PAPI HAIR DESIGN & BARBER, your task is to analyze the provided image and create a personalized hair consultation. Your tone must be sophisticated, reassuring, and expert. The response MUST be a single, valid JSON object that strictly adheres to the provided schema, with no markdown formatting or other text.
    
    Follow these analysis steps:
    1.  **Facial Geometry:** Meticulously identify the user's face shape (e.g., Oval, Square) and key features (jawline, forehead).
    2.  **Current Hair Diagnosis:** Accurately assess the current hair color, type, and condition.
    3.  **Tailored Recommendations:** Generate 3-4 exquisite hair suggestions based on the facial geometry and the user's preferences:
        *   Consultation Style Vibe: ${consultationStyle}
        *   Desired Hairstyle Form: ${hairstylePreference}
    4.  **Scientific Rationale:** The 'description' for each suggestion is CRITICAL. It must scientifically explain WHY the style complements their facial features (e.g., "The soft, face-framing layers will balance the width of the forehead, drawing attention to the eyes."). Frame this explanation in an inspiring, professional tone that makes the user excited about the potential transformation.
    5.  **Service Prescription:** For each suggestion, prescribe the precise services needed from this exclusive list: ${availableServicesList}. Use the exact names from the list only.
    
    Generate only the JSON object as your final output.`,
      };
    
      const payload = { imagePart, textPart, schema: analysisSchema };
      try {
        return await callApiProxy('analyzeHair', payload);
      } catch (e) {
        // Dev fallback when backend route missing
        if (typeof window !== 'undefined') {
          console.warn('[analyzeHairImage] Falling back to mock result:', e);
          return {
            currentHair: { color: 'Unknown', condition: 'N/A', type: 'N/A' },
            suggestions: [
              { name: 'Mock Honey Blend', hairstyle: 'Layered', hex: '#E6B883', description: 'Layered warmth to frame the face.', services: ['Farbenie (celých vlasov)'] },
              { name: 'Rich Espresso Depth', hairstyle: 'Current Style', hex: '#3B2F2F', description: 'Depth and shine enhancing natural tone.', services: ['Farbenie (odrasty)'] },
            ]
          } as HairAnalysisResult;
        }
        throw e;
      }
    };
    
    export const applyVirtualTryOn = async (imageDataUrl: string, suggestion: HairSuggestion): Promise<string> => {
      const { mimeType, base64ImageData } = parseDataUrl(imageDataUrl);
    
      const imagePart = {
        inlineData: { mimeType, data: base64ImageData },
      };
    
      const textPart = {
        text: `Perform a hyper-realistic virtual hair transformation on the person in the image.
    
    Transformation Details:
    - Target Hairstyle: "${suggestion.hairstyle}". If this is 'Current Style', then enhance the existing style with the new color, improving texture and shine.
    - Target Color: "${suggestion.name}". Use the hex code ${suggestion.hex} as the main shade, but create natural-looking highlights and lowlights for realistic depth.
    
    Execution Requirements:
    - Photorealism is the top priority. The new hair must blend seamlessly, matching the original image's lighting, shadows, and head angle.
    - Preserve Identity: Do not alter the person's facial features, skin tone, or the background.
    - Quality Focus: The hair texture must look natural and healthy. Avoid any artificial or "wig-like" appearance.
    
    Output only the resulting image.`,
      };
    
      const payload = { imagePart, textPart };
      const result = await callApiProxy('virtualTryOn', payload);
      if (result && result.imageUrl) {
        return result.imageUrl;
      }
      throw new Error("No image was generated by the model.");
    };
    
    
    // The chat is now managed via the API proxy as well.
    // For simplicity in this refactor, we are making the chat stateless on the server,
    // sending the history with each message.
    
    // FIX: Replaced direct SDK usage with a proxy class that calls the backend.
    // This prevents API key exposure and makes the chat functional.
    class ChatProxy {
        private systemInstruction: string;
        private history: ChatMessage[] = [];
    
        constructor(systemInstruction: string) {
            this.systemInstruction = systemInstruction;
        }
    
        public async sendMessage(params: { message: string }): Promise<{ text: string }> {
            const userMessage: ChatMessage = { role: 'user', text: params.message };
            const messagesWithNew = [...this.history, userMessage];
    
            const result = await callApiProxy('chat', {
                messages: messagesWithNew,
                systemInstruction: this.systemInstruction,
            });
    
            const modelMessage: ChatMessage = { role: 'model', text: result.text };
            this.history.push(userMessage, modelMessage);
    
            return { text: result.text };
        }
    }
    
    export const createChatSession = (): Chat => {
      const systemInstruction = `You are a friendly, expert hair stylist from PAPI HAIR DESIGN & BARBER. Your goal is to assist users with their hair-related questions, provide advice, and gently guide them towards booking services at the salon. Be encouraging, knowledgeable, and professional.`;
      
      // We return a proxy object that mimics the `Chat` class's `sendMessage` method.
      // A type assertion is used to satisfy the `Chat` return type without changing App.tsx.
      return new ChatProxy(systemInstruction) as unknown as Chat;
    };