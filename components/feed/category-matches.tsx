import type { Collection } from "lib/shopify/types";
import Link from "next/link";

// Shown above search results: any categories whose name matches the query, so
// the storefront's category framework is reachable straight from the search
// box (not just product matches).
export function CategoryMatches({ matches }: { matches: Collection[] }) {
  if (!matches.length) return null;
  return (
    <section className="mx-auto w-full max-w-[1800px] px-6 pt-6 lg:px-8">
      <h2 className="mb-3 font-display text-sm font-extrabold uppercase tracking-[0.14em] text-anime-ink/70">
        Categories
      </h2>
      <div className="flex flex-wrap gap-3">
        {matches.map((c) => (
          <Link
            key={c.handle}
            href={`/search/${c.handle}`}
            className="inline-flex items-center rounded-full border-[2.5px] border-anime-ink bg-white px-4 py-2 font-display text-sm font-extrabold uppercase tracking-[0.02em] text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:bg-anime-yellow hover:shadow-[4px_4px_0_0_var(--color-anime-ink)]"
          >
            {c.title}
          </Link>
        ))}
      </div>
    </section>
  );
}
