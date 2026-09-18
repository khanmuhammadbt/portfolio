import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Loader2, Mail, MessageCircle, Send, X } from "lucide-react";
import { GithubIcon, InstagramIcon, WhatsappIcon, YoutubeIcon } from "./icons";
import { api, detectBackend } from "../lib/api";
import {
  CHATBOT,
  CHAT_API_KEY,
  CHAT_MODEL,
  buildSystemPrompt,
  localAnswer,
  type ChatMessage,
} from "../lib/chat";
import { useSiteContent } from "../store/content";
import { useLang } from "../store/lang";
import type { Dict, Lang } from "../lib/i18n";
import type { SiteContent } from "../lib/content";
import { cn } from "../utils/cn";

const STORE_KEY = "km-chat";

function loadHistory(): ChatMessage[] {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/** Turn a raw URL / email into a single friendly word (localized) */
function linkLabel(url: string, t: Dict): string {
  const u = url.toLowerCase();
  if (u.startsWith("mailto:") || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) return t.linkEmail;
  if (u.includes("wa.me") || u.includes("whatsapp")) return t.linkWhatsapp;
  if (u.includes("youtube") || u.includes("youtu.be")) return t.linkYoutube;
  if (u.includes("instagram")) return t.linkInstagram;
  if (u.includes("github")) return t.linkGithub;
  try {
    const host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
    const word = host.split(".")[0];
    return word.charAt(0).toUpperCase() + word.slice(1);
  } catch {
    return t.linkOpen;
  }
}

function linkIcon(url: string) {
  const u = url.toLowerCase();
  if (u.startsWith("mailto:") || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) return Mail;
  if (u.includes("wa.me") || u.includes("whatsapp")) return WhatsappIcon;
  if (u.includes("youtube") || u.includes("youtu.be")) return YoutubeIcon;
  if (u.includes("instagram")) return InstagramIcon;
  if (u.includes("github")) return GithubIcon;
  return ExternalLink;
}

/** Render text where every URL/email becomes a compact clickable chip */
function RichText({ text, light = false, t }: { text: string; light?: boolean; t: Dict }) {
  const clean = text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "$2") // markdown link -> raw url
    .replace(/[*_`]{1,2}/g, ""); // stray markdown emphasis
  // split on URLs and bare emails
  const parts = clean.split(/(https?:\/\/[^\s)]+|mailto:[^\s)]+|[^\s@(]+@[^\s@).,]+\.[a-z]{2,})/gi);
  return (
    <>
      {parts.map((p, i) => {
        const isUrl = /^(https?:\/\/|mailto:)/i.test(p);
        const isEmail = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(p);
        if (!isUrl && !isEmail) return p;
        const href = isEmail && !p.startsWith("mailto:") ? `mailto:${p}` : p;
        const Icon = linkIcon(p);
        return (
          <a
            key={i}
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noreferrer"
            title={p}
            className={cn(
              "mx-0.5 inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 align-middle text-xs font-bold transition-transform duration-200 hover:-translate-y-0.5 active:scale-95",
              light
                ? "bg-white/25 text-white"
                : "neu-xs text-neu-accent hover:text-neu-accent"
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            {linkLabel(p, t)}
          </a>
        );
      })}
    </>
  );
}

/** Call Gemini directly (static demo mode only — backend proxies in production) */
async function callGeminiDirect(
  message: string,
  history: ChatMessage[],
  content: SiteContent,
  lang: Lang
): Promise<string | null> {
  const contents = [
    ...history.slice(-10).map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: "user", parts: [{ text: message }] },
  ];
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${CHAT_MODEL}:generateContent?key=${CHAT_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: buildSystemPrompt(content, lang) }] },
        contents,
        generationConfig: { temperature: 0.6, maxOutputTokens: 400 },
      }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("")
    .trim();
  return text || null;
}

async function getReply(
  message: string,
  history: ChatMessage[],
  content: SiteContent,
  lang: Lang,
  fallback: string
): Promise<string> {
  try {
    if (await detectBackend()) {
      const res = await api.chat(message, history.slice(-10), lang);
      if (res.reply) return res.reply;
    }
  } catch {
    /* fall through */
  }
  try {
    const direct = await callGeminiDirect(message, history, content, lang);
    if (direct) return direct;
  } catch {
    /* fall through */
  }
  return localAnswer(message, content, lang) ?? fallback;
}

export default function ChatBot() {
  const { content } = useSiteContent(); // RAW content (bot should use admin's real values)
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-40)));
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  // language switch -> restart the conversation in the new language
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setMessages([{ role: "model", text: t.chatWelcome }]);
  }, [lang, t.chatWelcome]);

  const openPanel = () => {
    setOpen(true);
    setMessages((m) => (m.length ? m : [{ role: "model", text: t.chatWelcome }]));
  };

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || sending) return;
    setInput("");
    const userMsg: ChatMessage = { role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setSending(true);
    try {
      const reply = await getReply(text, [...messages, userMsg], content, lang, t.chatFallback);
      setMessages((m) => [...m, { role: "model", text: reply }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div dir="ltr" className="font-body">
      {/* launcher */}
      <motion.button
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-label="Open Banta Tech chat"
        initial={{ opacity: 0, scale: 0.6, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="press fixed bottom-6 right-6 z-50 grid size-14 place-items-center rounded-full text-neu-accent"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        {!open && <span className="pulse-dot absolute right-1 top-1 size-2.5 rounded-full bg-green-500" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            dir={lang === "ur" ? "rtl" : "ltr"}
            className="neu-lg fixed bottom-24 right-4 z-50 flex h-[min(36rem,calc(100dvh-7.5rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[2rem] sm:right-6"
          >
            {/* header */}
            <div className="neu-inset-sm flex items-center gap-3 px-5 py-4">
              <span className="neu-inset-sm relative grid size-11 shrink-0 place-items-center rounded-full font-display text-xs font-bold text-neu-accent">
                {CHATBOT.initials}
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-neu-bg bg-green-500" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold">{t.chatName}</p>
                <p className="truncate text-[10px] font-medium uppercase tracking-[0.14em] text-neu-muted">
                  {t.chatStatus}
                </p>
              </div>
              <button
                onClick={() => setMessages([{ role: "model", text: t.chatWelcome }])}
                aria-label="Clear chat"
                className="press rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neu-muted"
              >
                {t.chatClear}
              </button>
            </div>

            {/* messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-line rounded-3xl px-4 py-3 text-sm leading-relaxed",
                      m.role === "user"
                        ? "btn-primary rounded-br-lg"
                        : "neu-sm rounded-bl-lg text-neu-text"
                    )}
                  >
                    <RichText text={m.text} light={m.role === "user"} t={t} />
                  </div>
                </motion.div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="neu-sm flex items-center gap-1.5 rounded-3xl rounded-bl-lg px-5 py-3.5">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d * 0.18 }}
                        className="size-1.5 rounded-full bg-neu-accent"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* quick chips */}
            <div className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {t.suggestions.map((f) => (
                <button
                  key={f.label}
                  onClick={() => send(f.q)}
                  disabled={sending}
                  className="press shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold text-neu-muted disabled:opacity-50"
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2 px-4 pb-4"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.chatPlaceholder}
                className="neu-inset-sm min-w-0 flex-1 rounded-full bg-transparent px-5 py-3 text-sm outline-none ring-neu-accent/50 transition-shadow focus:ring-2"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                aria-label="Send message"
                className="btn-primary grid size-11 shrink-0 place-items-center rounded-full disabled:opacity-50"
              >
                {sending ? <Loader2 className="size-4.5 animate-spin" /> : <Send className="size-4.5 rtl:-scale-x-100" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
