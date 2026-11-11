import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowUp, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { useLang } from "../../store/lang";
import About from "./components/About";
import Contact from "./components/Contact";
import Experience from "./components/Experience";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Skills from "./components/Skills";

export default function PortfolioPage() {
  const [showTop, setShowTop] = useState(false);
  const { t } = useLang();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 22,
    mass: 0.4,
  });

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="neu-inset-sm pointer-events-none fixed inset-x-0 top-0 z-50 h-1.5 rounded-full">
        <m.div
          style={{ scaleX: progress }}
          className="h-full origin-left rounded-full bg-gradient-to-r from-neu-accent via-neu-accent2 to-neu-accent"
        />
      </div>
      <main>
        <Hero />
        <div className="relative z-10 -mt-8 mb-12 flex justify-center px-4">
          <a
            href="#/themes"
            className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
          >
            <Palette className="size-4" />
            {t.navThemes}
          </a>
        </div>
        <Marquee />
        <About />
        <Skills />
        <Experience />
        <Contact />
      </main>
      <AnimatePresence>
        {showTop && (
          <m.a
            href="#"
            onClick={(event) => {
              event.preventDefault();
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
          </m.a>
        )}
      </AnimatePresence>
    </>
  );
}
