"use client";

import { savePhoneAction, type PhoneState } from "app/account/actions";
import { useActionState } from "react";

// Mobile number capture. Shopify's Customer Account API can't write a phone, so
// the save goes through a server action that pushes it onto the customer record
// with the Admin API. The whole card is hidden unless that token actually has
// write_customers — see adminCanWriteCustomers.
export function PhoneCard() {
  const [state, formAction, pending] = useActionState<PhoneState, FormData>(
    savePhoneAction,
    null,
  );

  return (
    <section className="mt-8 rounded-2xl border-[2.5px] border-anime-ink bg-white p-5 shadow-[4px_4px_0_0_var(--color-anime-ink)]">
      <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-anime-ink">
        Mobile number
      </h2>
      <p className="mt-1 font-comic text-[13px] text-anime-ink/70">
        So we can reach you about your delivery.
      </p>

      <form action={formAction} className="mt-4 flex flex-wrap gap-3">
        <label htmlFor="phone" className="sr-only">
          Mobile number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="050 123 4567"
          aria-describedby="phone-help"
          className="min-w-0 flex-1 rounded-xl border-[2.5px] border-anime-ink bg-white px-4 py-2.5 font-display text-base font-bold text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] outline-none placeholder:text-anime-ink/35 focus-visible:ring-2 focus-visible:ring-anime-pink"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-xl border-[2.5px] border-anime-ink bg-anime-pink px-5 py-2.5 font-display text-sm font-extrabold uppercase tracking-wide text-white shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-anime-ink)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </form>

      <p
        id="phone-help"
        role="status"
        aria-live="polite"
        className={
          "mt-2 font-comic text-[13px] " +
          (state
            ? state.ok
              ? "text-green-700"
              : "text-red-700"
            : "text-anime-ink/60")
        }
      >
        {state
          ? state.message
          : "UAE numbers welcome — we'll add +971 for you."}
      </p>
    </section>
  );
}
