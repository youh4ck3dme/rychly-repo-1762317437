import type { APIRoute } from 'astro';
import { secureAPI } from '../../../lib/security';
import { getOpenAIService } from '../../../lib/openaiService';
import type { HairSuggestRequest, HairSuggestResponse } from '../../../types';

export const POST: APIRoute = secureAPI(async (request: Request, sanitizedBody: HairSuggestRequest) => {
  const { hairType, faceShape, preferences, occasion = 'general' } = sanitizedBody;

  try {
    // Check if OpenAI service is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-') || process.env.OPENAI_API_KEY.trim() === '' || !process.env.OPENAI_API_KEY.startsWith('sk-')) {
      // Generate fallback suggestions
      const fallbackSuggestions = generateFallbackSuggestions(hairType, faceShape, preferences, occasion);
      return new Response(JSON.stringify({
        suggestions: fallbackSuggestions,
        confidence: 0.7,
        method: "fallback",
        note: "Using fallback suggestions due to API configuration"
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get OpenAI service instance and generate suggestions
    const openaiService = getOpenAIService();

    // Generate style suggestions
    const styleSuggestions = await openaiService.generateHairSuggestions({
      faceShape: faceShape,
      hairType: hairType,
      occasion: occasion,
      length: preferences?.length
    });

    // Generate color suggestions based on preferences
    const colorSuggestions = await generateColorSuggestions(preferences, hairType);

    // Generate care suggestions
    const careSuggestions = await generateCareSuggestions(hairType, preferences);

    const allSuggestions = [
      ...styleSuggestions.map(style => ({ type: 'style' as const, content: style })),
      ...colorSuggestions.map(color => ({ type: 'color' as const, content: color })),
      ...careSuggestions.map(care => ({ type: 'care' as const, content: care }))
    ];

    const response: HairSuggestResponse = {
      suggestions: allSuggestions,
      confidence: 0.9,
      method: "ai",
      personalized: true,
      totalSuggestions: allSuggestions.length
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error: any) {
    console.error('Hair suggestions error:', error);

    // Generate fallback suggestions on error
    const fallbackSuggestions = generateFallbackSuggestions(hairType, faceShape, preferences, occasion);
    return new Response(JSON.stringify({
      suggestions: fallbackSuggestions.map(content => ({ type: 'style', content })),
      confidence: 0.3,
      method: "fallback",
      note: `AI service unavailable: ${error.message}`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}, {
  requiredFields: [],
  requireAuth: false,
  rateLimitBy: 'ip',
  rateLimitMax: 15,
  rateLimitWindowMs: 60000, // 1 minute
  maxBodyBytes: 1024 * 50, // 50KB max body size
});

// Fallback suggestion generator
function generateFallbackSuggestions(hairType?: string, faceShape?: string, preferences?: any, occasion?: string) {
  const suggestions = [
    {
      type: 'style',
      content: 'Vrstvený strih strednej dĺžky s jemnými vlnami pre prirodzený vzhľad'
    },
    {
      type: 'color',
      content: 'Balayage v teplých karamelových tónoch pre rozjasnenie tváre'
    },
    {
      type: 'care',
      content: 'Pravidelné hydratačné masky pre zachovanie zdravých vlasov'
    },
    {
      type: 'style',
      content: 'Bob s asymetrickou ofinou pre moderný a dynamický vzhľad'
    },
    {
      type: 'color',
      content: 'Jemné melírovanie pre dodanie objemu a štruktúry'
    }
  ];

  return suggestions;
}

// Generate color suggestions based on preferences
async function generateColorSuggestions(preferences?: any, hairType?: string): Promise<string[]> {
  const baseColors = [
    'Platinová blond pre výrazný a moderný vzhľad',
    'Medené tóny pre teplý a prirodzený efekt',
    'Karamelové odtiene pre jemný a elegantný štýl',
    'Čokoládové hnedé pre klasický a sofistikovaný vzhľad',
    'Mahagónové červené pre odvážny a vášnivý výraz'
  ];

  // Filter based on preferences if available
  if (preferences?.colorPreference) {
    switch (preferences.colorPreference) {
      case 'natural':
        return baseColors.slice(0, 3);
      case 'bold':
        return ['Výrazná červená', 'Platinová blond', 'Modročierna'];
      case 'warm':
        return ['Zlaté blond', 'Medené tóny', 'Teplé hnedé'];
      case 'cool':
        return ['Popolavé blond', 'Studené hnedé', 'Fialkové odtiene'];
      default:
        return baseColors;
    }
  }

  return baseColors;
}

// Generate care suggestions based on hair type and preferences
async function generateCareSuggestions(hairType?: string, preferences?: any): Promise<string[]> {
  const baseCare = [
    'Používajte šampón bez sulfátov pre ochranu farby',
    'Aplikujte kondicionér po každom umytí',
    'Chráňte vlasy pred teplom stylingovými prípravkami'
  ];

  if (hairType === 'damaged' || preferences?.condition === 'damaged') {
    return [
      'Intenzívne regeneračné kúry 2x týždenne',
      'Oleje na vlasy pre hĺbkovú výživu',
      'Minimalizujte používanie tepla pri stylingu',
      'Pravidelné strihanie končekov každých 6-8 týždňov'
    ];
  }

  if (hairType === 'dry' || preferences?.condition === 'dry') {
    return [
      'Hydratačné masky 3x týždenne',
      'Bezoplachové kondicionéry pre každodenné použitie',
      'Ochrana pred slnkom a chlórom',
      'Arganový olej pre lesk a hebkosť'
    ];
  }

  return baseCare;
}