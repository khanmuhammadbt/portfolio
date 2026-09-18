import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_CONTENT, mergeContent, type SiteContent } from "../lib/content";
import { localizeContent } from "../lib/i18n";
import { api, detectBackend } from "../lib/api";
import { useLang } from "./lang";

const STORAGE_KEY = "km-content-v1";

export type BackendMode = "api" | "demo";

interface ContentCtx {
  content: SiteContent;
  ready: boolean;
  mode: BackendMode;
  source: "api" | "local" | "default";
  updatedAt: string | null;
  /** Persist full content object (API when backend exists, else localStorage) */
  save: (next: SiteContent) => Promise<void>;
  reload: () => Promise<void>;
}

const Ctx = createContext<ContentCtx | null>(null);

function readLocal(): SiteContent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return mergeContent(DEFAULT_CONTENT, JSON.parse(raw));
  } catch {
    return null;
  }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [mode, setMode] = useState<BackendMode>("demo");
  const [source, setSource] = useState<"api" | "local" | "default">("default");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    const hasBackend = await detectBackend();
    if (hasBackend) {
      setMode("api");
      const res = await api.content();
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
    } else {
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
    const onStorage = (e: StorageEvent) => {
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

  const save = useCallback(
    async (next: SiteContent) => {
      if (mode === "api") {
        const res = await api.saveContent(next);
        setUpdatedAt(res.updated_at);
        setContent(next);
        setSource("api");
        return;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setContent(next);
      setSource("local");
      setUpdatedAt(new Date().toISOString());
    },
    [mode]
  );

  const value = useMemo(
    () => ({ content, ready, mode, source, updatedAt, save, reload }),
    [content, ready, mode, source, updatedAt, save, reload]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSiteContent(): ContentCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSiteContent must be used inside ContentProvider");
  return ctx;
}

/** Content translated to the active UI language (Urdu overlay on defaults) */
export function useLocalizedContent(): ContentCtx {
  const ctx = useSiteContent();
  const { lang } = useLang();
  return useMemo(
    () => ({ ...ctx, content: localizeContent(ctx.content, lang) }),
    [ctx, lang]
  );
}
