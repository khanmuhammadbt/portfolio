import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { lazy, Suspense, useEffect, useState } from "react";
import { ContentProvider } from "./store/content";
import { LangProvider, useLang } from "./store/lang";
import { ThemeStyleProvider } from "./store/theme";
import { cn } from "./utils/cn";
import { readStorage, writeStorage } from "./utils/storage";
import PortfolioPage from "./features/portfolio/PortfolioPage";
import Navbar from "./components/Navbar";
const ThemesPage = lazy(() => import("./features/themes/ThemesPage"));
const AdminApp = lazy(() => import("./admin/AdminApp"));
const ChatBot = lazy(() => import("./features/chat/components/ChatBot"));
const BlogPage = lazy(() => import("./features/blog/BlogPage"));
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
function Shell({ dark, route, onToggle, chatReady }) {
    const { lang } = useLang();
    const isAdmin = route === "admin";
    const isThemes = route === "themes";
    const isBlog = route === "blog" || route.startsWith("blog/");
    // Urdu styling (RTL + Nastaliq) applies to the public site ONLY —
    // admin panel stays clean LTR in every mode
    const ur = lang === "ur" && !isAdmin;
    return (_jsxs("div", { dir: ur ? "rtl" : "ltr", "data-theme": isAdmin ? "neumorphism" : undefined, style: isAdmin ? { background: "var(--bg)" } : undefined, className: cn("relative min-h-screen min-w-0 overflow-x-clip font-body text-neu-text", ur && "ur-scope"), children: [!isAdmin && _jsx(Navbar, { dark: dark, onToggle: onToggle }), _jsx(Suspense, { fallback: null, children: isAdmin ? (_jsx(AdminApp, { dark: dark, onToggle: onToggle })) : isThemes ? (_jsx(ThemesPage, {})) : isBlog ? (_jsx(BlogPage, { slug: route.split("/")[1] || null })) : (_jsxs(_Fragment, { children: [_jsx(PortfolioPage, {}), chatReady && _jsx(ChatBot, {})] })) })] }));
}
export default function App() {
    const route = useHashRoute();
    const [dark, setDark] = useState(() => readStorage("km-theme", "dark") !== "light");
    const [chatReady, setChatReady] = useState(false);
    useEffect(() => {
        const timer = window.setTimeout(() => setChatReady(true), 1000);
        return () => window.clearTimeout(timer);
    }, []);
    useEffect(() => {
        const showOfflinePage = () => {
            if (window.location.pathname === "/offline.html") {
                return;
            }
            try {
                sessionStorage.setItem(
                    "offline-return-url",
                    `${window.location.pathname}${window.location.search}${window.location.hash}`,
                );
            }
            catch (error) {
                console.error("Could not save the current page before opening offline mode.", error);
            }
            window.location.replace("/offline.html");
        };
        window.addEventListener("offline", showOfflinePage);
        if (!navigator.onLine) {
            showOfflinePage();
        }
        return () => window.removeEventListener("offline", showOfflinePage);
    }, []);
    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
        writeStorage("km-theme", dark ? "dark" : "light");
    }, [dark]);
    return (_jsx(LangProvider, { children: _jsx(ThemeStyleProvider, { children: _jsx(ContentProvider, { children: _jsx(Shell, { dark: dark, route: route, chatReady: chatReady, onToggle: () => setDark((v) => !v) }) }) }) }));
}
