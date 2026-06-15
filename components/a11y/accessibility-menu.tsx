"use client";

import {
  AdjustmentsHorizontalIcon,
  ArrowsRightLeftIcon,
  Bars3BottomLeftIcon,
  EyeSlashIcon,
  LanguageIcon,
  LinkIcon,
  MagnifyingGlassPlusIcon,
  PauseCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useEffect, useState } from "react";

// Front-end accessibility preferences. Each toggle adds/removes a class on
// <html>; the matching CSS lives in globals.css. Saved per-device in
// localStorage and re-applied before paint by the inline script in the root
// layout (so there's no flash on load). Mobile-only, to match the scope.

type Key =
  | "contrast"
  | "links"
  | "biggerText"
  | "spacing"
  | "noMotion"
  | "hideImages"
  | "dyslexia"
  | "lineHeight";

export const A11Y_STORAGE_KEY = "cc-a11y";

// Key -> <html> class. Kept in sync with the inline no-flash script + CSS.
export const A11Y_CLASS: Record<Key, string> = {
  contrast: "a11y-contrast",
  links: "a11y-links",
  biggerText: "a11y-bigger-text",
  spacing: "a11y-spacing",
  noMotion: "a11y-no-motion",
  hideImages: "a11y-hide-images",
  dyslexia: "a11y-dyslexia",
  lineHeight: "a11y-line-height",
};

const OPTIONS: { key: Key; label: string; Icon: typeof LinkIcon }[] = [
  { key: "contrast", label: "Contrast +", Icon: AdjustmentsHorizontalIcon },
  { key: "links", label: "Highlight Links", Icon: LinkIcon },
  { key: "biggerText", label: "Bigger Text", Icon: MagnifyingGlassPlusIcon },
  { key: "spacing", label: "Text Spacing", Icon: ArrowsRightLeftIcon },
  { key: "noMotion", label: "Pause Motion", Icon: PauseCircleIcon },
  { key: "hideImages", label: "Hide Images", Icon: EyeSlashIcon },
  { key: "dyslexia", label: "Dyslexia Font", Icon: LanguageIcon },
  { key: "lineHeight", label: "Line Height", Icon: Bars3BottomLeftIcon },
];

const EMPTY = Object.fromEntries(
  (Object.keys(A11Y_CLASS) as Key[]).map((k) => [k, false]),
) as Record<Key, boolean>;

// Universal accessibility figure.
function A11yFigure({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="4" r="1.6" fill="currentColor" stroke="none" />
      <path d="M5 8h14" />
      <path d="M12 8v5" />
      <path d="M12 13l-3 7" />
      <path d="M12 13l3 7" />
    </svg>
  );
}

export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<Record<Key, boolean>>(EMPTY);

  // Hydrate from storage on mount (the inline script already styled the page).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(A11Y_STORAGE_KEY) || "{}");
      setS((v) => ({ ...v, ...saved }));
    } catch {
      /* ignore */
    }
  }, []);

  const applyAndSave = (next: Record<Key, boolean>) => {
    const el = document.documentElement;
    (Object.keys(A11Y_CLASS) as Key[]).forEach((k) =>
      el.classList.toggle(A11Y_CLASS[k], next[k]),
    );
    try {
      localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const toggle = (k: Key) =>
    setS((prev) => {
      const next = { ...prev, [k]: !prev[k] };
      applyAndSave(next);
      return next;
    });

  const reset = () => {
    applyAndSave(EMPTY);
    setS(EMPTY);
  };

  // Lock body scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeCount = Object.values(s).filter(Boolean).length;

  return (
    <>
      {/* Floating launcher, above the bottom tab bar */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Accessibility options"
        className="fixed bottom-[calc(64px+env(safe-area-inset-bottom)+1rem)] left-4 z-50 grid h-12 w-12 place-items-center rounded-full border-[2.5px] border-anime-ink bg-anime-pink text-white shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-transform active:scale-95 lg:hidden"
      >
        <A11yFigure className="h-6 w-6" />
        {activeCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-anime-lime px-1 font-display text-[10px] font-extrabold leading-none text-anime-ink">
            {activeCount}
          </span>
        ) : null}
      </button>

      {/* Bottom sheet */}
      <div
        className={clsx(
          "fixed inset-0 z-[70] lg:hidden",
          open ? "" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={clsx(
            "absolute inset-0 bg-black/40 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Accessibility menu"
          className={clsx(
            "absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl border-t-[2.5px] border-anime-ink bg-white p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-[0_-6px_24px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out",
            open ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-comic text-2xl uppercase tracking-wide text-anime-ink">
              Accessibility
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close accessibility menu"
            >
              <XMarkIcon className="h-7 w-7 text-anime-ink" strokeWidth={2.5} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {OPTIONS.map(({ key, label, Icon }) => {
              const on = s[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggle(key)}
                  aria-pressed={on}
                  className={clsx(
                    "flex flex-col items-center gap-2 rounded-2xl border-[2.5px] border-anime-ink p-4 text-center transition-all",
                    on
                      ? "bg-anime-pink text-white shadow-[3px_3px_0_0_var(--color-anime-ink)]"
                      : "bg-white text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)] active:translate-y-[1px]",
                  )}
                >
                  <Icon className="h-7 w-7" strokeWidth={2} />
                  <span className="font-display text-xs font-extrabold uppercase leading-tight">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={reset}
            className="mt-4 w-full rounded-full border-[2.5px] border-anime-ink bg-anime-yellow py-3 font-comic text-sm uppercase tracking-wide text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all active:translate-y-[1px]"
          >
            Reset all
          </button>
        </div>
      </div>
    </>
  );
}
