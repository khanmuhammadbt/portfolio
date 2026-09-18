/** Design-style registry. Each id maps to a [data-theme="id"] block in index.css */

export type ThemeId =
  | "neumorphism"
  | "minimalism"
  | "maximalism"
  | "glassmorphism"
  | "brutalism"
  | "claymorphism"
  | "material"
  | "cyberpunk"
  | "voltagent";

export interface ThemeMeta {
  id: ThemeId;
  name: { en: string; ur: string };
  tagline: { en: string; ur: string };
  desc: { en: string; ur: string };
  traits: { en: string[]; ur: string[] };
  /** swatch dots shown on the card header */
  swatch: [string, string, string];
  year: string;
}

export const THEMES: ThemeMeta[] = [
  {
    id: "neumorphism",
    name: { en: "Neumorphism", ur: "نیومورفزم" },
    tagline: { en: "Soft UI · extruded shadows", ur: "نرم یو آئی · ابھرے ہوئے سائے" },
    desc: {
      en: "Surfaces appear pressed out of or into the background using twin light and dark shadows. Calm, tactile and monochrome.",
      ur: "ہر سطح پس منظر سے ابھری یا دبی ہوئی لگتی ہے — روشن اور گہرے دوہرے سائے سے۔ پُرسکون، چھونے کے قابل اور یک رنگ۔",
    },
    traits: {
      en: ["Dual shadows", "Low contrast", "Monochrome", "Rounded"],
      ur: ["دوہرے سائے", "کم کنٹراسٹ", "یک رنگ", "گول کنارے"],
    },
    swatch: ["#e0e5ec", "#5b5ee9", "#a3b1c6"],
    year: "2019",
  },
  {
    id: "minimalism",
    name: { en: "Minimalism", ur: "منیملزم" },
    tagline: { en: "Less, but better", ur: "کم، مگر بہتر" },
    desc: {
      en: "Whitespace does the work. Hairline borders, no decoration, restrained type and a single accent colour.",
      ur: "خالی جگہ ہی سب کچھ کرتی ہے۔ باریک بارڈر، کوئی سجاوٹ نہیں، سادہ ٹائپ اور صرف ایک نمایاں رنگ۔",
    },
    traits: {
      en: ["Whitespace", "Hairline borders", "Flat", "One accent"],
      ur: ["خالی جگہ", "باریک بارڈر", "فلیٹ", "ایک رنگ"],
    },
    swatch: ["#fafafa", "#111113", "#e6e6e9"],
    year: "1960s →",
  },
  {
    id: "maximalism",
    name: { en: "Maximalism", ur: "میکسیملزم" },
    tagline: { en: "More is more", ur: "جتنا زیادہ، اتنا بہتر" },
    desc: {
      en: "Loud colour clashes, thick outlines and hard offset shadows. Confident, playful and impossible to ignore.",
      ur: "بھڑکیلے رنگ، موٹے کنارے اور سخت سائے۔ پُراعتماد، شوخ اور نظرانداز کرنا ناممکن۔",
    },
    traits: {
      en: ["Clashing colour", "Thick outlines", "Hard shadows", "Playful"],
      ur: ["متضاد رنگ", "موٹے کنارے", "سخت سائے", "شوخ"],
    },
    swatch: ["#fff3d6", "#ff2d75", "#7c3aed"],
    year: "2021",
  },
  {
    id: "glassmorphism",
    name: { en: "Glassmorphism", ur: "گلاس مورفزم" },
    tagline: { en: "Frosted glass layers", ur: "دھندلے شیشے کی تہیں" },
    desc: {
      en: "Translucent panels blur whatever sits behind them, edged with a thin light border and floating over vivid gradients.",
      ur: "نیم شفاف پینل پیچھے کی چیزوں کو دھندلا کر دیتے ہیں، باریک روشن کنارے اور شوخ گریڈینٹ کے اوپر تیرتے ہوئے۔",
    },
    traits: {
      en: ["Backdrop blur", "Translucency", "Light borders", "Gradients"],
      ur: ["بیک ڈراپ بلر", "شفافیت", "روشن کنارے", "گریڈینٹ"],
    },
    swatch: ["#7f7fd5", "#86a8e7", "#91eae4"],
    year: "2020",
  },
  {
    id: "brutalism",
    name: { en: "Brutalism", ur: "بروٹلزم" },
    tagline: { en: "Raw, unpolished, honest", ur: "کچا، بے تکلف، سچا" },
    desc: {
      en: "Zero radius, black outlines and blocky offset shadows. Web design stripped back to raw HTML energy.",
      ur: "کوئی گولائی نہیں، کالے کنارے اور بلاک نما سائے۔ ویب ڈیزائن اپنی خام ترین شکل میں۔",
    },
    traits: {
      en: ["Sharp corners", "Black outlines", "Offset shadow", "High contrast"],
      ur: ["تیز کونے", "کالے کنارے", "ہٹا ہوا سایہ", "زیادہ کنٹراسٹ"],
    },
    swatch: ["#fffdf5", "#111111", "#ff5f1f"],
    year: "2018",
  },
  {
    id: "claymorphism",
    name: { en: "Claymorphism", ur: "کلے مورفزم" },
    tagline: { en: "Puffy 3D clay", ur: "پھولی ہوئی تھری ڈی مٹی" },
    desc: {
      en: "Fat rounded corners with inner highlights and a coloured drop shadow, like soft modelling clay you could squeeze.",
      ur: "موٹے گول کنارے، اندرونی چمک اور رنگین سایہ — جیسے نرم مٹی جسے دبایا جا سکے۔",
    },
    traits: {
      en: ["Chunky radius", "Inner highlight", "Pastel", "Colour shadow"],
      ur: ["بڑی گولائی", "اندرونی چمک", "ہلکے رنگ", "رنگین سایہ"],
    },
    swatch: ["#e8dcff", "#7c5cff", "#ffb4d8"],
    year: "2021",
  },
  {
    id: "material",
    name: { en: "Material", ur: "میٹیریل" },
    tagline: { en: "Paper, ink & elevation", ur: "کاغذ، روشنائی اور بلندی" },
    desc: {
      en: "Google's system: cards behave like layered paper, lifted by consistent elevation shadows with bold ink accents.",
      ur: "گوگل کا نظام: کارڈز کاغذ کی تہوں کی طرح، مستقل سایوں سے اوپر اٹھے ہوئے اور نمایاں رنگوں کے ساتھ۔",
    },
    traits: {
      en: ["Elevation", "Paper cards", "Ink accent", "Grid rhythm"],
      ur: ["ایلیویشن", "کاغذی کارڈز", "نمایاں رنگ", "منظم گرڈ"],
    },
    swatch: ["#f4f6fa", "#1a73e8", "#dde3ea"],
    year: "2014",
  },
  {
    id: "cyberpunk",
    name: { en: "Cyberpunk Neon", ur: "سائبر پنک نیون" },
    tagline: { en: "Neon glow on black", ur: "کالے پر نیون چمک" },
    desc: {
      en: "Near-black canvas lit by electric cyan and magenta glow, thin neon borders and a night-city arcade mood.",
      ur: "تقریباً سیاہ پس منظر پر برقی نیلی اور گلابی چمک، باریک نیون کنارے اور رات کے شہر کا ماحول۔",
    },
    traits: {
      en: ["Neon glow", "Dark canvas", "Electric accents", "Thin borders"],
      ur: ["نیون چمک", "گہرا پس منظر", "برقی رنگ", "باریک کنارے"],
    },
    swatch: ["#0a0a14", "#00f0ff", "#ff00a0"],
    year: "2077",
  },
  {
    id: "voltagent",
    name: { en: "VoltAgent", ur: "ولٹ ایجنٹ" },
    tagline: { en: "Void-black · emerald terminal", ur: "خالی سیاہ · زرد سبز ٹرمینل" },
    desc: {
      en: "A deep dark interface with emerald accents, subtle borders, and terminal-like precision inspired by modern AI product design.",
      ur: "گہرا سیاہ انٹرفیس، سبز رنگ کے نمایاں اجزاء، باریک کنارے اور ٹرمینل نما درستگی — جدید AI پروڈکٹ ڈیزائن سے متاثر۔",
    },
    traits: {
      en: ["Void black", "Emerald glow", "Terminal UI", "Minimal chrome"],
      ur: ["خالی سیاہ", "سبز چمک", "ٹرمینل یو آئی", "کم کروم"],
    },
    swatch: ["#07110f", "#34d399", "#10b981"],
    year: "2025",
  },
];

export const DEFAULT_THEME: ThemeId = "voltagent";

export function getTheme(id: string): ThemeMeta {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
