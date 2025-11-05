# PAPI AI Hair – Vercel + OpenAI

## Lokálne
1) `cp .env.example .env` a doplň `OPENAI_API_KEY`.
2) `npm i`
3) `vercel dev`  (spustí Vite + /api funkcie)

## Deploy
1) `vercel link`
2) `vercel env add OPENAI_API_KEY`
3) `npm run build`
4) `vercel deploy --prod`

## API
- POST /api/hair/analyze  { imageUrl, locale? }
- POST /api/hair/suggest  { faceShape, hairType, vibe? }
- POST /api/hair/preview  { description }

