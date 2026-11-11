import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Languages, Moon, Sun, Menu, X, ArrowUpRight } from "lucide-react";
import { cn } from "../utils/cn";
import { useLocalizedContent as useSiteContent } from "../store/content";
import { useLang } from "../store/lang";
import { getTheme } from "../lib/themes";
import { useThemeStyle } from "../store/theme";

const LINK_HREFS = ["#about", "#skills", "#experience", "#contact", "#/blog"];

export default function Navbar({ dark, onToggle }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { content } = useSiteContent();
  const { t, lang, toggle } = useLang();
  const { theme } = useThemeStyle();
  const canToggleColorMode = getTheme(theme).colorModes.length > 1;
  const links = [
    { label: t.navAbout, href: LINK_HREFS[0] },
    { label: t.navSkills, href: LINK_HREFS[1] },
    { label: t.navExperience, href: LINK_HREFS[2] },
    { label: t.navContact, href: LINK_HREFS[3] },
    { label: t.navBlog, href: LINK_HREFS[4] },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-40 px-4 sm:top-5 sm:px-6">
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full p-2 pl-3 transition-[box-shadow] duration-500",
          scrolled ? "neu-inset-sm" : "neu-sm",
        )}
      >
        <a href="#home" className="group flex items-center gap-3">
          <span className="neu-inset-sm grid size-10 place-items-center rounded-full font-display text-sm font-bold text-neu-accent transition-transform duration-300 group-active:scale-90">
            {content.brand.initials}
          </span>
          <span className="hidden font-display text-sm font-semibold tracking-wide sm:block">
            {content.brand.name}
            <span className="text-neu-accent">.</span>
          </span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="press block rounded-full px-4 py-2 text-sm font-medium text-neu-muted"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label={lang === "en" ? "اردو میں دیکھیں" : "View in English"}
            className="press inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold text-neu-muted"
          >
            <Languages className="size-4" />
            <motion.span
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={lang === "en" ? "font-display" : "text-[13px]"}
              key={lang}
            >
              {lang === "en" ? "اردو" : "EN"}
            </motion.span>
          </button>
          {canToggleColorMode && (
            <button
              onClick={onToggle}
              aria-label="Toggle theme"
              className="press grid size-10 place-items-center rounded-full text-neu-muted"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="grid place-items-center"
                  key={dark ? "sun" : "moon"}
                >
                  {dark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
                </motion.span>
              </AnimatePresence>
            </button>
          )}
          <a
            href="#contact"
            className="btn-primary hidden items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold lg:inline-flex"
          >
            {t.hireMe}
            <ArrowUpRight className="size-4" />
          </a>
          <button
            onClick={() => setOpen((value) => !value)}
            aria-label="Menu"
            className="press grid size-10 place-items-center rounded-full text-neu-muted lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="neu mx-auto mt-3 max-w-6xl rounded-3xl p-3 lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="press block rounded-2xl px-5 py-3 text-sm font-medium text-neu-muted"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contact"
                  className="btn-primary mt-1 flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
                >
                  {t.hireMe}
                  <ArrowUpRight className="size-4" />
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
