import { cacheLife } from "next/cache";
import Link from "next/link";
import LogoSquare from "components/logo-square";
import { ACCOUNT_URL } from "lib/constants";

const { COMPANY_NAME, SITE_NAME } = process.env;

const customerService = [
  { title: "About", path: "/about" },
  { title: "Our Locations", path: "/locations" },
  { title: "Refund Request Form", path: "/refund-request" },
  { title: "Drop Alerts Membership", path: "/drop-alerts" },
  { title: "My Account", path: ACCOUNT_URL },
];

const terms = [
  { title: "Shop Now, Pay Later", path: "/shop-now-pay-later" },
  { title: "Terms & Conditions", path: "/terms-conditions" },
  { title: "Privacy Policy", path: "/privacy-policy" },
  { title: "Shipping Policy", path: "/shipping-policy" },
  { title: "Pre-Order Policy", path: "/pre-order-policy" },
  { title: "Cancellation Policy", path: "/cancellation-policy" },
  { title: "Returns / Refunds / Exchange Policy", path: "/returns" },
];

const faqs = [
  { title: "Where do you ship to?", path: "/faq#shipping" },
  { title: "Can I return and exchange products?", path: "/faq#returns" },
  { title: "Can I cancel my order?", path: "/faq#cancel" },
  { title: "How do I pre-order?", path: "/faq#preorder" },
  { title: "View All", path: "/faq" },
];

function SocialIcon({
  name,
}: {
  name: "instagram" | "facebook" | "youtube" | "tiktok";
}) {
  const common = "h-5 w-5";
  if (name === "instagram") {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38a3.7 3.7 0 0 1-1.38.9c-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.2 15.6 2.2 15.2 2.2 12s0-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38a3.7 3.7 0 0 1 1.38-.9c.42-.16 1.06-.36 2.23-.41C8.42 2.2 8.8 2.2 12 2.2Zm0 1.98c-3.15 0-3.5 0-4.74.06-1.07.05-1.65.23-2.04.38-.51.2-.88.44-1.26.82-.38.38-.62.75-.82 1.26-.15.39-.33.97-.38 2.04C2.7 8.5 2.7 8.85 2.7 12s0 3.5.06 4.74c.05 1.07.23 1.65.38 2.04.2.51.44.88.82 1.26.38.38.75.62 1.26.82.39.15.97.33 2.04.38 1.24.06 1.59.06 4.74.06s3.5 0 4.74-.06c1.07-.05 1.65-.23 2.04-.38.51-.2.88-.44 1.26-.82.38-.38.62-.75.82-1.26.15-.39.33-.97.38-2.04.06-1.24.06-1.59.06-4.74s0-3.5-.06-4.74c-.05-1.07-.23-1.65-.38-2.04a3.4 3.4 0 0 0-.82-1.26 3.4 3.4 0 0 0-1.26-.82c-.39-.15-.97-.33-2.04-.38-1.24-.06-1.59-.06-4.74-.06Zm0 3.36a4.46 4.46 0 1 1 0 8.92 4.46 4.46 0 0 1 0-8.92Zm0 7.36a2.9 2.9 0 1 0 0-5.8 2.9 2.9 0 0 0 0 5.8Zm5.66-7.55a1.04 1.04 0 1 1-2.08 0 1.04 1.04 0 0 1 2.08 0Z" />
      </svg>
    );
  }
  if (name === "facebook") {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.24-1.46 1.5-1.46h1.6V4.42c-.28-.04-1.23-.12-2.34-.12-2.32 0-3.91 1.42-3.91 4.02v2.18H8v3h2.35V21h3.15Z" />
      </svg>
    );
  }
  if (name === "youtube") {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.75-1.77C18.2 5 12 5 12 5s-6.2 0-7.85.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.75 1.77C5.8 19 12 19 12 19s6.2 0 7.85-.43a2.5 2.5 0 0 0 1.75-1.77c.27-1.57.4-3.17.4-4.8 0-1.63-.13-3.23-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
      </svg>
    );
  }
  return (
    <svg
      className={common}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.5 3h-3v12.4a2.6 2.6 0 1 1-2.6-2.6c.27 0 .53.04.77.12V9.78a5.78 5.78 0 1 0 4.83 5.7V8.66c.93.67 2.06 1.06 3.28 1.06V6.65a3.45 3.45 0 0 1-3.28-3.65Z" />
    </svg>
  );
}

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: { title: string; path: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display text-sm font-extrabold uppercase tracking-[0.18em] text-white/90">
        {title}
      </h3>
      <ul className="flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.title}>
            <Link
              href={l.path}
              prefetch={true}
              className="text-base leading-snug text-white/70 transition-colors hover:text-anime-pink"
            >
              {l.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Next 16 forbids reading the clock during static prerender, so the date
// lives in a cache scope (refreshed daily) instead of the render body.
async function getFooterDates() {
  "use cache";
  cacheLife("days");
  const currentYear = new Date().getFullYear();
  const copyrightDate = 2026 + (currentYear > 2026 ? `-${currentYear}` : "");
  // Was hardcoded to "24/05/2026" and had gone stale by months while the site
  // shipped changes daily. Derive it from the clock (daily cache) so it tracks
  // deploys and can't drift again. Fixed to Asia/Dubai so the date doesn't
  // shift with the build machine's timezone.
  const lastUpdated = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Dubai",
  }).format(new Date());
  return { copyrightDate, lastUpdated };
}

