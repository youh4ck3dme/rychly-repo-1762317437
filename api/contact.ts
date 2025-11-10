import type { APIRoute } from "astro";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Vytvorenie DOMPurify instance pre serverové použitie
const window = new JSDOM("").window;
const DOMPurifyServer = DOMPurify(window as any);

// In-memory store pre rate limiting (pre produkciu použiť Redis)
const submissions = new Map<string, { count: number; resetTime: number }>();

// Rate limiting: max 3 odoslania za 15 minút z jednej IP
const RATE_LIMIT = 3;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minút

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userSubmissions = submissions.get(ip);

  if (!userSubmissions || now > userSubmissions.resetTime) {
    // Prvý request alebo vypršaný časový limit
    submissions.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (userSubmissions.count >= RATE_LIMIT) {
    return true;
  }

  userSubmissions.count++;
  return false;
}

// Sanitizácia vstupov
function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  return DOMPurifyServer.sanitize(input.trim());
}

// Kontrola honeypot poľa
function isHoneypotFilled(honeypot: string): boolean {
  return Boolean(honeypot && honeypot.length > 0);
}

// Kontrola času vyplnenia formuláře (minimum 5 sekúnd)
function isTooFast(timestamp: number): boolean {
  const now = Date.now();
  const minTime = 5000; // 5 sekúnd
  return now - timestamp < minTime;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const { name, phone, email, service, message, honeypot, timestamp } =
      await request.json();

    // Získanie IP adresy
    const ip =
      clientAddress || request.headers.get("x-forwarded-for") || "unknown";

    // 1. RATE LIMITING - kontrola počtu odoslaní z jednej IP
    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Príliš veľa pokusov o odoslanie. Skúste to znovu o 15 minút.",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 2. HONEYPOT - kontrola skrytého poľa
    if (isHoneypotFilled(honeypot)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Spam detekovaný",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 3. ČASOVÁ KONTROLA - formulár musí byť vyplnený aspoň 5 sekúnd
    if (isTooFast(timestamp)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Formulár bol vyplnený príliš rýchlo",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 4. SANITIZÁCIA VSTUPOV
    const sanitizedName = sanitizeInput(name);
    const sanitizedPhone = sanitizeInput(phone);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedService = sanitizeInput(service);
    const sanitizedMessage = sanitizeInput(message);

    // 5. VALIDÁCIA POŽADOVANÝCH POLÍ
    if (!sanitizedName || !sanitizedEmail || !sanitizedMessage) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Meno, email a správa sú povinné polia",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 6. KONTROLA DĹŽKY VSTUPOV
    if (
      sanitizedName.length > 100 ||
      sanitizedEmail.length > 100 ||
      sanitizedPhone.length > 20 ||
      sanitizedService.length > 200 ||
      sanitizedMessage.length > 2000
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Niektoré polia sú príliš dlhé",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 7. VALIDÁCIA EMAILU
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Neplatný formát emailu",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 8. KONTROLA DUPLICITNÝCH SPRÁV (jednoduchá kontrola)
    const messageHash = Buffer.from(sanitizedMessage).toString("base64");
    const duplicateKey = `${ip}:${messageHash}`;
    // V produkcii by ste použili Redis alebo databázu pre uloženie hashov

    // 9. DODATOČNÁ KONTROLA SPAMU - základné kľúčové slová
    const spamKeywords = [
      "viagra",
      "casino",
      "lottery",
      "winner",
      "congratulations",
    ];
    const lowerMessage = sanitizedMessage.toLowerCase();
    const containsSpam = spamKeywords.some((keyword) =>
      lowerMessage.includes(keyword),
    );

    if (containsSpam) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Správa obsahuje nepovolený obsah",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Vytvorenie transportera pre e-mail
    const transporter = nodemailer.createTransport({
      host: "smtp.m1.websupport.sk",
      port: 465,
      secure: true, // SSL/TLS
      auth: {
        user: "info@papihairdesign.sk",
        pass: "Poklop123###",
      },
    });

    // Príprava e-mailu so sanitizovanými údajmi
    const mailOptions = {
      from: "info@papihairdesign.sk",
      to: "info@papihairdesign.sk",
      subject: `Nová správa z kontaktného formulára - ${sanitizedName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d97706;">Nová správa z kontaktného formulára</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Meno:</strong> ${sanitizedName}</p>
            <p><strong>Telefón:</strong> ${sanitizedPhone || "Nebol uvedený"}</p>
            <p><strong>Email:</strong> ${sanitizedEmail}</p>
            ${sanitizedService ? `<p><strong>Služba:</strong> ${sanitizedService}</p>` : ""}
            <p><strong>Správa:</strong></p>
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin-top: 10px;">
              ${sanitizedMessage.replace(/\n/g, "<br>")}
            </div>
          </div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            Táto správa bola odoslaná z kontaktného formulára na webovej stránke.<br>
            IP adresa: ${ip}<br>
            Čas odoslania: ${new Date().toLocaleString("sk-SK")}
          </p>
        </div>
      `,
      // Textová verzia pre e-mailové klienty, ktoré nepodporujú HTML
      text: `
Nová správa z kontaktného formulára

Meno: ${sanitizedName}
Telefón: ${sanitizedPhone || "Nebol uvedený"}
Email: ${sanitizedEmail}
${sanitizedService ? `Služba: ${sanitizedService}` : ""}
Správa:
${sanitizedMessage}

---
IP adresa: ${ip}
Čas odoslania: ${new Date().toLocaleString("sk-SK")}
      `,
      // Headers pre lepšiu sledovateľnosť
      headers: {
        "X-Mailer": "PapiHairDesign Contact Form",
        "X-Application": "Hair Studio Website",
        "X-IP-Address": ip,
        "X-Submission-Time": new Date().toISOString(),
      },
    };

    // Odoslanie e-mailu
    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Správa bola úspešne odoslaná",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Chyba pri odosielaní e-mailu:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Nastala chyba pri odosielaní správy. Skúste to znovu neskôr.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
