import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Reveal, SectionHead } from "../../../components/ui";
import { useLocalizedContent as useSiteContent } from "../../../store/content";
import { useLang } from "../../../store/lang";
import { getIcon } from "../../../lib/icons";
export default function Skills() {
    const { content } = useSiteContent();
    const { t } = useLang();
    const { skills } = content;
    return (_jsxs("section", { id: "skills", className: "relative px-4 py-28 sm:px-6", children: [_jsx("div", { className: "neu-inset absolute left-[-6rem] top-1/3 size-72 rounded-full opacity-40" }), _jsxs("div", { className: "mx-auto max-w-6xl", children: [_jsx(SectionHead, { eyebrow: skills.eyebrow, title: _jsxs(_Fragment, { children: [t.skillsTitlePre, " ", _jsx("span", { className: "text-neu-accent", children: t.skillsTitleAccent }), " ", t.skillsTitlePost] }), sub: skills.sub }), _jsx("div", { className: "mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4", children: skills.items.map((s, i) => {
                            const Icon = getIcon(s.icon);
                            return (_jsx(Reveal, { delay: (i % 4) * 0.1, children: _jsxs("div", { className: "neu neu-hover group h-full rounded-[1.8rem] p-6", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsx("span", { className: "neu-inset-sm grid size-13 place-items-center rounded-2xl transition-transform duration-500 group-hover:scale-110", style: { color: s.color }, children: _jsx(Icon, { className: "size-6" }) }), _jsxs("span", { className: "neu-inset-sm rounded-full px-3 py-1 font-display text-sm font-bold text-neu-accent", children: [s.level, "%"] })] }), _jsx("h3", { className: "mt-5 font-display text-lg font-bold", children: s.name }), _jsx("p", { className: "mt-1 text-xs font-medium uppercase tracking-[0.14em] text-neu-muted", children: s.tag }), _jsx("div", { className: "neu-inset-sm mt-5 h-3 overflow-hidden rounded-full", children: _jsx(motion.div, { initial: { width: 0 }, whileInView: { width: `${s.level}%` }, viewport: { once: true, margin: "-60px" }, transition: { duration: 1.4, delay: 0.25 + (i % 4) * 0.1, ease: [0.22, 1, 0.36, 1] }, className: "h-full rounded-full", style: {
                                                    background: `linear-gradient(90deg, ${s.color}, color-mix(in srgb, ${s.color} 45%, transparent))`,
                                                    boxShadow: `0 0 12px color-mix(in srgb, ${s.color} 45%, transparent)`,
                                                } }) })] }) }, `${s.name}-${i}`));
                        }) })] })] }));
}
