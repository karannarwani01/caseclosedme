"use client";

import { useActionState } from "react";
import {
  submitContactMessage,
  type ContactFormState,
} from "app/contact/actions";

const initialState: ContactFormState = { status: "idle" };

const TOPICS = [
  "Order question",
  "Shipping and delivery",
  "Returns and refunds",
  "Product question",
  "Wholesale / collaboration",
  "Something else",
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

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContactMessage,
    initialState,
  );
  const vals = state.values || {};

  if (state.status === "success") {
    return (
      <div className="rounded-md border-[2.5px] border-anime-ink bg-anime-lime p-7 shadow-[6px_6px_0_0_var(--color-anime-pink)] [font-family:var(--font-spacegrotesk)]">
        <h2 className="text-4xl uppercase tracking-wide text-anime-ink [font-family:var(--font-bangers)]">
          ★ Got it
        </h2>
        <p className="mt-3 text-base text-anime-ink sm:text-lg">
          {state.message}
        </p>
      </div>
    );
  }

  const err = state.fieldErrors || {};

  return (
    <form
      action={formAction}
      className="flex flex-col gap-5 [font-family:var(--font-spacegrotesk)]"
    >
      {state.status === "error" && state.message && (
        <div className="rounded-md border-[2.5px] border-anime-ink bg-anime-yellow px-5 py-3.5 text-base font-medium text-anime-ink">
          {state.message}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel label="Name" required error={err.name} />
          <input
            name="name"
            type="text"
            className={inputCls}
            defaultValue={vals.name || ""}
            required
          />
        </div>
        <div>
          <FieldLabel label="Email" required error={err.email} />
          <input
            name="email"
            type="email"
            className={inputCls}
            defaultValue={vals.email || ""}
            required
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel label="Order number (if any)" error={err.order_number} />
          <input
            name="order_number"
            type="text"
            className={inputCls}
            defaultValue={vals.order_number || ""}
            placeholder="#1234"
          />
        </div>
        <div>
          <FieldLabel label="Topic" required error={err.topic} />
          <select
            name="topic"
            className={inputCls}
            defaultValue={vals.topic || ""}
            required
          >
            <option value="" disabled>
              Pick a topic
            </option>
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <FieldLabel label="Message" required error={err.message} />
        <textarea
          name="message"
          rows={6}
          className={inputCls}
          defaultValue={vals.message || ""}
          placeholder="What can we help with?"
          required
          minLength={10}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex items-center justify-center rounded-md border-[3px] border-anime-ink bg-anime-pink px-8 py-4 font-display text-base font-extrabold uppercase tracking-widest text-white shadow-[5px_5px_0_0_var(--color-anime-ink)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send message"}
      </button>

      <p className="text-sm text-anime-ink/60">
        We reply to every message within 1–3 business days.
      </p>
    </form>
  );
}
