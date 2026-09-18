import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Palette, RotateCcw, Sparkles } from "lucide-react";
import { THEMES, type ThemeId } from "../lib/themes";
import { useThemeStyle } from "../store/theme";
import { useLang } from "../store/lang";
import { Reveal, SectionHead } from "../components/ui";
import { cn } from "../utils/cn";

/** Miniature UI rendered inside each theme's own scope → true live preview */
function MiniPreview({ id }: { id: ThemeId }) {
  return (
    <div
      data-theme={id}
      className="neu-inset rounded-[1.4rem] p-5"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <div className="flex items-center gap-3">
        <span className="neu-sm grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold" style={{ color: "var(--accent)" }}>
          KM
        </span>
        <div className="min-w-0 flex-1">
          <div className="neu-xs h-2.5 w-3/4 rounded-full" />
          <div className="neu-xs mt-1.5 h-2 w-1/2 rounded-full opacity-70" />
        </div>
      </div>

      {/* progress track */}
      <div className="neu-inset-sm mt-4 h-2.5 overflow-hidden rounded-full">
        <div className="h-full w-3/4 rounded-full" style={{ background: "var(--accent)" }} />
      </div>

      {/* chips + buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="neu-xs rounded-full px-2.5 py-1 text-[10px] font-semibold">React</span>
        <span className="neu-xs rounded-full px-2.5 py-1 text-[10px] font-semibold">Flask</span>
        <span className="btn-primary ml-auto rounded-full px-3.5 py-1.5 text-[10px] font-bold">Hire</span>
      </div>
    </div>
  );
}

export default function ThemesPage() {
  const { theme, setTheme, reset } = useThemeStyle();
  const { t, lang } = useLang();
  const [toast, setToast] = useState<string | null>(null);

  const apply = (id: ThemeId) => {
    setTheme(id);
    setToast(t.themeApplied);
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="relative min-h-screen px-5 pb-24 pt-28 sm:px-6 sm:pb-28 sm:pt-32">
      <div className="glow absolute left-1/2 top-10 size-[34rem] -translate-x-1/2 rounded-full" />

      <div className="mx-auto max-w-6xl">
        {/* back */}
        <Reveal>
          <a href="#/" className="press mb-10 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-neu-muted">
            <ArrowLeft className="size-4 rtl:-scale-x-100" />
            {t.backToSite}
          </a>
        </Reveal>

        <SectionHead
          id="themes-title"
          eyebrow={t.themesEyebrow}
          title={
            <>
              {t.themesTitle} <span className="text-neu-accent">{t.themesTitleAccent}</span>
            </>
          }
          sub={t.themesSub}
        />

        {/* active banner */}
        <Reveal delay={0.1}>
          <div className="neu-sm mx-auto mt-10 flex w-fit flex-wrap items-center justify-center gap-4 rounded-full px-6 py-3">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-neu-muted">
              <Palette className="size-4 text-neu-accent" />
              {t.themeCurrent}
            </span>
            <span className="neu-inset-sm rounded-full px-4 py-1.5 font-display text-sm font-bold text-neu-accent">
              {THEMES.find((x) => x.id === theme)?.name[lang]}
            </span>
            <button onClick={reset} className="press inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-neu-muted">
              <RotateCcw className="size-3.5" />
              {t.themeReset}
            </button>
          </div>
        </Reveal>

        {/* gallery */}
        <div className="mt-12 grid gap-5 sm:mt-14 sm:gap-7 md:grid-cols-2 xl:grid-cols-3">
          {THEMES.map((th, i) => {
            const active = th.id === theme;
            return (
              <Reveal key={th.id} delay={(i % 3) * 0.08}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "neu flex h-full flex-col gap-5 rounded-[1.6rem] p-5 sm:rounded-[2rem] sm:p-6",
                    active && "ring-2 ring-neu-accent"
                  )}
                >
                  {/* header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-display text-lg font-bold">{th.name[lang]}</h3>
                        {active && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-neu-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                            <Check className="size-2.5" /> {t.themeActive}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-xs font-medium uppercase tracking-[0.14em] text-neu-muted">
                        {th.tagline[lang]}
                      </p>
                    </div>
                    <div className="flex shrink-0 -space-x-1.5">
                      {th.swatch.map((c) => (
                        <span
                          key={c}
                          className="size-5 rounded-full border-2 border-neu-bg"
                          style={{ background: c }}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>

                  {/* live mini preview in that theme */}
                  <MiniPreview id={th.id} />

                  <p className="text-sm leading-relaxed text-neu-muted">{th.desc[lang]}</p>

                  {/* traits */}
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-neu-muted">
                      {t.themeTraits}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {th.traits[lang].map((tr) => (
                        <span key={tr} className="neu-xs rounded-full px-3 py-1.5 text-[11px] font-semibold text-neu-muted">
                          {tr}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* footer */}
                  <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neu-muted">
                      {th.year}
                    </span>
                    <button
                      onClick={() => apply(th.id)}
                      disabled={active}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity",
                        active ? "neu-inset-sm text-neu-muted" : "btn-primary"
                      )}
                    >
                      {active ? <Check className="size-4" /> : <Sparkles className="size-4" />}
                      {active ? t.themeActive : t.themeApply}
                    </button>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-8 z-50 flex justify-center px-4"
          >
            <div className="neu flex items-center gap-3 rounded-full px-6 py-3.5">
              <Check className="size-4 text-green-500" />
              <span className="text-sm font-semibold">{toast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
