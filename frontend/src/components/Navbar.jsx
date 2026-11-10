import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Languages, Moon, Palette, Sun, Menu, X, ArrowUpRight } from "lucide-react";
import { cn } from "../utils/cn";
import { useLocalizedContent as useSiteContent, } from "../store/content";
import { useLang } from "../store/lang";
import { getTheme } from "../lib/themes";
import { useThemeStyle } from "../store/theme";
const LINK_HREFS = ["#about", "#skills", "#experience", "#contact", "#/blog"];
export default function Navbar({ dark, onToggle }) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { content } = useSiteContent();
    const { t, lang, toggle } = useLang();
    const { theme } = useThemeStyle();
    const canToggleColorMode = getTheme(theme).colorModes.length > 1;
    const LINKS = [
        { label: t.navAbout, href: LINK_HREFS[0] },
        { label: t.navSkills, href: LINK_HREFS[1] },
        { label: t.navExperience, href: LINK_HREFS[2] },
        { label: t.navContact, href: LINK_HREFS[3] },
        { label: t.navBlog, href: LINK_HREFS[4] },
    ];
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    return (_jsxs("header", { className: "fixed inset-x-0 top-4 z-40 px-4 sm:top-5 sm:px-6", children: [_jsxs(motion.nav, { initial: { y: -80, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] }, className: cn("mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full p-2 pl-3 transition-[box-shadow] duration-500", scrolled ? "neu-inset-sm" : "neu-sm"), children: [_jsxs("a", { href: "#home", className: "group flex items-center gap-3", children: [_jsx("span", { className: "neu-inset-sm grid size-10 place-items-center rounded-full font-display text-sm font-bold text-neu-accent transition-transform duration-300 group-active:scale-90", children: content.brand.initials }), _jsxs("span", { className: "hidden font-display text-sm font-semibold tracking-wide sm:block", children: [content.brand.name, _jsx("span", { className: "text-neu-accent", children: "." })] })] }), _jsx("ul", { className: "hidden items-center gap-1 lg:flex", children: LINKS.map((l) => (_jsx("li", { children: _jsx("a", { href: l.href, className: "press block rounded-full px-4 py-2 text-sm font-medium text-neu-muted", children: l.label }) }, l.href))) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("a", { href: "#/themes", "aria-label": t.navThemes, title: t.navThemes, className: "press grid size-10 place-items-center rounded-full text-neu-muted", children: _jsx(Palette, { className: "size-4.5" }) }), _jsxs("button", { onClick: toggle, "aria-label": lang === "en" ? "اردو میں دیکھیں" : "View in English", className: "press inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold text-neu-muted", children: [_jsx(Languages, { className: "size-4" }), _jsx(motion.span, { initial: { y: 6, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.3 }, className: lang === "en" ? "font-display" : "text-[13px]", children: lang === "en" ? "اردو" : "EN" }, lang)] }), canToggleColorMode && (_jsx("button", { onClick: onToggle, "aria-label": "Toggle theme", className: "press grid size-10 place-items-center rounded-full text-neu-muted", children: _jsx(AnimatePresence, { mode: "wait", initial: false, children: _jsx(motion.span, { initial: { rotate: -90, opacity: 0, scale: 0.5 }, animate: { rotate: 0, opacity: 1, scale: 1 }, exit: { rotate: 90, opacity: 0, scale: 0.5 }, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }, className: "grid place-items-center", children: dark ? _jsx(Sun, { className: "size-4.5" }) : _jsx(Moon, { className: "size-4.5" }) }, dark ? "sun" : "moon") }) })), _jsxs("a", { href: "#contact", className: "btn-primary hidden items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold lg:inline-flex", children: [t.hireMe, _jsx(ArrowUpRight, { className: "size-4" })] }), _jsx("button", { onClick: () => setOpen((v) => !v), "aria-label": "Menu", className: "press grid size-10 place-items-center rounded-full text-neu-muted lg:hidden", children: open ? _jsx(X, { className: "size-5" }) : _jsx(Menu, { className: "size-5" }) })] })] }), _jsx(AnimatePresence, { children: open && (_jsx(motion.div, { initial: { opacity: 0, y: -12, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -12, scale: 0.97 }, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }, className: "neu mx-auto mt-3 max-w-6xl rounded-3xl p-3 lg:hidden", children: _jsxs("ul", { className: "flex flex-col gap-1", children: [LINKS.map((l) => (_jsx("li", { children: _jsx("a", { href: l.href, onClick: () => setOpen(false), className: "press block rounded-2xl px-5 py-3 text-sm font-medium text-neu-muted", children: l.label }) }, l.href))), _jsx("li", { children: _jsxs("a", { href: "#/themes", onClick: () => setOpen(false), className: "press flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium text-neu-muted", children: [_jsx(Palette, { className: "size-4" }), " ", t.navThemes] }) }), _jsx("li", { children: _jsxs("a", { href: "#contact", className: "btn-primary mt-1 flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold", children: [t.hireMe, " ", _jsx(ArrowUpRight, { className: "size-4" })] }) })] }) })) })] }));
}
