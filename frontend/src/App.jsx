import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { ContentProvider } from "./store/content";
import { LangProvider, useLang } from "./store/lang";
import { ThemeStyleProvider } from "./store/theme";
import { cn } from "./utils/cn";
import PortfolioPage from "./features/portfolio/PortfolioPage";
import ThemesPage from "./features/themes/ThemesPage";
import Navbar from "./components/Navbar";
import AdminApp from "./admin/AdminApp";
import ChatBot from "./features/chat/components/ChatBot";
import BlogPage from "./features/blog/BlogPage";
function useHashRoute() {
    const [hash, setHash] = useState(() => window.location.hash);
    useEffect(() => {
        const onChange = () => {
            setHash(window.location.hash);
        };
        window.addEventListener("hashchange", onChange);
        return () => window.removeEventListener("hashchange", onChange);
    }, []);
    useEffect(() => {
        if (hash.startsWith("#/") || !hash || hash === "#") {
            window.scrollTo(0, 0);
            return;
        }
        document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: "smooth" });
    }, [hash]);
    return hash.replace(/^#\/?/, "");
}
function Shell({ dark, route, onToggle }) {
    const { lang } = useLang();
    const isAdmin = route === "admin";
    const isThemes = route === "themes";
    const isBlog = route === "blog" || route.startsWith("blog/");
    // Urdu styling (RTL + Nastaliq) applies to the public site ONLY —
    // admin panel stays clean LTR in every mode
    const ur = lang === "ur" && !isAdmin;
    return (_jsxs("div", { dir: ur ? "rtl" : "ltr", "data-theme": isAdmin ? "neumorphism" : undefined, style: isAdmin ? { background: "var(--bg)" } : undefined, className: cn("relative min-h-screen min-w-0 overflow-x-clip font-body text-neu-text", ur && "ur-scope"), children: [!isAdmin && _jsx(Navbar, { dark: dark, onToggle: onToggle }), isAdmin ? (_jsx(AdminApp, { dark: dark, onToggle: onToggle })) : isThemes ? (_jsx(ThemesPage, {})) : isBlog ? (_jsx(BlogPage, { slug: route.split("/")[1] || null })) : (_jsxs(_Fragment, { children: [_jsx(PortfolioPage, {}), _jsx(ChatBot, {})] }))] }));
}
export default function App() {
    const route = useHashRoute();
    const [dark, setDark] = useState(() => localStorage.getItem("km-theme") !== "light");
    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
        localStorage.setItem("km-theme", dark ? "dark" : "light");
    }, [dark]);
    return (_jsx(LangProvider, { children: _jsx(ThemeStyleProvider, { children: _jsx(ContentProvider, { children: _jsx(Shell, { dark: dark, route: route, onToggle: () => setDark((v) => !v) }) }) }) }));
}
