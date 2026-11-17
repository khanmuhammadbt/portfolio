import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ContentProvider, useSiteContent } from "./store/content";
import { LangProvider, useLang } from "./store/lang";
import { ThemeStyleProvider } from "./store/theme";
import { cn } from "./utils/cn";
import { readStorage, writeStorage } from "./utils/storage";
import PortfolioPage from "./features/portfolio/PortfolioPage";
import Navbar from "./components/Navbar";

import ThemesPageForSSR from "./features/themes/ThemesPage";
import AdminAppForSSR from "./admin/AdminApp";
import BlogPageForSSR from "./features/blog/BlogPage";

const ThemesPage = import.meta.env.SSR ? ThemesPageForSSR : lazy(() => import("./features/themes/ThemesPage"));
const AdminApp = import.meta.env.SSR ? AdminAppForSSR : lazy(() => import("./admin/AdminApp"));
const ChatBot = lazy(() => import("./features/chat/components/ChatBot"));
const BlogPage = import.meta.env.SSR ? BlogPageForSSR : lazy(() => import("./features/blog/BlogPage"));

function SkeletonBlock({ className }) {
    return <div className={cn("neu-inset-sm animate-pulse opacity-60", className)} />;
}

function SiteSkeleton() {
    return (
        <div role="status" aria-label="Loading site" className="min-h-screen overflow-hidden px-4 sm:px-6">
            <header aria-hidden="true" className="mx-auto flex h-24 max-w-6xl items-center justify-between">
                <SkeletonBlock className="h-10 w-36 rounded-full" />
                <div className="hidden items-center gap-6 sm:flex">
                    <SkeletonBlock className="h-3 w-14 rounded-full" />
                    <SkeletonBlock className="h-3 w-16 rounded-full" />
                    <SkeletonBlock className="h-3 w-12 rounded-full" />
                    <SkeletonBlock className="h-10 w-10 rounded-full" />
                </div>
            </header>
            <main aria-hidden="true" className="mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center gap-14 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
                <div className="flex flex-col items-start">
                    <SkeletonBlock className="h-8 w-40 rounded-full" />
                    <SkeletonBlock className="mt-8 h-16 w-4/5 rounded-xl" />
                    <SkeletonBlock className="mt-4 h-6 w-64 rounded-full" />
                    <SkeletonBlock className="mt-5 h-4 w-full max-w-xl rounded-full" />
                    <div className="mt-9 flex gap-4">
                        <SkeletonBlock className="h-12 w-36 rounded-full" />
                        <SkeletonBlock className="h-12 w-36 rounded-full" />
                    </div>
                </div>
                <SkeletonBlock className="mx-auto aspect-square w-full max-w-sm rounded-full" />
            </main>
        </div>
    );
}

function Shell({ dark, route, onToggle, chatReady }) {
    const { lang } = useLang();
    const { ready } = useSiteContent();
    const isAdmin = route === "admin";
    const isThemes = route === "themes";
    const isBlog = route === "blog" || route.startsWith("blog/");
    const ur = lang === "ur" && !isAdmin;

    if (!ready && !isAdmin) return <SiteSkeleton />;

    return (
        <div
            dir={ur ? "rtl" : "ltr"}
            data-theme={isAdmin ? "neumorphism" : undefined}
            style={isAdmin ? { background: "var(--bg)" } : undefined}
            className={cn("relative min-h-screen min-w-0 overflow-x-clip font-body text-neu-text", ur && "ur-scope")}
        >
            {!isAdmin && <Navbar dark={dark} onToggle={onToggle} />}
            <Suspense fallback={null}>
                {isAdmin ? (
                    <AdminApp dark={dark} onToggle={onToggle} />
                ) : isThemes ? (
                    <ThemesPage />
                ) : isBlog ? (
                    <BlogPage slug={route.split("/")[1] || null} />
                ) : (
                    <>
                        <PortfolioPage />
                        {chatReady && <Suspense fallback={null}><ChatBot /></Suspense>}
                    </>
                )}
            </Suspense>
        </div>
    );
}

export default function App({ initialContent = null, initialDark = true }) {
    const location = useLocation();
    const route = location.pathname.replace(/^\/+|\/+$/g, "");
    const [dark, setDark] = useState(initialDark);
    const [chatReady, setChatReady] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => setChatReady(true), 1000);
        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        setDark(readStorage("km-theme", "dark") !== "light");
    }, []);

    useEffect(() => {
        if (location.hash) {
            document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: "smooth" });
        } else {
            window.scrollTo(0, 0);
        }
    }, [location.pathname, location.hash]);

    useEffect(() => {
        const showOfflinePage = () => {
            if (window.location.pathname === "/offline.html") return;
            try {
                sessionStorage.setItem(
                    "offline-return-url",
                    `${window.location.pathname}${window.location.search}${window.location.hash}`,
                );
            } catch (error) {
                console.error("Could not save the current page before opening offline mode.", error);
            }
            window.location.replace("/offline.html");
        };
        window.addEventListener("offline", showOfflinePage);
        if (!navigator.onLine) showOfflinePage();
        return () => window.removeEventListener("offline", showOfflinePage);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
        writeStorage("km-theme", dark ? "dark" : "light");
    }, [dark]);

    return (
        <LangProvider initialLang="en">
            <ThemeStyleProvider>
                <ContentProvider initialContent={initialContent}>
                    <Shell dark={dark} route={route} chatReady={chatReady} onToggle={() => setDark((value) => !value)} />
                </ContentProvider>
            </ThemeStyleProvider>
        </LangProvider>
    );
}
