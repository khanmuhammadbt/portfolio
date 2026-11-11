import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { m, useInView, animate } from "framer-motion";
import { cn } from "../utils/cn";
/** Butter-smooth scroll reveal wrapper */
export function Reveal({ children, delay = 0, y = 36, className, }) {
    return (_jsx(m.div, { className: cn("min-w-0", className), initial: { opacity: 0, y }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-70px" }, transition: { duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }, children: children }));
}
/** Consistent section heading block */
export function SectionHead({ eyebrow, title, sub, align = "center", }) {
    const centered = align === "center";
    return (_jsxs("div", { className: cn("flex flex-col gap-5", centered && "items-center text-center"), children: [_jsx(Reveal, { children: _jsxs("span", { className: "neu-xs inline-flex items-center gap-2 rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-neu-accent", children: [_jsx("span", { className: "size-1.5 rounded-full bg-neu-accent" }), eyebrow] }) }), _jsx(Reveal, { delay: 0.08, children: _jsx("h2", { className: "font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl", children: title }) }), sub && (_jsx(Reveal, { delay: 0.16, children: _jsx("p", { className: cn("max-w-xl text-base leading-relaxed text-neu-muted", centered && "mx-auto"), children: sub }) }))] }));
}
/** Animated number counter that fires in view */
export function Counter({ to, suffix = "" }) {
    const ref = useRef(null);
    const wrap = useRef(null);
    const inView = useInView(wrap, { once: true, margin: "-40px" });
    useEffect(() => {
        if (!inView)
            return;
        const controls = animate(0, to, {
            duration: 1.8,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: (v) => {
                if (ref.current)
                    ref.current.textContent = `${Math.round(v)}${suffix}`;
            },
        });
        return () => controls.stop();
    }, [inView, to, suffix]);
    return (_jsx("span", { ref: wrap, children: _jsxs("span", { ref: ref, children: ["0", suffix] }) }));
}
