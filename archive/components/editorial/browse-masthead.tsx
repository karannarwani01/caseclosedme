import { ISSUE } from "lib/editorial";

// Editorial (Direction C) magazine masthead for browse/collection pages:
// issue strip, eyebrow, oversized display title with trailing period,
// a count line, and an optional blurb — closed by a heavy rule.
export function BrowseMasthead({
  eyebrow,
  title,
  count,
  blurb,
}: {
  eyebrow: string;
  title: string;
  count?: number;
  blurb?: string;
}) {
  return (
    <header className="mb-8 border-b-2 border-anime-ink pb-6">
      {/* Issue strip */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-anime-ink/20 pb-2 font-display text-[12px] uppercase tracking-[0.06em] text-anime-ink/70">
        <span>
          Issue No. {ISSUE.no} · {ISSUE.date}
        </span>
        <span className="text-[13px] italic tracking-normal text-anime-ink/45">
          {ISSUE.tagline}
        </span>
      </div>

      {/* Title block */}
      <div className="flex flex-wrap items-end justify-between gap-4 pt-5">
        <div>
          <p className="font-display text-[11px] uppercase tracking-[0.12em] text-anime-ink/50">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] text-anime-ink md:text-7xl">
            {title}.
          </h1>
          {blurb ? (
            <p className="mt-3 max-w-xl font-sans text-[15px] leading-relaxed text-anime-ink/70">
              {blurb}
            </p>
          ) : null}
        </div>
        {typeof count === "number" ? (
          <p className="font-display text-[13px] uppercase tracking-[0.08em] text-anime-ink/45">
            <span className="font-extrabold text-anime-ink">{count}</span>{" "}
            {count === 1 ? "piece" : "pieces"} in the case
          </p>
        ) : null}
      </div>
    </header>
  );
}
