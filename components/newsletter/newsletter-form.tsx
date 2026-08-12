"use client";

import {
  subscribeNewsletter,
  type NewsletterState,
} from "components/newsletter/actions";
import { useActionState, useEffect } from "react";

// Same flag the signup popup checks — set it here too so subscribing from the
// footer stops the modal from nagging the visitor on their next visit.
const SUBSCRIBED_KEY = "cc-signup-popup:v1";

// Compact email capture for the dark footer. Writes a drop_alert metaobject
// (source "footer-newsletter") and, once the write_customers scope exists,
// also subscribes the address in Shopify for Shopify Email campaigns.
export function NewsletterForm() {
  const [state, action, pending] = useActionState<NewsletterState, FormData>(
    subscribeNewsletter,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      try {
        localStorage.setItem(SUBSCRIBED_KEY, "subscribed");
      } catch {
        /* private mode / storage disabled — non-fatal */
      }
    }
  }, [state?.ok]);

  if (state?.ok) {
    return (
      <p className="inline-flex -rotate-1 items-center gap-2 rounded-xl border-[2.5px] border-anime-ink bg-anime-lime px-4 py-3 font-display text-sm font-extrabold uppercase tracking-wide text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-pink)]">
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
      <div className="flex gap-2.5">
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="your@email.com"
          aria-label="Email address for the newsletter"
          className="min-w-0 flex-1 rounded-xl border-[2.5px] border-anime-ink bg-anime-paper px-4 py-2.5 text-sm font-bold text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-pink)] outline-none placeholder:text-anime-ink/40 focus:shadow-[3px_3px_0_0_var(--color-anime-cyan)]"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-xl border-[2.5px] border-anime-ink bg-anime-pink px-5 py-2.5 font-display text-xs font-extrabold uppercase tracking-wider text-white shadow-[3px_3px_0_0_var(--color-anime-lime)] transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-anime-lime)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Joining…" : "★ Join"}
        </button>
      </div>
      {state && !state.ok ? (
        <p className="text-xs font-bold text-anime-pink">{state.message}</p>
      ) : null}
    </form>
  );
}
