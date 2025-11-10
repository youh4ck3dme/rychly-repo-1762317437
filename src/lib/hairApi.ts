export async function analyze(imageUrl: string, locale: "sk" | "en" = "sk") {
  const r = await fetch("/api/hair/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl, locale }),
  });
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}

export async function suggest(
  faceShape: string,
  hairType: string,
  vibe = "luxury-modern",
) {
  const r = await fetch("/api/hair/suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ faceShape, hairType, vibe }),
  });
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}

export async function preview(description: string) {
  const r = await fetch("/api/hair/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  });
  if (!r.ok) throw new Error(await r.text());
  const { base64, mime } = await r.json();
  return `data:${mime};base64,${base64}`;
}
