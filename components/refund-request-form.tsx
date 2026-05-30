"use client";

import { useActionState, useState } from "react";
import {
  submitRefundRequest,
  type RefundFormState,
} from "app/refund-request/actions";
import { PhoneCountrySelect } from "components/phone-country-select";

const initialState: RefundFormState = { status: "idle" };

const REFUND_TYPES = [
  "Product not received",
  "Received wrong item",
  "Item arrived damaged or defective",
  "Order canceled before dispatch",
  "Return after delivery (within return window)",
  "Other (please specify)",
];

const PLATFORMS = [
  "caseclosedme.com",
  "Instagram DM",
  "WhatsApp",
  "Other",
];

const REFUND_METHODS = [
  "Original payment method",
  "Store credit",
];

const RETURN_METHODS = [
  "I will ship it back via courier",
  "Pickup from my address (UAE only)",
  "Drop-off at warehouse (by appointment)",
  "Not applicable (order canceled before dispatch)",
  "Other (please specify)",
];

function FieldLabel({
  label,
  required,
  error,
}: {
  label: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <span className="text-sm font-extrabold uppercase tracking-[0.18em] text-anime-ink">
        {label}
        {required && <span className="ml-1 text-anime-pink">*</span>}
      </span>
      {error && (
        <span className="text-xs font-bold uppercase tracking-wider text-anime-pink">
          {error}
        </span>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-md border-[2.5px] border-anime-ink bg-white px-4 py-3 text-base text-anime-ink placeholder:text-anime-ink/40 focus:outline-none focus:ring-2 focus:ring-anime-pink focus:ring-offset-2 focus:ring-offset-anime-paper";

export function RefundRequestForm() {
  const [state, formAction, pending] = useActionState(
    submitRefundRequest,
    initialState,
  );
  const [refundTypes, setRefundTypes] = useState<string[]>([]);
  const [returnMethod, setReturnMethod] = useState<string>("");
  const showOther = refundTypes.includes("Other (please specify)");
  const showReturnOther = returnMethod === "Other (please specify)";

  if (state.status === "success") {
    return (
      <div className="rounded-md border-[2.5px] border-anime-ink bg-anime-lime p-7 shadow-[6px_6px_0_0_var(--color-anime-pink)] [font-family:var(--font-spacegrotesk)]">
        <h2 className="text-4xl uppercase tracking-wide text-anime-ink [font-family:var(--font-bangers)]">
          ★ Got it
        </h2>
        <p className="mt-3 text-base text-anime-ink sm:text-lg">{state.message}</p>
      </div>
    );
  }

  const err = state.fieldErrors || {};

  return (
    <form
      action={formAction}
      noValidate
      className="flex flex-col gap-5 [font-family:var(--font-spacegrotesk)]"
    >
      {state.status === "error" && state.message && (
        <div className="rounded-md border-[2.5px] border-anime-ink bg-anime-yellow px-5 py-3.5 text-base font-medium text-anime-ink">
          {state.message}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel label="First name" required error={err.first_name} />
          <input name="first_name" type="text" className={inputCls} required />
        </div>
        <div>
          <FieldLabel label="Last name" />
          <input name="last_name" type="text" className={inputCls} />
        </div>
      </div>

      <div>
        <FieldLabel label="Email" required error={err.email} />
        <input name="email" type="email" className={inputCls} required />
      </div>

      <div>
        <FieldLabel label="Phone" required error={err.phone} />
        <div className="flex">
          <PhoneCountrySelect />
          <input
            name="phone"
            type="tel"
            className={`${inputCls} rounded-l-none`}
            placeholder="50 123 4567"
            required
          />
        </div>
      </div>

      <div>
        <FieldLabel label="Order number" required error={err.order_number} />
        <input
          name="order_number"
          type="text"
          placeholder="#1001"
          className={inputCls}
          required
        />
      </div>

      <div>
        <FieldLabel label="Date of purchase" required error={err.purchase_date} />
        <input
          name="purchase_date"
          type="date"
          className={inputCls}
          required
        />
      </div>

      <div>
        <FieldLabel
          label="Purchase platform"
          required
          error={err.purchase_platform}
        />
        <select name="purchase_platform" className={inputCls} required defaultValue="">
          <option value="" disabled>
            Select one
          </option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel
          label="Refund type (check all that apply)"
          required
          error={err.refund_type}
        />
        <div className="flex flex-col gap-3 rounded-md border-[2.5px] border-anime-ink bg-white p-5">
          {REFUND_TYPES.map((opt) => {
            const checked = refundTypes.includes(opt);
            return (
              <label
                key={opt}
                className="flex cursor-pointer items-start gap-3.5 text-base text-anime-ink sm:text-lg"
              >
                <input
                  type="checkbox"
                  name="refund_type"
                  value={opt}
                  checked={checked}
                  onChange={(e) =>
                    setRefundTypes((prev) =>
                      e.target.checked
                        ? [...prev, opt]
                        : prev.filter((x) => x !== opt),
                    )
                  }
                  className="mt-1 h-5 w-5 accent-anime-pink"
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
        {showOther && (
          <input
            name="refund_other"
            type="text"
            placeholder="Tell us more"
            className={`${inputCls} mt-3`}
          />
        )}
      </div>

      <div>
        <FieldLabel label="Item name(s)" required error={err.item_names} />
        <textarea
          name="item_names"
          rows={2}
          placeholder="e.g. Naruto Sage Mode Funko Pop #1234"
          className={inputCls}
          required
        />
      </div>

      <div>
        <FieldLabel label="Return method" required error={err.return_method} />
        <select
          name="return_method"
          className={inputCls}
          required
          value={returnMethod}
          onChange={(e) => setReturnMethod(e.target.value)}
        >
          <option value="" disabled>
            Select one
          </option>
          {RETURN_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        {showReturnOther && (
          <input
            name="return_other"
            type="text"
            placeholder="Tell us more"
            className={`${inputCls} mt-3`}
          />
        )}
      </div>

      <div>
        <FieldLabel label="Additional details" />
        <textarea
          name="notes"
          rows={4}
          placeholder="Anything else we should know?"
          className={inputCls}
        />
      </div>

      <div>
        <FieldLabel label="Photos (optional)" />
        <input
          name="photos"
          type="file"
          accept="image/*"
          multiple
          className="block w-full rounded-md border-[2.5px] border-anime-ink bg-white px-4 py-3 text-base text-anime-ink file:mr-4 file:rounded-md file:border-[2px] file:border-anime-ink file:bg-anime-lime file:px-4 file:py-2 file:font-display file:text-sm file:font-extrabold file:uppercase file:tracking-wider file:text-anime-ink hover:file:cursor-pointer"
        />
        <p className="mt-2 text-sm text-anime-ink/60 sm:text-base">
          Attach photos of the item or packaging (up to 5).
        </p>
      </div>

      <div>
        <FieldLabel
          label="Preferred refund method"
          required
          error={err.refund_method}
        />
        <select name="refund_method" className={inputCls} required defaultValue="">
          <option value="" disabled>
            Select one
          </option>
          {REFUND_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel label="Confirmation" required />
        <div className="flex flex-col gap-4 rounded-md border-[2.5px] border-anime-ink bg-white p-5">
          <label className="flex cursor-pointer items-start gap-3.5 text-base leading-snug text-anime-ink sm:text-lg">
            <input
              type="checkbox"
              name="confirm_accurate"
              className="mt-1 h-5 w-5 shrink-0 accent-anime-pink"
              required
            />
            <span>
              I confirm that all the information provided is accurate and
              truthful to the best of my knowledge.
              {err.confirm_accurate && (
                <span className="ml-2 font-display text-xs font-bold uppercase tracking-wider text-anime-pink">
                  {err.confirm_accurate}
                </span>
              )}
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3.5 text-base leading-snug text-anime-ink sm:text-lg">
            <input
              type="checkbox"
              name="confirm_policy"
              className="mt-1 h-5 w-5 shrink-0 accent-anime-pink"
              required
            />
            <span>
              Refunds are subject to our{" "}
              <a
                href="/returns"
                className="font-semibold text-anime-pink underline-offset-2 hover:underline"
              >
                Returns / Refunds / Exchange Policy
              </a>
              . By submitting this form, I agree that the request will be
              reviewed and processed in accordance with that policy.
              {err.confirm_policy && (
                <span className="ml-2 font-display text-xs font-bold uppercase tracking-wider text-anime-pink">
                  {err.confirm_policy}
                </span>
              )}
            </span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-3 inline-flex items-center justify-center rounded-md border-[2.5px] border-anime-ink bg-anime-lime px-8 py-4 text-xl uppercase tracking-wider text-anime-ink shadow-[4px_4px_0_0_var(--color-anime-pink)] transition-transform [font-family:var(--font-bangers)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--color-anime-pink)] disabled:cursor-not-allowed disabled:opacity-50 sm:text-2xl"
      >
        {pending ? "Sending…" : "★ Submit refund request"}
      </button>

      <p className="text-sm text-anime-ink/60 sm:text-base">
        We reply to all requests within 1 business day.
      </p>
    </form>
  );
}
