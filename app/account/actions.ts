"use server";

import { normalizePhone } from "lib/phone";
import { adminCanWriteCustomers, setCustomerPhone } from "lib/shopify-admin";
import { fetchAccountData } from "lib/shopify/customer/account-api";
import { readSession } from "lib/shopify/customer/session";
import { getFreshAccessToken } from "lib/shopify/customer/tokens";

export type PhoneState = { ok: boolean; message: string } | null;

export async function savePhoneAction(
  _prev: PhoneState,
  formData: FormData,
): Promise<PhoneState> {
  const session = await readSession();
  if (!session) {
    return { ok: false, message: "Please sign in again to save your number." };
  }

  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  if (!phone) {
    return {
      ok: false,
      message: "That doesn't look like a mobile number — try 050 123 4567.",
    };
  }

  if (!(await adminCanWriteCustomers())) {
    return {
      ok: false,
      message: "Saving numbers isn't switched on yet. Nothing was changed.",
    };
  }

  // Resolve who this is from the signed-in session, never from the form. A
  // customer id accepted from the client would let anyone overwrite anyone's
  // phone number.
  const token = await getFreshAccessToken();
  const account = token ? await fetchAccountData(token) : null;
  if (!account?.id) {
    return {
      ok: false,
      message: "Couldn't confirm your account. Please sign in again.",
    };
  }

  const res = await setCustomerPhone(account.id, phone);
  if (!res.ok) {
    // Shopify rejects duplicates, since a number is unique per customer.
    const dupe = /taken|already/i.test(res.error ?? "");
    return {
      ok: false,
      message: dupe
        ? "That number is already on another account."
        : "Couldn't save that number. Please try again.",
    };
  }

  return { ok: true, message: `Saved ${phone}` };
}
