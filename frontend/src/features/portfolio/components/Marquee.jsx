import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Sparkle } from "lucide-react";
import { useLocalizedContent as useSiteContent } from "../../../store/content";
export default function Marquee() {
    const { content } = useSiteContent();
    const row = [...content.marquee, ...content.marquee];
    return (_jsx("section", { "aria-hidden": true, className: "relative px-6 py-4", children: _jsx("div", { className: "neu-inset mx-auto max-w-7xl overflow-hidden rounded-full py-5", children: _jsx("div", { className: "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]", children: _jsx("div", { className: "marquee-track items-center gap-10 px-5", children: row.map((it, i) => (_jsxs("span", { className: "flex items-center gap-10 whitespace-nowrap", children: [_jsx("span", { className: "font-display text-sm font-semibold uppercase tracking-[0.32em] text-neu-muted", children: it }), _jsx(Sparkle, { className: "size-4 text-neu-accent" })] }, i))) }) }) }) }));
}
