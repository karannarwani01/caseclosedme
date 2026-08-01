import { addOptOut, verifyUnsubscribeToken } from "lib/review-requests";
import { NextRequest, NextResponse } from "next/server";

// One-click unsubscribe target for review-request emails. The link carries an
// HMAC of the email (lib/review-requests) so addresses can't be opted out by
// third parties. Responds with a tiny branded page — no layout, no JS.
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("e") || "";
  const token = req.nextUrl.searchParams.get("t") || "";

  const ok = Boolean(email) && verifyUnsubscribeToken(email, token);
  if (ok) {
    try {
      await addOptOut(email);
    } catch {
      // Fall through to the error page below.
      return page(false);
    }
  }
  return page(ok);
}

function page(ok: boolean): NextResponse {
  const body = ok
    ? "<h1>You're unsubscribed ✅</h1><p>We won't email you asking for reviews again.</p>"
    : "<h1>Link didn't work</h1><p>This unsubscribe link is invalid or expired. Email caseclosed.me@gmail.com and we'll sort it.</p>";
  return new NextResponse(
    `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>caseclosed</title></head>
<body style="margin:0;display:grid;place-items:center;min-height:100vh;background:#fff8f0;font-family:Arial,Helvetica,sans-serif;color:#0d0a1a;text-align:center;padding:24px;">
<div style="max-width:420px;background:#fff;border:2.5px solid #0d0a1a;border-radius:16px;padding:32px;box-shadow:6px 6px 0 0 #0d0a1a;">
<p style="font-weight:900;font-size:20px;margin:0 0 12px;">caseclosed</p>${body}
<p><a href="https://caseclosedme.com" style="color:#ff2e93;font-weight:bold;">Back to the shop →</a></p>
</div></body></html>`,
    { status: ok ? 200 : 400, headers: { "Content-Type": "text/html" } },
  );
}
