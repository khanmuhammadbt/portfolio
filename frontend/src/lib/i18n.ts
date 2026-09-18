import { DEFAULT_CONTENT, type SiteContent } from "./content";

export type Lang = "en" | "ur";

/* ------------------------------------------------------------------ *
 *  UI labels (non-CMS chrome): nav, headings, buttons, chat widget    *
 * ------------------------------------------------------------------ */
export const dict = {
  en: {
    navAbout: "About",
    navSkills: "Skills",
    navExperience: "Experience",
    navContact: "Contact",
    navThemes: "Themes",
    hireMe: "Hire Me",
    backTop: "Back to top",
    themesEyebrow: "Design Lab",
    themesTitle: "Explore the",
    themesTitleAccent: "design styles",
    themeBannerTitle: "See this site in 8 design styles",
    themeBannerText:
      "Neumorphism, Minimalism, Maximalism, Glassmorphism, Brutalism, Claymorphism, Material and Cyberpunk — preview each one and apply it to the whole site with a single tap.",
    themeBannerCta: "Explore design themes",
    themeBannerNow: "Now viewing",
    themesSub:
      "Every major UI aesthetic, applied live to this whole portfolio. Tap Apply on any card and watch the entire site transform instantly.",
    themeApply: "Apply",
    themeActive: "Active",
    themeCurrent: "Currently active",
    themeReset: "Reset to default",
    themeTraits: "Key traits",
    backToSite: "Back to site",
    themeApplied: "Theme applied across the site",
    skillsTitlePre: "Tools I",
    skillsTitleAccent: "sculpt",
    skillsTitlePost: "with",
    expTitlePre: "The journey of",
    expTitleAccent: "momentum",
    aboutYearsA: "Years of",
    aboutYearsB: "Experience",
    chatName: "Banta Tech Assistant",
    chatStatus: "Online 24/7 · Karachi Time",
    chatClear: "Clear",
    chatPlaceholder: "Type a message…",
    chatWelcome:
      "Hello! I'm the Banta Tech AI assistant. Want a website built, info about our CEO, or tech tips? Just ask!",
    chatFallback: "For a better answer, contact us directly on WhatsApp or Instagram.",
    linkWhatsapp: "WhatsApp",
    linkYoutube: "YouTube",
    linkInstagram: "Instagram",
    linkGithub: "GitHub",
    linkEmail: "Email",
    linkOpen: "Open link",
    suggestions: [
      { q: "What services do you offer?", label: "Services" },
      { q: "Who is the CEO of Banta Tech?", label: "Who is the CEO?" },
      { q: "I want a website built", label: "Need a website" },
      { q: "YouTube channel link?", label: "YouTube" },
      { q: "Contact info?", label: "Contact" },
    ],
  },
  ur: {
    navAbout: "تعارف",
    navSkills: "مہارتیں",
    navExperience: "تجربہ",
    navContact: "رابطہ",
    navThemes: "تھیمز",
    hireMe: "رابطہ کریں",
    backTop: "اوپر جائیں",
    themesEyebrow: "ڈیزائن لیب",
    themesTitle: "دیکھیے مختلف",
    themesTitleAccent: "ڈیزائن اسٹائلز",
    themeBannerTitle: "اس ویب سائٹ کو 8 ڈیزائن اسٹائلز میں دیکھیں",
    themeBannerText:
      "نیومورفزم، منیملزم، میکسیملزم، گلاس مورفزم، بروٹلزم، کلے مورفزم، میٹیریل اور سائبر پنک — ہر ایک کا نمونہ دیکھیں اور ایک کلک میں پوری سائٹ پر لاگو کریں۔",
    themeBannerCta: "ڈیزائن تھیمز دیکھیں",
    themeBannerNow: "اس وقت فعال",
    themesSub:
      "یو آئی کی ہر بڑی طرز، اسی پورٹ فولیو پر براہ راست لاگو۔ کسی بھی کارڈ پر ’لاگو کریں‘ دبائیں اور پوری ویب سائٹ کو فوراً بدلتے دیکھیں۔",
    themeApply: "لاگو کریں",
    themeActive: "فعال",
    themeCurrent: "اس وقت فعال",
    themeReset: "ڈیفالٹ پر واپس",
    themeTraits: "نمایاں خصوصیات",
    backToSite: "ویب سائٹ پر واپس",
    themeApplied: "تھیم پوری سائٹ پر لاگو ہو گئی",
    skillsTitlePre: "جن اوزاروں سے",
    skillsTitleAccent: "کام",
    skillsTitlePost: "کرتا ہوں",
    expTitlePre: "مسلسل محنت",
    expTitleAccent: "کا سفر",
    aboutYearsA: "سال کا",
    aboutYearsB: "تجربہ",
    chatName: "بنتا ٹیک اسسٹنٹ",
    chatStatus: "آن لائن 24/7 · کراچی ٹائم",
    chatClear: "صاف کریں",
    chatPlaceholder: "اردو میں لکھیں…",
    chatWelcome:
      "السلام علیکم! میں بنتا ٹیک کا اے آی اسسٹنٹ ہوں۔ ویب سائٹ بنوانی ہو، سی ای او کی معلومات، یا ٹیک ٹپس — اردو میں پوچھیں!",
    chatFallback: "بہتر جواب کے لیے براہ راست واٹس ایپ یا انسٹاگرام پر رابطہ کریں۔",
    linkWhatsapp: "واٹس ایپ",
    linkYoutube: "یوٹیوب",
    linkInstagram: "انسٹاگرام",
    linkGithub: "گٹ ہب",
    linkEmail: "ای میل",
    linkOpen: "لنک کھولیں",
    suggestions: [
      { q: "آپ کون سیاں خدمات دیتے ہیں؟", label: "خدمات" },
      { q: "بنتا ٹیک کا سی ای او کون ہے؟", label: "سی ای او کون ہے؟" },
      { q: "مجھے ویب سائٹ بنوانی ہے", label: "ویب سائٹ چاہیے" },
      { q: "یوٹیوب چینل کا لنک؟", label: "یوٹیوب" },
      { q: "رابطے کی معلومات؟", label: "رابطہ" },
    ],
  },
} as const;

