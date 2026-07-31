// UAE mobiles are the common case: 050…, 50…, 00971…, +971…. Anything already
// in international form is passed through so overseas customers still work.
// Returns null when the input can't be read as a phone number.
//
// Lives outside the "use server" module because every export from one of those
// has to be an async server action.
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let digits = trimmed.replace(/[^\d+]/g, "");
  if (digits.startsWith("00")) digits = `+${digits.slice(2)}`;

  if (digits.startsWith("+")) {
    const rest = digits.slice(1);
    if (!/^\d{8,15}$/.test(rest)) return null;
    // No country code starts with 0, so anything that does is a typo rather
    // than an international number — "0000000000" would otherwise sail through
    // the 00-means-+ rule above and reach Shopify as "+00000000".
    if (rest.startsWith("0")) return null;
    return `+${rest}`;
  }

  // Local UAE forms: 0501234567 or 501234567.
  const local = digits.replace(/^0+/, "");
  if (!/^\d{8,12}$/.test(local)) return null;
  return `+971${local}`;
}
