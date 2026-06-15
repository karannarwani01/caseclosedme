"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useState } from "react";
import { toast } from "sonner";

// Reviews UI placeholder. Renders the empty state + "Write a review" CTA. Wire
// to a reviews backend (Shopify metaobject or an app's API) later.
export function ReviewsAccordion({ title }: { title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border-[2.5px] border-anime-ink bg-white shadow-[3px_3px_0_0_var(--color-anime-ink)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 font-display text-sm font-extrabold uppercase tracking-wider text-anime-ink"
      >
        Reviews
        <ChevronDownIcon
          className={clsx("h-5 transition-transform", open && "rotate-180")}
          strokeWidth={2.5}
        />
      </button>
      {open ? (
        <div className="border-t-[2px] border-anime-ink px-4 py-6 text-center">
          <p className="font-display text-base font-extrabold uppercase text-anime-ink">
            No reviews yet
          </p>
          <p className="mt-1 text-sm text-anime-ink/70">
            Be the first to review “{title}”.
          </p>
          <button
            type="button"
            onClick={() => toast("✍️ Reviews are coming soon!")}
            className="mt-4 inline-flex items-center gap-2 rounded-full border-[2.5px] border-anime-ink bg-anime-yellow px-5 py-2.5 font-display text-sm font-extrabold uppercase tracking-wider text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_0_var(--color-anime-pink)]"
          >
            ✍️ Write a review
          </button>
        </div>
      ) : null}
    </div>
  );
}
