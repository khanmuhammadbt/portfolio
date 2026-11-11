import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, CircleAlert, Eye, EyeOff, KeyRound, Loader2, Lock, LogOut, Moon, RotateCcw, Save, ShieldCheck, Sun, } from "lucide-react";
import { useSiteContent } from "../store/content";
import { ApiError } from "../lib/api";
import { authService } from "../features/auth/authService";
import { BadCredentialsError, LockedError, demoChangePassword, demoLogin, demoLockRemaining, demoLogout, demoSession } from "./demoAuth";
import { DEFAULT_CONTENT } from "../lib/content";
import { ColorInput, Field, IconSelect, ImageUpload, ListEditor, NumInput, TextArea, TextInput, inputCls } from "./fields";
import { cn } from "../utils/cn";
import BlogEditor from "./BlogEditor";
const clone = (v) => JSON.parse(JSON.stringify(v));
const TABS = [
    { id: "hero", label: "Hero" },
    { id: "stats", label: "Stats" },
    { id: "marquee", label: "Marquee" },
    { id: "about", label: "About" },
    { id: "services", label: "Services" },
    { id: "skills", label: "Skills" },
    { id: "experience", label: "Experience" },
    { id: "blog", label: "Blog" },
    { id: "contact", label: "Contact" },
    { id: "footer", label: "Footer" },
    { id: "security", label: "Security" },
];
/* =============================== LOGIN =============================== */
function Login({ onSuccess }) {
    const { mode, ready } = useSiteContent();
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState(null);
    const [lockSecs, setLockSecs] = useState(() => demoLockRemaining());
    const [busy, setBusy] = useState(false);
    // prefetch CSRF token + anonymous session for the real backend
    useEffect(() => {
        if (ready && mode === "api")
            authService.csrf().catch(() => undefined);
    }, [ready, mode]);
    useEffect(() => {
        if (lockSecs <= 0)
            return;
        const t = setInterval(() => setLockSecs((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(t);
    }, [lockSecs]);
    const submit = async (e) => {
        e.preventDefault();
        if (busy || lockSecs > 0)
            return;
        if (mode !== "api") {
            setError("Admin demo mode is disabled. Start the Flask backend and sign in again.");
            setPassword("");
            return;
        }
        setBusy(true);
        setError(null);
        try {
            const admin = await authService.login(username.trim(), password);
            onSuccess(admin.username);
        }
        catch (err) {
            if (err instanceof LockedError)
                setLockSecs(err.retryAfter);
            else if (err instanceof ApiError) {
                if (err.status === 423 && err.retryAfter)
                    setLockSecs(err.retryAfter);
                else if (err.status === 429)
                    setError("Too many requests — slow down.");
                else
                    setError("Invalid credentials");
            }
            else if (err instanceof BadCredentialsError)
                setError("Invalid credentials");
            else
                setError("Something went wrong — try again.");
            setPassword("");
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsxs("div", { className: "flex min-h-screen items-center justify-center px-6 py-16", children: [_jsx("div", { className: "glow absolute left-1/2 top-1/3 size-[32rem] -translate-x-1/2 rounded-full" }), _jsxs(motion.div, { initial: { opacity: 0, y: 40, scale: 0.96 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }, className: "neu-lg relative w-full max-w-md rounded-[2.2rem] p-8 sm:p-10", children: [_jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx("span", { className: "neu-inset-sm grid size-16 place-items-center rounded-full text-neu-accent", children: _jsx(ShieldCheck, { className: "size-7" }) }), _jsx("h1", { className: "mt-6 font-display text-2xl font-bold", children: "Admin Console" }), _jsx("p", { className: "mt-2 text-sm text-neu-muted", children: mode === "api" ? (_jsx(_Fragment, { children: "Secured by the Flask backend \u2014 hashed passwords, CSRF tokens & brute-force lockouts." })) : (_jsx(_Fragment, { children: "Backend unavailable — start the Flask server to access the admin console." })) })] }), _jsx(AnimatePresence, { children: lockSecs > 0 && (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: "auto" }, exit: { opacity: 0, height: 0 }, className: "overflow-hidden", children: _jsxs("div", { className: "mt-6 flex items-center gap-3 rounded-2xl p-4 text-sm", style: { background: "color-mix(in srgb, #ef4444 10%, transparent)", color: "#ef4444" }, children: [_jsx(Lock, { className: "size-4 shrink-0" }), _jsxs("span", { children: ["Brute-force lockout active. Retry in ", _jsxs("b", { className: "font-mono", children: [lockSecs, "s"] }), " (delay doubles each round \u2014 max 60 min)."] })] }) })) }), _jsxs("form", { onSubmit: submit, className: "mt-7 flex flex-col gap-4", children: [_jsx(Field, { label: "Username", children: _jsx(TextInput, { value: username, onChange: (e) => setUsername(e.target.value), autoComplete: "username", required: true }) }), _jsx(Field, { label: "Password", children: _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPass ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "current-password", required: true, className: `${inputCls} pr-12` }), _jsx("button", { type: "button", onClick: () => setShowPass((v) => !v), "aria-label": "Toggle password visibility", className: "absolute right-3 top-1/2 -translate-y-1/2 text-neu-muted transition-colors hover:text-neu-accent", children: showPass ? _jsx(EyeOff, { className: "size-4.5" }) : _jsx(Eye, { className: "size-4.5" }) })] }) }), error && (_jsxs("p", { className: "flex items-center gap-2 text-sm text-red-400", children: [_jsx(CircleAlert, { className: "size-4" }), " ", error] })), _jsxs("button", { type: "submit", disabled: busy || lockSecs > 0, className: "btn-primary mt-2 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50", children: [busy ? _jsx(Loader2, { className: "size-4 animate-spin" }) : _jsx(KeyRound, { className: "size-4" }), busy ? "Verifying…" : "Sign In"] })] }), _jsxs("a", { href: "/", className: "mt-6 flex items-center justify-center gap-2 text-sm text-neu-muted transition-colors hover:text-neu-accent", children: [_jsx(ArrowLeft, { className: "size-4" }), " Back to website"] })] })] }));
}
/* =============================== DASHBOARD =============================== */
export default function AdminApp({ dark, onToggle }) {
    const site = useSiteContent();
    const [admin, setAdmin] = useState(null);
    const [draft, setDraft] = useState(null);
    const [tab, setTab] = useState("hero");
    const [saveState, setSaveState] = useState("idle");
    const [notice, setNotice] = useState(null);
    // restore existing session
    useEffect(() => {
        if (!site.ready)
            return;
        if (site.mode === "api")
            authService.me().then((u) => u && setAdmin(u.username));
        else {
            const s = demoSession();
            if (s)
                setAdmin(s.username);
        }
    }, [site.ready, site.mode]);
    useEffect(() => {
        if (admin && !draft)
            setDraft(clone(site.content));
    }, [admin, site.content, draft]);
    const dirty = useMemo(() => draft && JSON.stringify(draft) !== JSON.stringify(site.content), [draft, site.content]);
    if (!site.ready) {
        return (_jsx("div", { className: "grid min-h-screen place-items-center", children: _jsx(Loader2, { className: "size-8 animate-spin text-neu-accent" }) }));
    }
    if (!admin)
        return _jsx(Login, { onSuccess: setAdmin });
    if (!draft)
        return null;
    const patch = (p) => {
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
        }
        catch (e) {
            setSaveState("error");
            setNotice(e instanceof ApiError ? `${e.status}: ${e.message}` : "Save failed");
        }
    };
    const logout = async () => {
        if (site.mode === "api")
            await authService.logout().catch(() => undefined);
        else
            demoLogout();
        setAdmin(null);
        setDraft(null);
    };
    const resetDefaults = async () => {
        if (!confirm("Reset the ENTIRE website back to factory content? This cannot be undone."))
            return;
        const fresh = clone(DEFAULT_CONTENT);
        setDraft(fresh);
        await site.save(fresh);
        setSaveState("saved");
    };
    const section = (node) => (_jsx("div", { className: "neu rounded-[2rem] p-6 sm:p-8", children: node }));
    return (_jsxs("div", { className: "relative min-h-screen px-4 pb-32 pt-6 sm:px-6", children: [_jsx("div", { className: "glow absolute right-0 top-0 size-[30rem] rounded-full" }), _jsxs("header", { className: "neu-sm mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-3xl px-5 py-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "neu-inset-sm grid size-10 place-items-center rounded-full text-neu-accent", children: _jsx(ShieldCheck, { className: "size-4.5" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-display text-sm font-bold leading-tight", children: "Admin Console" }), _jsx("p", { className: "text-[11px] uppercase tracking-[0.16em] text-neu-muted", children: admin })]     }), _jsx("span", { className: cn("neu-inset-sm rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]", site.mode === "api" ? "text-green-500" : "text-amber-500"), children: site.mode === "api" ? "Flask backend" : "Backend required" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("a", { href: "/", className: "press inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-neu-muted", children: [_jsx(Eye, { className: "size-3.5" }), " View site"] }), _jsx("button", { onClick: onToggle, "aria-label": "Toggle theme", className: "press grid size-9 place-items-center rounded-full text-neu-muted", children: dark ? _jsx(Sun, { className: "size-4" }) : _jsx(Moon, { className: "size-4" }) }), _jsx("button", { onClick: logout, "aria-label": "Logout", className: "press grid size-9 place-items-center rounded-full text-red-400", children: _jsx(LogOut, { className: "size-4" }) })] })] }), _jsxs("div", { className: "mx-auto mt-6 grid max-w-7xl gap-6 lg:grid-cols-[13rem_1fr]", children: [_jsx("nav", { className: "neu-sm flex gap-2 overflow-x-auto rounded-3xl p-3 lg:h-fit lg:flex-col", children: TABS.map((t) => (_jsx("button", { onClick: () => setTab(t.id), className: cn("whitespace-nowrap rounded-2xl px-4 py-2.5 text-left text-sm font-semibold transition-all duration-300 lg:w-full", tab === t.id
                                ? "neu-inset-sm text-neu-accent"
                                : "press text-neu-muted"), children: t.label }, t.id))) }), _jsxs("div", { className: "min-w-0", children: [tab === "blog" && _jsx(BlogEditor, { posts: draft.blogPosts, onChange: (blogPosts) => patch({ blogPosts }) }), tab === "hero" &&
                                section(_jsxs("div", { className: "grid gap-5 sm:grid-cols-2", children: [_jsx(Field, { label: "Brand initials (logo)", children: _jsx(TextInput, { value: draft.brand.initials, onChange: (e) => patch({ brand: { ...draft.brand, initials: e.target.value } }) }) }), _jsx(Field, { label: "Brand name", children: _jsx(TextInput, { value: draft.brand.name, onChange: (e) => patch({ brand: { ...draft.brand, name: e.target.value } }) }) }), _jsx(Field, { label: "Availability badge", children: _jsx(TextInput, { value: draft.hero.availability, onChange: (e) => patch({ hero: { ...draft.hero, availability: e.target.value } }) }) }), _jsx(Field, { label: "Role", children: _jsx(TextInput, { value: draft.hero.role, onChange: (e) => patch({ hero: { ...draft.hero, role: e.target.value } }) }) }), _jsx(Field, { label: "First name (big)", children: _jsx(TextInput, { value: draft.hero.firstName, onChange: (e) => patch({ hero: { ...draft.hero, firstName: e.target.value } }) }) }), _jsx(Field, { label: "Last name (outlined)", children: _jsx(TextInput, { value: draft.hero.lastName, onChange: (e) => patch({ hero: { ...draft.hero, lastName: e.target.value } }) }) }), _jsx(Field, { label: "Experience badge", children: _jsx(TextInput, { value: draft.hero.yearsBadge, onChange: (e) => patch({ hero: { ...draft.hero, yearsBadge: e.target.value } }) }) }), _jsx("div", { className: "sm:col-span-2", children: _jsx(Field, { label: "Portrait image (Hero + About dono me use hoti hai)", children: _jsx(ImageUpload, { value: draft.hero.portraitUrl ?? "", onChange: (portraitUrl) => patch({ hero: { ...draft.hero, portraitUrl } }), fallbackLabel: "Built-in photo" }) }) }), _jsx("div", { className: "sm:col-span-2", children: _jsx(Field, { label: "Intro paragraph", children: _jsx(TextArea, { value: draft.hero.intro, onChange: (e) => patch({ hero: { ...draft.hero, intro: e.target.value } }) }) }) }), _jsx(Field, { label: "Primary button label", children: _jsx(TextInput, { value: draft.hero.primaryCta, onChange: (e) => patch({ hero: { ...draft.hero, primaryCta: e.target.value } }) }) }), _jsx(Field, { label: "Secondary button label", children: _jsx(TextInput, { value: draft.hero.secondaryCta, onChange: (e) => patch({ hero: { ...draft.hero, secondaryCta: e.target.value } }) }) })] })), tab === "stats" &&
                                section(_jsx(ListEditor, { items: draft.stats, onChange: (stats) => patch({ stats }), addLabel: "Add stat", makeNew: () => ({ value: 10, suffix: "+", label: "New Stat" }), renderItem: (s, _i, u) => (_jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [_jsx(Field, { label: "Value", children: _jsx(NumInput, { value: s.value, onChange: (e) => u({ value: Number(e.target.value) }) }) }), _jsx(Field, { label: "Suffix", children: _jsx(TextInput, { value: s.suffix, onChange: (e) => u({ suffix: e.target.value }) }) }), _jsx(Field, { label: "Label", children: _jsx(TextInput, { value: s.label, onChange: (e) => u({ label: e.target.value }) }) })] })) })), tab === "marquee" &&
                                section(_jsx(Field, { label: "Ticker items (comma separated)", children: _jsx(TextArea, { value: draft.marquee.join(", "), onChange: (e) => patch({ marquee: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }) }) })), tab === "about" &&
                                section(_jsxs("div", { className: "flex flex-col gap-5", children: [_jsxs("div", { className: "grid gap-5 sm:grid-cols-3", children: [_jsx(Field, { label: "Eyebrow", children: _jsx(TextInput, { value: draft.about.eyebrow, onChange: (e) => patch({ about: { ...draft.about, eyebrow: e.target.value } }) }) }), _jsx(Field, { label: "Heading line", children: _jsx(TextInput, { value: draft.about.headingA, onChange: (e) => patch({ about: { ...draft.about, headingA: e.target.value } }) }) }), _jsx(Field, { label: "Heading accent", children: _jsx(TextInput, { value: draft.about.headingAccent, onChange: (e) => patch({ about: { ...draft.about, headingAccent: e.target.value } }) }) })] }), _jsx(Field, { label: "Bio paragraph 1", children: _jsx(TextArea, { value: draft.about.bio1, onChange: (e) => patch({ about: { ...draft.about, bio1: e.target.value } }) }) }), _jsx(Field, { label: "Bio paragraph 2", children: _jsx(TextArea, { value: draft.about.bio2, onChange: (e) => patch({ about: { ...draft.about, bio2: e.target.value } }) }) }), _jsx(ListEditor, { items: draft.about.facts, onChange: (facts) => patch({ about: { ...draft.about, facts } }), addLabel: "Add fact", makeNew: () => ({ icon: "sparkles", label: "Label", value: "Value" }), renderItem: (f, _i, u) => (_jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [_jsx(Field, { label: "Icon", children: _jsx(IconSelect, { value: f.icon, onChange: (icon) => u({ icon }) }) }), _jsx(Field, { label: "Label", children: _jsx(TextInput, { value: f.label, onChange: (e) => u({ label: e.target.value }) }) }), _jsx(Field, { label: "Value", children: _jsx(TextInput, { value: f.value, onChange: (e) => u({ value: e.target.value }) }) })] })) })] })), tab === "services" &&
                                section(_jsx(ListEditor, { items: draft.services, onChange: (services) => patch({ services }), addLabel: "Add service", makeNew: () => ({ icon: "sparkles", color: "#5b5ee9", title: "New Service", text: "Describe it…" }), renderItem: (s, _i, u) => (_jsxs("div", { className: "grid gap-4", children: [_jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [_jsx(Field, { label: "Icon", children: _jsx(IconSelect, { value: s.icon, onChange: (icon) => u({ icon }) }) }), _jsx(Field, { label: "Accent color", children: _jsx(ColorInput, { value: s.color, onChange: (color) => u({ color }) }) }), _jsx(Field, { label: "Title", children: _jsx(TextInput, { value: s.title, onChange: (e) => u({ title: e.target.value }) }) })] }), _jsx(Field, { label: "Description", children: _jsx(TextArea, { value: s.text, onChange: (e) => u({ text: e.target.value }) }) })] })) })), tab === "skills" &&
                                section(_jsxs("div", { className: "flex flex-col gap-5", children: [_jsxs("div", { className: "grid gap-5 sm:grid-cols-2", children: [_jsx(Field, { label: "Eyebrow", children: _jsx(TextInput, { value: draft.skills.eyebrow, onChange: (e) => patch({ skills: { ...draft.skills, eyebrow: e.target.value } }) }) }), _jsx(Field, { label: "Section subtitle", children: _jsx(TextInput, { value: draft.skills.sub, onChange: (e) => patch({ skills: { ...draft.skills, sub: e.target.value } }) }) })] }), _jsx(ListEditor, { items: draft.skills.items, onChange: (items) => patch({ skills: { ...draft.skills, items } }), addLabel: "Add skill", makeNew: () => ({ icon: "sparkles", name: "New Skill", tag: "Tag", level: 50, color: "#5b5ee9" }), renderItem: (s, _i, u) => (_jsxs("div", { className: "grid gap-4", children: [_jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "Name", children: _jsx(TextInput, { value: s.name, onChange: (e) => u({ name: e.target.value }) }) }), _jsx(Field, { label: "Tagline", children: _jsx(TextInput, { value: s.tag, onChange: (e) => u({ tag: e.target.value }) }) })] }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [_jsx(Field, { label: "Icon", children: _jsx(IconSelect, { value: s.icon, onChange: (icon) => u({ icon }) }) }), _jsx(Field, { label: "Color", children: _jsx(ColorInput, { value: s.color, onChange: (color) => u({ color }) }) }), _jsx(Field, { label: `Level — ${s.level}%`, children: _jsx("input", { type: "range", min: 0, max: 100, value: s.level, onChange: (e) => u({ level: Number(e.target.value) }), className: "mt-3 w-full", style: { accentColor: s.color } }) })] })] })) })] })), tab === "experience" &&
                                section(_jsxs("div", { className: "flex flex-col gap-5", children: [_jsxs("div", { className: "grid gap-5 sm:grid-cols-2", children: [_jsx(Field, { label: "Eyebrow", children: _jsx(TextInput, { value: draft.experience.eyebrow, onChange: (e) => patch({ experience: { ...draft.experience, eyebrow: e.target.value } }) }) }), _jsx(Field, { label: "Section subtitle", children: _jsx(TextInput, { value: draft.experience.sub, onChange: (e) => patch({ experience: { ...draft.experience, sub: e.target.value } }) }) })] }), _jsx(ListEditor, { items: draft.experience.items, onChange: (items) => patch({ experience: { ...draft.experience, items } }), addLabel: "Add experience", makeNew: () => ({ icon: "sparkles", period: "2026", role: "New Role", org: "Company", text: "Describe it…", tags: [] }), renderItem: (t, _i, u) => (_jsxs("div", { className: "grid gap-4", children: [_jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [_jsx(Field, { label: "Period", children: _jsx(TextInput, { value: t.period, onChange: (e) => u({ period: e.target.value }) }) }), _jsx(Field, { label: "Role", children: _jsx(TextInput, { value: t.role, onChange: (e) => u({ role: e.target.value }) }) }), _jsx(Field, { label: "Organization", children: _jsx(TextInput, { value: t.org, onChange: (e) => u({ org: e.target.value }) }) })] }), _jsx(Field, { label: "Description", children: _jsx(TextArea, { value: t.text, onChange: (e) => u({ text: e.target.value }) }) }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "Icon", children: _jsx(IconSelect, { value: t.icon, onChange: (icon) => u({ icon }) }) }), _jsx(Field, { label: "Tags (comma separated)", children: _jsx(TextInput, { value: t.tags.join(", "), onChange: (e) => u({ tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }) }) })] })] })) })] })), tab === "contact" &&
                                section(_jsxs("div", { className: "flex flex-col gap-5", children: [_jsxs("div", { className: "grid gap-5 sm:grid-cols-3", children: [_jsx(Field, { label: "Eyebrow", children: _jsx(TextInput, { value: draft.contact.eyebrow, onChange: (e) => patch({ contact: { ...draft.contact, eyebrow: e.target.value } }) }) }), _jsx(Field, { label: "Heading line", children: _jsx(TextInput, { value: draft.contact.headingA, onChange: (e) => patch({ contact: { ...draft.contact, headingA: e.target.value } }) }) }), _jsx(Field, { label: "Heading accent", children: _jsx(TextInput, { value: draft.contact.headingAccent, onChange: (e) => patch({ contact: { ...draft.contact, headingAccent: e.target.value } }) }) })] }), _jsx(Field, { label: "Section subtitle", children: _jsx(TextArea, { value: draft.contact.sub, onChange: (e) => patch({ contact: { ...draft.contact, sub: e.target.value } }) }) }), _jsxs("div", { className: "grid gap-5 sm:grid-cols-3", children: [_jsx(Field, { label: "CTA note", children: _jsx(TextInput, { value: draft.contact.ctaNote, onChange: (e) => patch({ contact: { ...draft.contact, ctaNote: e.target.value } }) }) }), _jsx(Field, { label: "CTA sub-line", children: _jsx(TextInput, { value: draft.contact.ctaSub, onChange: (e) => patch({ contact: { ...draft.contact, ctaSub: e.target.value } }) }) }), _jsx(Field, { label: "CTA button label", children: _jsx(TextInput, { value: draft.contact.ctaButton, onChange: (e) => patch({ contact: { ...draft.contact, ctaButton: e.target.value } }) }) })] }), _jsx(ListEditor, { items: draft.contact.channels, onChange: (channels) => patch({ contact: { ...draft.contact, channels } }), addLabel: "Add channel", makeNew: () => ({ icon: "globe", color: "#5b5ee9", name: "New Channel", handle: "@handle", href: "https://" }), renderItem: (c, _i, u) => (_jsxs("div", { className: "grid gap-4", children: [_jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [_jsx(Field, { label: "Icon", children: _jsx(IconSelect, { value: c.icon, onChange: (icon) => u({ icon }) }) }), _jsx(Field, { label: "Color", children: _jsx(ColorInput, { value: c.color, onChange: (color) => u({ color }) }) }), _jsx(Field, { label: "Name", children: _jsx(TextInput, { value: c.name, onChange: (e) => u({ name: e.target.value }) }) })] }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "Handle / display", children: _jsx(TextInput, { value: c.handle, onChange: (e) => u({ handle: e.target.value }) }) }), _jsx(Field, { label: c.icon === "whatsapp" ? "Link URL (WhatsApp: wa.me/92XXXXXXXXXX — bina 0/+)" : "Link URL", children: _jsx(TextInput, { value: c.href, onChange: (e) => u({ href: e.target.value }) }) })] })] })) })] })), tab === "footer" &&
                                section(_jsxs("div", { className: "flex flex-col gap-5", children: [_jsx(Field, { label: "Footer tagline", children: _jsx(TextArea, { value: draft.footer.tagline, onChange: (e) => patch({ footer: { ...draft.footer, tagline: e.target.value } }) }) }), _jsx(Field, { label: "Copyright line", children: _jsx(TextInput, { value: draft.footer.copyright, onChange: (e) => patch({ footer: { ...draft.footer, copyright: e.target.value } }) }) })] })), tab === "security" && section(_jsx(SecurityTab, { onReset: resetDefaults }))] })] }), _jsx(AnimatePresence, { children: (dirty || saveState !== "idle") && (_jsx(motion.div, { initial: { opacity: 0, y: 60 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 60 }, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }, className: "fixed inset-x-0 bottom-6 z-40 flex justify-center px-4", children: _jsxs("div", { className: "neu flex items-center gap-4 rounded-full py-3 pl-6 pr-3", children: [_jsx("span", { className: "text-sm font-medium text-neu-muted", children: saveState === "saved" ? (_jsxs("span", { className: "flex items-center gap-2 text-green-500", children: [_jsx(CheckCircle2, { className: "size-4" }), " Published successfully"] })) : saveState === "error" ? (_jsxs("span", { className: "flex items-center gap-2 text-red-400", children: [_jsx(CircleAlert, { className: "size-4" }), " ", notice ?? "Save failed"] })) : ("You have unpublished changes") }), _jsxs("button", { onClick: doSave, disabled: saveState === "saving", className: "btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60", children: [saveState === "saving" ? _jsx(Loader2, { className: "size-4 animate-spin" }) : _jsx(Save, { className: "size-4" }), "Publish"] })] }) })) })] }));
}
/* =============================== SECURITY TAB =============================== */
function SecurityTab({ onReset }) {
    const site = useSiteContent();
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [msg, setMsg] = useState(null);
    const [busy, setBusy] = useState(false);
    const valid = next.length >= 8 && /[a-zA-Z]/.test(next) && /\d/.test(next) && next === confirm;
    const submit = async (e) => {
        e.preventDefault();
        if (!valid || busy)
            return;
        setBusy(true);
        setMsg(null);
        try {
            if (site.mode === "api")
                await authService.changePassword(current, next);
            else
                await demoChangePassword(current, next);
            setMsg({ ok: true, text: "Password updated and stored as a hash." });
            setCurrent("");
            setNext("");
            setConfirm("");
        }
        catch {
            setMsg({ ok: false, text: "Current password is incorrect." });
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsxs("div", { className: "flex flex-col gap-8", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-display text-xl font-bold", children: "Change admin password" }), _jsx("p", { className: "mt-1 text-sm text-neu-muted", children: site.mode === "api"
                            ? "PBKDF2-SHA256 (600,000 iterations) hash — stored in the database, never in plaintext."
                            : "Backend required — demo mode has been disabled." }), _jsxs("form", { onSubmit: submit, className: "mt-5 grid max-w-md gap-4", children: [_jsx(Field, { label: "Current password", children: _jsx(TextInput, { type: "password", value: current, onChange: (e) => setCurrent(e.target.value), autoComplete: "current-password", required: true }) }), _jsx(Field, { label: "New password (8+ chars, letters & digits)", children: _jsx(TextInput, { type: "password", value: next, onChange: (e) => setNext(e.target.value), autoComplete: "new-password", required: true }) }), _jsx(Field, { label: "Confirm new password", children: _jsx(TextInput, { type: "password", value: confirm, onChange: (e) => setConfirm(e.target.value), autoComplete: "new-password", required: true }) }), next && !valid && (_jsx("p", { className: "text-xs text-amber-500", children: "Password must be 8+ chars with letters & digits, and match the confirmation." })), msg && (_jsxs("p", { className: cn("flex items-center gap-2 text-sm", msg.ok ? "text-green-500" : "text-red-400"), children: [msg.ok ? _jsx(CheckCircle2, { className: "size-4" }) : _jsx(CircleAlert, { className: "size-4" }), " ", msg.text] })), _jsxs("button", { type: "submit", disabled: !valid || busy, className: "btn-primary inline-flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50", children: [busy ? _jsx(Loader2, { className: "size-4 animate-spin" }) : _jsx(KeyRound, { className: "size-4" }), "Update password"] })] })] }), _jsxs("div", { className: "neu-inset-sm rounded-2xl p-5", children: [_jsx("h4", { className: "font-display font-bold", children: "Active protections" }), _jsx("ul", { className: "mt-3 grid gap-2 text-sm text-neu-muted sm:grid-cols-2", children: site.mode === "api" ? (_jsxs(_Fragment, { children: [_jsx("li", { children: "\u2022 Passwords: PBKDF2-SHA256, 600k iterations" }), _jsx("li", { children: "\u2022 CSRF: per-session token + SameSite=Strict cookies" }), _jsx("li", { children: "\u2022 Brute force: 5 fails \u2192 exponential lockout (\u226460 min)" }), _jsx("li", { children: "\u2022 Rate limiting: per-IP quotas + 429 responses" }), _jsx("li", { children: "\u2022 Sessions: idle 30 min / absolute 12 h, rotated on login" }), _jsx("li", { children: "\u2022 Audit log for every auth & content event" })] })) : (_jsxs(_Fragment, { children: [_jsx("li", { children: "\u2022 Backend required for admin access" }), _jsx("li", { children: "\u2022 Demo mode has been disabled for security" }), _jsx("li", { children: "\u2022 Start Flask to restore CSRF, hashing & session protections" })] })) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-display font-bold", children: "Danger zone" }), _jsx("p", { className: "mt-1 text-sm text-neu-muted", children: "Restore factory content across the whole site." }), _jsxs("button", { onClick: onReset, className: "press mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-red-400", children: [_jsx(RotateCcw, { className: "size-4" }), " Reset to defaults"] })] })] }));
}
