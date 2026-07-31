// Trust / delivery promises with custom comic-style icons (white-fill + ink
// stroke on a colour-coded ink-bordered seal). Content reflects the UAE
// defaults (COD, flat AED 20 UAE delivery, 0% BNPL, worldwide). Keep the
// delivery badge in step with shopify-pages/shipping.html — they are the same
// promise shown in two places.

const INK = "var(--color-anime-ink)";

function CashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <rect
        x="2.5"
        y="6"
        width="19"
        height="12"
        rx="2"
        fill="white"
        stroke={INK}
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="2.6"
        fill="white"
        stroke={INK}
        strokeWidth="1.8"
      />
      <circle cx="5.5" cy="12" r="0.9" fill={INK} />
      <circle cx="18.5" cy="12" r="0.9" fill={INK} />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M7 10V8a5 5 0 0 1 10 0v2"
        stroke={INK}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect
        x="4.5"
        y="10"
        width="15"
        height="10"
        rx="2.2"
        fill="white"
        stroke={INK}
        strokeWidth="1.8"
      />
      <circle cx="12" cy="14.3" r="1.5" fill={INK} />
      <rect x="11.25" y="14.3" width="1.5" height="3" rx="0.75" fill={INK} />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <rect
        x="1.5"
        y="7"
        width="12"
        height="9"
        rx="1.6"
        fill="white"
        stroke={INK}
        strokeWidth="1.8"
      />
      <path
        d="M13.5 10h3.7l3.3 3.3V16h-7z"
        fill="white"
        stroke={INK}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle
        cx="6"
        cy="18"
        r="2"
        fill="white"
        stroke={INK}
        strokeWidth="1.8"
      />
      <circle
        cx="17"
        cy="18"
        r="2"
        fill="white"
        stroke={INK}
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PercentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="white"
        stroke={INK}
        strokeWidth="1.8"
      />
      <line
        x1="8.6"
        y1="15.4"
        x2="15.4"
        y2="8.6"
        stroke={INK}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="9.2" cy="9.2" r="1.5" stroke={INK} strokeWidth="1.6" />
      <circle cx="14.8" cy="14.8" r="1.5" stroke={INK} strokeWidth="1.6" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="white"
        stroke={INK}
        strokeWidth="1.8"
      />
      <ellipse cx="12" cy="12" rx="3.6" ry="9" stroke={INK} strokeWidth="1.5" />
      <line x1="3" y1="12" x2="21" y2="12" stroke={INK} strokeWidth="1.5" />
      <line x1="5" y1="7.6" x2="19" y2="7.6" stroke={INK} strokeWidth="1.3" />
      <line x1="5" y1="16.4" x2="19" y2="16.4" stroke={INK} strokeWidth="1.3" />
    </svg>
  );
}

const TRUST = [
  {
    Icon: CashIcon,
    bg: "bg-anime-lime",
    title: "Cash on Delivery",
    sub: "UAE only",
  },
  {
    Icon: LockIcon,
    bg: "bg-anime-cyan",
    title: "Secure Payment",
    sub: "PayPal & cards",
  },
  {
    Icon: TruckIcon,
    bg: "bg-anime-orange",
    title: "Flat Rate Delivery",
    sub: "AED 20 across the UAE",
  },
  {
    Icon: PercentIcon,
    bg: "bg-anime-yellow",
    title: "0% Interest",
    sub: "Tabby & Tamara",
  },
  {
    Icon: GlobeIcon,
    bg: "bg-anime-purple",
    title: "Worldwide",
    sub: "We ship globally",
  },
];

export function TrustBadges() {
  return (
    <ul className="grid grid-cols-5 gap-x-2 gap-y-1 rounded-2xl border-[2.5px] border-anime-ink bg-white px-3 py-5 shadow-[3px_3px_0_0_var(--color-anime-ink)]">
      {TRUST.map(({ Icon, bg, title, sub }) => (
        <li
          key={title}
          className="flex flex-col items-center gap-2 px-1 text-center"
        >
          <span
            className={`grid h-12 w-12 place-items-center rounded-full border-[2.5px] border-anime-ink shadow-[2.5px_2.5px_0_0_var(--color-anime-ink)] ${bg}`}
          >
            <Icon />
          </span>
          <span className="text-[11px] font-extrabold uppercase leading-[1.15] tracking-[0.02em] text-anime-ink">
            {title}
          </span>
          <span className="text-[10px] font-medium leading-tight text-anime-ink/55">
            {sub}
          </span>
        </li>
      ))}
    </ul>
  );
}
