Úloha:Ste senior softvérový architekt so špecializáciou na DevOps a vývoj moderných webových aplikácií.
Úloha:Vytvorte podrobnú technickú špecifikáciu pre nový nástroj rozhrania príkazového riadka (CLI) s názvom„Inšpektor stavu Next.js“Tento nástroj analyzuje projekt Next.js s cieľom identifikovať problémy súvisiace s výkonom, bezpečnosťou a osvedčenými postupmi a poskytnúť praktické odporúčania a automatizované opravy.
Kontext:Nástroj by mal byť komplexným riešením pre vývojárov na udržiavanie vysokokvalitných aplikácií Next.js. Musí byť inteligentný, interaktívny a rozšíriteľný.
Základné vlastnosti podrobnejšie:
Inteligentný detekčný modul:
Uznanie architektúry:Vysvetlite, ako nástroj automaticky zistí verziu Next.js a rozlíši medzi...Smerovač stránokaSmerovač aplikáciíarchitektúry.
Analýza závislostí:Popíšte mechanizmus na identifikáciu kľúčových frameworkov a knižníc použitých v projekte (napr. Tailwind CSS, tRPC, Prisma, knižnice na správu stavov).
⚡ Modul výkonnostnej inteligencie:
Analýza zväzkov:Podrobne opíšte proces vykonania skutočnej analýzy veľkosti balíka (nielen odhad). Ako sa vizualizujú výsledky, aby sa ukázalo, ktoré balíky najviac prispievajú k veľkosti balíka?
Odhad základných webových ukazovateľov (CWV):Popíšte techniky statickej analýzy na odhad skóre CWV (LCP, FID, CLS) analýzou štruktúr komponentov, spracovania obrázkov a načítania fontov.
Detekcia úniku pamäte:Navrhnite stratégiu na detekciu potenciálnych únikov pamäte prostredníctvom statickej analýzy kódu so zameraním na bežné úskalia v Reacte (napr. nevyčistené odbery vpoužitieEfekt). Uveďte konkrétne príklady odporúčaní.
🔒 Modul bezpečnostného štítu:
Skenovanie zraniteľností v reálnom čase:Ako bude nástroj vyhľadávať známe zraniteľnosti v rámci závislostí projektu?
Audit osvedčených postupov:Uveďte, ako sa bude overovať súlad projektu s osvedčenými postupmi OWASP pre webové aplikácie vrátane kontrol konfigurácií XSS, CSRF a zabezpečených hlavičiek.
🎛️ Interaktívny ovládací panel (CLI UI):
Výber testu:Navrhnite rozhranie, ktoré používateľom umožní vybrať si, ktoré konkrétne testy alebo moduly sa majú spustiť.
Pokrok v reálnom čase:Popíšte, ako bude nástroj zobrazovať priebeh v reálnom čase a ukazovať, ktoré kontroly prebiehajú, sú dokončené alebo zlyhali.
Interaktívne opravy:Vysvetlite, ako nástroj zobrazí identifikované problémy a ponúkne interaktívne návrhy na ich opravu.
🔧 Nástroj na automatickú opravu:
Automatizované opravy:Podrobne opíšte schopnosť automaticky opraviť bežné problémy s nízkym rizikom (napr. pridanierel="noopener noreferrer"na externé odkazy, optimalizácia obrázkov, pridanie chýbajúcich atribútov ARIA).
Inteligentné aktualizácie:Popíšte proces inteligentnej aktualizácie závislostí s ohľadom na kritické zmeny.
Generovanie konfigurácie:Ako bude nástroj generovať alebo aktualizovať konfiguračné súbory (napr.next.config.js,tsconfig.json) na základe osvedčených postupov?
Odporúčania pre implementáciu (zahrnúť do výstupu):
Na základe špecifikácie poskytnite jasný a prioritizovaný zoznam implementačných krokov.
Okamžité vylepšenia:Navrhnite, čo je potrebné na prechod od overenia konceptu (simulované kontroly) k plne funkčnému nástroju (skutočné kontroly).
Modernizácia:Odporúčam pridať podporu pre pripravované funkcie, ako napríklad možnosti Next.js 15+.
Interaktivita a automatizácia:Zdôraznite implementačnú cestu pre testy voliteľné používateľom a nástroj na automatické opravy.
Rozšíriteľnosť:Navrhnite architektúru založenú na pluginoch, ktorá umožní komunite v budúcnosti pridávať nové kontroly a funkcie.
Výstupný formát:Štruktúrovaný technický dokument s jasnými nadpismi pre každý funkčný modul. V prípade potreby použite odrážky a úryvky kódu na ilustráciu konceptov. Tón by mal byť profesionálny a technický.
