"use server";

import { emirateName, isEmirateCode } from "lib/emirates";
import { normalizePhone } from "lib/phone";
import {
  adminCanWriteCustomers,
  setCustomerPhone,
  upsertPhoneRecord,
} from "lib/shopify-admin";
import {
  createCustomerAddress,
  deleteCustomerAddress,
  fetchAccountData,
  updateCustomerAddress,
} from "lib/shopify/customer/account-api";
import { readSession } from "lib/shopify/customer/session";
import { getFreshAccessToken } from "lib/shopify/customer/tokens";

export type PhoneState = { ok: boolean; message: string } | null;
export type AddressState = { ok: boolean; message: string } | null;

// Resolve who this is from the signed-in session, never from the form. A
// customer id accepted from the client would let anyone write to anyone's
// account.
async function signedInAccount() {
  const session = await readSession();
  if (!session) return null;
  const token = await getFreshAccessToken();
  if (!token) return null;
  const account = await fetchAccountData(token);
  if (!account?.id) return null;
  return { token, account };
}

export async function savePhoneAction(
  _prev: PhoneState,
  formData: FormData,
): Promise<PhoneState> {
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  if (!phone) {
    return {
      ok: false,
      message: "That doesn't look like a mobile number — try 050 123 4567.",
    };
  }

  const who = await signedInAccount();
  if (!who) {
    return {
      ok: false,
      message: "Couldn't confirm your account. Please sign in again.",
    };
  }
  const { account } = who;

  // Always keep our own record: an app-owned metaobject the current token can
  // both write and read. Collection works today, before write_customers lands.
  const rec = await upsertPhoneRecord(account.id!, account.email, phone);
  if (!rec.ok) {
    return {
      ok: false,
      message: "Couldn't save that number. Please try again.",
    };
  }

  // When the token can also write the customer record, mirror it there so the
  // number shows on the customer profile and feeds Shopify SMS/WhatsApp tools.
  if (await adminCanWriteCustomers()) {
    const res = await setCustomerPhone(account.id!, phone);
    if (!res.ok) {
      // Surface the failure instead of reporting a false "Saved" — the number
      // otherwise never reaches the customer record Shopify's SMS tools read.
      if (/taken|already/i.test(res.error ?? "")) {
        return {
          ok: false,
          message: "That number is already on another account.",
        };
      }
      return {
        ok: false,
        message: "Couldn't save that number. Please try again.",
      };
    }
  }

  return { ok: true, message: `Saved ${phone}` };
}

// Shared parse for the add and edit forms. Returns null with a message when a
// required field is missing.
function parseAddressForm(formData: FormData): {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  zoneCode: string;
  zip?: string;
  phoneNumber?: string;
  territoryCode: string;
} | null {
  const s = (k: string) => String(formData.get(k) ?? "").trim();
  const firstName = s("firstName");
  const lastName = s("lastName");
  const address1 = s("address1");
  const zoneCode = s("zoneCode");
  if (!firstName || !lastName || !address1 || !isEmirateCode(zoneCode)) {
    return null;
  }
  return {
    firstName,
    lastName,
    address1,
    address2: s("address2") || undefined,
    // Shopify wants a city as well as the zone; when the shopper leaves the
    // area blank, the emirate's name is the city for all practical purposes.
    city: s("city") || emirateName(zoneCode)!,
    zoneCode,
    zip: s("zip") || undefined,
    // Optional phone rides along on the address when it parses.
    phoneNumber: normalizePhone(s("phone")) ?? undefined,
    // The store ships from and sells into the UAE; the form fixes the country.
    territoryCode: "AE",
  };
}

const NOT_SIGNED_IN: AddressState = {
  ok: false,
  message: "Couldn't confirm your account. Please sign in again.",
};

function addressFailure(error?: string): AddressState {
  return {
    ok: false,
    message: error
      ? `Couldn't save the address: ${error}`
      : "Couldn't save the address. Please try again.",
  };
}

export async function addAddressAction(
  _prev: AddressState,
  formData: FormData,
): Promise<AddressState> {
  const who = await signedInAccount();
  if (!who) return NOT_SIGNED_IN;

  const address = parseAddressForm(formData);
  if (!address) {
    return { ok: false, message: "Name, address and emirate are required." };
  }

  const res = await createCustomerAddress(
    who.token,
    address,
    formData.get("makeDefault") === "on",
  );
  if (!res.ok) return addressFailure(res.error);
  return { ok: true, message: "Address saved." };
}

export async function updateAddressAction(
  _prev: AddressState,
  formData: FormData,
): Promise<AddressState> {
  const who = await signedInAccount();
  if (!who) return NOT_SIGNED_IN;

  const addressId = String(formData.get("addressId") ?? "");
  if (!addressId) return addressFailure("missing address id");

  const address = parseAddressForm(formData);
  if (!address) {
    return { ok: false, message: "Name, address and emirate are required." };
  }

  // The id comes from the client, but Shopify scopes the mutation to the
  // signed-in customer's own addresses, so it cannot reach anyone else's.
  const res = await updateCustomerAddress(
    who.token,
    addressId,
    address,
    formData.get("makeDefault") === "on" ? true : undefined,
  );
  if (!res.ok) return addressFailure(res.error);
  return { ok: true, message: "Address updated." };
}

export async function setDefaultAddressAction(
  _prev: AddressState,
  formData: FormData,
): Promise<AddressState> {
  const who = await signedInAccount();
  if (!who) return NOT_SIGNED_IN;

  const addressId = String(formData.get("addressId") ?? "");
  if (!addressId) return addressFailure("missing address id");

  const res = await updateCustomerAddress(
    who.token,
    addressId,
    undefined,
    true,
  );
  if (!res.ok) return addressFailure(res.error);
  return { ok: true, message: "Default address updated." };
}

export async function deleteAddressAction(
  _prev: AddressState,
  formData: FormData,
): Promise<AddressState> {
  const who = await signedInAccount();
  if (!who) return NOT_SIGNED_IN;

  const addressId = String(formData.get("addressId") ?? "");
  if (!addressId) return addressFailure("missing address id");

  const res = await deleteCustomerAddress(who.token, addressId);
  if (!res.ok) {
    return {
      ok: false,
      message: res.error
        ? `Couldn't delete the address: ${res.error}`
        : "Couldn't delete the address. Please try again.",
    };
  }
  return { ok: true, message: "Address deleted." };
}
