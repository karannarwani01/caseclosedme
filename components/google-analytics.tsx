import Script from "next/script";

// GA4 (property "caseclosedme.com", stream 15427603925). The ID is public by
// nature — it ships in the page source of every site using GA — but lives in
// an env var so preview/dev deployments can run without polluting prod data:
// only environments where NEXT_PUBLIC_GA_ID is set load the tag at all.
// SPA route changes are tracked by GA4's enhanced measurement (History API),
// so no per-navigation gtag calls are needed.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function GoogleAnalytics() {
  if (!GA_ID) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
