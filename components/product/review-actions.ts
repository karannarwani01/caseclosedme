"use server";

import { createProductReview } from "lib/shopify-admin";
import { updateTag } from "next/cache";

export type ReviewState = { ok: boolean; message: string } | null;

export async function submitReview(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const productHandle = String(formData.get("productHandle") || "");
  const rating = Number(formData.get("rating") || 0);
  const author = String(formData.get("author") || "").trim();
  const body = String(formData.get("body") || "").trim();

  // Honeypot: invisible to humans, bots fill it. Pretend success so the bot
  // moves on without learning it was caught.
  if (String(formData.get("website") || "").trim()) {
    return {
      ok: true,
      message: "Thanks! Your review is live. ✅",
    };
  }

  if (!productHandle) return { ok: false, message: "Something went wrong." };
  if (!(rating >= 1 && rating <= 5))
    return { ok: false, message: "Pick a star rating." };
  if (author.length < 2) return { ok: false, message: "Add your name." };
  if (body.length < 3) return { ok: false, message: "Write a few words." };

  try {
    await createProductReview({ productHandle, rating, author, body });
    updateTag("reviews");
  } catch {
    return { ok: false, message: "Couldn't submit — please try again." };
  }
  return {
    ok: true,
    message: "Thanks! Your review is live. ✅",
  };
}
