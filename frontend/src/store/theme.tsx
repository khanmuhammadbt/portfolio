import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_THEME, THEMES, type ThemeId } from "../lib/themes";

const KEY = "km-theme-style";

interface ThemeCtx {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  reset: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

function readTheme(): ThemeId {
  const saved = localStorage.getItem(KEY);
  return THEMES.some((t) => t.id === saved) ? (saved as ThemeId) : DEFAULT_THEME;
}

function setThemeFavicon() {
  const root = document.documentElement;
  const accent = getComputedStyle(root).getPropertyValue("--accent").trim() || "#7af0bf";
  const background = getComputedStyle(root).getPropertyValue("--bg").trim() || "#0b120f";
  const iconSvg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>
      <rect width='128' height='128' rx='28' fill='${background}'/>
      <circle cx='64' cy='64' r='52' fill='none' stroke='${accent}' stroke-width='6' opacity='0.9'/>
      <text x='64' y='81' text-anchor='middle' font-family='Arial Black, Arial, sans-serif' font-size='44' font-weight='900' fill='${accent}' letter-spacing='-2'>KM</text>
    </svg>
  `;
  const favicon = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconSvg)}`;

  document.querySelectorAll('link[rel~="icon"]').forEach((link) => {
    const el = link as HTMLLinkElement;
    el.href = favicon;
  });

  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.setAttribute("content", accent);
  });
}

export function ThemeStyleProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(readTheme);

  useEffect(() => {
    localStorage.setItem(KEY, theme);
    // on <html> so the page background matches; admin re-scopes to default
    document.documentElement.setAttribute("data-theme", theme);
    setThemeFavicon();
  }, [theme]);

  const value = useMemo<ThemeCtx>(
    () => ({
      theme,
      setTheme: setThemeState,
      reset: () => setThemeState(DEFAULT_THEME),
    }),
    [theme]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useThemeStyle(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useThemeStyle must be used inside ThemeStyleProvider");
  return ctx;
}
