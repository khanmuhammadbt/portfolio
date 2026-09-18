import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { ContentProvider } from "./store/content";
import { LangProvider, useLang } from "./store/lang";
import { ThemeStyleProvider } from "./store/theme";
import { cn } from "./utils/cn";
import ThemesPage from "./pages/Themes";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import About from "./components/About";
import Skills from "./components/Skills";
import Experience from "./components/Experience";
import ThemeBanner from "./components/ThemeBanner";
import Contact from "./components/Contact";
import AdminApp from "./admin/AdminApp";
import ChatBot from "./components/ChatBot";

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash.replace(/^#\/?/, "").split("/")[0];
}

function Portfolio() {
  const [showTop, setShowTop] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.4 });

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="neu-inset-sm pointer-events-none fixed inset-x-0 top-0 z-50 h-1.5 rounded-full">
        <motion.div
          style={{ scaleX: progress }}
          className="h-full origin-left rounded-full bg-gradient-to-r from-neu-accent via-neu-accent2 to-neu-accent"
        />
      </div>

      <main id="main">
        <Hero />
        <Marquee />
        <About />
        <Skills />
        <Experience />
        <ThemeBanner />
        <Contact />
      </main>

      <ChatBot />

      <AnimatePresence>
        {showTop && (
          <motion.a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            aria-label="Back to top"
            initial={{ opacity: 0, y: 24, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="press fixed bottom-6 left-6 z-40 grid size-12 place-items-center rounded-full text-neu-muted"
          >
            <ArrowUp className="size-5" />
          </motion.a>
        )}
      </AnimatePresence>
    </>
  );
}

function Shell({ dark, route, onToggle }: { dark: boolean; route: string; onToggle: () => void }) {
  const { lang } = useLang();
  const isAdmin = route === "admin";
  const isThemes = route === "themes";
  // Urdu styling (RTL + Nastaliq) applies to the public site ONLY —
  // admin panel stays clean LTR in every mode
  const ur = lang === "ur" && !isAdmin;
  return (
    <div
      dir={ur ? "rtl" : "ltr"}
      // admin uses the same premium dark visual language as the portfolio
      data-theme={isAdmin ? "voltagent" : undefined}
      style={isAdmin ? { background: "var(--bg)" } : undefined}
      className={cn("relative min-h-screen font-body text-neu-text", ur && "ur-scope")}
    >
      {!isAdmin && (
        <a href="#main" className="skip-link">
          {lang === "ur" ? "مواد پر جائیں" : "Skip to content"}
        </a>
      )}
      {!isAdmin && <Navbar dark={dark} onToggle={onToggle} />}
      {isAdmin ? (
        <AdminApp dark={dark} onToggle={onToggle} />
      ) : isThemes ? (
        <ThemesPage />
      ) : (
        <Portfolio />
      )}
    </div>
  );
}

export default function App() {
  const route = useHashRoute();
  const [dark, setDark] = useState(() => localStorage.getItem("km-theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("km-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <LangProvider>
      <ThemeStyleProvider>
        <ContentProvider>
          <Shell dark={dark} route={route} onToggle={() => setDark((v) => !v)} />
        </ContentProvider>
      </ThemeStyleProvider>
    </LangProvider>
  );
}
