import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { imageUrl, locale = "sk" } = body || {};

    if (!imageUrl || typeof imageUrl !== 'string') {
      return new Response(JSON.stringify({ error: "imageUrl required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const systemPrompt = `Si top kaderník a colorista. Z fotky zisti typ/stav vlasov, tvar tváre a odporuč 3–5 strihov, farieb, styling tipov. Odpovedz IBA JSON podľa schémy. Jazyk: ${locale==="sk"?"slovenčina":"English"}.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyzuj túto fotku a vráť JSON report s typom vlasov, tvarom tváre a odporúčaniami."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "low"
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return new Response(JSON.stringify(JSON.parse(content)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Bad request" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
