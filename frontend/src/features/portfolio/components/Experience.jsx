import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Reveal, SectionHead } from "../../../components/ui";
import { cn } from "../../../utils/cn";
import { useLocalizedContent as useSiteContent } from "../../../store/content";
import { useLang } from "../../../store/lang";
import { getIcon } from "../../../lib/icons";
export default function Experience() {
    const { content } = useSiteContent();
    const { t } = useLang();
    const { experience } = content;
    return (_jsxs("section", { id: "experience", className: "relative px-4 py-28 sm:px-6", children: [_jsx("div", { className: "glow absolute right-0 top-1/3 size-[28rem] rounded-full" }), _jsxs("div", { className: "mx-auto max-w-6xl", children: [_jsx(SectionHead, { eyebrow: experience.eyebrow, title: _jsxs(_Fragment, { children: [t.expTitlePre, " ", _jsx("span", { className: "text-neu-accent", children: t.expTitleAccent })] }), sub: experience.sub }), _jsxs("div", { className: "relative mx-auto mt-20 max-w-4xl", children: [_jsx("div", { className: "neu-inset-sm absolute bottom-4 left-[1.35rem] top-4 w-1.5 rounded-full md:left-1/2 md:-translate-x-1/2" }), experience.items.map((t, i) => {
                                const left = i % 2 === 0;
                                const Icon = getIcon(t.icon);
                                return (_jsxs("div", { className: "relative mb-14 last:mb-0 md:grid md:grid-cols-[1fr_3.5rem_1fr]", children: [_jsx("div", { className: "absolute left-[1.35rem] top-2 -translate-x-1/2 md:left-1/2 md:top-3", children: _jsx(Reveal, { delay: 0.1, children: _jsx("span", { className: "neu-sm grid size-10 place-items-center rounded-full", children: _jsx("span", { className: "pulse-dot size-2.5 rounded-full bg-neu-accent" }) }) }) }), _jsx("div", { className: cn("pl-16 md:pl-0", left ? "md:col-start-1 md:pr-2" : "md:col-start-3 md:pl-2"), children: _jsx(Reveal, { delay: 0.15, y: 44, children: _jsxs("div", { className: "neu neu-hover rounded-[1.8rem] p-7", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("span", { className: "neu-inset-sm flex items-center gap-2 rounded-full px-4 py-1.5 font-display text-xs font-bold uppercase tracking-[0.18em] text-neu-accent", children: [_jsx(Icon, { className: "size-3.5" }), t.period] }), _jsx("span", { className: "text-xs font-medium uppercase tracking-[0.16em] text-neu-muted", children: t.org })] }), _jsx("h3", { className: "mt-4 font-display text-2xl font-bold", children: t.role }), _jsx("p", { className: "mt-3 text-sm leading-relaxed text-neu-muted", children: t.text }), _jsx("div", { className: "mt-5 flex flex-wrap gap-2", children: t.tags.map((tag) => (_jsx("span", { className: "neu-xs rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-neu-muted", children: tag }, tag))) })] }) }) })] }, `${t.role}-${i}`));
                            })] })] })] }));
}
