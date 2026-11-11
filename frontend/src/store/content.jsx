import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_CONTENT, mergeContent } from "../lib/content";
import { localizeContent } from "../lib/i18n";
import { detectBackend } from "../lib/api";
import { contentService } from "../features/content/contentService";
import { readJsonStorage, writeJsonStorage } from "../utils/storage";
import { useLang } from "./lang";
const STORAGE_KEY = "km-content-v1";
const Ctx = createContext(null);
function readLocal() {
    const raw = readJsonStorage(STORAGE_KEY, null);
    if (!raw)
        return null;
    return mergeContent(DEFAULT_CONTENT, raw);
}
export function ContentProvider({ children }) {
    const [content, setContent] = useState(DEFAULT_CONTENT);
    const [mode, setMode] = useState("demo");
    const [source, setSource] = useState("default");
    const [updatedAt, setUpdatedAt] = useState(null);
    const [ready, setReady] = useState(false);
    const reload = useCallback(async () => {
        const hasBackend = await detectBackend();
        if (hasBackend) {
            setMode("api");
            const res = await contentService.get();
            if (res) {
                setContent(mergeContent(DEFAULT_CONTENT, res.content));
                setSource("api");
                setUpdatedAt(res.updated_at);
                setReady(true);
                return;
            }
        }
        setMode("demo");
        const local = readLocal();
        if (local) {
            setContent(local);
            setSource("local");
        }
        else {
            setContent(DEFAULT_CONTENT);
            setSource("default");
        }
        setReady(true);
    }, []);
    useEffect(() => {
        reload();
    }, [reload]);
    // cross-tab sync: edits published in another tab update this one live
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === STORAGE_KEY && mode === "demo") {
                const local = readLocal();
                if (local) {
                    setContent(local);
                    setSource("local");
                }
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [mode]);
    const save = useCallback(async (next) => {
        if (mode === "api") {
            const res = await contentService.save(next);
            setUpdatedAt(res.updated_at);
            setContent(next);
            setSource("api");
            return;
        }
        writeJsonStorage(STORAGE_KEY, next);
        setContent(next);
        setSource("local");
        setUpdatedAt(new Date().toISOString());
    }, [mode]);
    const value = useMemo(() => ({ content, ready, mode, source, updatedAt, save, reload }), [content, ready, mode, source, updatedAt, save, reload]);
    return _jsx(Ctx.Provider, { value: value, children: children });
}
export function useSiteContent() {
    const ctx = useContext(Ctx);
    if (!ctx)
        throw new Error("useSiteContent must be used inside ContentProvider");
    return ctx;
}
/** Content translated to the active UI language (Urdu overlay on defaults) */
export function useLocalizedContent() {
    const ctx = useSiteContent();
    const { lang } = useLang();
    return useMemo(() => ({ ...ctx, content: localizeContent(ctx.content, lang) }), [ctx, lang]);
}
