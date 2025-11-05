import type { APIRoute } from 'astro';
import { secureAPI } from '../../../lib/security';
import { getOpenAIService } from '../../../lib/openaiService';
import type { VirtualTryOnRequest, VirtualTryOnResponse } from '../../../types';

export const POST: APIRoute = secureAPI(async (request: Request, sanitizedBody: VirtualTryOnRequest) => {
  const { userImage, suggestion } = sanitizedBody;

  // Enhanced input validation
  if (!userImage || typeof userImage !== 'string') {
    return new Response(JSON.stringify({
      error: "userImage is required and must be a valid string"
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!suggestion || typeof suggestion !== 'object') {
    return new Response(JSON.stringify({
      error: "suggestion is required and must be a valid object"
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate image URL format
  try {
    const url = new URL(userImage);
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
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-') || process.env.OPENAI_API_KEY.includes('sk-')) {
      // Generate fallback virtual try-on image using canvas
      const fallbackImage = await generateFallbackTryOn(userImage, suggestion);
      return new Response(JSON.stringify({
        image: fallbackImage,
        method: "fallback",
        note: "Using fallback virtual try-on due to API configuration"
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get OpenAI service instance and generate virtual try-on
    const openaiService = getOpenAIService();
    const virtualTryOnResult = await openaiService.generateVirtualTryOn(userImage, suggestion);

    const response: VirtualTryOnResponse = {
      image: virtualTryOnResult.image,
      confidence: virtualTryOnResult.confidence,
      method: "ai",
      processingTime: virtualTryOnResult.processingTime
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error: any) {
    console.error('Virtual try-on error:', error);

    // Generate fallback image on error
    try {
      const fallbackImage = await generateFallbackTryOn(userImage, suggestion);
      return new Response(JSON.stringify({
        image: fallbackImage,
        method: "fallback",
        note: `AI service unavailable: ${error.message}`
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (fallbackError) {
      return new Response(JSON.stringify({
        error: "Virtual try-on service temporarily unavailable"
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}, {
  requiredFields: ['userImage', 'suggestion'],
  requireAuth: false,
  rateLimitBy: 'ip',
  rateLimitMax: 5,
  rateLimitWindowMs: 60000, // 1 minute - more restrictive for AI operations
  maxBodyBytes: 1024 * 100, // 100KB max body size
});

// Fallback virtual try-on generator using canvas manipulation
async function generateFallbackTryOn(userImage: string, suggestion: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Apply color overlay based on suggestion
      if (suggestion.hex) {
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = suggestion.hex;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Reset
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }

      // Add subtle text overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAPI', canvas.width / 2, canvas.height - 30);

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = userImage;
  });
}