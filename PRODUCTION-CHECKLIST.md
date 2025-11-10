# ✅ **PRODUKČNÝ DEPLOYMENT CHECKLIST**

## 🚨 **KRITIČNÉ BEZPEČNOSTNÉ KROKY**

### **1. API Kľúče a Tokeny**

- [ ] **Vymazať kompromitované API kľúče** z `.env.example`
- [ ] **Vygenerovať nový OPENAI_API_KEY** (súčasný je kompromitovaný)
- [ ] **Vytvoriť silný API_AUTH_TOKEN** (min. 64 znakov)
- [ ] **Pridať SENTRY_DSN** pre error monitoring

### **2. Environment Variables vo Vercel**

```bash
# Nutné nastaviť vo Vercel dashboard:
vercel env add OPENAI_API_KEY production
vercel env add API_AUTH_TOKEN production
vercel env add SENTRY_DSN production
vercel env add NODE_ENV production
```

### **3. Bezpečnostné Testovanie**

```bash
# Spustiť všetky bezpečnostné testy:
./production-health-check.sh

# Overiť jednotlivé komponenty:
./test-api.sh
./security-setup.sh
```

---

## 🔧 **TECHNICKÁ OVERENIA**

### **4. Build Proces**

- [ ] **Lokálny build** - `npm run build` prechádza bez chýb
- [ ] **Preview build** - `npm run preview` funguje správne
- [ ] **Dependencies** - všetky balíčky nainštalované

### **5. API Endpointy**

- [ ] **Chat API** (`/api/chat`) - reaguje na požiadavky
- [ ] **Hair Analysis API** (`/api/hair/analyze`) - spracováva obrázky
- [ ] **Error handling** - správne HTTP status kódy
- [ ] **Response formát** - validný JSON s timestamp

### **6. Vercel Konfigurácia**

- [ ] **Adapter nastavený** - `@astrojs/vercel` s `output: server`
- [ ] **Analytics enabled** - Web Analytics a Speed Insights
- [ ] **Build command** - `npm run build` v `vercel.json`
- [ ] **Environment variables** - nastavené pre produkciu

---

## 📊 **VÝKONNOSTNÉ TESTY**

### **7. Performance Metrics**

- [ ] **Response time** < 5 sekúnd pre API volania
- [ ] **Rate limiting** - 100 požiadaviek/15 minút na IP
- [ ] **Memory usage** - v rámci Vercel limitov
- [ ] **Cold start time** - akceptovateľný pre serverless

### **8. Load Testing**

```bash
# Simulácia záťaže:
for i in {1..50}; do
  curl -s -X POST "https://your-domain.vercel.app/api/chat" \
    -H "Authorization: Bearer $API_AUTH_TOKEN" \
    -d '{"message":"load test"}' > /dev/null &
done
```

---

## 🔍 **BEZPEČNOSTNÉ OVERENIA**

### **9. Autentifikácia a Autorizácia**

- [ ] **401 Unauthorized** pre neplatné tokeny
- [ ] **Bearer token validation** funguje správne
- [ ] **Rate limiting** aktivuje pri prekročení limitu
- [ ] **Input sanitizácia** odstraňuje XSS payloady

### **10. Security Headers**

- [ ] **X-Content-Type-Options: nosniff**
- [ ] **X-Frame-Options: DENY**
- [ ] **X-XSS-Protection: 1; mode=block**
- [ ] **Content-Security-Policy** definovaná

### **11. Útokové Simulácie**

```bash
# Test XSS útokov:
curl -X POST "https://your-domain.vercel.app/api/chat" \
  -H "Authorization: Bearer $API_AUTH_TOKEN" \
  -d '{"message":"<script>alert(\"xss\")</script>"}'

# Test brute force:
for i in {1..10}; do
  curl -s -X POST "https://your-domain.vercel.app/api/chat" \
    -H "Authorization: Bearer invalid-token-$i" \
    -d '{"message":"test"}' > /dev/null &
done
```

---

## 📋 **DOKUMENTÁCIA A MONITORING**

### **12. Dokumentácia**

- [ ] **README.md** aktualizované s produkčnými URL
- [ ] **README_API.md** obsahuje správne endpointy
- [ ] **DEPLOYMENT.md** poskytuje deployment návod
- [ ] **.env.example** bez skutočných kľúčov

### **13. Monitoring Setup**

- [ ] **Sentry integrácia** pre error tracking
- [ ] **Vercel Analytics** sledovanie návštevnosti
- [ ] **Production monitoring** script funkčný
- [ ] **Alerting** nastavené pre kritické chyby

---

## 🚀 **DEPLOYMENT PROCES**

### **14. Pre-deployment**

```bash
# 1. Final security check
./production-health-check.sh

# 2. Generate secure tokens
./security-setup.sh

# 3. Update .env with real keys
# OPENAI_API_KEY=your-real-key
# API_AUTH_TOKEN=generated-token

# 4. Test build
npm run build
```

### **15. Deployment**

```bash
# 1. Deploy to Vercel
vercel --prod

# 2. Set environment variables
vercel env add OPENAI_API_KEY production
vercel env add API_AUTH_TOKEN production
vercel env add SENTRY_DSN production

# 3. Verify deployment
curl -f "https://your-domain.vercel.app/api/chat" \
  -H "Authorization: Bearer $API_AUTH_TOKEN" \
  -d '{"message":"deployment test"}'
```

### **16. Post-deployment**

```bash
# 1. Run full test suite
./test-api.sh

# 2. Start monitoring
./monitor-production.sh start

# 3. Check logs
vercel logs --follow

# 4. Verify Sentry errors
# Check Sentry dashboard for any errors
```

---

## ⚠️ **KRITIČNÉ UPOZORNENIA**

### **🚨 BEZPEČNOSTNÉ RIZIKÁ**

- **API kľúče** v `.env.example` sú kompromitované
- **Chýbajúca autentifikácia** umožňuje neautorizovaný prístup
- **Rate limiting** nie je implementované
- **Input sanitizácia** chýba

### **🔧 VÝKONNOSTNÉ RIZIKÁ**

- **OpenAI API failures** nie sú ošetrené
- **Memory leaks** v rate limiting store
- **Cold start time** môže byť vysoký

### **📊 MONITORING RIZIKÁ**

- **Chýbajúci error tracking**
- **Žiadne alerting** pre downtime
- **Performance monitoring** nie je implementované

---

## 🎯 **AKČNÝ PLÁN**

### **DNES (Príoritné)**

1. **Vyriešiť bezpečnostné riziká** 🚨
2. **Vygenerovať nové API tokeny** 🔑
3. **Otestovať všetky endpointy** ✅

### **TENTO TÝŽDEŇ**

1. **Deploynúť na produkciu** 🚀
2. **Nastaviť monitoring** 📊
3. **Overiť funkčnosť** 🔍

### **PRIEBEŽNE**

1. **Monitorovať výkonnosť** 📈
2. **Aktualizovať dokumentáciu** 📚
3. **Reagovať na alerty** 🚨

---

## 📞 **KONTAKTY A PODPORA**

### **Monitoring**

- **Vercel Dashboard** - hlavný monitoring
- **Sentry** - error tracking
- **Production Monitor** - `./monitor-production.sh`

### **Núdzové Kontakty**

- **Vercel Support** - infraštruktúra
- **OpenAI Support** - API problémy
- **Developer** - aplikačná logika

---

**💇‍♂️ PAPI Hair Design - Production Deployment Complete!**

_Po dokončení tohto checklistu bude váš projekt plne pripravený na produkčné prostredie s maximálnou bezpečnosťou a spoľahlivosťou._
