// Best-effort primary colour for a product. Colour usually isn't in the title,
// so this catches obvious colour words and otherwise defaults to "color-multi"
// (a safe placeholder to refine in the admin). Always returns a tag.
const COLOR_WORDS: [RegExp, string][] = [
  [/\bred\b|\bcrimson\b/, "color-red"],
  [/\bblue\b|\bcyan\b|\bnavy\b/, "color-blue"],
  [/\bgreen\b|\bemerald\b/, "color-green"],
  [/\bblack\b|\bnoir\b/, "color-black"],
  [/\bpink\b|\brose\b/, "color-pink"],
  [/\byellow\b|\bgold(en)?\b/, "color-yellow"],
  [/\borange\b/, "color-orange"],
  [/\bpurple\b|\bviolet\b/, "color-purple"],
  [/\bwhite\b/, "color-white"],
  [/\bgr[ae]y\b|\bsilver\b/, "color-grey"],
  [/\bbrown\b/, "color-brown"],
];

export function colorTagFor(title: string): string {
  const t = (title || "").toLowerCase();
  for (const [re, tag] of COLOR_WORDS) if (re.test(t)) return tag;
  return "color-multi";
}
