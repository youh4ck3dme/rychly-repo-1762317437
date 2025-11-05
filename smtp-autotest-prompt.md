# 🚀 100% FUNKČNÝ PROMPT PRE AUTOMATICKÉ TESTOVANIE A OPRAVU SMTP SERVERA

## 🎯 ÚČEL
Tento prompt automaticky otestuje SMTP server a v prípade nefunkčnosti ho opraví.

## 📋 KROKY PRE AUTOMATICKÉ SPRACOVANIE

### KROK 1: ANALÝZA PROJEKTU
```
Najprv analyzuj projekt a nájdi SMTP konfiguráciu:

1. Prečítaj .env súbory a nájdi SMTP nastavenia
2. Nájdi API endpointy ktoré používajú email (napr. contact.ts)
3. Identifikuj SMTP konfiguráciu (host, port, credentials)
```

### KROK 2: VYTVORENIE TESTOVACIEHO SCRIPTU
```
Vytvor testovací script s názvom "test-smtp.js" s týmto obsahom:

import nodemailer from 'nodemailer';

async function testSMTP() {
    console.log('🚀 Testujem SMTP server...');

    // SMTP konfigurácia z projektu
    const transporter = nodemailer.createTransport({
        host: 'smtp.m1.websupport.sk', // Alebo z .env súboru
        port: 465,
        secure: true,
        auth: {
            user: 'info@papihairdesign.sk', // Alebo z .env súboru
            pass: 'Poklop123###' // Alebo z .env súboru
        }
    });

    const mailOptions = {
        from: 'info@papihairdesign.sk',
        to: 'info@papihairdesign.sk',
        subject: 'SMTP TEST - ' + new Date().toISOString(),
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>🧪 SMTP TEST</h2>
                <p>✅ Testovací e-mail</p>
                <p>Čas testu: ${new Date().toLocaleString('sk-SK')}</p>
                <p>Ak tento e-mail dostanete, SMTP server funguje správne! 🎉</p>
            </div>
        `,
        text: 'SMTP TEST - Ak tento e-mail dostanete, SMTP server funguje správne!'
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ SUCCESS! E-mail bol úspešne odoslaný');
        console.log('📬 Message ID:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.log('❌ ERROR! E-mail sa nepodarilo odoslať');
        console.log('🔍 Error:', error.message);
        return { success: false, error: error.message };
    }
}

testSMTP().then(result => {
    if (result.success) {
        console.log('🎉 SMTP TEST ÚSPEŠNÝ!');
        process.exit(0);
    } else {
        console.log('💥 SMTP TEST ZLYHAL!');
        process.exit(1);
    }
});
```

### KROK 3: SPUSTENIE TESTU
```
node test-smtp.js
```

### KROK 4: ANALÝZA VÝSLEDKOV

**✅ AK TEST PREŠIEL:**
- SMTP server funguje správne
- Žiadna oprava nie je potrebná
- E-mail bol úspešne odoslaný

**❌ AK TEST ZLYHAL:**

#### MOŽNÉ PRÍČINY A RIEŠENIA:

1. **Nesprávne credentials:**
   ```bash
   # Skontroluj .env súbor
   cat .env
   # Over správnosť SMTP údajov
   ```

2. **Nesprávny host alebo port:**
   ```javascript
   // Možné alternatívy pre Websupport:
   host: 'smtp.m1.websupport.sk' // port 465, secure: true
   host: 'smtp.websupport.sk'    // port 587, secure: false
   host: 'mail.websupport.sk'    // port 25, secure: false
   ```

3. **Firewall alebo sieťové obmedzenia:**
   ```bash
   # Test konektivity
   telnet smtp.m1.websupport.sk 465
   # Alebo
   nc -zv smtp.m1.websupport.sk 465
   ```

4. **Problém s TLS/SSL:**
   ```javascript
   // Skús rôzne konfigurácie:
   {
       host: 'smtp.m1.websupport.sk',
       port: 587,
       secure: false, // Začiatok bez šifrovania
       tls: {
           ciphers: 'SSLv3',
           rejectUnauthorized: false
       }
   }
   ```

### KROK 5: OPRAVA KONFIGURÁCIE

**Ak test zlyhal, postupne vyskúšaj tieto konfigurácie:**

```javascript
// Konfigurácia 1: SSL na porte 465
const config1 = {
    host: 'smtp.m1.websupport.sk',
    port: 465,
    secure: true,
    auth: { user: 'info@papihairdesign.sk', pass: 'heslo' }
};

