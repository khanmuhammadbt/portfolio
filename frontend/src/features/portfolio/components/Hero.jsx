import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { m } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Mail } from "lucide-react";
import { GithubIcon, InstagramIcon, WhatsappIcon, YoutubeIcon } from "../../../components/icons";
const portrait = "/images/khan-portrait-832.webp";
import { Counter } from "../../../components/ui";
import { useLocalizedContent as useSiteContent } from "../../../store/content";
import { getIcon } from "../../../lib/icons";
const CHIP_POSITIONS = [
    { className: "left-[-6%] top-[10%]", delay: "0s" },
    { className: "right-[-9%] top-[30%]", delay: "1.2s" },
    { className: "right-[-4%] bottom-[16%]", delay: "0.6s" },
    { className: "left-[-3%] bottom-[6%]", delay: "1.8s" },
];
const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};
const item = {
    hidden: { opacity: 0, y: 42 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};
export default function Hero() {
    const { content } = useSiteContent();
    const { hero, stats, contact, skills } = content;
    const socials = contact.channels
        .map((c) => ({
        href: c.href,
        label: c.name,
        icon: c.icon === "github"
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
    return (_jsxs("section", { id: "home", className: "relative flex min-h-screen flex-col justify-center overflow-hidden px-4 pb-20 pt-32 sm:px-6", children: [_jsx("div", { className: "glow absolute -left-40 top-10 size-[34rem] rounded-full" }), _jsx("div", { className: "glow absolute -right-48 bottom-0 size-[36rem] rounded-full" }), _jsx("div", { className: "neu-inset absolute -right-24 top-24 size-64 rounded-full opacity-50" }), _jsx("div", { className: "neu-inset absolute -left-16 bottom-24 size-40 rounded-full opacity-40" }), _jsxs("div", { className: "mx-auto grid w-full max-w-6xl min-w-0 items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10", children: [_jsxs(m.div, { variants: container, initial: "hidden", animate: "show", className: "relative z-10", children: [_jsx(m.div, { variants: item, children: _jsxs("span", { className: "neu-xs inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-neu-muted", children: [_jsx("span", { className: "pulse-dot size-2 rounded-full bg-green-500" }), hero.availability] }) }), _jsxs(m.h1, { variants: item, className: "mt-7 break-words font-display text-[clamp(2.5rem,8.5vw,7rem)] font-bold leading-[0.95] tracking-tight", children: [hero.firstName, _jsx("br", {}), _jsx("span", { className: "text-stroke font-display", children: hero.lastName })] }), _jsxs(m.p, { variants: item, className: "mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-lg font-medium sm:text-xl", children: [_jsx("span", { className: "text-neu-accent", children: hero.role }), _jsx("span", { className: "size-1.5 rounded-full bg-neu-muted/60" }), _jsx("span", { className: "text-neu-muted", children: hero.yearsBadge })] }), _jsx(m.p, { variants: item, className: "mt-5 max-w-xl leading-relaxed text-neu-muted", children: hero.intro }), _jsxs(m.div, { variants: item, className: "mt-9 flex flex-wrap items-center gap-4", children: [_jsxs("a", { href: "#contact", className: "btn-primary inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold", children: [hero.primaryCta, _jsx(ArrowUpRight, { className: "size-4" })] }), _jsxs("a", { href: "#skills", className: "press inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-neu-muted", children: [hero.secondaryCta, _jsx(ArrowDown, { className: "size-4" })] })] }), _jsx(m.div, { variants: item, className: "mt-10 flex items-center gap-3", children: socials.map((s) => (_jsx("a", { href: s.href, target: "_blank", rel: "noreferrer", "aria-label": s.label, className: "press grid size-11 place-items-center rounded-full text-neu-muted", children: _jsx(s.icon, { className: "size-[18px]" }) }, s.label))) })] }), _jsx(m.div, { initial: { scale: 0.95, rotate: 2 }, animate: { scale: 1, rotate: 0 }, transition: { duration: 0.8, delay: 0, ease: [0.22, 1, 0.36, 1] }, className: "relative mx-auto w-full max-w-sm lg:max-w-none", children: _jsxs("div", { className: "relative mx-auto aspect-square max-w-[26rem]", children: [_jsx("div", { className: "neu-lg absolute inset-0 rounded-full" }), _jsx("div", { className: "neu-inset absolute inset-5 rounded-full" }), _jsx("img", { src: hero.portraitUrl?.trim() ? hero.portraitUrl : portrait, srcSet: hero.portraitUrl?.trim() ? undefined : "/images/khan-portrait-416.webp 416w, /images/khan-portrait-832.webp 832w", sizes: "(max-width: 640px) 80vw, 416px", width: "832", height: "555", fetchPriority: "high", decoding: "async", alt: `Portrait of ${content.brand.name}`, className: "absolute inset-9 size-[calc(100%-4.5rem)] rounded-full object-cover" }), _jsx("div", { className: "neu-inset-sm pointer-events-none absolute inset-9 rounded-full opacity-60" }), chips.map((c, i) => {
                                    const Icon = getIcon(c.icon);
                                    const pos = CHIP_POSITIONS[i % CHIP_POSITIONS.length];
                                    return (_jsx("div", { className: `animate-floaty absolute ${pos.className}`, style: { animationDelay: pos.delay }, children: _jsxs("div", { className: "neu-sm flex items-center gap-2 rounded-2xl px-3.5 py-2.5", children: [_jsx(Icon, { className: "size-4", style: { color: c.color } }), _jsx("span", { className: "font-display text-xs font-semibold tracking-wide", children: c.name })] }) }, c.name));
                                }), _jsx("div", { className: "absolute -bottom-7 left-1/2 -translate-x-1/2 lg:-left-10 lg:translate-x-0", children: _jsxs("div", { className: "neu relative grid size-32 place-items-center rounded-full", children: [_jsxs("svg", { viewBox: "0 0 100 100", className: "animate-spin-slow absolute inset-2 size-[calc(100%-1rem)]", children: [_jsx("defs", { children: _jsx("path", { id: "badge-circle", d: "M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" }) }), _jsx("text", { className: "fill-neu-muted font-display uppercase", fontSize: "7.4", letterSpacing: "2.6", children: _jsx("textPath", { href: "#badge-circle", children: badgeText }) })] }), _jsx("span", { className: "neu-inset-sm grid size-12 place-items-center rounded-full text-neu-accent", children: _jsx(ArrowDown, { className: "size-5" }) })] }) })] }) })] }), _jsx(m.div, { initial: { opacity: 0, y: 60 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }, className: "relative z-10 mx-auto mt-16 w-full max-w-6xl", children: _jsx("div", { className: "neu-sm mx-auto grid w-fit grid-cols-2 gap-x-10 gap-y-7 rounded-[2.2rem] px-8 py-7 sm:flex sm:items-center sm:gap-10 sm:rounded-full sm:px-12 sm:py-5", children: stats.map((s, i) => (_jsxs("div", { className: "flex items-center gap-10", children: [i > 0 && _jsx("span", { className: "neu-inset-sm hidden h-10 w-px sm:block" }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-display text-2xl font-bold text-neu-accent", children: _jsx(Counter, { to: s.value, suffix: s.suffix }) }), _jsx("p", { className: "mt-0.5 text-[11px] font-medium uppercase tracking-[0.16em] text-neu-muted", children: s.label })] })] }, `${s.label}-${i}`))) }) })] }));
}
