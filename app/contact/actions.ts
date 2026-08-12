"use server";

import {
  createContactMessageRecord,
  isAdminConfigured,
} from "lib/shopify-admin";

// Same notification relay the refund form uses: the metaobject record is the
// source of truth; this email is best-effort and its address is server-only.
const FORM_ENDPOINT =
  process.env.CONTACT_FORM_ENDPOINT ||
  "https://formsubmit.co/ajax/caseclosed.me@gmail.com";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: {
    name?: string;
    email?: string;
    order_number?: string;
    topic?: string;
    message?: string;
  };
};

export async function submitContactMessage(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const fields = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    order_number: String(formData.get("order_number") || "").trim(),
    topic: String(formData.get("topic") || "").trim(),
    message: String(formData.get("message") || "").trim(),
  };

  const fieldErrors: Record<string, string> = {};
  if (!fields.name) fieldErrors.name = "Required";
  if (!fields.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email))
    fieldErrors.email = "Valid email required";
  if (!fields.topic) fieldErrors.topic = "Required";
  if (!fields.message || fields.message.length < 10)
    fieldErrors.message = "Tell us a bit more (10+ characters)";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
      values: fields,
    };
  }

  const details = [
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    fields.order_number ? `Order number: ${fields.order_number}` : "",
    `Topic: ${fields.topic}`,
    "",
    fields.message,
    "",
    `Submitted: ${new Date().toISOString()}`,
  ]
    .filter((line, i, arr) => line !== "" || arr[i - 1] !== "")
    .join("\n");

  let savedToAdmin = false;
  if (isAdminConfigured()) {
    try {
      await createContactMessageRecord({
        summary: `${fields.topic} — ${fields.name}`,
        status: "New",
        details,
      });
      savedToAdmin = true;
    } catch (e) {
      console.error("Failed to write contact message to Shopify admin:", e);
    }
  }

  let emailSent = false;
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: `Contact form — ${fields.topic} — ${fields.name}`,
        _template: "table",
        _captcha: "false",
        Name: fields.name,
        Email: fields.email,
        "Order Number": fields.order_number || "—",
        Topic: fields.topic,
        Message: fields.message,
      }),
    });
    emailSent = res.ok;
  } catch (e) {
    console.error("FormSubmit notification failed:", e);
  }

  if (savedToAdmin || emailSent) {
    return {
      status: "success",
      message:
        "Message received. We'll reply within 1-3 business days to the email you provided.",
    };
  }

  return {
    status: "error",
    message: "We couldn't send your message. Please try again in a minute.",
  };
}
