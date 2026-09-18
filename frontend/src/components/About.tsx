import { Reveal, SectionHead } from "./ui";
const portrait = "/images/khan-portrait.jpg";
import { useLang } from "../store/lang";
import { useLocalizedContent as useSiteContent } from "../store/content";
import { getIcon } from "../lib/icons";

export default function About() {
  const { content } = useSiteContent();
  const { t } = useLang();
  const { about, services, hero, brand } = content;

  return (
    <section id="about" aria-labelledby="about-title" className="relative px-5 py-20 sm:px-6 sm:py-28">
      <div className="glow absolute left-1/2 top-0 size-[30rem] -translate-x-1/2 rounded-full" />
      <div className="mx-auto max-w-6xl">
        <SectionHead
          id="about-title"
          eyebrow={about.eyebrow}
          title={
            <>
              {about.headingA}
              <br className="hidden sm:block" /> <span className="text-neu-accent">{about.headingAccent}</span>
            </>
          }
        />

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          {/* portrait card */}
          <Reveal>
            <div className="relative mx-auto max-w-md">
              <div className="neu-lg rounded-[2.5rem] p-5">
                <div className="neu-inset-sm overflow-hidden rounded-[1.8rem]">
                  <img
                    src={hero.portraitUrl?.trim() ? hero.portraitUrl : portrait}
                    alt={`${brand.name} — ${hero.role}`}
                    width={420}
                    height={462}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/4.4] w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between px-3 pb-2 pt-5">
                  <div>
                    <p className="font-display text-lg font-bold">{brand.name}</p>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-neu-muted">{hero.role}</p>
                  </div>
                  <span className="neu-inset-sm grid size-11 place-items-center rounded-full font-display text-sm font-bold text-neu-accent">
                    {brand.initials}
                  </span>
                </div>
              </div>

              <div className="animate-floaty absolute -right-4 -top-6 sm:-right-8">
                <div className="neu-sm flex items-center gap-3 rounded-2xl px-5 py-3.5">
                  <span className="font-display text-3xl font-bold text-neu-accent">
                    {hero.yearsBadge.split(" ")[0]}
                  </span>
                  <span className="text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-neu-muted">
                    {t.aboutYearsA}
                    <br />
                    {t.aboutYearsB}
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* copy */}
          <div>
            <Reveal delay={0.1}>
              <p className="text-lg leading-relaxed text-neu-muted">{about.bio1}</p>
              <p className="mt-4 leading-relaxed text-neu-muted">{about.bio2}</p>
            </Reveal>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {about.facts.map((f, i) => {
                const Icon = getIcon(f.icon);
                return (
                  <Reveal key={`${f.label}-${i}`} delay={0.12 + i * 0.06}>
                    <div className="neu-sm neu-hover flex items-center gap-4 rounded-2xl px-5 py-4">
                      <span className="neu-inset-sm grid size-10 shrink-0 place-items-center rounded-full text-neu-accent" aria-hidden="true">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neu-muted">{f.label}</p>
                        <p className="truncate text-sm font-semibold">{f.value}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>

        {/* services */}
        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {services.map((s, i) => {
            const Icon = getIcon(s.icon);
            return (
              <Reveal key={`${s.title}-${i}`} delay={i * 0.12}>
                <div className="neu neu-hover group h-full rounded-[2rem] p-8">
                  <span className="neu-inset-sm grid size-14 place-items-center rounded-2xl" style={{ color: s.color }} aria-hidden="true">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-6 font-display text-xl font-bold">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-neu-muted">{s.text}</p>
                  <span className="mt-6 block h-1.5 w-full overflow-hidden rounded-full neu-inset-sm">
                    <span
                      className="block h-full w-1/3 rounded-full transition-all duration-700 group-hover:w-full"
                      style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }}
                    />
                  </span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
