# 🚀 PAPI Hair Design API

Hair studio webová aplikácia s AI analýzou vlasov a chatbotom.

## 🌐 Produkčná URL

```
BASE="https://phd-ai-hair-studio-5hbgan143-h4ck3d-labs-projects.vercel.app"
```

## 📡 API Endpointy

### Chat API
- **URL:** `$BASE/api/chat`
- **Method:** POST
- **Content-Type:** `application/json`

**Request:**
```json
{
  "message": "Ahoj, ako sa máš?"
}
```

**Response:**
```json
{
  "reply": "Ahoj! Povedal si: Ahoj, ako sa máš?"
}
```

### Hair Analysis API
- **URL:** `$BASE/api/hair/analyze`
- **Method:** POST
- **Content-Type:** `application/json`

**Request:**
```json
{
  "imageUrl": "https://picsum.photos/seed/hair/600"
}
```

**Response:**
```json
{
  "ok": true,
  "summary": "Ukážková analýza vlasov",
  "imageUrl": "https://picsum.photos/seed/hair/600"
}
```

## 🔐 Authentication (Optional)

API podporuje optional Bearer token autentifikáciu cez `API_AUTH_TOKEN` environment variable.

### Bez Auth (verejné API)
```bash
curl -X POST "$BASE/api/chat" \
  -H 'Content-Type: application/json' \
  -d '{"message":"Ahoj!"}'
```

### S Auth (chránené API)
```bash
TOKEN="<tvoj-api-token>"

curl -X POST "$BASE/api/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"message":"Test"}'
```

**Auth Responses:**
- ✅ `200 OK` - správny token alebo žiadny token (ak nie je nastavený `API_AUTH_TOKEN`)
- ❌ `401 Unauthorized` - nesprávny token (ak je nastavený `API_AUTH_TOKEN`)

## 🧪 Rýchle Testy

### Smoke Test (bez auth)
```bash
# Chat test
curl -i -sS -X POST "$BASE/api/chat" \
  -H 'Content-Type: application/json' \
  -d '{"message":"Ahoj!"}' | head -n 20

# Hair analysis test
curl -i -sS -X POST "$BASE/api/hair/analyze" \
  -H 'Content-Type: application/json' \
  -d '{"imageUrl":"https://picsum.photos/seed/hair/600"}' | head -n 20
```

### Auth Test (s tokenom)
```bash
TOKEN="<tvoj-token>"

# Chat s auth
curl -i -sS -X POST "$BASE/api/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"message":"Test"}' | head -n 20

# Hair analysis s auth
curl -i -sS -X POST "$BASE/api/hair/analyze" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"imageUrl":"https://picsum.photos/seed/hair/600"}' | head -n 20
```

## 📊 Vercel Logs

```bash
vercel logs "$BASE"
```

## 🛠 Lokálny Vývoj

```bash
# Spusti dev server
npm run dev
# alebo
npx astro dev

# Lokálna URL: http://localhost:4321
```

Lokálne API funguje rovnako ako produkčné, ale bez Vercel auth middleware.

## 🔧 Konfigurácia

### Astro Config
```js
// astro.config.mjs
export default {
  output: 'server',
  adapter: vercel(),
};
```

### Environment Variables
- `API_AUTH_TOKEN` - optional Bearer token pre API ochranu
- `OPENAI_API_KEY` - pre AI funkcionality

---

**💇‍♂️ Happy coding!** - PAPI Hair Design tím