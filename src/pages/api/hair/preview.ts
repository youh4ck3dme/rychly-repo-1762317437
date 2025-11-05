import type { APIRoute } from 'astro';
import { secureAPI } from '../../../lib/security';
import { getOpenAIService } from '../../../lib/openaiService';
import type { HairPreviewRequest, HairPreviewResponse } from '../../../types';

export const POST: APIRoute = secureAPI(async (request: Request, sanitizedBody: HairPreviewRequest) => {
  const { imageUrl, style, color } = sanitizedBody;

  // Enhanced input validation
  if (!imageUrl || typeof imageUrl !== 'string') {
    return new Response(JSON.stringify({
      error: "imageUrl is required and must be a valid string"
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate image URL format
  try {
    const url = new URL(imageUrl);
    const allowedHosts = ['imgur.com', 'cloudinary.com', 'unsplash.com', 'pexels.com', 'i.ibb.co', 'postimg.cc'];
    const isAllowedHost = allowedHosts.some(host => url.hostname.includes(host)) || url.hostname === 'localhost';

    if (!isAllowedHost && !process.env.ALLOW_ALL_IMAGE_HOSTS) {
      return new Response(JSON.stringify({
        error: "Image URL must be from an allowed host"
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (urlError) {
    return new Response(JSON.stringify({
      error: "Invalid image URL format"
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Check if OpenAI service is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-') || process.env.OPENAI_API_KEY.trim() === '' || !process.env.OPENAI_API_KEY.startsWith('sk-')) {
      // Generate fallback preview
      const fallbackPreview = await generateFallbackPreview(imageUrl, style, color);
      return new Response(JSON.stringify({
        previewImage: fallbackPreview,
        confidence: 0.7,
        method: "fallback",
        note: "Using fallback preview due to API configuration"
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get OpenAI service instance and generate preview
    const openaiService = getOpenAIService();
    const previewResult = await openaiService.generateHairPreview(imageUrl, style, color);

    const response: HairPreviewResponse = {
      previewImage: previewResult.image,
      confidence: previewResult.confidence,
      method: "ai",
      processingTime: previewResult.processingTime,
      suggestions: previewResult.suggestions
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error: any) {
    console.error('Hair preview error:', error);

    // Generate fallback preview on error
    try {
      const fallbackPreview = await generateFallbackPreview(imageUrl, style, color);
      return new Response(JSON.stringify({
        previewImage: fallbackPreview,
        confidence: 0.3,
        method: "fallback",
        note: `AI service unavailable: ${error.message}`
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (fallbackError) {
      return new Response(JSON.stringify({
        error: "Hair preview service temporarily unavailable"
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}, {
  requiredFields: ['imageUrl'],
  requireAuth: false,
  rateLimitBy: 'ip',
  rateLimitMax: 8,
  rateLimitWindowMs: 60000, // 1 minute
  maxBodyBytes: 1024 * 100, // 100KB max body size
});

// Fallback preview generator - returns original image with overlay text
async function generateFallbackPreview(imageUrl: string, style?: string, color?: string): Promise<string> {
  try {
    // For server-side fallback, we'll return the original image
    // In a production environment, you might use a server-side image processing library
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const originalDataUrl = `data:image/jpeg;base64,${base64}`;

    // Create a simple HTML overlay as a data URL
    const overlayHtml = `
      <div style="position: relative; display: inline-block;">
        <img src="${originalDataUrl}" style="max-width: 100%; height: auto;"/>
        <div style="
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          text-align: center;
          padding: 10px;
          font-family: Arial, sans-serif;
          font-weight: bold;
          font-size: 16px;
        ">
          PAPI Preview${style ? ` - ${style}` : ''}${color ? ` (${color})` : ''}
        </div>
      </div>
    `;

    // Convert HTML to data URL (simple approach)
    const htmlBase64 = Buffer.from(overlayHtml, 'utf8').toString('base64');
    return `data:text/html;base64,${htmlBase64}`;
  } catch (error) {
    console.error('Fallback preview error:', error);
    // Return a simple placeholder
    return `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16" fill="#666">
          PAPI Hair Preview
        </text>
        <text x="50%" y="70%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12" fill="#999">
          ${style ? 'Style: ' + style : ''} ${color ? 'Color: ' + color : ''}
        </text>
      </svg>
    `).toString('base64')}`;
  }
}