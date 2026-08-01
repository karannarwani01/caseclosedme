"use client";

import {
  submitReview,
  type ReviewState,
} from "components/product/review-actions";
import { UnitsArrow } from "components/ui/units-arrow";
import { UnitsFill } from "components/ui/units-fill";
import clsx from "clsx";
import { useActionState, useState } from "react";

export function ReviewForm({ productHandle }: { productHandle: string }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(
    submitReview,
    null,
  );
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  if (state?.ok) {
    return (
      <div className="rounded-2xl border-[3px] border-anime-ink bg-anime-lime px-6 py-6 text-center shadow-[5px_5px_0_0_var(--color-anime-ink)]">
        <p className="font-comic text-2xl uppercase tracking-wide text-anime-ink">
          🎉 Thanks!
        </p>
        <p className="mt-1 text-sm font-semibold text-anime-ink/80">
          {state.message}
        </p>
      </div>
    );
  }

  const shown = hover || rating;

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-2xl border-[3px] border-anime-ink bg-white p-5 shadow-[5px_5px_0_0_var(--color-anime-ink)]"
    >
      <p className="font-comic text-xl uppercase tracking-wide text-anime-ink">
        Write a review
      </p>
      <input type="hidden" name="productHandle" value={productHandle} />
      <input type="hidden" name="rating" value={rating} />
      {/* Honeypot — hidden from real users, checked server-side. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {/* Star picker */}
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(i)}
            onClick={() => setRating(i)}
            className="transition-transform hover:scale-110"
          >
            <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
              <path
                d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 18.9 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"
                fill={i <= shown ? "var(--color-anime-yellow)" : "white"}
                stroke="var(--color-anime-ink)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}
      </div>

      <input
        name="author"
        required
        placeholder="Your name"
        className="rounded-xl border-[2.5px] border-anime-ink bg-anime-paper px-4 py-2.5 text-sm font-semibold text-anime-ink outline-none placeholder:text-anime-ink/40 focus:shadow-[3px_3px_0_0_var(--color-anime-pink)]"
      />
      <textarea
        name="body"
        required
        rows={4}
        placeholder="Share your thoughts on this drop…"
        className="rounded-xl border-[2.5px] border-anime-ink bg-anime-paper px-4 py-2.5 text-sm font-semibold text-anime-ink outline-none placeholder:text-anime-ink/40 focus:shadow-[3px_3px_0_0_var(--color-anime-pink)]"
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="cc-units cc-u-berry inline-flex items-center gap-1.5 rounded-full border-[2.5px] border-anime-ink bg-anime-pink px-6 py-2.5 font-comic text-base uppercase tracking-wider text-white shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_0_var(--color-anime-ink)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UnitsFill />
          {pending ? "Posting…" : "Post review"}
          <UnitsArrow />
        </button>
        {state && !state.ok ? (
          <p className={clsx("text-sm font-bold text-anime-pink")}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
