import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
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
const DEMO_MODE_ENABLED = false;

function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidBlogPost(value) {
    return isRecord(value)
        && typeof value.slug === "string"
        && typeof value.title === "string"
        && typeof value.body === "string"
        && typeof value.published === "boolean"
        && ["excerpt", "category", "date"].every((key) => (
            value[key] === undefined || typeof value[key] === "string"
        ))
        && (value.coverImage === undefined || value.coverImage === null || typeof value.coverImage === "string");
}

function matchesContentShape(base, value, path = "") {
    if (path === "hero.portraitUrl" && value === null) return true;
    if (Array.isArray(base)) {
        if (!Array.isArray(value)) return false;
        const itemShape = base[0];
        return value.every((item) => {
            if (itemShape === undefined) {
                return path === "blogPosts" ? isValidBlogPost(item) : isRecord(item);
            }
            return matchesContentShape(itemShape, item, path);
        });
    }
    if (isRecord(base)) {
        if (!isRecord(value) || Object.keys(value).length === 0) return false;
        return Object.entries(value).every(([key, child]) => (
            !Object.prototype.hasOwnProperty.call(base, key)
            || matchesContentShape(base[key], child, path ? `${path}.${key}` : key)
        ));
    }
    if (typeof base === "number") return typeof value === "number" && Number.isFinite(value);
    return typeof value === typeof base;
}

function isValidContent(value) {
    if (!isRecord(value) || Object.keys(value).length === 0) return false;
    const knownKeys = Object.keys(value).filter((key) => (
        Object.prototype.hasOwnProperty.call(DEFAULT_CONTENT, key)
    ));
    return knownKeys.length > 0 && knownKeys.every((key) => (
        matchesContentShape(DEFAULT_CONTENT[key], value[key], key)
    ));
}

export function ContentProvider({ children, initialContent = null }) {
    const hasInitialContent = isValidContent(initialContent);
    const [content, setContent] = useState(() => hasInitialContent ? mergeContent(DEFAULT_CONTENT, initialContent) : DEFAULT_CONTENT);
    const [mode, setMode] = useState("api");
    const [source, setSource] = useState("default");
    const [updatedAt, setUpdatedAt] = useState(null);
    const [ready, setReady] = useState(hasInitialContent);
    const requestSequence = useRef(0);
    const appliedSequence = useRef(0);
    const reload = useCallback(async () => {
        const sequence = ++requestSequence.current;
        const hasBackend = await detectBackend();
        if (hasBackend) {
            setMode("api");
            const res = await contentService.get();
            if (isRecord(res) && isValidContent(res.content)) {
                if (sequence >= appliedSequence.current) {
                    appliedSequence.current = sequence;
                    setContent(mergeContent(DEFAULT_CONTENT, res.content));
                    setSource("api");
                    setUpdatedAt(res.updated_at);
                }
                setReady(true);
                return;
            }
        }
        if (!DEMO_MODE_ENABLED) {
            setMode("api");
            setReady(true);
            return;
        }
        setMode("demo");
        const local = readLocal();
        if (local) {
            if (sequence >= appliedSequence.current) {
                appliedSequence.current = sequence;
                setContent(local);
                setSource("local");
            }
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
            const sequence = ++requestSequence.current;
            const res = await contentService.save(next);
            if (sequence >= appliedSequence.current) {
                appliedSequence.current = sequence;
                setUpdatedAt(res.updated_at);
                setContent(next);
                setSource("api");
            }
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
