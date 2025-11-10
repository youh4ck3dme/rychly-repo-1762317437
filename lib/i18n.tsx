import React, { createContext, useState, useContext, useCallback } from "react";

type Language = "en" | "sk";

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: Record<string, string>) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Welcome
    "welcome.title": "Discover Your Perfect Hair Color.",
    "welcome.subtitle":
      "Get an expert hair diagnosis and discover your perfect, tailor-made color with advanced AI.",
    "welcome.tagline": "Powered by PAPI HAIR DESIGN & BARBER",
    "welcome.button": "START CONSULTATION",
    "welcome.buttonSubtitle": "Personalized AI Analysis",
    // Upload Wizard
    "upload.title": "Studio | PAPI HAIR DESIGN & BARBER",
    "upload.subtitle":
      "Your transformation begins here. Follow the steps to craft a look that is uniquely yours.",
    "upload.nextStep": "Next Step",
    "upload.prevStep": "Previous Step",

    "upload.consultationStyleTitle": "Choose Your Style Rune",
    "upload.consultationStyleSubtitle":
      "Select the essence of the look you wish to achieve.",
    "upload.styles.classic": "Classic",
    "upload.styles.classic.desc": "Timeless elegance and refined beauty.",
    "upload.styles.trendy": "Trendy",
    "upload.styles.trendy.desc": "Modern, fashion-forward, and bold.",
    "upload.styles.bold": "Bold",
    "upload.styles.bold.desc": "Dramatic, high-impact, and unforgettable.",
    "upload.styles.lowMaintenance": "Effortless",
    "upload.styles.lowMaintenance.desc": "Natural grace with minimal upkeep.",
    "upload.styles.glamorous": "Glamorous",
    "upload.styles.glamorous.desc": "Luxurious, polished, and captivating.",
    "upload.styles.bohemian": "Bohemian",
    "upload.styles.bohemian.desc":
      "Free-spirited, earthy, with a touch of romance.",
    "upload.styles.artDeco": "Art Deco",
    "upload.styles.artDeco.desc": "Geometric precision meets opulent glamour.",
    "upload.styles.futuristic": "Futuristic",
    "upload.styles.futuristic.desc":
      "Sleek, avant-garde, and ahead of its time.",

    "upload.hairstylePreferenceTitle": "Envision Your Form",
    "upload.hairstylePreferenceSubtitle":
      "Choose a foundational cut for your new style.",
    "upload.hairstyles.keep": "Keep Style",
    "upload.hairstyles.keep.desc": "Refine and perfect your current length.",
    "upload.hairstyles.bob": "Bob",
    "upload.hairstyles.bob.desc": "A sharp, chic, and powerful statement.",
    "upload.hairstyles.longLayers": "Long Layers",
    "upload.hairstyles.longLayers.desc":
      "Flowing movement and graceful volume.",
    "upload.hairstyles.pixie": "Pixie",
    "upload.hairstyles.pixie.desc": "Playful, daring, and full of character.",
    "upload.hairstyles.wavyLob": "Wavy Lob",
    "upload.hairstyles.wavyLob.desc":
      "Effortlessly cool with soft, textured waves.",
    "upload.hairstyles.shaggyBob": "Shaggy Bob",
    "upload.hairstyles.shaggyBob.desc":
      "A textured bob with choppy layers for a rebellious, chic look.",
    "upload.hairstyles.butterflyCut": "Butterfly Cut",
    "upload.hairstyles.butterflyCut.desc":
      "Feathery, face-framing layers with longer lengths for dramatic volume.",
    "upload.hairstyles.wolfCut": "Wolf Cut",
    "upload.hairstyles.wolfCut.desc":
      "A wild mix of a shag and a mullet, full of texture and attitude.",
    "upload.hairstyles.italianBob": "Italian Bob",
    "upload.hairstyles.italianBob.desc":
      "A chunky, neck-grazing bob with a heavy, luxurious weight line.",
    "upload.hairstyles.bixieCut": "Bixie Cut",
    "upload.hairstyles.bixieCut.desc":
      "The perfect hybrid of a bob and pixie for versatile, short styling.",
    "upload.hairstyles.octopusCut": "Octopus Cut",
    "upload.hairstyles.octopusCut.desc":
      "Volume on top with wispy, tentacle-like layers below.",
    "upload.hairstyles.curveCut": "Curve Cut (C-Cut)",
    "upload.hairstyles.curveCut.desc":
      "Soft, C-shaped layers that curve inwards, beautifully framing the face.",
    "upload.hairstyles.modernMullet": "Modern Mullet",
    "upload.hairstyles.modernMullet.desc":
      'A softer, more refined take on the classic "business in front, party in back".',
    "upload.hairstyles.birkinBangs": "Birkin Bangs",
    "upload.hairstyles.birkinBangs.desc":
      "Wispy, eyebrow-grazing fringe inspired by Jane Birkin's iconic look.",
    "upload.hairstyles.hushCut": "Hush Cut",
    "upload.hairstyles.hushCut.desc":
      "A soft, heavily-layered Korean cut with gentle, face-framing pieces.",

    "upload.finalStepTitle": "Summon Your Image",
    "upload.finalStepSubtitle":
      "Provide a clear, well-lit selfie for the ritual.",
    "upload.useCamera": "Use Camera",
    "upload.uploadPhoto": "Upload a Photo",
    "upload.cameraError.notSupported":
      "Camera not supported on this device or browser.",
    "upload.cameraError.denied":
      "Camera access was denied. Please allow camera access in your browser settings.",
    "upload.cameraError.notFound": "No camera found on this device.",
    "upload.cameraError.generic":
      "Could not access the camera. Please try again.",
    "upload.cameraError.notReady":
      "Camera is not ready yet. Please wait a moment.",
    "upload.recentPhotos": "Recent Photos",
    "upload.recentPhotoAlt": "Recent photo",
    // Mobile Pairing Modal
    "modal.pairing.title": "No Camera Detected",
    "modal.pairing.subtitle": "Use your phone's camera to continue.",
    "modal.pairing.step1": "Open the camera app on your phone.",
    "modal.pairing.step2": "Scan the QR code below.",
    "modal.pairing.step3": "Follow the link to connect.",
    "modal.pairing.close": "Close",
    // Analysis
    "analysis.title": "Analyzing Your Hair...",
    "analysis.steps.1": "Assessing current hair color...",
    "analysis.steps.2": "Evaluating hair condition...",
    "analysis.steps.3": "Identifying hair type...",
    "analysis.steps.4": "Analyzing facial features...",
    "analysis.steps.5": "Considering your preferences...",
    "analysis.steps.6": "Generating personalized suggestions...",
    "analysis.steps.7": "Matching with salon services...",
    "analysis.steps.8": "Preparing your results...",
    // Results
    "results.creatingLook": "Creating your new look...",
    "results.customColorTitle": "Choose a Custom Color",
    "results.hexCode": "HEX Code",
    "results.cancel": "Cancel",
    "results.apply": "Apply Color",
    "results.title": "Your Color Consultation",
    "results.diagnosis": "AI Diagnosis",
    "results.currentColor": "Current Color",
    "results.condition": "Condition",
    "results.type": "Type",
    "results.tryOn": "Try On Recommended Looks",
    "results.originalHair": "Original Hair",
    "results.originalHairDescription": "Your current hair color.",
    "results.hairstyle": "Hairstyle",
    "results.recommendedServices": "Recommended Services",
    "results.viewServices": "View Recommended Services",
    "results.startOver": "START OVER",
    "results.error": "Could not apply this look. Please try another one.",
    // Explore
    "explore.subtitle": "Discover the latest trends, brought to life by AI.",
    "explore.colorTrends": "Color Trends",
    "explore.styleTrends": "Hairstyle Trends",
    "explore.filter.all": "All",
    "explore.filter.female": "Female",
    "explore.filter.male": "Male",
    // Services
    "services.title": "Our Services",
    "services.note":
      "Note: Prices include VAT and may vary depending on the selected stylist or team member.",
    "services.categories.damske": "Women",
    "services.categories.panske": "Men",
    // Blog
    "blog.title": "Blog Archive",
    "blog.back": "Back to Archive",
    "blog.instagram.title": "From Our Instagram",
    "blog.instagram.follow": "Follow Us on Instagram",
    "blog.empty.title": "Coming Soon!",
    "blog.empty.text":
      "New articles and insights from our stylists are being prepared. Check back later for fresh content!",
    // About Us
    "about.title": "About Us",
    "about.intro":
      "Welcome to our sanctuary of style. We are a team of passionate artists dedicated to the craft of hairdressing, where creativity and expertise combine to create unforgettable looks.",
    "about.book": "Book an Appointment",
    "about.viewServices": "View Pricelist",
    "about.philosophy.title": "Our Philosophy",
    "about.philosophy.text":
      "At Papi Hair Design, we believe that a great hairstyle is a work of art. It is an expression of your individuality and a reflection of your personal style. Our mission is to provide a personalized, luxurious experience for every client. We use only the highest quality products and keep up with the latest trends and techniques to bring you the best in hair care and design.",
    "about.stats.clients": "500+ satisfied clients",
    "about.stats.experience": "15+ years of experience",
    "about.team.title": "Our Talented Team",
    "about.team.intro":
      "The heart and soul of our salon. Meet the artists behind the chairs.",
    "about.team.papi.name": "Papi",
    "about.team.papi.title": "Owner & Master Stylist",
    "about.team.papi.bio":
      "The founder of the salon with more than 15 years of experience in hair design. Specializes in premium services and creative transformations.",
    "about.team.papi.skills.1": "Premium cutting",
    "about.team.papi.skills.2": "Styling",
    "about.team.papi.skills.3": "Color",
    "about.team.papi.skills.4": "Creative hairstyles",
    "about.team.mato.name": "Maťo",
    "about.team.mato.title": "Professional Barber",
    "about.team.mato.bio":
      "A specialist in men's cuts and beard grooming with a modern approach. Master of classic and modern cutting techniques.",
    "about.team.mato.skills.1": "Men's cuts",
    "about.team.mato.skills.2": "Beard & mustache",
    "about.team.mato.skills.3": "Classic cuts",
    "about.team.mato.skills.4": "Fade techniques",
    "about.team.miska.name": "Miška",
    "about.team.miska.title": "Creative Hair Artist",
    "about.team.miska.bio":
      "Creativity and modern techniques are her strong suit. An expert in color transformations and the latest trends in hairdressing.",
    "about.team.miska.skills.1": "Women's cuts",
    "about.team.miska.skills.2": "Highlights & color",
    "about.team.miska.skills.3": "Styling",
    "about.team.miska.skills.4": "Modern trends",
    "about.cta.title": "Ready for a transformation?",
    "about.cta.text":
      "Book your appointment today and let our experts take care of your new look.",
    "about.cta.bookOnline": "Book Online",
    "about.cta.call": "Call: +421 949 459 624",
    // Contact
    "contact.title": "Contact Us",
    "contact.intro":
      "A luxury hair salon in the center of Košice. Book an appointment or visit us for professional services at the highest level.",
    "contact.phone.title": "Phone",
    "contact.phone.hours": "MON-FRI: 08:00 - 17:00",
    "contact.email.title": "Email",
    "contact.email.response": "Response within 24 hours",
    "contact.address.title": "Address",
    "contact.address.location": "Trieda SNP 61 (Spoločenský pavilón) Košice",
    "contact.booking.title": "Book an Appointment",
    "contact.booking.text":
      "Book your appointment online or contact us by phone. Our team will be happy to help you choose the right service.",
    "contact.booking.online": "Online Booking",
    "contact.booking.call": "Call Now",
    "contact.form.title": "Write to Us",
    "contact.form.name": "Name *",
    "contact.form.name.placeholder": "Your name",
    "contact.form.phone": "Phone",
    "contact.form.phone.placeholder": "+421 xxx xxx xxx",
    "contact.form.email": "Email *",
    "contact.form.email.placeholder": "your@email.com",
    "contact.form.service": "Service",
    "contact.form.service.placeholder": "Select a service",
    "contact.form.message": "Message *",
    "contact.form.message.placeholder":
      "Describe your requirements or questions...",
    "contact.form.submit": "Send Message",
    "contact.form.submitted.title": "Message Sent!",
    "contact.form.submitted.message":
      "Thank you for contacting us. We will get back to you shortly.",
    "contact.form.submitted.close": "Close",
    "contact.form.error.required.name": "Name is required.",
    "contact.form.error.required.email": "Email is required.",
    "contact.form.error.invalid.email": "Email address is invalid.",
    "contact.form.error.required.message": "Message is required.",
    "contact.hours.title": "Opening Hours",
    "contact.hours.weekdays": "Monday - Friday",
    "contact.hours.weekends": "Saturday - Sunday",
    "contact.hours.closed": "Closed",
    "contact.hours.open": "Currently open",
    "contact.hours.closedDynamic": "Currently closed",
    "contact.social.title": "Follow Us",
    "contact.social.text": "Stay in touch and follow our latest work",
    // Footer
    "footer.home": "Home",
    "footer.explore": "Portfolio",
    "footer.services": "Services",
    "footer.blog": "Blog",
    "footer.about": "About Us",
    // App/Chatbot
    "app.openChat": "Open Chat",
    "chatbot.initialMessage":
      "Hello! I am your PAPI HAIR DESIGN & BARBER AI Stylist. How can I help you today?",
    "chatbot.error": "Sorry, I encountered an error. Please try again.",
    "chatbot.title": "AI Stylist",
    "chatbot.close": "Close chat",
    "chatbot.placeholder": "Ask about your hair...",
    "chatbot.send": "Send message",
    // Error Boundary
    "errorBoundary.title": "Something Went Wrong",
    "errorBoundary.message":
      "An unexpected error occurred. Try restarting the app.",
    "errorBoundary.button": "Restart App",
    "errorBoundary.details": "Error Details (dev mode)",
  },
  sk: {
    // Welcome
    "welcome.title": "Výnimočný dizajn vlasov dotiahnutý k dokonalosti",
    "welcome.subtitle":
      "Získajte odbornú diagnózu vlasov a objavte svoju dokonalú, na mieru šitú farbu s pokročilou AI.",
    "welcome.tagline": "Vytvorené pre PAPI HAIR DESIGN & BARBER",
    "welcome.button": "SPUSTIŤ KONZULTÁCIU",
    "welcome.buttonSubtitle": "Personalizovaná AI Analýza",
    // Upload Wizard
    "upload.title": "Štúdio | PAPI HAIR DESIGN & BARBER",
    "upload.subtitle":
      "Vaša transformácia začína tu. Nasledujte kroky a vytvorte si vzhľad, ktorý je jedinečne váš.",
    "upload.nextStep": "Ďalší krok",
    "upload.prevStep": "Späť",

    "upload.consultationStyleTitle": "Vyberte si runu štýlu",
    "upload.consultationStyleSubtitle":
      "Zvoľte esenciu vzhľadu, ktorý chcete dosiahnuť.",
    "upload.styles.classic": "Klasický",
    "upload.styles.classic.desc": "Nadčasová elegancia a rafinovaná krása.",
    "upload.styles.trendy": "Trendový",
    "upload.styles.trendy.desc": "Moderný, odvážny a v súlade s módou.",
    "upload.styles.bold": "Odvážny",
    "upload.styles.bold.desc": "Dramatický, výrazný a nezabudnuteľný.",
    "upload.styles.lowMaintenance": "Nenáročný",
    "upload.styles.lowMaintenance.desc":
      "Prirodzená ladnosť s minimálnou údržbou.",
    "upload.styles.glamorous": "Očarujúci",
    "upload.styles.glamorous.desc": "Luxusný, uhladený a podmanivý.",
    "upload.styles.bohemian": "Bohémsky",
    "upload.styles.bohemian.desc":
      "Slobodomyseľný, zemitý, s dotykom romantiky.",
    "upload.styles.artDeco": "Art Deco",
    "upload.styles.artDeco.desc":
      "Geometrická precíznosť sa stretáva s opulentným pôvabom.",
    "upload.styles.futuristic": "Futuristický",
    "upload.styles.futuristic.desc":
      "Elegantný, avantgardný a predbehajúci svoju dobu.",

    "upload.hairstylePreferenceTitle": "Predstavte si svoju formu",
    "upload.hairstylePreferenceSubtitle":
      "Zvoľte základný strih pre váš nový štýl.",
    "upload.hairstyles.keep": "Ponechať",
    "upload.hairstyles.keep.desc": "Zdokonaliť a vylepšiť vašu súčasnú dĺžku.",
    "upload.hairstyles.bob": "Bob",
    "upload.hairstyles.bob.desc": "Ostrý, šik a silný výraz osobnosti.",
    "upload.hairstyles.longLayers": "Dlhé vrstvy",
    "upload.hairstyles.longLayers.desc": "Plynulý pohyb a elegantný objem.",
    "upload.hairstyles.pixie": "Pixie",
    "upload.hairstyles.pixie.desc": "Hravý, odvážny a plný charakteru.",
    "upload.hairstyles.wavyLob": "Vlnitý Lob",
    "upload.hairstyles.wavyLob.desc":
      "Nenápadne cool s jemnými, textúrovanými vlnami.",
    "upload.hairstyles.shaggyBob": "Shaggy Bob",
    "upload.hairstyles.shaggyBob.desc":
      "Textúrovaný bob s rozstrapkanými vrstvami pre rebelantský, šik vzhľad.",
    "upload.hairstyles.butterflyCut": "Motýlí Strih",
    "upload.hairstyles.butterflyCut.desc":
      "Vzdušné vrstvy rámujúce tvár s dlhšími koncami pre dramatický objem.",
    "upload.hairstyles.wolfCut": "Wolf Cut",
    "upload.hairstyles.wolfCut.desc":
      "Divoký mix shag a mullet účesu, plný textúry a sebavedomia.",
    "upload.hairstyles.italianBob": "Taliansky Bob",
    "upload.hairstyles.italianBob.desc":
      "Robustný bob s dĺžkou po krk s ťažkou, luxusnou líniou.",
    "upload.hairstyles.bixieCut": "Bixie Strih",
    "upload.hairstyles.bixieCut.desc":
      "Perfektný hybrid medzi bobom a pixie pre všestranný, krátky styling.",
    "upload.hairstyles.octopusCut": "Chobotnicový Strih",
    "upload.hairstyles.octopusCut.desc":
      "Objem na vrchu s jemnými, chápadlovitými vrstvami naspodu.",
    "upload.hairstyles.curveCut": "Oblúkový Strih (C-Cut)",
    "upload.hairstyles.curveCut.desc":
      "Jemné vrstvy v tvare písmena C, ktoré sa stáčajú dovnútra a krásne rámujú tvár.",
    "upload.hairstyles.modernMullet": "Moderný Mullet",
    "upload.hairstyles.modernMullet.desc":
      'Jemnejšia a rafinovanejšia verzia klasiky "vpredu biznis, vzadu párty".',
    "upload.hairstyles.birkinBangs": "Birkin Ofina",
    "upload.hairstyles.birkinBangs.desc":
      "Jemná ofina siahajúca po obočie, inšpirovaná ikonickým vzhľadom Jane Birkin.",
    "upload.hairstyles.hushCut": "Hush Strih",
    "upload.hairstyles.hushCut.desc":
      "Jemný, silne vrstvený kórejský strih s nežnými kúskami rámujúcimi tvár.",

    "upload.finalStepTitle": "Vyvolajte svoj obraz",
    "upload.finalStepSubtitle":
      "Pre rituál poskytnite jasnú, dobre osvetlenú selfie.",
    "upload.useCamera": "Použiť fotoaparát",
    "upload.uploadPhoto": "Nahrať fotku",
    "upload.cameraError.notSupported":
      "Fotoaparát nie je na tomto zariadení alebo v prehliadači podporovaný.",
    "upload.cameraError.denied":
      "Prístup k fotoaparátu bol zamietnutý. Povoľte prístup v nastaveniach prehliadača.",
    "upload.cameraError.notFound":
      "Na tomto zariadení sa nenašiel žiadny fotoaparát.",
    "upload.cameraError.generic":
      "Nepodarilo sa získať prístup k fotoaparátu. Skúste to prosím znova.",
    "upload.cameraError.notReady":
      "Fotoaparát ešte nie je pripravený. Počkajte chvíľu.",
    "upload.recentPhotos": "Nedávne fotky",
    "upload.recentPhotoAlt": "Nedávna fotka",
    // Mobile Pairing Modal
    "modal.pairing.title": "Nenašiel sa žiadny fotoaparát",
    "modal.pairing.subtitle": "Pokračujte použitím fotoaparátu na telefóne.",
    "modal.pairing.step1": "Otvorte aplikáciu fotoaparátu na telefóne.",
    "modal.pairing.step2": "Naskenujte QR kód nižšie.",
    "modal.pairing.step3": "Pre pripojenie nasledujte odkaz.",
    "modal.pairing.close": "Zavrieť",
    // Analysis
    "analysis.title": "Analyzujem vaše vlasy...",
    "analysis.steps.1": "Hodnotenie aktuálnej farby vlasov...",
    "analysis.steps.2": "Posudzovanie stavu vlasov...",
    "analysis.steps.3": "Identifikácia typu vlasov...",
    "analysis.steps.4": "Analýza čŕt tváre...",
    "analysis.steps.5": "Zohľadnenie vašich preferencií...",
    "analysis.steps.6": "Generovanie personalizovaných návrhov...",
    "analysis.steps.7": "Párovanie so službami salónu...",
    "analysis.steps.8": "Príprava vašich výsledkov...",
    // Results
    "results.creatingLook": "Vytváram váš nový vzhľad...",
    "results.customColorTitle": "Vyberte si vlastnú farbu",
    "results.hexCode": "HEX kód",
    "results.cancel": "Zrušiť",
    "results.apply": "Aplikovať farbu",
    "results.title": "Vaša farebná konzultácia",
    "results.diagnosis": "AI Diagnóza",
    "results.currentColor": "Aktuálna farba",
    "results.condition": "Stav",
    "results.type": "Typ",
    "results.tryOn": "Vyskúšajte odporúčané vzhľady",
    "results.originalHair": "Pôvodné vlasy",
    "results.originalHairDescription": "Vaša aktuálna farba vlasov.",
    "results.hairstyle": "Účes",
    "results.recommendedServices": "Odporúčané služby",
    "results.viewServices": "Zobraziť odporúčané služby",
    "results.startOver": "ZAČAŤ ODZNOVA",
    "results.error": "Tento vzhľad sa nepodarilo aplikovať. Skúste prosím iný.",
    // Explore
    "explore.subtitle":
      "Objavte najnovšie trendy oživené umelou inteligenciou.",
    "explore.colorTrends": "Farebné Trendy",
    "explore.styleTrends": "Vlasové Trendy",
    "explore.filter.all": "Všetky",
    "explore.filter.female": "Dámske",
    "explore.filter.male": "Pánske",
    // Services
    "services.title": "Naše služby",
    "services.note":
      "Pozn.: Ceny sú uvedené s DPH a môžu sa líšiť v závislosti od vybraného kaderníka alebo člena tímu.",
    "services.categories.damske": "Dámske",
    "services.categories.panske": "Pánske",
    // Blog
    "blog.title": "Archív Blogu",
    "blog.back": "Späť na Archív",
    "blog.instagram.title": "Z nášho Instagramu",
    "blog.instagram.follow": "Sledujte nás na Instagrame",
    "blog.empty.title": "Už čoskoro!",
    "blog.empty.text":
      "Pripravujeme nové články a postrehy od našich stylistov. Vráťte sa neskôr pre čerstvý obsah!",
    // About Us
    "about.title": "O nás",
    "about.intro":
      "Vitajte v našom sanktváriu štýlu. Sme tím vášnivých umelcov, ktorí sa venujú remeslu kaderníctva, kde sa kreativita a odbornosť spájajú a vytvárajú nezabudnuteľné looky.",
    "about.book": "Rezervovať termín",
    "about.viewServices": "Pozrieť cenník",
    "about.philosophy.title": "Naša filozofia",
    "about.philosophy.text":
      "V Papi Hair Design veríme, že skvelý účes je umeleckým dielom. Je to vyjadrenie vašej individuality a odraz vašeho osobného štýlu. Našou misiou je poskytnúť personalizovaný, luxusný zážitok pre každého klienta. Používame len najkvalitnejšie produkty a držíme krok s najnovšími trendmi a technikami, aby sme vám priniesli to najšie v starostlivosti o vlasy a dizajne.",
    "about.stats.clients": "500+ spokojných klientov",
    "about.stats.experience": "15+ rokov skúseností",
    "about.team.title": "Náš talentovaný tím",
    "about.team.intro":
      "Srdce a duša nášho salónu. Spoznajte umelcov za kreslami.",
    "about.team.papi.name": "Papi",
    "about.team.papi.title": "Majiteľ & Master Stylist",
    "about.team.papi.bio":
      "Zakladateľ salónu s viac ako 15 rokmi skúseností v oblasti vlasového dizajnu. Špecializuje sa na prémiové služby a kreativné transformácie.",
    "about.team.papi.skills.1": "Premium strihanie",
    "about.team.papi.skills.2": "Styling",
    "about.team.papi.skills.3": "Farba",
    "about.team.papi.skills.4": "Kreativné účesy",
    "about.team.mato.name": "Maťo",
    "about.team.mato.title": "Professional Barber",
    "about.team.mato.bio":
      "Špecialista na pánske strihy a úpravu brady s moderným prístupom. Majster klasických aj moderných techník strihánia.",
    "about.team.mato.skills.1": "Pánske strihanie",
    "about.team.mato.skills.2": "Brada & fúzy",
    "about.team.mato.skills.3": "Klasické strihy",
    "about.team.mato.skills.4": "Fade techniques",
    "about.team.miska.name": "Miška",
    "about.team.miska.title": "Creative Hair Artist",
    "about.team.miska.bio":
      "Kreativita a moderné techniky sú jej silnou stránkou. Expertka na farebné transformácie a najnovšie trendy v kaderníctve.",
    "about.team.miska.skills.1": "Dámske strihanie",
    "about.team.miska.skills.2": "Melír & farba",
    "about.team.miska.skills.3": "Styling",
    "about.team.miska.skills.4": "Moderné trendy",
    "about.cta.title": "Pripravení na transformáciu?",
    "about.cta.text":
      "Rezervujte si termín ešte dnes a nechajte našich expertov postarať sa o váš nový look.",
    "about.cta.bookOnline": "Rezervovať online",
    "about.cta.call": "Zavolať: +421 949 459 624",
    // Contact
    "contact.title": "Kontaktujte nás",
    "contact.intro":
      "Luxusný kadernícky salón v centre Košíc. Rezervujte si termín alebo nás navštívte pre profesionálne služby na najvyššej úrovni.",
    "contact.phone.title": "Telefón",
    "contact.phone.hours": "PO-PI: 08:00 - 17:00",
    "contact.email.title": "Email",
    "contact.email.response": "Odpoveď do 24 hodín",
    "contact.address.title": "Adresa",
    "contact.address.location": "Trieda SNP 61 (Spoločenský pavilón) Košice",
    "contact.booking.title": "Rezervácia termínu",
    "contact.booking.text":
      "Rezervujte si termín online alebo nás kontaktujte telefonicky. Náš tím vám rád pomôže vybrať správnu službu.",
    "contact.booking.online": "Online rezervácia",
    "contact.booking.call": "Zavolať teraz",
    "contact.form.title": "Napíšte nám",
    "contact.form.name": "Meno *",
    "contact.form.name.placeholder": "Vaše meno",
    "contact.form.phone": "Telefón",
    "contact.form.phone.placeholder": "+421 xxx xxx xxx",
    "contact.form.email": "Email *",
    "contact.form.email.placeholder": "vas@email.com",
    "contact.form.service": "Služba",
    "contact.form.service.placeholder": "Vyberte službu",
    "contact.form.message": "Správa *",
    "contact.form.message.placeholder":
      "Opíšte vaše požiadavky alebo otázky...",
    "contact.form.submit": "Odoslať správu",
    "contact.form.submitted.title": "Správa odoslaná!",
    "contact.form.submitted.message":
      "Ďakujeme, že ste nás kontaktovali. Ozveme sa vám čo najskôr.",
    "contact.form.submitted.close": "Zavrieť",
    "contact.form.error.required.name": "Meno je povinné.",
    "contact.form.error.required.email": "Email je povinný.",
    "contact.form.error.invalid.email": "Emailová adresa je neplatná.",
    "contact.form.error.required.message": "Správa je povinná.",
    "contact.hours.title": "Otváracie hodiny",
    "contact.hours.weekdays": "Pondelok - Piatok",
    "contact.hours.weekends": "Sobota - Nedeľa",
    "contact.hours.closed": "Zatvorené",
    "contact.hours.open": "Aktuálne otvorené",
    "contact.hours.closedDynamic": "Aktuálne zatvorené",
    "contact.social.title": "Sledujte nás",
    "contact.social.text":
      "Zostaňte v kontakte a sledujte naše najnovšie práce",
    // Footer
    "footer.home": "Domov",
    "footer.explore": "Portfólio",
    "footer.services": "Naše služby",
    "footer.blog": "Blog",
    "footer.about": "O nás",
    // App/Chatbot
    "app.openChat": "Otvoriť chat",
    "chatbot.initialMessage":
      "Dobrý deň! Som váš PAPI HAIR DESIGN & BARBER AI Stylista. Ako vám dnes môžem pomôcť?",
    "chatbot.error":
      "Ospravedlňujem sa, vyskytla sa chyba. Skúste to prosím znova.",
    "chatbot.title": "AI Stylista",
    "chatbot.close": "Zatvoriť chat",
    "chatbot.placeholder": "Opýtajte sa na svoje vlasy...",
    "chatbot.send": "Odoslať správu",
    // Error Boundary
    "errorBoundary.title": "Niečo sa pokazilo",
    "errorBoundary.message":
      "Došlo k neočakávanej chybe. Skús aplikáciu obnoviť.",
    "errorBoundary.button": "Obnoviť aplikáciu",
    "errorBoundary.details": "Detaily chyby (dev mode)",
  },
};

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider = React.memo(
  ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const [language, setLanguage] = useState<Language>("sk");

    const t = useCallback(
      (key: string, options?: Record<string, string>): string => {
        let translation = translations[language][key] || key;
        if (options) {
          Object.keys(options).forEach((optionKey) => {
            translation = translation.replace(
              `{{${optionKey}}}`,
              options[optionKey],
            );
          });
        }
        return translation;
      },
      [language],
    );

    return (
      <LanguageContext.Provider value={{ language, setLanguage, t }}>
        {children}
      </LanguageContext.Provider>
    );
  },
);

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