// Konfigurácia 2: TLS na porte 587
const config2 = {
    host: 'smtp.m1.websupport.sk',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user: 'info@papihairdesign.sk', pass: 'heslo' }
};

// Konfigurácia 3: Alternatívny host
const config3 = {
    host: 'smtp.websupport.sk',
    port: 587,
    secure: false,
    auth: { user: 'info@papihairdesign.sk', pass: 'heslo' }
};
```

### KROK 6: OVERENIE OPRAVY

Po aplikovaní opráv:

1. **Znova spusti test:**
   ```bash
   node test-smtp.js
   ```

2. **Skontroluj e-mailovú schránku:**
   - Mal by prísť testovací e-mail
   - Over správnosť odosielateľa a prijímateľa

3. **Otestuj kontaktný formulár:**
   - Spusti vývojový server: `npm run dev`
   - Odošli správu cez kontaktný formulár
   - Over či e-mail príde

### KROK 7: TRVALÉ RIEŠENIE

**Pre permanentné fungovanie:**

1. **Pridaj SMTP konfiguráciu do .env súboru:**
   ```
   SMTP_HOST=smtp.m1.websupport.sk
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=info@papihairdesign.sk
   SMTP_PASS=Poklop123###
   ```

2. **Uprav kontaktný formulár aby používal .env premenné:**
   ```javascript
   const transporter = nodemailer.createTransport({
       host: process.env.SMTP_HOST,
       port: parseInt(process.env.SMTP_PORT),
       secure: process.env.SMTP_SECURE === 'true',
       auth: {
           user: process.env.SMTP_USER,
           pass: process.env.SMTP_PASS
       }
   });
   ```

## 🔧 AUTOMATICKÝ REPAIR SCRIPT

Pre úplnú automatizáciu vytvor aj tento script:

```javascript
// auto-repair-smtp.js
import nodemailer from 'nodemailer';
import { writeFileSync } from 'fs';

const configs = [
    { host: 'smtp.m1.websupport.sk', port: 465, secure: true },
    { host: 'smtp.m1.websupport.sk', port: 587, secure: false, requireTLS: true },
    { host: 'smtp.websupport.sk', port: 587, secure: false },
    { host: 'mail.websupport.sk', port: 25, secure: false }
];

async function testConfigs() {
    for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
        console.log(`🧪 Testujem konfiguráciu ${i + 1}: ${config.host}:${config.port}`);

        const transporter = nodemailer.createTransport({
            ...config,
            auth: { user: 'info@papihairdesign.sk', pass: 'Poklop123###' }
        });

        try {
            await transporter.sendMail({
                from: 'info@papihairdesign.sk',
                to: 'info@papihairdesign.sk',
                subject: 'AUTO-REPAIR TEST',
                text: 'Automatický test konfigurácie'
            });

            console.log(`✅ Konfigurácia ${i + 1} funguje!`);
            return config;
        } catch (error) {
            console.log(`❌ Konfigurácia ${i + 1} zlyhala: ${error.message}`);
        }
    }
    return null;
}

testConfigs().then(workingConfig => {
    if (workingConfig) {
        console.log('🎉 Našla sa funkčná konfigurácia!');
        // Ulož konfiguráciu do .env súboru
        const envContent = `
SMTP_HOST=${workingConfig.host}
SMTP_PORT=${workingConfig.port}
SMTP_SECURE=${workingConfig.secure}
SMTP_USER=info@papihairdesign.sk
SMTP_PASS=Poklop123###
        `.trim();

        writeFileSync('.env.smtp', envContent);
        console.log('💾 Konfigurácia uložená do .env.smtp');
    } else {
        console.log('💥 Žiadna konfigurácia nefunguje');
    }
});
```

## 📞 KONTAKT PRE PODPORU

Ak žiadna konfigurácia nefunguje:
1. Kontaktuj Websupport podporu
2. Over si SPF, DKIM, DMARC záznamy
3. Skontroluj či nie je prekročený limit odoslaných e-mailov
4. Over firewall nastavenia

## ✅ OVERENIE ÚSPECHU

**SMTP server funguje správne keď:**
- ✅ Testovací script vráti "SUCCESS"
- ✅ E-mail príde do schránky do 1 minúty
- ✅ Kontaktný formulár odosiela e-maily
- ✅ Žiadne chybové hlášky v konzole

**Gratulujem! SMTP server je 100% funkčný! 🎉**