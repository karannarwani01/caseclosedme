"use client";

import {
  subscribeNewsletter,
  type NewsletterState,
} from "components/newsletter/actions";
import { useActionState } from "react";

// Compact email capture for the dark footer. Writes a drop_alert metaobject
// (source "footer-newsletter") and, once the write_customers scope exists,
// also subscribes the address in Shopify for Shopify Email campaigns.
export function NewsletterForm() {
  const [state, action, pending] = useActionState<NewsletterState, FormData>(
    subscribeNewsletter,
    null,
  );

  if (state?.ok) {
    return (
      <p className="rounded-xl border-2 border-anime-lime bg-anime-lime/10 px-4 py-3 text-sm font-semibold text-anime-lime">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2">
      {/* Honeypot — hidden from real users, checked server-side. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder="your@email.com"
          aria-label="Email address for the newsletter"
          className="min-w-0 flex-1 rounded-full border-2 border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white outline-none placeholder:text-white/40 focus:border-anime-pink"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-full border-2 border-anime-ink bg-anime-pink px-5 py-2.5 font-display text-xs font-extrabold uppercase tracking-wider text-white shadow-[2px_2px_0_0_rgba(255,255,255,0.25)] transition-transform hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Joining…" : "Join"}
        </button>
      </div>
      {state && !state.ok ? (
        <p className="text-xs font-bold text-anime-pink">{state.message}</p>
      ) : null}
    </form>
  );
}
