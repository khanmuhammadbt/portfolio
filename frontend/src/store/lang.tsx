import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dict, type Dict, type Lang } from "../lib/i18n";

const LANG_KEY = "km-lang";

interface LangCtx {
  lang: Lang;
  t: Dict;
  toggle: () => void;
  setLang: (l: Lang) => void;
}

const Ctx = createContext<LangCtx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() =>
    localStorage.getItem(LANG_KEY) === "ur" ? "ur" : "en"
  );

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    // NOTE: dir/font scoping is applied on the site container (not <html>),
    // so the admin panel always stays clean LTR regardless of language.

    // Load the heavy Nastaliq font ONLY when Urdu is chosen (keeps LCP fast in English)
    if (lang === "ur" && !document.getElementById("ur-font")) {
      const link = document.createElement("link");
      link.id = "ur-font";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, [lang]);

  const value = useMemo<LangCtx>(
    () => ({
      lang,
      t: dict[lang] as Dict,
      setLang: setLangState,
      toggle: () => setLangState((l) => (l === "en" ? "ur" : "en")),
    }),
    [lang]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
