"use server";

import { createDropAlertRecord } from "lib/shopify-admin";

export type AlertState = { ok: boolean; message: string } | null;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function subscribeDropAlert(
  _prev: AlertState,
  formData: FormData,
): Promise<AlertState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "Enter a valid email address." };
  }

  try {
    const { duplicate } = await createDropAlertRecord(
      email,
      "membership-coming-soon",
    );
    return {
      ok: true,
      message: duplicate
        ? "You're already on the list! 🎉"
        : "You're in! We'll alert you the moment the next drop lands. 🔥",
    };
  } catch {
    return { ok: false, message: "Something went wrong — try again." };
  }
}
