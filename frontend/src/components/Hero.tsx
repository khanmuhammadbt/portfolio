import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Mail } from "lucide-react";
import { GithubIcon, InstagramIcon, WhatsappIcon, YoutubeIcon } from "./icons";
import { Counter } from "./ui";
const portrait = "/images/khan-portrait.jpg";
import { useLocalizedContent as useSiteContent } from "../store/content";
import { getIcon } from "../lib/icons";

/** chip anchors kept inside the frame on phones, floated outside on ≥sm */
const CHIP_POSITIONS = [
  { className: "left-[2%] top-[6%] sm:left-[-6%] sm:top-[10%]", delay: "0s" },
  { className: "right-[0%] top-[26%] sm:right-[-9%] sm:top-[30%]", delay: "1.2s" },
  { className: "right-[2%] bottom-[14%] sm:right-[-4%] sm:bottom-[16%]", delay: "0.6s" },
  { className: "left-[0%] bottom-[4%] sm:left-[-3%] sm:bottom-[6%]", delay: "1.8s" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 42 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Hero() {
  const { content } = useSiteContent();
  const { hero, stats, contact, skills } = content;

  const socials = contact.channels
    .map((c) => ({
      href: c.href,
      label: c.name,
      icon:
        c.icon === "github"
          ? GithubIcon
          : c.icon === "youtube"
            ? YoutubeIcon
            : c.icon === "instagram"
              ? InstagramIcon
              : c.icon === "whatsapp"
                ? WhatsappIcon
                : Mail,
    }))
    .slice(0, 5);

  const chips = skills.items.slice(0, 4);
  const badgeText = skills.items
    .slice(0, 5)
    .map((s) => s.name.toUpperCase())
    .join(" • ");

  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden px-5 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32"
    >
      {/* ambient decor */}
      <div className="glow absolute -left-40 top-10 size-[34rem] rounded-full" />
      <div className="glow absolute -right-48 bottom-0 size-[36rem] rounded-full" />
      <div className="neu-inset absolute -right-24 top-24 size-64 rounded-full opacity-50" />
      <div className="neu-inset absolute -left-16 bottom-24 size-40 rounded-full opacity-40" />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        {/* ---- copy ---- */}
        <motion.div variants={container} initial="hidden" animate="show" className="relative z-10">
          <motion.div variants={item}>
            <span className="neu-xs inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-neu-muted">
              <span className="pulse-dot size-2 rounded-full bg-green-500" />
              {hero.availability}
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-7 font-display text-[clamp(3.4rem,8.5vw,7rem)] font-bold leading-[0.95] tracking-tight"
          >
            {hero.firstName}
            <br />
            <span className="text-stroke font-display">{hero.lastName}</span>
          </motion.h1>

          <motion.p variants={item} className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-lg font-medium sm:text-xl">
            <span className="text-neu-accent">{hero.role}</span>
            <span className="size-1.5 rounded-full bg-neu-muted/60" />
            <span className="text-neu-muted">{hero.yearsBadge}</span>
          </motion.p>

          <motion.p variants={item} className="mt-5 max-w-xl leading-relaxed text-neu-muted">
            {hero.intro}
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#contact"
              className="btn-primary inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
            >
              {hero.primaryCta}
              <ArrowUpRight className="size-4" />
            </a>
            <a
              href="#skills"
              className="press inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-neu-muted"
            >
              {hero.secondaryCta}
              <ArrowDown className="size-4" />
            </a>
          </motion.div>

          {/* socials */}
          <motion.div variants={item} className="mt-10 flex items-center gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="press grid size-11 place-items-center rounded-full text-neu-muted"
              >
                <s.icon className="size-[18px]" />
              </a>
            ))}
          </motion.div>
        </motion.div>

        {/* ---- portrait composition ---- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: 4 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[19rem] sm:max-w-sm lg:max-w-none"
        >
          <div className="relative mx-auto aspect-square w-full max-w-[26rem]">
            <div className="neu-lg absolute inset-0 rounded-full" />
            <div className="neu-inset absolute inset-5 rounded-full" />
            <img
              src={hero.portraitUrl?.trim() ? hero.portraitUrl : portrait}
              alt={`${content.brand.name}, ${hero.role}`}
              width={416}
              height={416}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-6 size-[calc(100%-3rem)] rounded-full object-cover sm:inset-9 sm:size-[calc(100%-4.5rem)]"
            />
            <div className="neu-inset-sm pointer-events-none absolute inset-9 rounded-full opacity-60" />

            {/* orbiting chips (synced with top 4 skills) */}
            {chips.map((c, i) => {
              const Icon = getIcon(c.icon);
              const pos = CHIP_POSITIONS[i % CHIP_POSITIONS.length];
              return (
                <div key={c.name} className={`animate-floaty absolute ${pos.className}`} style={{ animationDelay: pos.delay }}>
                  <div className="neu-sm flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 sm:gap-2 sm:rounded-2xl sm:px-3.5 sm:py-2.5">
                    <Icon className="size-3.5 sm:size-4" style={{ color: c.color }} aria-hidden="true" />
                    <span className="font-display text-[10px] font-semibold tracking-wide sm:text-xs">{c.name}</span>
                  </div>
                </div>
              );
            })}

            {/* rotating badge */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 lg:-left-10 lg:translate-x-0">
              <div className="neu relative grid size-24 place-items-center rounded-full sm:size-32">
                <svg viewBox="0 0 100 100" className="animate-spin-slow absolute inset-2 size-[calc(100%-1rem)]">
                  <defs>
                    <path id="badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
                  </defs>
                  <text className="fill-neu-muted font-display uppercase" fontSize="7.4" letterSpacing="2.6">
                    <textPath href="#badge-circle">{badgeText}</textPath>
                  </text>
                </svg>
                <span className="neu-inset-sm grid size-12 place-items-center rounded-full text-neu-accent">
                  <ArrowDown className="size-5" />
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ---- stats strip ---- */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto mt-16 w-full max-w-6xl"
      >
        <div className="neu-sm mx-auto grid w-fit grid-cols-2 gap-x-10 gap-y-7 rounded-[2.2rem] px-8 py-7 sm:flex sm:items-center sm:gap-10 sm:rounded-full sm:px-12 sm:py-5">
          {stats.map((s, i) => (
            <div key={`${s.label}-${i}`} className="flex items-center gap-10">
              {i > 0 && <span className="neu-inset-sm hidden h-10 w-px sm:block" />}
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-neu-accent">
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.16em] text-neu-muted">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
