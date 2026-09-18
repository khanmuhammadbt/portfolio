/** The entire website is driven by this content object (editable via admin panel) */

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
}
export interface FactItem {
  icon: string;
  label: string;
  value: string;
}
export interface ServiceItem {
  icon: string;
  color: string;
  title: string;
  text: string;
}
export interface SkillItem {
  icon: string;
  color: string;
  name: string;
  tag: string;
  level: number;
}
export interface TimelineItem {
  icon: string;
  period: string;
  role: string;
  org: string;
  text: string;
  tags: string[];
}
export interface ChannelItem {
  icon: string;
  color: string;
  name: string;
  handle: string;
  href: string;
}

export interface SiteContent {
  brand: { initials: string; name: string };
  hero: {
    availability: string;
    firstName: string;
    lastName: string;
    role: string;
    yearsBadge: string;
    intro: string;
    primaryCta: string;
    secondaryCta: string;
    portraitUrl?: string;
  };
  stats: StatItem[];
  marquee: string[];
  about: {
    eyebrow: string;
    headingA: string;
    headingAccent: string;
    bio1: string;
    bio2: string;
    facts: FactItem[];
  };
  services: ServiceItem[];
  skills: { eyebrow: string; sub: string; items: SkillItem[] };
  experience: { eyebrow: string; sub: string; items: TimelineItem[] };
  contact: {
    eyebrow: string;
    headingA: string;
    headingAccent: string;
    sub: string;
    ctaNote: string;
    ctaSub: string;
    ctaButton: string;
    channels: ChannelItem[];
  };
  footer: { tagline: string; copyright: string };
}

