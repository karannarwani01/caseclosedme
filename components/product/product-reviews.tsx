import { ReviewForm } from "components/product/review-form";
import { Stars } from "components/product/stars";

type Review = {
  id: string;
  rating: number;
  author: string;
  body: string;
  createdAt: string;
};

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ProductReviews({
  productHandle,
  reviews,
  count,
  average,
}: {
  productHandle: string;
  reviews: Review[];
  count: number;
  average: number;
}) {
  return (
    <section
      id="reviews"
      className="mx-auto mt-14 w-full scroll-mt-24 md:mt-20"
    >
      <div className="mb-8 flex flex-col items-center gap-3 text-center md:mb-10">
        <span className="inline-flex items-center rounded-full border-[2.5px] border-anime-ink bg-anime-cyan px-4 py-1.5 font-display text-xs font-extrabold uppercase tracking-[0.14em] text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)] md:text-sm">
          ★ What collectors say
        </span>
        <h2 className="font-comic text-5xl leading-[0.95] tracking-wide text-anime-ink md:text-6xl">
          Reviews
        </h2>
        {count > 0 ? (
          <div className="flex items-center gap-2">
            <Stars value={average} />
            <span className="font-display text-sm font-extrabold text-anime-ink">
              {average.toFixed(1)} · {count} review{count === 1 ? "" : "s"}
            </span>
          </div>
        ) : null}
      </div>

      {count === 0 ? (
        // Empty state: single centered column (message + form) — no lopsided
        // side-by-side boxes.
        <div className="mx-auto flex max-w-xl flex-col gap-5">
          <div className="rounded-2xl border-[2.5px] border-dashed border-anime-ink/30 px-6 py-8 text-center">
            <p className="font-comic text-2xl uppercase text-anime-ink">
              No reviews yet
            </p>
            <p className="mt-1 text-sm text-anime-ink/60">
              Be the first to review this drop!
            </p>
          </div>
          <ReviewForm productHandle={productHandle} />
        </div>
      ) : (
        <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1.3fr_1fr]">
          <ul className="flex flex-col gap-4">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border-[2.5px] border-anime-ink bg-white p-5 shadow-[4px_4px_0_0_var(--color-anime-ink)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <Stars value={r.rating} className="h-4 w-4" />
                  <span className="text-xs font-medium text-anime-ink/50">
                    {formatDate(r.createdAt)}
                  </span>
                </div>
                <p className="mt-2 font-display text-sm font-extrabold uppercase tracking-wide text-anime-ink">
                  {r.author}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-anime-ink/80">
                  {r.body}
                </p>
              </li>
            ))}
          </ul>

          <ReviewForm productHandle={productHandle} />
        </div>
      )}
    </section>
  );
}
