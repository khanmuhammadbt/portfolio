import { Reveal, SectionHead } from "./ui";
import { cn } from "../utils/cn";
import { useLocalizedContent as useSiteContent } from "../store/content";
import { useLang } from "../store/lang";
import { getIcon } from "../lib/icons";

export default function Experience() {
  const { content } = useSiteContent();
  const { t } = useLang();
  const { experience } = content;

  return (
    <section id="experience" aria-labelledby="experience-title" className="relative px-5 py-20 sm:px-6 sm:py-28">
      <div className="glow absolute right-0 top-1/3 size-[28rem] rounded-full" />
      <div className="mx-auto max-w-6xl">
        <SectionHead
          id="experience-title"
          eyebrow={experience.eyebrow}
          title={
            <>
              {t.expTitlePre} <span className="text-neu-accent">{t.expTitleAccent}</span>
            </>
          }
          sub={experience.sub}
        />

        <div className="relative mx-auto mt-20 max-w-4xl">
          <div className="neu-inset-sm absolute bottom-4 left-[1.35rem] top-4 w-1.5 rounded-full md:left-1/2 md:-translate-x-1/2" />

          {experience.items.map((t, i) => {
            const left = i % 2 === 0;
            const Icon = getIcon(t.icon);
            return (
              <div key={`${t.role}-${i}`} className="relative mb-14 last:mb-0 md:grid md:grid-cols-[1fr_3.5rem_1fr]">
                <div className="absolute left-[1.35rem] top-2 -translate-x-1/2 md:left-1/2 md:top-3">
                  <Reveal delay={0.1}>
                    <span className="neu-sm grid size-10 place-items-center rounded-full" aria-hidden="true">
                      <span className="pulse-dot size-2.5 rounded-full bg-neu-accent" />
                    </span>
                  </Reveal>
                </div>

                <div className={cn("pl-16 md:pl-0", left ? "md:col-start-1 md:pr-2" : "md:col-start-3 md:pl-2")}>
                  <Reveal delay={0.15} y={44}>
                    <div className="neu neu-hover rounded-[1.8rem] p-7">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="neu-inset-sm flex items-center gap-2 rounded-full px-4 py-1.5 font-display text-xs font-bold uppercase tracking-[0.18em] text-neu-accent">
                          <Icon className="size-3.5" />
                          {t.period}
                        </span>
                        <span className="text-xs font-medium uppercase tracking-[0.16em] text-neu-muted">{t.org}</span>
                      </div>
                      <h3 className="mt-4 font-display text-2xl font-bold">{t.role}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-neu-muted">{t.text}</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {t.tags.map((tag) => (
                          <span key={tag} className="neu-xs rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-neu-muted">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
