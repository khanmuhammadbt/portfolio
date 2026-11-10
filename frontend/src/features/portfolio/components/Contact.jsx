import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowUpRight, Lock } from "lucide-react";
import { Reveal, SectionHead } from "../../../components/ui";
import { useLocalizedContent as useSiteContent } from "../../../store/content";
import { getIcon } from "../../../lib/icons";
export default function Contact() {
    const { content } = useSiteContent();
    const { contact, brand } = content;
    return (_jsxs(_Fragment, { children: [_jsxs("section", { id: "contact", className: "relative px-4 py-28 sm:px-6", children: [_jsx("div", { className: "neu-inset absolute -left-20 bottom-16 size-64 rounded-full opacity-40" }), _jsxs("div", { className: "mx-auto max-w-6xl", children: [_jsx(SectionHead, { eyebrow: contact.eyebrow, title: _jsxs(_Fragment, { children: [contact.headingA, _jsx("br", { className: "hidden sm:block" }), " ", _jsx("span", { className: "text-neu-accent", children: contact.headingAccent })] }), sub: contact.sub }), _jsx("div", { className: "mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3", children: contact.channels.map((c, i) => {
                                    const Icon = getIcon(c.icon);
                                    const isEmail = /^mailto:/i.test(c.href);
                                    const email = isEmail ? c.href.slice("mailto:".length).split("?")[0] : "";
                                    const href = isEmail
                                        ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`
                                        : c.href;
                                    return (_jsx(Reveal, { delay: (i % 3) * 0.1, children: _jsxs("a", { href: href, target: "_blank", rel: "noreferrer", className: "neu neu-hover group flex items-center gap-4 rounded-[1.8rem] p-6", children: [_jsx("span", { className: "neu-inset-sm grid size-14 shrink-0 place-items-center rounded-2xl transition-transform duration-500 group-hover:scale-110", style: { color: c.color }, children: _jsx(Icon, { className: "size-6" }) }), _jsxs("span", { className: "min-w-0 flex-1", children: [_jsx("span", { className: "block font-display text-base font-bold", children: c.name }), _jsx("span", { className: "block truncate text-sm text-neu-muted", children: c.handle })] }), _jsx(ArrowUpRight, { className: "size-5 shrink-0 text-neu-muted transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-neu-accent" })] }) }, `${c.name}-${i}`));
                                }) })] })] }), _jsx("footer", { className: "px-4 pb-10 sm:px-6", children: _jsxs("div", { className: "neu mx-auto flex max-w-6xl flex-col items-center gap-6 rounded-[2.5rem] px-8 py-10", children: [_jsx("span", { className: "neu-inset-sm grid size-14 place-items-center rounded-full font-display text-lg font-bold text-neu-accent", children: brand.initials }), _jsx("p", { className: "max-w-md text-center text-sm leading-relaxed text-neu-muted", children: content.footer.tagline }), _jsx("div", { className: "neu-inset-sm h-1.5 w-40 rounded-full" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("p", { className: "text-xs font-medium uppercase tracking-[0.24em] text-neu-muted", children: ["\u00A9 ", new Date().getFullYear(), " ", content.footer.copyright] }), _jsx("a", { href: "#/admin", "aria-label": "Admin panel", className: "press grid size-8 place-items-center rounded-full text-neu-muted", children: _jsx(Lock, { className: "size-3.5" }) })] })] }) })] }));
}
