// The review-request email, as email-safe inline-styled HTML (tables, no
// webfonts — Bangers doesn't load in mail clients, so the comic weight comes
// from heavy system sans + the brand colours).

import { unsubscribeToken } from "lib/review-requests";
import { baseUrl } from "lib/utils";

const INK = "#0d0a1a";
const PINK = "#ff2e93";
const YELLOW = "#ffd60a";
const PAPER = "#fff8f0";

export function buildReviewRequestEmail(input: {
  firstName: string;
  email: string;
  items: { title: string; handle: string }[];
}): { subject: string; html: string } {
  const hi = input.firstName ? `Hey ${input.firstName}` : "Hey collector";
  const subject = "How's the haul? Rate your caseclosed pickup ⭐";
  const unsubUrl = `${baseUrl}/api/email/unsubscribe?e=${encodeURIComponent(
    input.email,
  )}&t=${unsubscribeToken(input.email)}`;

  const rows = input.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:2px solid ${INK};border-radius:12px;">
              <tr>
                <td style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;">
                  <p style="margin:0 0 10px;font-size:15px;font-weight:bold;color:${INK};">${escapeHtml(item.title)}</p>
                  <a href="${baseUrl}/product/${item.handle}#reviews"
                     style="display:inline-block;background:${PINK};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;text-decoration:none;padding:10px 18px;border:2px solid ${INK};border-radius:999px;">
                    ★ Leave a review
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${PAPER};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
            <tr>
              <td style="background:${INK};border-radius:16px 16px 0 0;padding:20px 24px;" align="center">
                <span style="font-family:Arial Black,Arial,Helvetica,sans-serif;font-size:24px;font-weight:900;color:#ffffff;">caseclosed</span>
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;border:2px solid ${INK};border-top:0;padding:28px 24px 8px;">
                <p style="margin:0;font-family:Arial Black,Arial,Helvetica,sans-serif;font-size:22px;font-weight:900;color:${INK};">
                  ${escapeHtml(hi)} — how's the haul? <span style="color:${PINK};">⭐</span>
                </p>
                <p style="margin:12px 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${INK};">
                  Your order has landed and we'd love to know what you think.
                  A quick rating helps other UAE collectors pick their next grail
                  — and it means a lot to a small crew like ours.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 4px;">
                  ${rows}
                </table>
                <p style="margin:10px 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${INK};background:${YELLOW};border:2px solid ${INK};border-radius:8px;padding:8px 12px;">
                  Takes 30 seconds — stars, a few words, done.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:${INK};border-radius:0 0 16px 16px;padding:16px 24px;" align="center">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#ffffffb3;">
                  caseclosed · caseclosedme.com · Dubai, UAE<br/>
                  <a href="${unsubUrl}" style="color:#ffffffb3;text-decoration:underline;">Unsubscribe from review requests</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
