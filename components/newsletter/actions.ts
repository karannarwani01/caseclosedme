"use server";

import { adminGraphQL, createDropAlertRecord } from "lib/shopify-admin";

export type NewsletterState = { ok: boolean; message: string } | null;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  // Honeypot: invisible to humans, bots fill it. Pretend success.
  if (String(formData.get("website") || "").trim()) {
    return { ok: true, message: "You're in! 🎉" };
  }

  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "Enter a valid email address." };
  }

  try {
    const { duplicate } = await createDropAlertRecord(
      email,
      "footer-newsletter",
    );

    // Best-effort: also register the subscriber in Shopify so campaigns can
    // be sent from Shopify Email. This needs the write_customers scope on the
    // custom app — until it's granted the call fails and the metaobject above
    // stays the source of truth (sync later, nothing is lost).
    try {
      await adminGraphQL(
        `mutation($input: CustomerInput!) {
          customerCreate(input: $input) {
            customer { id }
            userErrors { message }
          }
        }`,
        {
          input: {
            email,
            emailMarketingConsent: {
              marketingState: "SUBSCRIBED",
              marketingOptInLevel: "SINGLE_OPT_IN",
              consentUpdatedAt: new Date().toISOString(),
            },
          },
        },
      );
    } catch {
      // Missing scope or the customer already exists — both fine.
    }

    return {
      ok: true,
      message: duplicate
        ? "You're already on the list! 🎉"
        : "You're in! Drops, restocks & deals — straight to your inbox. 🔥",
    };
  } catch {
    return { ok: false, message: "Something went wrong — try again." };
  }
}
