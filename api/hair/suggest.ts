import type { APIRoute } from "astro";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { faceShape, hairType, vibe = "luxury-modern" } = body || {};

    const systemPrompt = `Si profesionálny kaderník. Na základe týchto parametrov vytvor presne 5 návrhov účesov ako JSON pole objektov s vlastnosťami: name (názov účesu), why (prečo sa hodí), careLevel (náročnosť údržby 1-5), products (2-4 odporúčané produkty).`;

    const userPrompt = `Klient: faceShape=${faceShape}, hairType=${hairType}, vibe=${vibe}. Vráť presne 5 návrhov účesov ako pole objektov.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return new Response(JSON.stringify({ ideas: JSON.parse(content) }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Bad request" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
