import { ArrowUpRight, Lock } from "lucide-react";
import { Reveal, SectionHead } from "./ui";
import { useLocalizedContent as useSiteContent } from "../store/content";
import { getIcon } from "../lib/icons";

export default function Contact() {
  const { content } = useSiteContent();
  const { contact, brand } = content;

  const mailChannel = contact.channels.find((c) => c.icon === "mail") ?? contact.channels[contact.channels.length - 1];

  return (
    <>
      <section id="contact" aria-labelledby="contact-title" className="relative px-5 py-20 sm:px-6 sm:py-28">
        <div className="neu-inset absolute -left-20 bottom-16 size-64 rounded-full opacity-40" />
        <div className="mx-auto max-w-6xl">
          <SectionHead
            id="contact-title"
            eyebrow={contact.eyebrow}
            title={
              <>
                {contact.headingA}
                <br className="hidden sm:block" /> <span className="text-neu-accent">{contact.headingAccent}</span>
              </>
            }
            sub={contact.sub}
          />

          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {contact.channels.map((c, i) => {
              const Icon = getIcon(c.icon);
              return (
                <Reveal key={`${c.name}-${i}`} delay={(i % 3) * 0.1}>
                  <a
                    href={c.href}
                    target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    aria-label={`${c.name}: ${c.handle} (opens in a new tab)`}
                    className="neu neu-hover group flex items-center gap-4 rounded-[1.8rem] p-5 sm:p-6"
                  >
                    <span
                      className="neu-inset-sm grid size-14 shrink-0 place-items-center rounded-2xl transition-transform duration-500 group-hover:scale-110"
                      style={{ color: c.color }}
                      aria-hidden="true"
                    >
                      <Icon className="size-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-base font-bold">{c.name}</span>
                      <span className="block truncate text-sm text-neu-muted">{c.handle}</span>
                    </span>
                    <ArrowUpRight className="size-5 shrink-0 text-neu-muted transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-neu-accent" />
                  </a>
                </Reveal>
              );
            })}

            {/* CTA card */}
            <Reveal delay={0.2}>
              <div className="neu-inset flex h-full flex-col justify-between gap-6 rounded-[1.8rem] p-6">
                <p className="font-display text-lg font-bold leading-snug">
                  {contact.ctaNote}
                  <br />
                  <span className="text-neu-muted">{contact.ctaSub}</span>
                </p>
                <a
                  href={mailChannel?.href ?? "#contact"}
                  className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
                >
                  {contact.ctaButton}
                  <ArrowUpRight className="size-4" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="px-6 pb-10">
        <div className="neu mx-auto flex max-w-6xl flex-col items-center gap-6 rounded-[2.5rem] px-8 py-10">
          <span className="neu-inset-sm grid size-14 place-items-center rounded-full font-display text-lg font-bold text-neu-accent">
            {brand.initials}
          </span>
          <p className="max-w-md text-center text-sm leading-relaxed text-neu-muted">{content.footer.tagline}</p>
          <div className="neu-inset-sm h-1.5 w-40 rounded-full" />
          <div className="flex items-center gap-4">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-neu-muted">
              © {new Date().getFullYear()} {content.footer.copyright}
            </p>
            <a
              href="#/admin"
              aria-label="Admin panel"
              className="press grid size-8 place-items-center rounded-full text-neu-muted"
            >
              <Lock className="size-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
