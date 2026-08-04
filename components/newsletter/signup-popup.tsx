"use client";

import {
  subscribeNewsletter,
  type NewsletterState,
} from "components/newsletter/actions";
import { useActionState, useEffect, useRef, useState } from "react";

// Newsletter signup popup for not-yet-subscribed visitors. Reappears on
// every visit (dismiss only silences the current browsing session, via
// sessionStorage) until the visitor actually subscribes — success is stored
// in localStorage and permanently suppresses it. Submits through the same
// server action as the footer form, so subscribers land in Shopify and get
// the welcome automation.
const SUBSCRIBED_KEY = "cc-signup-popup:v1";
const SESSION_KEY = "cc-signup-popup:session";
const OPEN_DELAY_MS = 8000;

export function SignupPopup() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<NewsletterState, FormData>(
    subscribeNewsletter,
    null,
  );
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(SUBSCRIBED_KEY) === "subscribed") return;
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      return;
    }
    const t = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open) emailRef.current?.focus();
  }, [open]);

  // Successful signup: suppress permanently and close after the confirmation.
  useEffect(() => {
    if (!state?.ok) return;
    try {
      localStorage.setItem(SUBSCRIBED_KEY, "subscribed");
    } catch {}
    const t = setTimeout(() => setOpen(false), 2800);
    return () => clearTimeout(t);
  }, [state]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Dismiss quiets the popup for this browsing session only — it comes back
  // on the next visit until the visitor subscribes.
  function dismiss() {
    try {
      sessionStorage.setItem(SESSION_KEY, "dismissed");
    } catch {}
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cc-signup-popup-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close signup popup"
        onClick={dismiss}
        className="absolute inset-0 cursor-default bg-anime-ink/60 backdrop-blur-[2px]"
      />

      <div className="relative w-full max-w-md -rotate-1 rounded-2xl border-[3px] border-anime-ink bg-anime-paper p-6 shadow-[8px_8px_0_0_var(--color-anime-pink)] sm:p-8">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute -top-3 -right-3 flex h-9 w-9 rotate-2 items-center justify-center rounded-full border-[2.5px] border-anime-ink bg-anime-lime text-base font-extrabold text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)] transition-transform hover:scale-110"
        >
          ✕
        </button>

        <p className="inline-block rotate-1 rounded-md border-2 border-anime-ink bg-anime-cyan px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-widest text-anime-ink">
          ★ Collectors only
        </p>

        <h2
          id="cc-signup-popup-title"
          className="mt-3 text-4xl uppercase tracking-wide text-anime-ink [font-family:var(--font-bangers)] sm:text-5xl"
        >
          Join the <span className="text-anime-pink">crew!</span>
        </h2>

        <p className="mt-2 text-sm font-bold leading-relaxed text-anime-ink/80 [font-family:var(--font-spacegrotesk)]">
          New drops, restocks and early access — you hear it first, before it
          hits the site and before it sells out.
        </p>

        {state?.ok ? (
          <p className="mt-5 inline-flex -rotate-1 items-center gap-2 rounded-xl border-[2.5px] border-anime-ink bg-anime-lime px-4 py-3 font-display text-sm font-extrabold uppercase tracking-wide text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-pink)]">
            {state.message}
          </p>
        ) : (
          <form action={action} className="mt-5 flex flex-col gap-2">
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
                ref={emailRef}
                type="email"
                name="email"
                required
                placeholder="your@email.com"
                aria-label="Email address for the newsletter"
                className="min-w-0 flex-1 rounded-xl border-[2.5px] border-anime-ink bg-white px-4 py-2.5 text-sm font-bold text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-pink)] outline-none placeholder:text-anime-ink/40 focus:shadow-[3px_3px_0_0_var(--color-anime-cyan)]"
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
              <p className="text-xs font-bold text-anime-pink">
                {state.message}
              </p>
            ) : null}
          </form>
        )}

        <button
          type="button"
          onClick={dismiss}
          className="mt-4 text-xs font-bold text-anime-ink/50 underline underline-offset-2 hover:text-anime-ink"
        >
          Not now, thanks
        </button>
      </div>
    </div>
  );
}
