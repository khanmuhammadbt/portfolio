import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Moon,
  RotateCcw,
  Save,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { useSiteContent } from "../store/content";
import { ApiError, api } from "../lib/api";
import { BadCredentialsError, LockedError, demoChangePassword, demoLogin, demoLockRemaining, demoLogout, demoSession } from "./demoAuth";
import { DEFAULT_CONTENT, type SiteContent } from "../lib/content";
import { ColorInput, Field, IconSelect, ImageUpload, ListEditor, NumInput, TextArea, TextInput, inputCls } from "./fields";
import { cn } from "../utils/cn";

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

type Tab = "hero" | "stats" | "marquee" | "about" | "services" | "skills" | "experience" | "contact" | "footer" | "security";

const TABS: { id: Tab; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "stats", label: "Stats" },
  { id: "marquee", label: "Marquee" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
  { id: "footer", label: "Footer" },
  { id: "security", label: "Security" },
];

/* =============================== LOGIN =============================== */

function Login({ onSuccess }: { onSuccess: (u: string) => void }) {
  const { mode, ready } = useSiteContent();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockSecs, setLockSecs] = useState(() => demoLockRemaining());
  const [busy, setBusy] = useState(false);

  // prefetch CSRF token + anonymous session for the real backend
  useEffect(() => {
    if (ready && mode === "api") api.csrf().catch(() => undefined);
  }, [ready, mode]);

  useEffect(() => {
    if (lockSecs <= 0) return;
    const t = setInterval(() => setLockSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [lockSecs]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || lockSecs > 0) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === "api") {
        const admin = await api.login(username.trim(), password);
        onSuccess(admin.username);
      } else {
        const admin = await demoLogin(username.trim(), password);
        onSuccess(admin.username);
      }
    } catch (err) {
      if (err instanceof LockedError) setLockSecs(err.retryAfter);
      else if (err instanceof ApiError) {
        if (err.status === 423 && err.retryAfter) setLockSecs(err.retryAfter);
        else if (err.status === 429) setError("Too many requests — slow down.");
        else setError("Invalid credentials");
      } else if (err instanceof BadCredentialsError) setError("Invalid credentials");
      else setError("Something went wrong — try again.");
      setPassword("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="glow absolute left-1/2 top-1/3 size-[32rem] -translate-x-1/2 rounded-full" />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="neu-lg relative w-full max-w-md rounded-[2.2rem] p-8 sm:p-10"
      >
        <div className="flex flex-col items-center text-center">
          <span className="neu-inset-sm grid size-16 place-items-center rounded-full text-neu-accent">
            <ShieldCheck className="size-7" />
          </span>
          <h1 className="mt-6 font-display text-2xl font-bold">Admin Console</h1>
          <p className="mt-2 text-sm text-neu-muted">
            {mode === "api" ? (
              <>Secured by the Flask backend — hashed passwords, CSRF tokens &amp; brute-force lockouts.</>
            ) : (
              <>Demo mode — Flask backend not detected. Password verified as a local SHA-256 hash.</>
            )}
          </p>
        </div>

        {mode === "demo" && (
          <div className="neu-inset-sm mt-6 rounded-2xl p-4 text-center text-xs leading-relaxed text-neu-muted">
            Demo credentials — <span className="font-semibold text-neu-text">admin / bantech123</span>. Deploy the
            Flask server for production-grade protection.
          </div>
        )}

        <AnimatePresence>
          {lockSecs > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 flex items-center gap-3 rounded-2xl p-4 text-sm" style={{ background: "color-mix(in srgb, #ef4444 10%, transparent)", color: "#ef4444" }}>
                <Lock className="size-4 shrink-0" />
                <span>
                  Brute-force lockout active. Retry in <b className="font-mono">{lockSecs}s</b> (delay doubles each round
                  — max 60 min).
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={submit} className="mt-7 flex flex-col gap-4">
          <Field label="Username">
            <TextInput value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
          </Field>
          <Field label="Password">
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className={`${inputCls} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label="Toggle password visibility"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neu-muted transition-colors hover:text-neu-accent"
              >
                {showPass ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
              </button>
            </div>
          </Field>

          {error && (
            <p className="flex items-center gap-2 text-sm text-red-400">
              <CircleAlert className="size-4" /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || lockSecs > 0}
            className="btn-primary mt-2 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
            {busy ? "Verifying…" : "Sign In"}
          </button>
        </form>

        <a href="#/" className="mt-6 flex items-center justify-center gap-2 text-sm text-neu-muted transition-colors hover:text-neu-accent">
          <ArrowLeft className="size-4" /> Back to website
        </a>
      </motion.div>
    </div>
  );
}

/* =============================== DASHBOARD =============================== */

export default function AdminApp({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const site = useSiteContent();
  const [admin, setAdmin] = useState<string | null>(null);
  const [draft, setDraft] = useState<SiteContent | null>(null);
  const [tab, setTab] = useState<Tab>("hero");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [notice, setNotice] = useState<string | null>(null);

  // restore existing session
  useEffect(() => {
    if (!site.ready) return;
    if (site.mode === "api") api.me().then((u) => u && setAdmin(u.username));
    else {
      const s = demoSession();
      if (s) setAdmin(s.username);
    }
  }, [site.ready, site.mode]);

  useEffect(() => {
    if (admin && !draft) setDraft(clone(site.content));
  }, [admin, site.content, draft]);

  const dirty = useMemo(
    () => draft && JSON.stringify(draft) !== JSON.stringify(site.content),
    [draft, site.content]
  );

  if (!site.ready) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-8 animate-spin text-neu-accent" />
      </div>
    );
  }
  if (!admin) return <Login onSuccess={setAdmin} />;
  if (!draft) return null;

  const patch = (p: Partial<SiteContent>) => {
    setDraft((d) => (d ? { ...d, ...p } : d));
    setSaveState("idle");
  };

  const doSave = async () => {
    setSaveState("saving");
    setNotice(null);
    try {
      await site.save(draft);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2600);
    } catch (e) {
      setSaveState("error");
      setNotice(e instanceof ApiError ? `${e.status}: ${e.message}` : "Save failed");
    }
  };

  const logout = async () => {
    if (site.mode === "api") await api.logout().catch(() => undefined);
    else demoLogout();
    setAdmin(null);
    setDraft(null);
  };

  const resetDefaults = async () => {
    if (!confirm("Reset the ENTIRE website back to factory content? This cannot be undone.")) return;
    const fresh = clone(DEFAULT_CONTENT);
    setDraft(fresh);
    await site.save(fresh);
    setSaveState("saved");
  };

  const section = (node: React.ReactNode) => (
    <div className="neu rounded-[2rem] p-6 sm:p-8">{node}</div>
  );

  return (
    <div className="relative min-h-screen px-4 pb-32 pt-6 sm:px-6">
      <div className="glow absolute right-0 top-0 size-[30rem] rounded-full" />

      {/* top bar */}
      <header className="neu-sm mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-3xl px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="neu-inset-sm grid size-10 place-items-center rounded-full text-neu-accent">
            <ShieldCheck className="size-4.5" />
          </span>
          <div>
            <p className="font-display text-sm font-bold leading-tight">Admin Console</p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-neu-muted">{admin}</p>
          </div>
          <span
            className={cn(
              "neu-inset-sm rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
              site.mode === "api" ? "text-green-500" : "text-amber-500"
            )}
          >
            {site.mode === "api" ? "Flask backend" : "Demo mode"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a href="#/" className="press inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-neu-muted">
            <Eye className="size-3.5" /> View site
          </a>
          <button onClick={onToggle} aria-label="Toggle theme" className="press grid size-9 place-items-center rounded-full text-neu-muted">
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button onClick={logout} aria-label="Logout" className="press grid size-9 place-items-center rounded-full text-red-400">
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto mt-6 grid max-w-7xl gap-6 lg:grid-cols-[13rem_1fr]">
        {/* sidebar */}
        <nav className="neu-sm flex gap-2 overflow-x-auto rounded-3xl p-3 lg:h-fit lg:flex-col">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "whitespace-nowrap rounded-2xl px-4 py-2.5 text-left text-sm font-semibold transition-all duration-300 lg:w-full",
                tab === t.id
                  ? "neu-inset-sm text-neu-accent"
                  : "press text-neu-muted"
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* editors */}
        <div className="min-w-0">
          {tab === "hero" &&
            section(
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Brand initials (logo)">
                  <TextInput value={draft.brand.initials} onChange={(e) => patch({ brand: { ...draft.brand, initials: e.target.value } })} />
                </Field>
                <Field label="Brand name">
                  <TextInput value={draft.brand.name} onChange={(e) => patch({ brand: { ...draft.brand, name: e.target.value } })} />
                </Field>
                <Field label="Availability badge">
                  <TextInput value={draft.hero.availability} onChange={(e) => patch({ hero: { ...draft.hero, availability: e.target.value } })} />
                </Field>
                <Field label="Role">
                  <TextInput value={draft.hero.role} onChange={(e) => patch({ hero: { ...draft.hero, role: e.target.value } })} />
                </Field>
                <Field label="First name (big)">
                  <TextInput value={draft.hero.firstName} onChange={(e) => patch({ hero: { ...draft.hero, firstName: e.target.value } })} />
                </Field>
                <Field label="Last name (outlined)">
                  <TextInput value={draft.hero.lastName} onChange={(e) => patch({ hero: { ...draft.hero, lastName: e.target.value } })} />
                </Field>
                <Field label="Experience badge">
                  <TextInput value={draft.hero.yearsBadge} onChange={(e) => patch({ hero: { ...draft.hero, yearsBadge: e.target.value } })} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Portrait image (Hero + About dono me use hoti hai)">
                    <ImageUpload
                      value={draft.hero.portraitUrl ?? ""}
                      onChange={(portraitUrl) => patch({ hero: { ...draft.hero, portraitUrl } })}
                      fallbackLabel="Built-in photo"
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Intro paragraph">
                    <TextArea value={draft.hero.intro} onChange={(e) => patch({ hero: { ...draft.hero, intro: e.target.value } })} />
                  </Field>
                </div>
                <Field label="Primary button label">
                  <TextInput value={draft.hero.primaryCta} onChange={(e) => patch({ hero: { ...draft.hero, primaryCta: e.target.value } })} />
                </Field>
                <Field label="Secondary button label">
                  <TextInput value={draft.hero.secondaryCta} onChange={(e) => patch({ hero: { ...draft.hero, secondaryCta: e.target.value } })} />
                </Field>
              </div>
            )}

          {tab === "stats" &&
            section(
              <ListEditor
                items={draft.stats}
                onChange={(stats) => patch({ stats })}
                addLabel="Add stat"
                makeNew={() => ({ value: 10, suffix: "+", label: "New Stat" })}
                renderItem={(s, _i, u) => (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Value">
                      <NumInput value={s.value} onChange={(e) => u({ value: Number(e.target.value) })} />
                    </Field>
                    <Field label="Suffix">
                      <TextInput value={s.suffix} onChange={(e) => u({ suffix: e.target.value })} />
                    </Field>
                    <Field label="Label">
                      <TextInput value={s.label} onChange={(e) => u({ label: e.target.value })} />
                    </Field>
                  </div>
                )}
              />
            )}

          {tab === "marquee" &&
            section(
              <Field label="Ticker items (comma separated)">
                <TextArea
                  value={draft.marquee.join(", ")}
                  onChange={(e) =>
                    patch({ marquee: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
                  }
                />
              </Field>
            )}

          {tab === "about" &&
            section(
              <div className="flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field label="Eyebrow">
                    <TextInput value={draft.about.eyebrow} onChange={(e) => patch({ about: { ...draft.about, eyebrow: e.target.value } })} />
                  </Field>
                  <Field label="Heading line">
                    <TextInput value={draft.about.headingA} onChange={(e) => patch({ about: { ...draft.about, headingA: e.target.value } })} />
                  </Field>
                  <Field label="Heading accent">
                    <TextInput value={draft.about.headingAccent} onChange={(e) => patch({ about: { ...draft.about, headingAccent: e.target.value } })} />
                  </Field>
                </div>
                <Field label="Bio paragraph 1">
                  <TextArea value={draft.about.bio1} onChange={(e) => patch({ about: { ...draft.about, bio1: e.target.value } })} />
                </Field>
                <Field label="Bio paragraph 2">
                  <TextArea value={draft.about.bio2} onChange={(e) => patch({ about: { ...draft.about, bio2: e.target.value } })} />
                </Field>
                <ListEditor
                  items={draft.about.facts}
                  onChange={(facts) => patch({ about: { ...draft.about, facts } })}
                  addLabel="Add fact"
                  makeNew={() => ({ icon: "sparkles", label: "Label", value: "Value" })}
                  renderItem={(f, _i, u) => (
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="Icon">
                        <IconSelect value={f.icon} onChange={(icon) => u({ icon })} />
                      </Field>
                      <Field label="Label">
                        <TextInput value={f.label} onChange={(e) => u({ label: e.target.value })} />
                      </Field>
                      <Field label="Value">
                        <TextInput value={f.value} onChange={(e) => u({ value: e.target.value })} />
                      </Field>
                    </div>
                  )}
                />
              </div>
            )}

          {tab === "services" &&
            section(
              <ListEditor
                items={draft.services}
                onChange={(services) => patch({ services })}
                addLabel="Add service"
                makeNew={() => ({ icon: "sparkles", color: "#5b5ee9", title: "New Service", text: "Describe it…" })}
                renderItem={(s, _i, u) => (
                  <div className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="Icon">
                        <IconSelect value={s.icon} onChange={(icon) => u({ icon })} />
                      </Field>
                      <Field label="Accent color">
                        <ColorInput value={s.color} onChange={(color) => u({ color })} />
                      </Field>
                      <Field label="Title">
                        <TextInput value={s.title} onChange={(e) => u({ title: e.target.value })} />
                      </Field>
                    </div>
                    <Field label="Description">
                      <TextArea value={s.text} onChange={(e) => u({ text: e.target.value })} />
                    </Field>
                  </div>
                )}
              />
            )}

          {tab === "skills" &&
            section(
              <div className="flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Eyebrow">
                    <TextInput value={draft.skills.eyebrow} onChange={(e) => patch({ skills: { ...draft.skills, eyebrow: e.target.value } })} />
                  </Field>
                  <Field label="Section subtitle">
                    <TextInput value={draft.skills.sub} onChange={(e) => patch({ skills: { ...draft.skills, sub: e.target.value } })} />
                  </Field>
                </div>
                <ListEditor
                  items={draft.skills.items}
                  onChange={(items) => patch({ skills: { ...draft.skills, items } })}
                  addLabel="Add skill"
                  makeNew={() => ({ icon: "sparkles", name: "New Skill", tag: "Tag", level: 50, color: "#5b5ee9" })}
                  renderItem={(s, _i, u) => (
                    <div className="grid gap-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Name">
                          <TextInput value={s.name} onChange={(e) => u({ name: e.target.value })} />
                        </Field>
                        <Field label="Tagline">
                          <TextInput value={s.tag} onChange={(e) => u({ tag: e.target.value })} />
                        </Field>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <Field label="Icon">
                          <IconSelect value={s.icon} onChange={(icon) => u({ icon })} />
                        </Field>
                        <Field label="Color">
                          <ColorInput value={s.color} onChange={(color) => u({ color })} />
                        </Field>
                        <Field label={`Level — ${s.level}%`}>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={s.level}
                            onChange={(e) => u({ level: Number(e.target.value) })}
                            className="mt-3 w-full"
                            style={{ accentColor: s.color }}
                          />
                        </Field>
                      </div>
                    </div>
                  )}
                />
              </div>
            )}

          {tab === "experience" &&
            section(
              <div className="flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Eyebrow">
                    <TextInput value={draft.experience.eyebrow} onChange={(e) => patch({ experience: { ...draft.experience, eyebrow: e.target.value } })} />
                  </Field>
                  <Field label="Section subtitle">
                    <TextInput value={draft.experience.sub} onChange={(e) => patch({ experience: { ...draft.experience, sub: e.target.value } })} />
                  </Field>
                </div>
                <ListEditor
                  items={draft.experience.items}
                  onChange={(items) => patch({ experience: { ...draft.experience, items } })}
                  addLabel="Add experience"
                  makeNew={() => ({ icon: "sparkles", period: "2026", role: "New Role", org: "Company", text: "Describe it…", tags: [] })}
                  renderItem={(t, _i, u) => (
                    <div className="grid gap-4">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <Field label="Period">
                          <TextInput value={t.period} onChange={(e) => u({ period: e.target.value })} />
                        </Field>
                        <Field label="Role">
                          <TextInput value={t.role} onChange={(e) => u({ role: e.target.value })} />
                        </Field>
                        <Field label="Organization">
                          <TextInput value={t.org} onChange={(e) => u({ org: e.target.value })} />
                        </Field>
                      </div>
                      <Field label="Description">
                        <TextArea value={t.text} onChange={(e) => u({ text: e.target.value })} />
                      </Field>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Icon">
                          <IconSelect value={t.icon} onChange={(icon) => u({ icon })} />
                        </Field>
                        <Field label="Tags (comma separated)">
                          <TextInput value={t.tags.join(", ")} onChange={(e) => u({ tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
                        </Field>
                      </div>
                    </div>
                  )}
                />
              </div>
            )}

          {tab === "contact" &&
            section(
              <div className="flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field label="Eyebrow">
                    <TextInput value={draft.contact.eyebrow} onChange={(e) => patch({ contact: { ...draft.contact, eyebrow: e.target.value } })} />
                  </Field>
                  <Field label="Heading line">
                    <TextInput value={draft.contact.headingA} onChange={(e) => patch({ contact: { ...draft.contact, headingA: e.target.value } })} />
                  </Field>
                  <Field label="Heading accent">
                    <TextInput value={draft.contact.headingAccent} onChange={(e) => patch({ contact: { ...draft.contact, headingAccent: e.target.value } })} />
                  </Field>
                </div>
                <Field label="Section subtitle">
                  <TextArea value={draft.contact.sub} onChange={(e) => patch({ contact: { ...draft.contact, sub: e.target.value } })} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field label="CTA note">
                    <TextInput value={draft.contact.ctaNote} onChange={(e) => patch({ contact: { ...draft.contact, ctaNote: e.target.value } })} />
                  </Field>
                  <Field label="CTA sub-line">
                    <TextInput value={draft.contact.ctaSub} onChange={(e) => patch({ contact: { ...draft.contact, ctaSub: e.target.value } })} />
                  </Field>
                  <Field label="CTA button label">
                    <TextInput value={draft.contact.ctaButton} onChange={(e) => patch({ contact: { ...draft.contact, ctaButton: e.target.value } })} />
                  </Field>
                </div>
                <ListEditor
                  items={draft.contact.channels}
                  onChange={(channels) => patch({ contact: { ...draft.contact, channels } })}
                  addLabel="Add channel"
                  makeNew={() => ({ icon: "globe", color: "#5b5ee9", name: "New Channel", handle: "@handle", href: "https://" })}
                  renderItem={(c, _i, u) => (
                    <div className="grid gap-4">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <Field label="Icon">
                          <IconSelect value={c.icon} onChange={(icon) => u({ icon })} />
                        </Field>
                        <Field label="Color">
                          <ColorInput value={c.color} onChange={(color) => u({ color })} />
                        </Field>
                        <Field label="Name">
                          <TextInput value={c.name} onChange={(e) => u({ name: e.target.value })} />
                        </Field>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Handle / display">
                          <TextInput value={c.handle} onChange={(e) => u({ handle: e.target.value })} />
                        </Field>
                        <Field label={c.icon === "whatsapp" ? "Link URL (WhatsApp: wa.me/92XXXXXXXXXX — bina 0/+)" : "Link URL"}>
                          <TextInput value={c.href} onChange={(e) => u({ href: e.target.value })} />
                        </Field>
                      </div>
                    </div>
                  )}
                />
              </div>
            )}

          {tab === "footer" &&
            section(
              <div className="flex flex-col gap-5">
                <Field label="Footer tagline">
                  <TextArea value={draft.footer.tagline} onChange={(e) => patch({ footer: { ...draft.footer, tagline: e.target.value } })} />
                </Field>
                <Field label="Copyright line">
                  <TextInput value={draft.footer.copyright} onChange={(e) => patch({ footer: { ...draft.footer, copyright: e.target.value } })} />
                </Field>
              </div>
            )}

          {tab === "security" && section(<SecurityTab onReset={resetDefaults} />)}
        </div>
      </div>

      {/* save bar */}
      <AnimatePresence>
        {(dirty || saveState !== "idle") && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4"
          >
            <div className="neu flex items-center gap-4 rounded-full py-3 pl-6 pr-3">
              <span className="text-sm font-medium text-neu-muted">
                {saveState === "saved" ? (
                  <span className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="size-4" /> Published successfully
                  </span>
                ) : saveState === "error" ? (
                  <span className="flex items-center gap-2 text-red-400">
                    <CircleAlert className="size-4" /> {notice ?? "Save failed"}
                  </span>
                ) : (
                  "You have unpublished changes"
                )}
              </span>
              <button
                onClick={doSave}
                disabled={saveState === "saving"}
                className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                {saveState === "saving" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Publish
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =============================== SECURITY TAB =============================== */

function SecurityTab({ onReset }: { onReset: () => void }) {
  const site = useSiteContent();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const valid = next.length >= 8 && /[a-zA-Z]/.test(next) && /\d/.test(next) && next === confirm;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      if (site.mode === "api") await api.changePassword(current, next);
      else await demoChangePassword(current, next);
      setMsg({ ok: true, text: "Password updated and stored as a hash." });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch {
      setMsg({ ok: false, text: "Current password is incorrect." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="font-display text-xl font-bold">Change admin password</h3>
        <p className="mt-1 text-sm text-neu-muted">
          {site.mode === "api"
            ? "PBKDF2-SHA256 (600,000 iterations) hash — stored in the database, never in plaintext."
            : "SHA-256 hash — stored in localStorage for demo mode."}
        </p>
        <form onSubmit={submit} className="mt-5 grid max-w-md gap-4">
          <Field label="Current password">
            <TextInput type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
          </Field>
          <Field label="New password (8+ chars, letters & digits)">
            <TextInput type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" required />
          </Field>
          <Field label="Confirm new password">
            <TextInput type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
          </Field>
          {next && !valid && (
            <p className="text-xs text-amber-500">
              Password must be 8+ chars with letters &amp; digits, and match the confirmation.
            </p>
          )}
          {msg && (
            <p className={cn("flex items-center gap-2 text-sm", msg.ok ? "text-green-500" : "text-red-400")}>
              {msg.ok ? <CheckCircle2 className="size-4" /> : <CircleAlert className="size-4" />} {msg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={!valid || busy}
            className="btn-primary inline-flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
            Update password
          </button>
        </form>
      </div>

      <div className="neu-inset-sm rounded-2xl p-5">
        <h4 className="font-display font-bold">Active protections</h4>
        <ul className="mt-3 grid gap-2 text-sm text-neu-muted sm:grid-cols-2">
          {site.mode === "api" ? (
            <>
              <li>• Passwords: PBKDF2-SHA256, 600k iterations</li>
              <li>• CSRF: per-session token + SameSite=Strict cookies</li>
              <li>• Brute force: 5 fails → exponential lockout (≤60 min)</li>
              <li>• Rate limiting: per-IP quotas + 429 responses</li>
              <li>• Sessions: idle 30 min / absolute 12 h, rotated on login</li>
              <li>• Audit log for every auth &amp; content event</li>
            </>
          ) : (
            <>
              <li>• Demo: SHA-256 hashed password (localStorage)</li>
              <li>• Demo: 5 fails → exponential lockout (≤60 min)</li>
              <li>• Demo: 30-min idle sessions</li>
              <li>• Deploy Flask for CSRF, audit logs &amp; server-side hashing</li>
            </>
          )}
        </ul>
      </div>

      <div>
        <h4 className="font-display font-bold">Danger zone</h4>
        <p className="mt-1 text-sm text-neu-muted">Restore factory content across the whole site.</p>
        <button onClick={onReset} className="press mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-red-400">
          <RotateCcw className="size-4" /> Reset to defaults
        </button>
      </div>
    </div>
  );
}
