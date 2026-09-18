import { ArrowUpRight, Palette } from "lucide-react";
import { THEMES } from "../lib/themes";
import { useThemeStyle } from "../store/theme";
import { useLang } from "../store/lang";
import { Reveal } from "./ui";

/** Mid-page invitation to the design-themes gallery (replaces the old nav icon) */
export default function ThemeBanner() {
  const { t, lang } = useLang();
  const { theme } = useThemeStyle();
  const active = THEMES.find((x) => x.id === theme) ?? THEMES[0];

  return (
    <section id="design-themes" aria-labelledby="design-themes-title" className="relative px-6 py-16 sm:py-20">
      <div className="glow absolute left-1/2 top-1/2 size-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full" />

      <Reveal>
        <div className="neu-lg mx-auto grid max-w-5xl gap-8 rounded-[2rem] p-7 sm:rounded-[2.5rem] sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          {/* copy */}
          <div>
            <span className="neu-xs inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-neu-accent">
              <Palette className="size-3.5" />
              {t.themesEyebrow}
            </span>

            <h2 id="design-themes-title" className="mt-5 font-display text-2xl font-bold leading-snug sm:text-3xl">
              {t.themeBannerTitle}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-neu-muted sm:text-base">{t.themeBannerText}</p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <a
                href="#/themes"
                className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
              >
                {t.themeBannerCta}
                <ArrowUpRight className="size-4 rtl:-scale-x-100" />
              </a>
              <span className="text-xs font-medium text-neu-muted">
                {t.themeBannerNow}:{" "}
                <span className="font-bold text-neu-accent">{active.name[lang]}</span>
              </span>
            </div>
          </div>

          {/* swatch grid — visual hint of what's inside */}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            {THEMES.map((th) => (
              <li key={th.id}>
                <a
                  href="#/themes"
                  className="neu-sm neu-hover flex items-center gap-2.5 rounded-2xl px-3 py-2.5"
                  aria-label={`${th.name[lang]} — ${t.themeBannerCta}`}
                >
                  <span className="flex shrink-0 -space-x-1">
                    {th.swatch.map((c) => (
                      <span
                        key={c}
                        className="size-3.5 rounded-full border border-neu-bg"
                        style={{ background: c }}
                      />
                    ))}
                  </span>
                  <span className="truncate text-[11px] font-semibold">{th.name[lang]}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
