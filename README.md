<div align="center">
<img width="1200" height="475" alt="PAPI Hair Design Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 💇‍♂️ PAPI Hair Design - AI Hair Studio

Moderná webová aplikácia pre kaderníctvo s AI analýzou vlasov a inteligentným chatbotom.

**🌐 Produkčná URL:** [https://phd-ai-hair-studio-5hbgan143-h4ck3d-labs-projects.vercel.app](https://phd-ai-hair-studio-5hbgan143-h4ck3d-labs-projects.vercel.app)

**🤖 AI Studio:** [https://ai.studio/apps/drive/1d8lynfKX3vjEvtWfaoBeD-RU5yCJjQM9](https://ai.studio/apps/drive/1d8lynfKX3vjEvtWfaoBeD-RU5yCJjQM9)

## ✨ Funkcie

- **🎨 AI Analýza Vlasov** - Pokročilá analýza vlasov pomocou OpenAI Vision
- **💬 Inteligentný Chatbot** - AI asistent pre kadernícke poradenstvo
- **📱 Responzívny Dizajn** - Optimalizované pre všetky zariadenia
- **🔒 Bezpečná Autentifikácia** - Chránené API endpointy
- **⚡ Vysoký Výkon** - Server-side rendering s Astro
- **🎯 SEO Optimalizácia** - Rýchle načítavanie a vyhľadávanie

## 🚀 Rýchly Štart

### Predpoklady

- **Node.js 18+**
- **NPM alebo Yarn**
- **OpenAI API Key**

### Inštalácia a Spustenie

```bash
# 1. Klonovanie projektu
git clone <repository-url>
cd phd-ai-hair-studio

# 2. Inštalácia závislostí
npm install

# 3. Konfigurácia environment variables
cp .env.example .env
# Upravte .env súbor s vašimi API kľúčmi

# 4. Spustenie development servera
npm run dev

# 5. Otvorte prehliadač
# http://localhost:4321
```

### 🔐 Konfigurácia API

```bash
# Pre OpenAI (odporúčané)
OPENAI_API_KEY=your-openai-api-key-here

# Pre Gemini (alternatíva)
GEMINI_API_KEY=your-gemini-api-key-here

# Bezpečnostný token pre API
API_AUTH_TOKEN=your-secure-api-token-here
```

## 📋 API Dokumentácia

Podrobná dokumentácia API je dostupná v [README_API.md](README_API.md)

### Rýchle API Testy

```bash
# Chat API
curl -X POST "https://phd-ai-hair-studio-5hbgan143-h4ck3d-labs-projects.vercel.app/api/chat" \
  -H "Authorization: Bearer $API_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Ahoj, aký účes by si mi odporučil?"}'

# Hair Analysis API
curl -X POST "https://phd-ai-hair-studio-5hbgan143-h4ck3d-labs-projects.vercel.app/api/hair/analyze" \
  -H "Authorization: Bearer $API_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://picsum.photos/seed/hair/600"}'
```

## 🛠 Development

### Build Príkazy

```bash
# Development
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Vercel deployment
npm run vercel:dev
```

### Projekt Štruktúra

```
├── src/
│   ├── components/      # React/Preact komponenty
│   ├── layouts/         # Astro layouty
│   ├── pages/           # Astro stránky a API
│   ├── lib/             # Utility funkcie a služby
│   └── styles/          # CSS štýly
├── public/              # Statické súbory
├── astro.config.mjs     # Astro konfigurácia
├── tailwind.config.js   # Tailwind konfigurácia
└── vercel.json          # Vercel konfigurácia
```

## 🚢 Deployment

### Vercel (Odporúčané)

```bash
# Automatické nasadenie
vercel --prod

# Manuálne nastavenie environment variables
vercel env add OPENAI_API_KEY
vercel env add API_AUTH_TOKEN

# Kontrola logov
vercel logs --follow
```

### Manuálny Deployment

Podrobný návod nájdete v [DEPLOYMENT.md](DEPLOYMENT.md)

## 🧪 Testovanie

### Automatické Testy

```bash
# Spustenie bezpečnostných a funkčných testov
chmod +x test-api.sh
./test-api.sh

# Security setup
chmod +x security-setup.sh
./security-setup.sh
```

## 🔒 Bezpečnosť

- ✅ **Rate Limiting** - 100 požiadaviek/15 minút na IP
- ✅ **Input Sanitizácia** - Ochrana proti XSS útokom
- ✅ **Bearer Token Autentifikácia** - Chránené API endpointy
- ✅ **Security Headers** - XSS, CSRF, Content-Type ochrana
- ✅ **Environment Variables** - Bezpečné API kľúče

## 📊 Monitoring

- **Vercel Analytics** - Automatické sledovanie návštev
- **Speed Insights** - Core Web Vitals monitoring
- **Error Tracking** - Cez Vercel logs
- **API Monitoring** - Health check endpointy

## 🤝 Príspevky

1. Forknite projekt
2. Vytvorte feature branch (`git checkout -b feature/amazing-feature`)
3. Commitnite zmeny (`git commit -m 'Add amazing feature'`)
4. Pushnite branch (`git push origin feature/amazing-feature`)
5. Otvorte Pull Request

## 📄 Licencia

Tento projekt je súkromný a nie je verejne licencovaný.

## 🆘 Podpora

### Kontakty

- **Developer:** PAPI Hair Design tím
- **Technická podpora:** cez GitHub Issues
- **Produkcia:** Vercel Dashboard monitoring

### Troubleshooting

Pri problémoch skontrolujte:
1. [DEPLOYMENT.md](DEPLOYMENT.md) - deployment návod
2. Vercel logs - `vercel logs --follow`
3. Environment variables vo Vercel dashboard

---

**💇‍♂️ Šťastné kódovanie! - PAPI Hair Design tím**
# Snimka-obrazovky-2025-11-05-o-5-19-25-1
