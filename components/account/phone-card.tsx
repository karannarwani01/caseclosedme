"use client";

import { savePhoneAction, type PhoneState } from "app/account/actions";
import { useActionState } from "react";

// Mobile number capture — a required part of the account. Saves into an
// app-owned Shopify metaobject today (the Admin token can't write customer
// records yet) and mirrors onto the customer record once write_customers is
// granted. See savePhoneAction.
export function PhoneCard({ initialPhone }: { initialPhone: string | null }) {
  const [state, formAction, pending] = useActionState<PhoneState, FormData>(
    savePhoneAction,
    null,
  );

  const saved = state?.ok ? state.message.replace(/^Saved /, "") : initialPhone;

  return (
    <section className="mt-8 rounded-2xl border-[2.5px] border-anime-ink bg-white p-5 shadow-[4px_4px_0_0_var(--color-anime-ink)]">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-anime-ink">
          Mobile number
        </h2>
        {saved ? (
          <span className="inline-flex items-center rounded-full border-[2px] border-anime-ink bg-anime-lime px-2.5 py-0.5 font-display text-[11px] font-extrabold uppercase tracking-wider text-anime-ink">
            ✓ {saved}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border-[2px] border-anime-ink bg-anime-pink px-2.5 py-0.5 font-display text-[11px] font-extrabold uppercase tracking-wider text-white">
            Required
          </span>
        )}
      </div>
      <p className="mt-1 font-comic text-[13px] text-anime-ink/70">
        {saved
          ? "We'll use this to reach you about deliveries. Update it any time."
          : "We need this to reach you about your delivery."}
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
          defaultValue={initialPhone ?? ""}
          placeholder="050 123 4567"
          aria-describedby="phone-help"
          className="min-w-0 flex-1 rounded-xl border-[2.5px] border-anime-ink bg-white px-4 py-2.5 font-display text-base font-bold text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] outline-none placeholder:text-anime-ink/35 focus-visible:ring-2 focus-visible:ring-anime-pink"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-xl border-[2.5px] border-anime-ink bg-anime-pink px-5 py-2.5 font-display text-sm font-extrabold uppercase tracking-wide text-white shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-anime-ink)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : saved ? "Update" : "Save"}
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
