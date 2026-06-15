"use client";

import { subscribeDropAlert } from "app/membership/actions";
import { useActionState } from "react";

export function DropAlertForm() {
  const [state, action, pending] = useActionState(subscribeDropAlert, null);

  if (state?.ok) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border-[3px] border-anime-ink bg-anime-lime px-6 py-7 text-center shadow-[6px_6px_0_0_var(--color-anime-ink)]">
        <span className="text-4xl">🎉</span>
        <p className="font-comic text-2xl uppercase tracking-wide text-anime-ink">
          You&apos;re on the list!
        </p>
        <p className="text-sm font-semibold text-anime-ink/80">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="mx-auto flex w-full max-w-md flex-col gap-3"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          className="w-full rounded-full border-[3px] border-anime-ink bg-white px-5 py-3.5 font-sans text-base font-semibold text-anime-ink shadow-[4px_4px_0_0_var(--color-anime-ink)] outline-none placeholder:text-anime-ink/40 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_0_var(--color-anime-pink)]"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-full border-[3px] border-anime-ink bg-anime-pink px-6 py-3.5 font-comic text-lg uppercase tracking-wider text-white shadow-[4px_4px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-anime-ink)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Joining…" : "Notify me"}
        </button>
      </div>
      {state && !state.ok ? (
        <p className="text-center text-sm font-bold text-anime-pink">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
