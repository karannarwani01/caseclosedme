// The seven emirates with Shopify's zone codes (ISO 3166-2:AE, short form).
// Shopify rejects a UAE address without a zoneCode — "Zone code must exist" —
// so the address form offers exactly this list.
export const EMIRATES = [
  { code: "AZ", name: "Abu Dhabi" },
  { code: "AJ", name: "Ajman" },
  { code: "DU", name: "Dubai" },
  { code: "FU", name: "Fujairah" },
  { code: "RK", name: "Ras al-Khaimah" },
  { code: "SH", name: "Sharjah" },
  { code: "UQ", name: "Umm al-Quwain" },
] as const;

export type EmirateCode = (typeof EMIRATES)[number]["code"];

export function emirateName(code: string | null): string | null {
  return EMIRATES.find((e) => e.code === code)?.name ?? null;
}

export function isEmirateCode(code: string): code is EmirateCode {
  return EMIRATES.some((e) => e.code === code);
}
