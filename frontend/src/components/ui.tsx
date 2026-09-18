import { useEffect, useRef, type ReactNode } from "react";
import { motion, useInView, animate } from "framer-motion";
import { cn } from "../utils/cn";

/** Butter-smooth scroll reveal wrapper */
export function Reveal({
  children,
  delay = 0,
  y = 36,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Consistent section heading block */
export function SectionHead({
  eyebrow,
  title,
  sub,
  align = "center",
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  align?: "center" | "left";
  /** id for the <h2> so the parent <section aria-labelledby> resolves */
  id?: string;
}) {
  const centered = align === "center";
  return (
    <div className={cn("flex flex-col gap-5", centered && "items-center text-center")}>
      <Reveal>
        <span className="neu-xs inline-flex items-center gap-2 rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-neu-accent">
          <span className="size-1.5 rounded-full bg-neu-accent" aria-hidden="true" />
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 id={id} className="font-display text-3xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.16}>
          <p className={cn("max-w-xl text-base leading-relaxed text-neu-muted", centered && "mx-auto")}>
            {sub}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/** Animated number counter that fires in view */
export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const wrap = useRef<HTMLSpanElement>(null);
  const inView = useInView(wrap, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, to, suffix]);

  return (
    <span ref={wrap}>
      <span ref={ref}>0{suffix}</span>
    </span>
  );
}
