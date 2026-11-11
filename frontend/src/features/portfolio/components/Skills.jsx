import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { Reveal, SectionHead } from "../../../components/ui";
import { useLocalizedContent as useSiteContent } from "../../../store/content";
import { useLang } from "../../../store/lang";
import { getIcon } from "../../../lib/icons";

function SkillProgress({ level, color, delay }) {
    const ref = useRef(null);
    useEffect(() => {
        const container = ref.current;
        if (!container)
            return;
        const revealProgress = () => {
            const { top, bottom } = container.getBoundingClientRect();
            if (top < window.innerHeight * 0.9 && bottom > 0) {
                container.firstElementChild.classList.add("is-visible");
                window.removeEventListener("scroll", revealProgress);
                window.removeEventListener("resize", revealProgress);
            }
        };
        revealProgress();
        window.addEventListener("scroll", revealProgress, { passive: true });
        window.addEventListener("resize", revealProgress);
        return () => {
            window.removeEventListener("scroll", revealProgress);
            window.removeEventListener("resize", revealProgress);
        };
    }, []);
    return (_jsx("div", { ref, className: "neu-inset-sm mt-5 h-3 overflow-hidden rounded-full", children: _jsx("div", { className: "skill-progress-fill h-full rounded-full", style: {
                width: `${level}%`,
                transitionDelay: `${delay}s`,
                background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 45%, transparent))`,
                boxShadow: `0 0 12px color-mix(in srgb, ${color} 45%, transparent)`,
            } }) }));
}

export default function Skills() {
    const { content } = useSiteContent();
    const { t } = useLang();
    const { skills } = content;
    return (_jsxs("section", { id: "skills", className: "relative px-4 py-28 sm:px-6", children: [_jsx("div", { className: "neu-inset absolute left-[-6rem] top-1/3 size-72 rounded-full opacity-40" }), _jsxs("div", { className: "mx-auto max-w-6xl", children: [_jsx(SectionHead, { eyebrow: skills.eyebrow, title: _jsxs(_Fragment, { children: [t.skillsTitlePre, " ", _jsx("span", { className: "text-neu-accent", children: t.skillsTitleAccent }), " ", t.skillsTitlePost] }), sub: skills.sub }), _jsx("div", { className: "mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4", children: skills.items.map((s, i) => {
                            const Icon = getIcon(s.icon);
                            return (_jsx(Reveal, { delay: (i % 4) * 0.1, children: _jsxs("div", { className: "neu neu-hover group h-full rounded-[1.8rem] p-6", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsx("span", { className: "neu-inset-sm grid size-13 place-items-center rounded-2xl transition-transform duration-500 group-hover:scale-110", style: { color: s.color }, children: _jsx(Icon, { className: "size-6" }) }), _jsxs("span", { className: "neu-inset-sm rounded-full px-3 py-1 font-display text-sm font-bold text-neu-accent", children: [s.level, "%"] })] }), _jsx("h3", { className: "mt-5 font-display text-lg font-bold", children: s.name }), _jsx("p", { className: "mt-1 text-xs font-medium uppercase tracking-[0.14em] text-neu-muted", children: s.tag }), _jsx(SkillProgress, { level: s.level, color: s.color, delay: 0.25 + (i % 4) * 0.1 })] }) }, `${s.name}-${i}`));
                        }) })] })] }));
}
