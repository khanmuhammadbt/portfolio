import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dict } from "../lib/i18n";
const LANG_KEY = "km-lang";
const Ctx = createContext(null);
export function LangProvider({ children }) {
    const [lang, setLangState] = useState(() => localStorage.getItem(LANG_KEY) === "ur" ? "ur" : "en");
    useEffect(() => {
        localStorage.setItem(LANG_KEY, lang);
        // NOTE: dir/font scoping is applied on the site container (not <html>),
        // so the admin panel always stays clean LTR regardless of language.
    }, [lang]);
    const value = useMemo(() => ({
        lang,
        t: dict[lang],
        setLang: setLangState,
        toggle: () => setLangState((l) => (l === "en" ? "ur" : "en")),
    }), [lang]);
    return _jsx(Ctx.Provider, { value: value, children: children });
}
export function useLang() {
    const ctx = useContext(Ctx);
    if (!ctx)
        throw new Error("useLang must be used inside LangProvider");
    return ctx;
}
