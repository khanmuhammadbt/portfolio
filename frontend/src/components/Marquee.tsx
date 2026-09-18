import { Sparkle } from "lucide-react";
import { useLocalizedContent as useSiteContent } from "../store/content";

export default function Marquee() {
  const { content } = useSiteContent();
  const row = [...content.marquee, ...content.marquee];
  return (
    <section aria-hidden className="relative px-6 py-4">
      <div className="neu-inset mx-auto max-w-7xl overflow-hidden rounded-full py-5">
        <div className="[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="marquee-track items-center gap-10 px-5">
            {row.map((it, i) => (
              <span key={i} className="flex items-center gap-10 whitespace-nowrap">
                <span className="font-display text-sm font-semibold uppercase tracking-[0.32em] text-neu-muted">
                  {it}
                </span>
                <Sparkle className="size-4 text-neu-accent" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
