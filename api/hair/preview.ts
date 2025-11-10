import type { APIRoute } from "astro";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { description } = body || {};

    if (!description) {
      return new Response(JSON.stringify({ error: "description required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Ultra-realistic beauty portrait, ${description}. Salon lighting, preserve natural face & skin tone.`,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const base64 = response.data?.[0]?.b64_json || null;

    return new Response(JSON.stringify({ base64, mime: "image/png" }), {
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
