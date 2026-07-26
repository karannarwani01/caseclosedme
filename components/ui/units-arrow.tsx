import clsx from "clsx";

/**
 * Diagonal (↗) arrow that does the units.gr "swap" on hover: the visible glyph
 * slides out to the top-right while a duplicate slides in from the bottom-left.
 * Render it as the last child of a `.cc-units` button/link — the swap is driven
 * by CSS in globals.css keyed off `.cc-units:hover`.
 */
export function UnitsArrow({ className }: { className?: string }) {
  return (
    <span className={clsx("cc-arrow", className)} aria-hidden="true">
      <Glyph />
      <Glyph />
    </span>
  );
}

function Glyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <path
        d="M7 17 L17 7 M8 7 h9 v9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
