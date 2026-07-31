"use client";

import {
  addAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  updateAddressAction,
  type AddressState,
} from "app/account/actions";
import { EMIRATES, emirateName } from "lib/emirates";
import type { AccountAddress } from "lib/shopify/customer/account-api";
import { useActionState, useEffect, useState } from "react";

// 16px on phones, compact 14px from sm up: iOS Safari auto-zooms the whole
// page when a focused input's font is under 16px, and never zooms back out.
const inputClass =
  "min-w-0 rounded-xl border-[2.5px] border-anime-ink bg-white px-4 py-2.5 font-display text-base sm:text-sm font-bold text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] outline-none placeholder:text-anime-ink/35 focus-visible:ring-2 focus-visible:ring-anime-pink";

const smallButtonClass =
  "inline-flex items-center rounded-lg border-[2px] border-anime-ink px-2.5 py-1 font-display text-[11px] font-extrabold uppercase tracking-wide shadow-[2px_2px_0_0_var(--color-anime-ink)] transition-all hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60";

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

// The add/edit form. Keyed by the parent so switching between "add" and a
// particular address resets the defaults.
function AddressForm({
  editing,
  onDone,
}: {
  editing: AccountAddress | null;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<AddressState, FormData>(
    editing ? updateAddressAction : addAddressAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="mt-5 grid gap-3 sm:grid-cols-2">
      {editing ? (
        <input type="hidden" name="addressId" value={editing.id} />
      ) : null}
      <input
        name="firstName"
        required
        autoComplete="given-name"
        placeholder="First name"
        defaultValue={editing?.firstName ?? ""}
        className={inputClass}
      />
      <input
        name="lastName"
        required
        autoComplete="family-name"
        placeholder="Last name"
        defaultValue={editing?.lastName ?? ""}
        className={inputClass}
      />
      <input
        name="address1"
        required
        autoComplete="address-line1"
        placeholder="Building, street"
        defaultValue={editing?.address1 ?? ""}
        className={`${inputClass} sm:col-span-2`}
      />
      <input
        name="address2"
        autoComplete="address-line2"
        placeholder="Apartment, floor (optional)"
        defaultValue={editing?.address2 ?? ""}
        className={`${inputClass} sm:col-span-2`}
      />
      <select
        name="zoneCode"
        required
        defaultValue={editing?.zoneCode ?? ""}
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
        defaultValue={
          editing && editing.city !== emirateName(editing.zoneCode)
            ? (editing.city ?? "")
            : ""
        }
        className={inputClass}
      />
      <input
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="Phone for this address (optional)"
        defaultValue={editing?.phoneNumber ?? ""}
        className={`${inputClass} sm:col-span-2`}
      />
      <p className="font-comic text-[12px] text-anime-ink/60 sm:col-span-2">
        Country: United Arab Emirates
      </p>
      <label className="flex items-center gap-2 font-comic text-[13px] text-anime-ink/80 sm:col-span-2">
        <input
          type="checkbox"
          name="makeDefault"
          defaultChecked={editing?.isDefault ?? false}
          className="h-4 w-4 accent-[var(--color-anime-pink)]"
        />
        Make this my default address
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-xl border-[2.5px] border-anime-ink bg-anime-pink px-5 py-2.5 font-display text-sm font-extrabold uppercase tracking-wide text-white shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-anime-ink)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : editing ? "Save changes" : "Save address"}
        </button>
        {state && !state.ok ? (
          <span role="status" className="font-comic text-[13px] text-red-700">
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}

// One saved address with its Make default / Edit / Delete row. Delete asks
// once inline ("Sure?") instead of a blocking dialog.
function AddressRow({
  address,
  onEdit,
  onChanged,
}: {
  address: AccountAddress;
  onEdit: () => void;
  onChanged: () => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [delState, delAction, delPending] = useActionState<
    AddressState,
    FormData
  >(deleteAddressAction, null);
  const [defState, defAction, defPending] = useActionState<
    AddressState,
    FormData
  >(setDefaultAddressAction, null);

  useEffect(() => {
    if (delState?.ok || defState?.ok) onChanged();
  }, [delState, defState, onChanged]);

  const error =
    delState && !delState.ok
      ? delState.message
      : defState && !defState.ok
        ? defState.message
        : null;

  return (
    <li className="flex flex-col rounded-xl border-[2px] border-anime-ink/20 bg-anime-paper/40 p-4">
      {address.isDefault ? (
        <span className="mb-2 self-start rounded-full border-[2px] border-anime-ink bg-anime-yellow px-2.5 py-0.5 font-display text-[10px] font-extrabold uppercase tracking-wider text-anime-ink">
          Default
        </span>
      ) : null}

      {formatLines(address).map((line, i) => (
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

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!address.isDefault ? (
          <form action={defAction}>
            <input type="hidden" name="addressId" value={address.id} />
            <button
              type="submit"
              disabled={defPending}
              className={`${smallButtonClass} bg-anime-yellow text-anime-ink`}
            >
              {defPending ? "…" : "Make default"}
            </button>
          </form>
        ) : null}
        <button
          type="button"
          onClick={onEdit}
          className={`${smallButtonClass} bg-anime-cyan text-anime-ink`}
        >
          Edit
        </button>
        {confirmingDelete ? (
          <form action={delAction} className="flex items-center gap-2">
            <input type="hidden" name="addressId" value={address.id} />
            <button
              type="submit"
              disabled={delPending}
              className={`${smallButtonClass} bg-red-600 text-white`}
            >
              {delPending ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className={`${smallButtonClass} bg-white text-anime-ink`}
            >
              Keep
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className={`${smallButtonClass} bg-white text-anime-ink`}
          >
            Delete
          </button>
        )}
      </div>

      {error ? (
        <p role="status" className="mt-2 font-comic text-[12px] text-red-700">
          {error}
        </p>
      ) : null}
    </li>
  );
}

// View, add, edit, delete and choose-default for the customer's addresses.
// Everything runs through the Customer Account API with the visitor's own
// login token; after any change the parent refetches /api/account/data so the
// list shows what Shopify actually stored.
export function AddressesCard({
  initialAddresses,
  onSaved,
}: {
  initialAddresses: AccountAddress[];
  onSaved: () => void;
}) {
  // null = closed, "new" = add form, otherwise the id being edited.
  const [formMode, setFormMode] = useState<string | null>(
    initialAddresses.length === 0 ? "new" : null,
  );

  const editing =
    formMode && formMode !== "new"
      ? (initialAddresses.find((a) => a.id === formMode) ?? null)
      : null;

  const closeAndRefresh = () => {
    setFormMode(null);
    onSaved();
  };

  return (
    <section className="mt-8 rounded-2xl border-[2.5px] border-anime-ink bg-white p-5 shadow-[4px_4px_0_0_var(--color-anime-ink)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-anime-ink">
          Addresses
        </h2>
        <button
          type="button"
          onClick={() => setFormMode(formMode === "new" ? null : "new")}
          className="inline-flex items-center rounded-xl border-[2.5px] border-anime-ink bg-anime-cyan px-4 py-2 font-display text-xs font-extrabold uppercase tracking-wide text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-anime-ink)]"
        >
          {formMode === "new" ? "Close" : "+ Add address"}
        </button>
      </div>

      {initialAddresses.length === 0 && formMode !== "new" ? (
        <p className="mt-3 font-comic text-[13px] text-anime-ink/60">
          No addresses saved yet.
        </p>
      ) : null}

      {initialAddresses.length > 0 ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {initialAddresses.map((a) => (
            <AddressRow
              key={a.id}
              address={a}
              onEdit={() => setFormMode(a.id)}
              onChanged={onSaved}
            />
          ))}
        </ul>
      ) : null}

      {formMode ? (
        <>
          {editing ? (
            <p className="mt-5 font-display text-sm font-extrabold uppercase tracking-wide text-anime-ink/70">
              Editing {editing.firstName} {editing.lastName}&apos;s address
            </p>
          ) : null}
          <AddressForm
            key={formMode}
            editing={editing}
            onDone={closeAndRefresh}
          />
        </>
      ) : null}
    </section>
  );
}
