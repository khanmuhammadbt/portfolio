import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import About from "./components/About";
import Contact from "./components/Contact";
import Experience from "./components/Experience";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Skills from "./components/Skills";
export default function PortfolioPage() {
    const [showTop, setShowTop] = useState(false);
    const { scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.4 });
    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 700);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "neu-inset-sm pointer-events-none fixed inset-x-0 top-0 z-50 h-1.5 rounded-full", children: _jsx(motion.div, { style: { scaleX: progress }, className: "h-full origin-left rounded-full bg-gradient-to-r from-neu-accent via-neu-accent2 to-neu-accent" }) }), _jsxs("main", { children: [_jsx(Hero, {}), _jsx(Marquee, {}), _jsx(About, {}), _jsx(Skills, {}), _jsx(Experience, {}), _jsx(Contact, {})] }), _jsx(AnimatePresence, { children: showTop && (_jsx(motion.a, { href: "#", onClick: (e) => {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }, "aria-label": "Back to top", initial: { opacity: 0, y: 24, scale: 0.8 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 24, scale: 0.8 }, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }, className: "press fixed bottom-6 left-6 z-40 grid size-12 place-items-center rounded-full text-neu-muted", children: _jsx(ArrowUp, { className: "size-5" }) })) })] }));
}
