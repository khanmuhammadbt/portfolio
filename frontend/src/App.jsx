import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { lazy, Suspense, useEffect, useState } from "react";
import { ContentProvider, useSiteContent } from "./store/content";
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

function resolveHashRoute() {
    const hash = window.location.hash.replace(/^#\/?/, "");
    if (!hash) {
        return null;
    }
    if (["admin", "themes", "blog"].includes(hash) || hash.startsWith("blog/")) {
        return hash;
    }
    return null;
}

function resolvePathRoute() {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
    if (!path) {
        return "";
    }
    if (path === "admin" || path === "themes") {
        return path;
    }
    if (path === "blog" || path.startsWith("blog/")) {
        return path;
    }
    return "";
}

function useSiteRoute() {
    const [route, setRoute] = useState(() => resolveHashRoute() ?? resolvePathRoute());
    useEffect(() => {
        const redirectLegacyHashRoute = () => {
            const legacy = resolveHashRoute();
            if (!legacy) {
                return;
            }
            const nextPath = `/${legacy}`;
            if (window.location.pathname !== nextPath) {
                window.history.replaceState(null, "", nextPath);
            }
            setRoute(resolvePathRoute());
        };

        const onLocationChange = () => {
            setRoute(resolveHashRoute() ?? resolvePathRoute());
        };

        redirectLegacyHashRoute();
        window.addEventListener("popstate", onLocationChange);
        window.addEventListener("hashchange", onLocationChange);
        return () => {
            window.removeEventListener("popstate", onLocationChange);
            window.removeEventListener("hashchange", onLocationChange);
        };
    }, []);

    useEffect(() => {
        const hash = window.location.hash;
        if (!hash || hash === "#") {
            window.scrollTo(0, 0);
            return;
        }
        const target = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
        }
    }, [route]);

    return route;
}
function SkeletonBlock({ className }) {
    return _jsx("div", { className: cn("neu-inset-sm animate-pulse opacity-60", className) });
}
function SiteSkeleton() {
    return (_jsxs("div", { role: "status", "aria-label": "Loading site", className: "min-h-screen overflow-hidden px-4 sm:px-6", children: [
        _jsxs("header", { "aria-hidden": "true", className: "mx-auto flex h-24 max-w-6xl items-center justify-between", children: [
            _jsx(SkeletonBlock, { className: "h-10 w-36 rounded-full" }),
            _jsxs("div", { className: "hidden items-center gap-6 sm:flex", children: [
                _jsx(SkeletonBlock, { className: "h-3 w-14 rounded-full" }),
                _jsx(SkeletonBlock, { className: "h-3 w-16 rounded-full" }),
                _jsx(SkeletonBlock, { className: "h-3 w-12 rounded-full" }),
                _jsx(SkeletonBlock, { className: "h-10 w-10 rounded-full" }),
            ] }),
        ] }),
        _jsxs("main", { "aria-hidden": "true", className: "mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center gap-14 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10", children: [
            _jsxs("div", { className: "flex flex-col items-start", children: [
                _jsx(SkeletonBlock, { className: "h-8 w-40 rounded-full" }),
                _jsxs("div", { className: "mt-8 w-full max-w-2xl space-y-4", children: [
                    _jsx(SkeletonBlock, { className: "h-12 w-4/5 rounded-xl sm:h-16" }),
                    _jsx(SkeletonBlock, { className: "h-12 w-3/5 rounded-xl sm:h-16" }),
                ] }),
                _jsx(SkeletonBlock, { className: "mt-7 h-6 w-64 rounded-full" }),
                _jsxs("div", { className: "mt-5 w-full max-w-xl space-y-3", children: [
                    _jsx(SkeletonBlock, { className: "h-4 w-full rounded-full" }),
                    _jsx(SkeletonBlock, { className: "h-4 w-11/12 rounded-full" }),
                    _jsx(SkeletonBlock, { className: "h-4 w-2/3 rounded-full" }),
                ] }),
                _jsxs("div", { className: "mt-9 flex flex-wrap gap-4", children: [
                    _jsx(SkeletonBlock, { className: "h-12 w-36 rounded-full" }),
                    _jsx(SkeletonBlock, { className: "h-12 w-36 rounded-full" }),
                ] }),
                _jsxs("div", { className: "mt-9 flex gap-3", children: [
                    _jsx(SkeletonBlock, { className: "size-11 rounded-full" }),
                    _jsx(SkeletonBlock, { className: "size-11 rounded-full" }),
                    _jsx(SkeletonBlock, { className: "size-11 rounded-full" }),
                ] }),
            ] }),
            _jsx("div", { className: "mx-auto w-full max-w-sm", children: _jsx(SkeletonBlock, { className: "aspect-square w-full rounded-full" }) }),
        ] }),
    ] }));
}
function Shell({ dark, route, onToggle, chatReady }) {
    const { lang } = useLang();
    const { ready } = useSiteContent();
    const isAdmin = route === "admin";
    const isThemes = route === "themes";
    const isBlog = route === "blog" || route.startsWith("blog/");
    // Urdu styling (RTL + Nastaliq) applies to the public site ONLY —
    // admin panel stays clean LTR in every mode
    const ur = lang === "ur" && !isAdmin;
    if (!ready && !isAdmin) {
        return _jsx(SiteSkeleton, {});
    }
    return (_jsxs("div", { dir: ur ? "rtl" : "ltr", "data-theme": isAdmin ? "neumorphism" : undefined, style: isAdmin ? { background: "var(--bg)" } : undefined, className: cn("relative min-h-screen min-w-0 overflow-x-clip font-body text-neu-text", ur && "ur-scope"), children: [!isAdmin && _jsx(Navbar, { dark: dark, onToggle: onToggle }), _jsx(Suspense, { fallback: null, children: isAdmin ? (_jsx(AdminApp, { dark: dark, onToggle: onToggle })) : isThemes ? (_jsx(ThemesPage, {})) : isBlog ? (_jsx(BlogPage, { slug: route.split("/")[1] || null })) : (_jsxs(_Fragment, { children: [_jsx(PortfolioPage, {}), chatReady && _jsx(Suspense, { fallback: null, children: _jsx(ChatBot, {}) })] })) })] }));
}
export default function App() {
    const route = useSiteRoute();
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
