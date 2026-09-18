import { motion } from "framer-motion";
import { Reveal, SectionHead } from "./ui";
import { useLocalizedContent as useSiteContent } from "../store/content";
import { useLang } from "../store/lang";
import { getIcon } from "../lib/icons";

export default function Skills() {
  const { content } = useSiteContent();
  const { t } = useLang();
  const { skills } = content;

  return (
    <section id="skills" aria-labelledby="skills-title" className="relative px-5 py-20 sm:px-6 sm:py-28">
      <div className="neu-inset absolute left-[-6rem] top-1/3 size-72 rounded-full opacity-40" />
      <div className="mx-auto max-w-6xl">
        <SectionHead
          id="skills-title"
          eyebrow={skills.eyebrow}
          title={
            <>
              {t.skillsTitlePre} <span className="text-neu-accent">{t.skillsTitleAccent}</span> {t.skillsTitlePost}
            </>
          }
          sub={skills.sub}
        />

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {skills.items.map((s, i) => {
            const Icon = getIcon(s.icon);
            return (
              <Reveal key={`${s.name}-${i}`} delay={(i % 4) * 0.1}>
                <div className="neu neu-hover group h-full rounded-[1.8rem] p-6">
                  <div className="flex items-start justify-between">
                    <span
                      className="neu-inset-sm grid size-13 place-items-center rounded-2xl transition-transform duration-500 group-hover:scale-110"
                      style={{ color: s.color }}
                    >
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <span className="neu-inset-sm rounded-full px-3 py-1 font-display text-sm font-bold text-neu-accent">
                      {s.level}%
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-lg font-bold">{s.name}</h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-neu-muted">{s.tag}</p>

                  <div
                    className="neu-inset-sm mt-5 h-3 overflow-hidden rounded-full"
                    role="progressbar"
                    aria-label={`${s.name} proficiency`}
                    aria-valuenow={s.level}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${s.level}%` }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 1.4, delay: 0.25 + (i % 4) * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${s.color}, color-mix(in srgb, ${s.color} 45%, transparent))`,
                        boxShadow: `0 0 12px color-mix(in srgb, ${s.color} 45%, transparent)`,
                      }}
                    />
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