export default async function Footer() {
  const { copyrightDate, lastUpdated } = await getFooterDates();
  const copyrightName = COMPANY_NAME || SITE_NAME || "caseclosed";

  return (
    <>
      {/* Cream breathing room between the page content and the dark footer.
          mt-auto lives here so the footer still pins to the bottom on short
          pages, while always leaving a visible gap above it. */}
      <div aria-hidden className="mt-auto h-16 md:h-24" />
      <footer className="border-t-[2.5px] border-anime-ink bg-anime-ink text-white">
        <div className="mx-auto grid w-full max-w-[1800px] gap-10 px-4 py-14 lg:px-8 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr_1fr_0.8fr]">
          <div className="flex flex-col gap-5">
            <Link
              href="/"
              prefetch={true}
              className="flex items-center gap-3"
              aria-label="caseclosed home"
            >
              <LogoSquare size="sm" />
              <span className="font-display text-3xl font-extrabold tracking-tight text-white">
                caseclosed
              </span>
            </Link>

            <div className="flex items-center gap-3 text-white/80">
              <a
                href="https://instagram.com/caseclosed.me"
                aria-label="Instagram"
                className="transition-colors hover:text-anime-pink"
              >
                <SocialIcon name="instagram" />
              </a>
              {/* Facebook/YouTube/TikTok hidden until the accounts exist —
                  they pointed at the platforms' bare homepages. SocialIcon
                  still supports all four names; re-add the anchors with real
                  handles to bring them back. */}
            </div>

            <Link
              href="/reviews"
              className="relative inline-flex items-center justify-center rounded-md border-[2.5px] border-anime-ink bg-anime-lime px-5 py-3.5 font-display text-base font-extrabold uppercase tracking-wider text-anime-ink shadow-[4px_4px_0_0_var(--color-anime-pink)]"
            >
              ★ See our happy collectors
            </Link>
          </div>

          <LinkColumn title="Customer Service" links={customerService} />
          <LinkColumn title="Terms" links={terms} />
          <LinkColumn title="FAQ's" links={faqs} />

          <div className="flex flex-col gap-3">
            <h3 className="font-display text-sm font-extrabold uppercase tracking-[0.18em] text-white/90">
              Contact Us
            </h3>
            <a
              href="tel:+971501269270"
              className="text-base text-white/70 transition-colors hover:text-anime-pink"
            >
              +971 50 126 9270
            </a>
            <a
              href="mailto:caseclosed.me@gmail.com"
              className="text-base text-white/70 transition-colors hover:text-anime-pink"
            >
              caseclosed.me@gmail.com
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-display text-sm font-extrabold uppercase tracking-[0.18em] text-white/90">
              Corporate
            </h3>
            <p className="text-base text-white/70">caseclosed HQ</p>
          </div>
        </div>

        <div className="border-t-[2.5px] border-white/10">
          <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-1 px-4 py-5 text-sm text-white/60 md:flex-row md:items-center md:justify-between lg:px-8">
            <p>Website last updated: {lastUpdated} · All prices include VAT</p>
            <p>
              &copy; {copyrightDate} {copyrightName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
