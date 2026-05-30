"use server";

import {
  createRefundRequestRecord,
  isAdminConfigured,
  uploadImageToShopify,
} from "lib/shopify-admin";

const FORM_ENDPOINT =
  process.env.REFUND_FORM_ENDPOINT ||
  "https://formsubmit.co/ajax/hello@caseclosedme.com";

export type RefundFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    order_number?: string;
    purchase_date?: string;
    purchase_platform?: string;
    refund_types?: string[];
    refund_other?: string;
    item_names?: string;
    return_method?: string;
    return_other?: string;
    notes?: string;
    refund_method?: string;
    confirm_accurate?: boolean;
    confirm_policy?: boolean;
  };
};

export async function submitRefundRequest(
  _prev: RefundFormState,
  formData: FormData,
): Promise<RefundFormState> {
  const fields = {
    first_name: String(formData.get("first_name") || "").trim(),
    last_name: String(formData.get("last_name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    phone_country: String(formData.get("phone_country") || "").trim(),
    order_number: String(formData.get("order_number") || "").trim(),
    purchase_date: String(formData.get("purchase_date") || "").trim(),
    purchase_platform: String(formData.get("purchase_platform") || "").trim(),
    refund_types: formData.getAll("refund_type").map(String),
    refund_other: String(formData.get("refund_other") || "").trim(),
    item_names: String(formData.get("item_names") || "").trim(),
    return_method: String(formData.get("return_method") || "").trim(),
    return_other: String(formData.get("return_other") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
    refund_method: String(formData.get("refund_method") || "").trim(),
    confirm_accurate: formData.get("confirm_accurate") === "on",
    confirm_policy: formData.get("confirm_policy") === "on",
  };

  const fieldErrors: Record<string, string> = {};
  if (!fields.first_name) fieldErrors.first_name = "Required";
  if (!fields.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email))
    fieldErrors.email = "Valid email required";
  if (!fields.phone || fields.phone.replace(/\D/g, "").length < 8)
    fieldErrors.phone = "Valid phone required";
  if (!fields.order_number) fieldErrors.order_number = "Required";
  if (!fields.purchase_date) fieldErrors.purchase_date = "Required";
  if (!fields.purchase_platform) fieldErrors.purchase_platform = "Required";
  if (fields.refund_types.length === 0)
    fieldErrors.refund_type = "Select at least one";
  if (!fields.item_names) fieldErrors.item_names = "Required";
  if (!fields.return_method) fieldErrors.return_method = "Required";
  if (!fields.refund_method) fieldErrors.refund_method = "Required";
  if (!fields.confirm_accurate)
    fieldErrors.confirm_accurate = "You must confirm";
  if (!fields.confirm_policy) fieldErrors.confirm_policy = "You must agree";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
      // Echo entered values back so the form can repopulate them (React 19
      // resets uncontrolled fields after an action; defaultValue restores them).
      values: {
        first_name: fields.first_name,
        last_name: fields.last_name,
        email: fields.email,
        phone: fields.phone,
        order_number: fields.order_number,
        purchase_date: fields.purchase_date,
        purchase_platform: fields.purchase_platform,
        refund_types: fields.refund_types,
        refund_other: fields.refund_other,
        item_names: fields.item_names,
        return_method: fields.return_method,
        return_other: fields.return_other,
        notes: fields.notes,
        refund_method: fields.refund_method,
        confirm_accurate: fields.confirm_accurate,
        confirm_policy: fields.confirm_policy,
      },
    };
  }

  const payload = {
    _subject: `Refund request — order ${fields.order_number}`,
    _template: "table",
    _captcha: "false",
    Name: `${fields.first_name} ${fields.last_name}`.trim(),
    Email: fields.email,
    Phone: `${fields.phone_country} ${fields.phone}`.trim(),
    "Order Number": fields.order_number,
    "Date of Purchase": fields.purchase_date,
    "Purchase Platform": fields.purchase_platform,
    "Refund Type": fields.refund_types.join(", "),
    "Refund Other (specify)": fields.refund_other || "—",
    "Item Name(s)": fields.item_names,
    "Return Method": fields.return_method,
    "Return Other (specify)": fields.return_other || "—",
    "Additional Notes": fields.notes || "—",
    "Preferred Refund Method": fields.refund_method,
    "Accuracy Confirmed": fields.confirm_accurate ? "Yes" : "No",
    "Policy Agreed": fields.confirm_policy ? "Yes" : "No",
  };

  // Write the request into the Shopify admin (best-effort — never block the
  // customer's submission on it; email below is the backup).
  if (isAdminConfigured()) {
    try {
      const customerName = `${fields.first_name} ${fields.last_name}`.trim();
      const refundType = [
        ...fields.refund_types,
        fields.refund_other ? `Other: ${fields.refund_other}` : "",
      ]
        .filter(Boolean)
        .join(", ");
      const returnMethod = fields.return_other
        ? `${fields.return_method} (${fields.return_other})`
        : fields.return_method;
      const details = [
        `Name: ${customerName}`,
        `Email: ${fields.email}`,
        `Phone: ${fields.phone_country} ${fields.phone}`.trim(),
        `Order number: ${fields.order_number}`,
        `Date of purchase: ${fields.purchase_date}`,
        `Purchase platform: ${fields.purchase_platform}`,
        `Refund type: ${refundType}`,
        `Item(s): ${fields.item_names}`,
        `Return method: ${returnMethod}`,
        `Preferred refund method: ${fields.refund_method}`,
        fields.notes ? `Additional details: ${fields.notes}` : "",
        `Submitted: ${new Date().toISOString()}`,
      ]
        .filter(Boolean)
        .join("\n");

      // Upload any attached photos to Shopify Files (max 5).
      const photoFiles = formData
        .getAll("photos")
        .filter((f): f is File => f instanceof File && f.size > 0)
        .slice(0, 5);
      const photoIds: string[] = [];
      for (const f of photoFiles) {
        try {
          const id = await uploadImageToShopify(f);
          if (id) photoIds.push(id);
        } catch (e) {
          console.error("Photo upload failed:", e);
        }
      }

      await createRefundRequestRecord(
        {
          summary: `Order ${fields.order_number} — ${customerName}`,
          status: "New",
          details,
        },
        photoIds,
      );
    } catch (e) {
      console.error("Failed to write refund request to Shopify admin:", e);
    }
  }

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return {
        status: "error",
        message:
          "We couldn't send your request. Please email hello@caseclosedme.com directly.",
      };
    }

    return {
      status: "success",
      message:
        "Refund request sent. We'll reply within 1 business day to hello@caseclosedme.com.",
    };
  } catch {
    return {
      status: "error",
      message:
        "We couldn't reach the form service. Please email hello@caseclosedme.com directly.",
    };
  }
}
