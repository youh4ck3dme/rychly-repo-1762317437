# 🚀 Deployment Guide - PAPI Hair Design

Kompletný návod na nasadenie Astro/Tailwind/Vercel projektu do produkcie.

## 📋 Predpoklady

- Node.js 18+
- NPM alebo Yarn
- Vercel CLI (`npm i -g vercel`)
- Git repositár

## 🔐 Bezpečnostná Konfigurácia

### 1. Environment Variables

**Povinné premenné:**

```bash
NODE_ENV=production
ASTRO_SITE=https://your-domain.vercel.app
API_AUTH_TOKEN=your-secure-64-char-token
OPENAI_API_KEY=your-openai-api-key
```

**Voliteľné premenné:**

```bash
# Email konfigurácia
SMTP_HOST=smtp.your-provider.com
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password

# Vlastné farby
PRIMARY_COLOR_600=#your-primary-color

# Alternatívna AI služba
GEMINI_API_KEY=your-gemini-api-key
```

### 2. API Token Generovanie

```bash
# Automatické generovanie bezpečného tokenu
./security-setup.sh

# Manuálne generovanie
openssl rand -base64 64 | tr -d "=+/" | cut -c1-64
```

## 🏗 Build Proces

### Lokálny Build Test

```bash
# Inštalácia závislostí
npm install

# Build test
npm run build

# Preview build
npm run preview
```

### Vercel Deployment

```bash
# Prihlásenie do Vercel
vercel login

# Nasadenie projektu
vercel --prod

# Kontrola deployment logov
vercel logs --follow
```

## 🧪 Testovanie

### API Endpoint Testy

```bash
# Chat API test
curl -X POST "https://your-domain.vercel.app/api/chat" \
  -H "Authorization: Bearer $API_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Ahoj, ako sa máš?"}'

# Hair Analysis API test
curl -X POST "https://your-domain.vercel.app/api/hair/analyze" \
  -H "Authorization: Bearer $API_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://picsum.photos/seed/hair/600"}'
```

### Bezpečnostné Testy

```bash
# Test rate limitu (100 požiadaviek/15min)
for i in {1..105}; do
  curl -s -w "%{http_code}\n" -X POST "https://your-domain.vercel.app/api/chat" \
    -H "Authorization: Bearer $API_AUTH_TOKEN" \
    -d '{"message":"test"}'
done

# Test neautorizovaného prístupu
curl -X POST "https://your-domain.vercel.app/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
# Mala by vrátiť 401 Unauthorized
```

## 📊 Monitoring

### Vercel Analytics

Projekt má nakonfigurované:

- ✅ Web Analytics (automatické sledovanie návštev)
- ✅ Speed Insights (Core Web Vitals)
- ✅ Error tracking cez Vercel logs

### Manuálny Monitoring

```bash
# Kontrola funkčnosti
curl -f "https://your-domain.vercel.app/api/chat" \
  -H "Authorization: Bearer $API_AUTH_TOKEN" \
  -d '{"message":"health check"}' > /dev/null && echo "✅ API OK"

# Kontrola response času
time curl -s "https://your-domain.vercel.app/api/chat" \
  -H "Authorization: Bearer $API_AUTH_TOKEN" \
  -d '{"message":"test"}' > /dev/null
```

## 🔧 Konfigurácia

### Astro Config

```javascript
// astro.config.mjs
export default {
  output: "server",
  adapter: vercel({
    webAnalytics: { enabled: true },
    speedInsights: { enabled: true },
  }),
};
```

### Vercel Config

```json
// vercel.json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "src/pages/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## 🚨 Troubleshooting

### Bežné Problémy

**Build Error - OpenAI API Key**

```bash
# Riešenie: Skontrolujte environment variables vo Vercel dashboard
vercel env ls
```

**Rate Limit Error**

```bash
# Riešenie: Zvýšte limit alebo implementujte exponential backoff
# Aktuálny limit: 100 požiadaviek/15 minút na IP
```

**Memory Error**

```bash
# Riešenie: Zvýšte memory limit vo vercel.json
"functions": {
  "src/pages/api/**/*.ts": {
    "maxDuration": 30
  }
}
```

### Debug Mód

```bash
# Lokálny development s debug logmi
NODE_ENV=development npm run dev

# Kontrola environment variables
./security-setup.sh
```

## 📞 Podpora

### Kontakty

- **Developer:** PAPI Hair Design tím
- **Monitoring:** Vercel Dashboard
- **Logs:** `vercel logs --follow`

### Núdzové Kontakty

Pri kritických problémoch kontaktujte:

- Vercel Support (cez dashboard)
- OpenAI Support (pri API problémoch)

## 🔄 Aktualizácie

### Minor Updates

```bash
# Automatické redeploy pri git push
git add .
git commit -m "feat: update styling"
git push origin main
```

### Major Updates

```bash
# Manuálne deploy s confirmáciou
vercel --prod

# Rollback pri problémoch
vercel rollback
```

## ✅ Production Checklist

- [ ] Environment variables nastavené vo Vercel
- [ ] API_AUTH_TOKEN vygenerovaný a funkčný
- [ ] OpenAI API key platný a funkčný
- [ ] Build prechádza bez chýb
- [ ] API endpointy testované
- [ ] Rate limiting funkčný
- [ ] Bezpečnostné headers nastavené
- [ ] Monitoring aktívny
- [ ] Dokumentácia aktualizovaná

---

**💇‍♂️ PAPI Hair Design - Production Ready!**
