/**
 * Wave fill for units.gr-style buttons. Render it as the FIRST child of any
 * `.cc-units` button; a blobby layer expands from the cursor carrying a 3-colour
 * radial gradient (centre u2 → green middle → outer u1) whose edge undulates
 * like a wave. Colours come from CSS vars on the button (`.cc-units` + `.cc-u-*`).
 */
export function UnitsFill() {
  return (
    <span className="cc-fill" aria-hidden="true">
      <i />
    </span>
  );
}
