import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_THEME, THEMES } from "../lib/themes";
const KEY = "km-theme-style";
const Ctx = createContext(null);
function readTheme() {
    const saved = localStorage.getItem(KEY);
    return THEMES.some((t) => t.id === saved) ? saved : DEFAULT_THEME;
}
export function ThemeStyleProvider({ children }) {
    const [theme, setThemeState] = useState(readTheme);
    useEffect(() => {
        localStorage.setItem(KEY, theme);
        // on <html> so the page background matches; admin re-scopes to default
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);
    const value = useMemo(() => ({
        theme,
        setTheme: setThemeState,
        reset: () => setThemeState(DEFAULT_THEME),
    }), [theme]);
    return _jsx(Ctx.Provider, { value: value, children: children });
}
export function useThemeStyle() {
    const ctx = useContext(Ctx);
    if (!ctx)
        throw new Error("useThemeStyle must be used inside ThemeStyleProvider");
    return ctx;
}
