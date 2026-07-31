"use client";

import { addAddressAction, type AddressState } from "app/account/actions";
import { EMIRATES, emirateName } from "lib/emirates";
import type { AccountAddress } from "lib/shopify/customer/account-api";
import { useActionState, useEffect, useState } from "react";

const inputClass =
  "min-w-0 rounded-xl border-[2.5px] border-anime-ink bg-white px-4 py-2.5 font-display text-sm font-bold text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] outline-none placeholder:text-anime-ink/35 focus-visible:ring-2 focus-visible:ring-anime-pink";

function formatLines(a: AccountAddress): string[] {
  const emirate = emirateName(a.zoneCode);
  return [
    [a.firstName, a.lastName].filter(Boolean).join(" "),
    a.address1 ?? "",
    a.address2 ?? "",
    // Skip a duplicated "Dubai, Dubai" when the city is just the emirate.
    [a.city !== emirate ? a.city : null, emirate, a.zip]
      .filter(Boolean)
      .join(", "),
    a.territoryCode === "AE" ? "United Arab Emirates" : (a.territoryCode ?? ""),
    a.phoneNumber ?? "",
  ].filter(Boolean);
}

// View + add addresses. Reads and writes go through the Customer Account API
// with the visitor's own login token — no Admin scopes involved. After a
// successful add the page refetches /api/account/data so the list (and any
// new default flag) reflects what Shopify actually stored.
export function AddressesCard({
  initialAddresses,
  onSaved,
}: {
  initialAddresses: AccountAddress[];
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(initialAddresses.length === 0);
  const [state, formAction, pending] = useActionState<AddressState, FormData>(
    addAddressAction,
    null,
  );

  // On success: collapse the form and let the parent refetch the real list.
  useEffect(() => {
    if (state?.ok) {
      setOpen(false);
      onSaved();
    }
  }, [state, onSaved]);

  return (
    <section className="mt-8 rounded-2xl border-[2.5px] border-anime-ink bg-white p-5 shadow-[4px_4px_0_0_var(--color-anime-ink)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-anime-ink">
          Addresses
        </h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center rounded-xl border-[2.5px] border-anime-ink bg-anime-cyan px-4 py-2 font-display text-xs font-extrabold uppercase tracking-wide text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-anime-ink)]"
        >
          {open ? "Close" : "+ Add address"}
        </button>
      </div>

      {initialAddresses.length === 0 && !open ? (
        <p className="mt-3 font-comic text-[13px] text-anime-ink/60">
          No addresses saved yet.
        </p>
      ) : null}

      {initialAddresses.length > 0 ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {initialAddresses.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border-[2px] border-anime-ink/20 bg-anime-paper/40 p-4"
            >
              {a.isDefault ? (
                <span className="mb-2 inline-flex items-center rounded-full border-[2px] border-anime-ink bg-anime-yellow px-2.5 py-0.5 font-display text-[10px] font-extrabold uppercase tracking-wider text-anime-ink">
                  Default
                </span>
              ) : null}
              {formatLines(a).map((line, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "font-display text-sm font-extrabold text-anime-ink"
                      : "font-comic text-[13px] text-anime-ink/75"
                  }
                >
                  {line}
                </p>
              ))}
            </li>
          ))}
        </ul>
      ) : null}

      {open ? (
        <form action={formAction} className="mt-5 grid gap-3 sm:grid-cols-2">
          <input
            name="firstName"
            required
            autoComplete="given-name"
            placeholder="First name"
            className={inputClass}
          />
          <input
            name="lastName"
            required
            autoComplete="family-name"
            placeholder="Last name"
            className={inputClass}
          />
          <input
            name="address1"
            required
            autoComplete="address-line1"
            placeholder="Building, street"
            className={`${inputClass} sm:col-span-2`}
          />
          <input
            name="address2"
            autoComplete="address-line2"
            placeholder="Apartment, floor (optional)"
            className={`${inputClass} sm:col-span-2`}
          />
          <select
            name="zoneCode"
            required
            defaultValue=""
            autoComplete="address-level1"
            aria-label="Emirate"
            className={inputClass}
          >
            <option value="" disabled>
              Emirate
            </option>
            {EMIRATES.map((e) => (
              <option key={e.code} value={e.code}>
                {e.name}
              </option>
            ))}
          </select>
          <input
            name="city"
            autoComplete="address-level2"
            placeholder="Area / city (optional)"
            className={inputClass}
          />
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Phone for this address (optional)"
            className={`${inputClass} sm:col-span-2`}
          />
          <p className="font-comic text-[12px] text-anime-ink/60 sm:col-span-2">
            Country: United Arab Emirates
          </p>
          <label className="flex items-center gap-2 font-comic text-[13px] text-anime-ink/80 sm:col-span-2">
            <input
              type="checkbox"
              name="makeDefault"
              className="h-4 w-4 accent-[var(--color-anime-pink)]"
            />
            Make this my default address
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center rounded-xl border-[2.5px] border-anime-ink bg-anime-pink px-5 py-2.5 font-display text-sm font-extrabold uppercase tracking-wide text-white shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-anime-ink)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save address"}
            </button>
          </div>
        </form>
      ) : null}

      {state ? (
        <p
          role="status"
          aria-live="polite"
          className={
            "mt-3 font-comic text-[13px] " +
            (state.ok ? "text-green-700" : "text-red-700")
          }
        >
          {state.message}
        </p>
      ) : null}
    </section>
  );
}