export type Dict = (typeof dict)["en"];

/* ------------------------------------------------------------------ *
 *  Urdu overlay for CMS content — only strings still equal to the     *
 *  factory defaults are swapped; anything the admin customized is     *
 *  left untouched (we never overwrite user content).                  *
 * ------------------------------------------------------------------ */
const UR: SiteContent = {
  brand: { initials: "خ م", name: "خان محمد" },
  hero: {
    availability: "کام کے لیے دستیاب",
    firstName: "خان",
    lastName: "محمد",
    role: "فل اسٹیک ڈویلپر",
    yearsBadge: "3+ سال کا تجربہ",
    intro:
      "میں نرم اور خوبصورت ڈیجیٹل تجربات بناتا ہوں — React کے شاندار انٹرفیسز سے لے کر Python، Flask اور SQLAlchemy کے مضبوط بیک اینڈز تک۔ صاف کوڈ، نازک سائے۔",
    primaryCta: "بات کریں",
    secondaryCta: "مہارتیں دیکھیں",
    portraitUrl: "",
  },
  stats: [
    { value: 3, suffix: "+", label: "سال کا تجربہ" },
    { value: 8, suffix: "+", label: "ٹیکنالوجیز" },
    { value: 20, suffix: "+", label: "منصوبے مکمل" },
    { value: 100, suffix: "%", label: "لگن" },
  ],
  marquee: ["HTML5", "CSS3", "JavaScript", "React", "Python", "Flask", "SQLAlchemy", "VS Code", "GitHub", "فل اسٹیک"],
  about: {
    eyebrow: "میرا تعارف",
    headingA: "خیالات کو نرم اور کارآمد",
    headingAccent: "مصنوعات میں بدلنا",
    bio1:
      "میں پاکستان سے فل اسٹیک ڈویلپر ہوں، جسے مکمل ویب ایپلیکیشنز بنانے کا 3 سال کا عملی تجربہ ہے۔ HTML اور CSS کی بنیادوں سے لے کر جدید React فرنٹ اینڈز اور Python بیک اینڈز تک — سب میرا کھیل کا میدان ہے۔",
    bio2:
      "ایڈیٹر سے باہر، میں بنتا ٹیک چلاتا ہوں — ایک یوٹیوب چینل جہاں میں نئی نسل کے ڈویلپرز کے لیے ویب ڈیولپمنٹ آسان انداز میں سکھاتا ہوں۔ کوڈ، کیمرہ اور مسلسل سیکھنا۔",
    facts: [
      { icon: "user", label: "نام", value: "خان محمد" },
      { icon: "mail", label: "ای میل", value: "khan@bantatech.com" },
      { icon: "mappin", label: "مقام", value: "ریموٹ — پاکستان" },
      { icon: "badgecheck", label: "حیثیت", value: "فری لانس کے لیے دستیاب" },
    ],
  },
  services: [
    {
      icon: "code2",
      color: "#5b5ee9",
      title: "فرنٹ اینڈ ڈیولپمنٹ",
      text: "React پر مبنی ریسپانسیو انٹرفیسز — نرم اینیمیشنز اور ہر پکسل کی تکمیل کے ساتھ۔",
    },
    {
      icon: "database",
      color: "#ef5d8f",
      title: "بیک اینڈ اور APIs",
      text: "Python، Flask اور SQLAlchemy سے صاف اور مضبوط REST سروسز — ڈیٹا ماڈلنگ، تصدیق اور بہترین آرکیٹیکچر۔",
    },
    {
      icon: "youtube",
      color: "#f43f5e",
      title: "مواد اور کمیونٹی",
      text: "یوٹیوب چینل @bantatech پر ہنر بانٹنا — ٹیوٹوریلز، پراجیکٹس اور مصنوعات بنانے کا سفر۔",
    },
  ],
  skills: {
    eyebrow: "ٹیک اسٹیک",
    sub: "مکمل مصنوعات بنانے کے لیے منتخب ٹیکنالوجیز — پہلے ڈیزائن سے لے کر ڈپلائی شدہ API تک۔",
    items: [
      { icon: "filecode2", name: "HTML5", tag: "مارک اپ اور سیمانٹکس", level: 95, color: "#f06529" },
      { icon: "palette", name: "CSS3", tag: "لے آؤٹ اور موشن", level: 92, color: "#2965f1" },
      { icon: "braces", name: "JavaScript", tag: "منطق اور DOM", level: 88, color: "#d9a40b" },
      { icon: "atom", name: "React JS", tag: "کمپوننٹس اور SPAs", level: 86, color: "#22b8d8" },
      { icon: "terminal", name: "Python", tag: "اسکرپٹنگ اور منطق", level: 85, color: "#3b7dd8" },
      { icon: "flask", name: "Flask", tag: "APIs اور روٹنگ", level: 80, color: "#8b5cf6" },
      { icon: "database", name: "SQLAlchemy", tag: "ORM اور ماڈلز", level: 78, color: "#d0403c" },
      { icon: "code2", name: "VS Code", tag: "روزانہ کا ایڈیٹر", level: 95, color: "#29a3f5" },
    ],
  },
  experience: {
    eyebrow: "سفر",
    sub: "ہر سال، ٹیکنالوجی کی ایک نئی تہہ — ٹائم لائن میں محفوظ۔",
    items: [
      {
        icon: "sparkles",
        period: "2023",
        role: "فرنٹ اینڈ ڈویلپر",
        org: "فری لانس — بنیاد",
        text: "براؤزر سے محبت ہوئی۔ HTML، CSS اور JavaScript سے ریسپانسیو انٹرفیسز بنائے، پھر React سیکھی — 10+ لینڈنگ پیجز اور ڈیش بورڈز مکمل کیے۔",
        tags: ["HTML", "CSS", "JavaScript", "React"],
      },
      {
        icon: "layers",
        period: "2024",
        role: "بیک اینڈ ڈویلپر",
        org: "فری لانس — گہرائی میں",
        text: "پردے کے پیچھے آیا۔ Flask سے REST APIs ڈیزائن کیں، SQLAlchemy سے ڈیٹا ماڈلز بنائے، اور تصدیق اور مائیگریشن کے ساتھ SQL ڈیٹابیسز جوڑے۔",
        tags: ["Python", "Flask", "SQLAlchemy", "SQL"],
      },
      {
        icon: "rocket",
        period: "2025 — اب تک",
        role: "فل اسٹیک ڈویلپر اور کریئیٹر",
        org: "بنتا ٹیک",
        text: "دونوں جہانوں کو مکمل مصنوعات میں جوڑنا — اور یوٹیوب @bantatech پر اردو میں ویب ڈیولپمنٹ سکھانا، VS Code میرا گھر۔",
        tags: ["React", "Flask", "مواد", "VS Code"],
      },
    ],
  },
  contact: {
    eyebrow: "رابطہ کریں",
    headingA: "آئیے آپ کے خیال کو",
    headingAccent: "شکل دیں",
    sub: "فری لانس پراجیکٹس، تعاون، یا ٹیکنالوجی پر گفتگو کے لیے ہمیشہ دستیاب۔ کوئی بھی چینل منتخب کریں۔",
    ctaNote: "سیدھی بات پسند ہے؟",
    ctaSub: "میرا ان باکس 24/7 کھلا ہے۔",
    ctaButton: "پراجیکٹ شروع کریں",
    channels: [
      { icon: "github", color: "#7d8590", name: "GitHub", handle: "Khanmuhammadbt", href: "https://github.com/Khanmuhammadbt" },
      { icon: "youtube", color: "#f43f5e", name: "YouTube", handle: "@bantatech", href: "https://youtube.com/@bantatech" },
      { icon: "instagram", color: "#ef5d8f", name: "Instagram", handle: "Bantech1947", href: "https://instagram.com/bantech1947" },
      { icon: "whatsapp", color: "#22b862", name: "WhatsApp", handle: "+92 123 456 789", href: "https://wa.me/92123456789?text=Hello%20Banta%20Tech!%20I%20would%20like%20some%20information" },
      { icon: "mail", color: "#5b5ee9", name: "Email", handle: "khan@bantatech.com", href: "mailto:khan@bantatech.com" },
    ],
  },
  footer: {
    tagline: "خالص CSS سایوں، React اور نرم سطحوں کی بے حد محبت سے تیار کردہ۔",
    copyright: "خان محمد — بنتا ٹیک",
  },
};

/** Replace only still-default strings with Urdu; keep admin customizations */
export function localizeContent(content: SiteContent, lang: Lang): SiteContent {
  if (lang === "en") return content;
  return apply(content as unknown, DEFAULT_CONTENT as unknown, UR as unknown) as SiteContent;
}

function apply(live: unknown, def: unknown, ur: unknown): unknown {
  if (typeof def === "string" && typeof ur === "string") {
    return live === def ? ur : typeof live === "string" ? live : def;
  }
  if (typeof def === "number" || typeof def === "boolean") return live ?? def;
  if (Array.isArray(def) && Array.isArray(ur)) {
    const liveArr = Array.isArray(live) ? live : def;
    return def.map((d, i) =>
      i < ur.length ? apply(liveArr[i] ?? d, d, ur[i]) : liveArr[i] ?? d
    );
  }
  if (def && typeof def === "object" && ur && typeof ur === "object") {
    const out: Record<string, unknown> = {};
    const liveObj = (live ?? {}) as Record<string, unknown>;
    for (const k of Object.keys(def as Record<string, unknown>)) {
      out[k] = apply(liveObj[k], (def as Record<string, unknown>)[k], (ur as Record<string, unknown>)[k]);
    }
    return out;
  }
  return live ?? def;
}