export const DEFAULT_CONTENT: SiteContent = {
  brand: { initials: "KM", name: "Khan Muhammad" },
  hero: {
    availability: "Available for work",
    firstName: "KHAN",
    lastName: "MUHAMMAD",
    role: "Full-Stack Developer",
    yearsBadge: "3+ Years of Craft",
    intro:
      "I build soft, tactile digital experiences — from pixel-perfect React interfaces to robust Python, Flask & SQLAlchemy backends. Neat code, softer shadows.",
    primaryCta: "Let's Talk",
    secondaryCta: "Explore Skills",
    portraitUrl: "",
  },
  stats: [
    { value: 3, suffix: "+", label: "Years Experience" },
    { value: 8, suffix: "+", label: "Technologies" },
    { value: 20, suffix: "+", label: "Projects Built" },
    { value: 100, suffix: "%", label: "Dedication" },
  ],
  marquee: ["HTML5", "CSS3", "JavaScript", "React", "Python", "Flask", "SQLAlchemy", "VS Code", "GitHub", "Full-Stack"],
  about: {
    eyebrow: "About Me",
    headingA: "Turning ideas into soft,",
    headingAccent: "functional products",
    bio1:
      "I'm a full-stack developer from Pakistan with 3 years of hands-on experience shipping web applications end-to-end. My playground stretches from HTML & CSS fundamentals to modern React frontends and Python-powered backends.",
    bio2:
      "Off the editor, I run BantaTech — a YouTube channel where I break down web development for the next wave of builders. Code, cameras, and constant learning.",
    facts: [
      { icon: "user", label: "Name", value: "Khan Muhammad" },
      { icon: "mail", label: "Email", value: "khan@bantatech.com" },
      { icon: "mappin", label: "Base", value: "Remote — Pakistan" },
      { icon: "badgecheck", label: "Status", value: "Open to Freelance" },
    ],
  },
  services: [
    {
      icon: "code2",
      color: "#5b5ee9",
      title: "Frontend Engineering",
      text: "Responsive, component-driven React interfaces with buttery interactions and pixel-perfect detail.",
    },
    {
      icon: "database",
      color: "#ef5d8f",
      title: "Backend & APIs",
      text: "Clean REST services with Python, Flask and SQLAlchemy — modeled data, auth, and solid architecture.",
    },
    {
      icon: "youtube",
      color: "#f43f5e",
      title: "Content & Community",
      text: "Sharing the craft on YouTube @bantatech — tutorials, builds, and the journey of shipping products.",
    },
  ],
  skills: {
    eyebrow: "Tech Stack",
    sub: "A carefully sharpened stack for building complete products — from the first wireframe to the deployed API.",
    items: [
      { icon: "filecode2", name: "HTML5", tag: "Markup & Semantics", level: 95, color: "#f06529" },
      { icon: "palette", name: "CSS3", tag: "Layouts & Motion", level: 92, color: "#2965f1" },
      { icon: "braces", name: "JavaScript", tag: "Logic & DOM", level: 88, color: "#d9a40b" },
      { icon: "atom", name: "React JS", tag: "SPAs & Components", level: 86, color: "#22b8d8" },
      { icon: "terminal", name: "Python", tag: "Scripting & Logic", level: 85, color: "#3b7dd8" },
      { icon: "flask", name: "Flask", tag: "APIs & Routing", level: 80, color: "#8b5cf6" },
      { icon: "database", name: "SQLAlchemy", tag: "ORM & Models", level: 78, color: "#d0403c" },
      { icon: "code2", name: "VS Code", tag: "Daily Driver", level: 95, color: "#29a3f5" },
    ],
  },
  experience: {
    eyebrow: "Journey",
    sub: "Every year, a new layer of the stack — pressed into a timeline.",
    items: [
      {
        icon: "sparkles",
        period: "2023",
        role: "Frontend Developer",
        org: "Freelance — The Foundation",
        text: "Fell in love with the browser. Built responsive interfaces with HTML, CSS and JavaScript, then leveled up to React — shipping 10+ landing pages and dashboards.",
        tags: ["HTML", "CSS", "JavaScript", "React"],
      },
      {
        icon: "layers",
        period: "2024",
        role: "Backend Developer",
        org: "Freelance — Going Deeper",
        text: "Moved behind the scenes. Designed REST APIs with Flask, modeled data with SQLAlchemy, and wired up SQL databases with authentication and migrations.",
        tags: ["Python", "Flask", "SQLAlchemy", "SQL"],
      },
      {
        icon: "rocket",
        period: "2025 — Now",
        role: "Full-Stack Developer & Creator",
        org: "BantaTech",
        text: "Connecting both worlds into complete products — and teaching the craft on YouTube @bantatech while building in public with VS Code as my home base.",
        tags: ["React", "Flask", "Content", "VS Code"],
      },
    ],
  },
  contact: {
    eyebrow: "Get In Touch",
    headingA: "Let's press an idea",
    headingAccent: "into shape",
    sub: "Open for freelance projects, collaborations, or just a good tech conversation. Pick a channel — they're all soft to the touch.",
    ctaNote: "Prefer a straight line?",
    ctaSub: "My inbox is open 24/7.",
    ctaButton: "Start a Project",
    channels: [
      { icon: "github", color: "#7d8590", name: "GitHub", handle: "Khanmuhammadbt", href: "https://github.com/Khanmuhammadbt" },
      { icon: "youtube", color: "#f43f5e", name: "YouTube", handle: "@bantatech", href: "https://youtube.com/@bantatech" },
      { icon: "instagram", color: "#ef5d8f", name: "Instagram", handle: "bantech1947", href: "https://instagram.com/bantech1947" },
      { icon: "whatsapp", color: "#22b862", name: "WhatsApp", handle: "+92 123 456 789", href: "https://wa.me/92123456789?text=Hello%20Banta%20Tech!%20I%20would%20like%20some%20information%20about%20getting%20a%20website" },
      { icon: "mail", color: "#5b5ee9", name: "Email", handle: "khan@bantatech.com", href: "mailto:khan@bantatech.com" },
    ],
  },
  footer: {
    tagline: "Crafted with pure CSS shadows, React, and an unreasonable love for soft surfaces.",
    copyright: "Khan Muhammad — BantaTech",
  },
};

/** Deep-merge stored content over defaults so older saves never break new fields */
export function mergeContent(base: SiteContent, override: unknown): SiteContent {
  if (override == null || typeof override !== "object") return base;
  const out = merge(base as unknown as Record<string, unknown>, override as Record<string, unknown>);
  return out as unknown as SiteContent;
}

function merge(base: Record<string, unknown>, over: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(over)) {
    const b = base[key];
    const o = over[key];
    if (Array.isArray(o)) result[key] = o;
    else if (o && typeof o === "object" && b && typeof b === "object" && !Array.isArray(b)) {
      result[key] = merge(b as Record<string, unknown>, o as Record<string, unknown>);
    } else if (o !== undefined) result[key] = o;
  }
  return result;
}
