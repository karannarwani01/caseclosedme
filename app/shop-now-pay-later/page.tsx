import Footer from "components/layout/footer";

export const metadata = {
  title: "Shop Now, Pay Later",
  description:
    "Pay in installments at caseclosed with Tabby or Tamara. Interest-free, no hidden fees, available across the UAE.",
  alternates: { canonical: "/shop-now-pay-later" },
};

type Provider = {
  name: string;
  badge: string; // official "pay with" badge PNG under /public
  badgeWidth: number;
  badgeHeight: number;
  badgeClass: string; // Tailwind sizing — different per logo because aspect ratios differ
  split: string;
  min: string;
  max: string;
  accent: string;
  shadow: string;
  link: string;
};

const providers: Provider[] = [
  {
    name: "Tabby",
    badge: "/logos/tabby-badge.png",
    badgeWidth: 3046,
    badgeHeight: 1214,
    badgeClass: "h-16 w-auto sm:h-20",
    split: "4 payments over 4 months",
    min: "AED 10",
    max: "AED 4,000",
    accent: "bg-anime-lime",
    shadow: "shadow-[6px_6px_0_0_var(--color-anime-pink)]",
    link: "https://tabby.ai/en-AE/pay-later",
  },
  {
    name: "Tamara",
    badge: "/logos/tamara-badge.png",
    badgeWidth: 2825,
    badgeHeight: 400,
    badgeClass: "h-9 w-auto sm:h-11",
    split: "3 payments over 3 months",
    min: "AED 100",
    max: "AED 2,500",
    accent: "bg-anime-cyan",
    shadow: "shadow-[6px_6px_0_0_var(--color-anime-purple)]",
    link: "https://support.tamara.co/hc/en-us/categories/360003035440-Customer",
  },
];

const steps = [
  "Add your items to the cart and head to checkout.",
  "At the payment step, pick Tabby or Tamara.",
  "Get redirected to the provider for an instant eligibility check.",
  "Confirm your installment plan and place the order — we ship as soon as it's confirmed.",
  "The provider sends reminders before each installment date.",
];

const eligibility = [
  "18 years or older",
  "Valid Emirates ID or UAE residency",
  "A debit or credit card registered in the UAE",
];

export default function ShopNowPayLaterPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-24">
        {/* Hero */}
        <div className="text-center">
          <span className="inline-flex items-center rounded-md border-[2.5px] border-anime-ink bg-anime-pink px-3.5 py-1.5 font-display text-sm font-extrabold uppercase tracking-widest text-white shadow-[3px_3px_0_0_var(--color-anime-ink)]">
            ★ Pay in installments
          </span>
          <h1 className="mt-6 font-display text-5xl font-extrabold uppercase tracking-tight text-anime-ink sm:text-6xl">
            Shop Now, <span className="text-anime-pink">Pay Later</span>
          </h1>
        </div>

        {/* Intro + badges */}
        <div className="mt-12 text-center">
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-anime-ink sm:text-xl">
            Our installment payments are based on{" "}
            <em className="font-semibold not-italic">"Shop Now, Pay Later"</em>{" "}
            — you receive your order today and pay in monthly installments,
            interest-free. Our installment payment providers are:
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-10 sm:gap-12">
            {providers.map((p) => (
              <a
                key={p.name}
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Learn more about paying with ${p.name}`}
                className="transition-transform hover:scale-[1.04]"
              >
                <img
                  src={p.badge}
                  alt={`${p.name} logo`}
                  width={p.badgeWidth}
                  height={p.badgeHeight}
                  className={p.badgeClass}
                />
              </a>
            ))}
          </div>
        </div>

        {/* Provider details — clean text comparison, no card containers */}
        <div className="mt-16 grid gap-12 sm:grid-cols-2">
          {providers.map((p) => (
            <div key={p.name} className="flex flex-col">
              <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-anime-ink sm:text-4xl">
                {p.name}
              </h2>
              <p className="mt-2 text-base font-semibold text-anime-ink sm:text-lg">
                {p.split}
              </p>
              <dl className="mt-6 flex flex-col gap-3 text-base text-anime-ink sm:text-lg">
                <div className="flex items-baseline justify-between gap-3 border-b-[1.5px] border-anime-ink/30 pb-2">
                  <dt className="font-display text-xs font-bold uppercase tracking-widest sm:text-sm">
                    Minimum
                  </dt>
                  <dd className="font-semibold">{p.min}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-b-[1.5px] border-anime-ink/30 pb-2">
                  <dt className="font-display text-xs font-bold uppercase tracking-widest sm:text-sm">
                    Maximum
                  </dt>
                  <dd className="font-semibold">{p.max}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="font-display text-xs font-bold uppercase tracking-widest sm:text-sm">
                    Interest
                  </dt>
                  <dd className="font-semibold">0%</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>

        {/* Eligibility */}
        <div className="mt-16 rounded-md border-[2.5px] border-anime-ink bg-white p-7 shadow-[4px_4px_0_0_var(--color-anime-ink)]">
          <span className="font-display text-sm font-extrabold uppercase tracking-[0.18em] text-anime-pink">
            Who can use it
          </span>
          <ul className="mt-5 flex flex-col gap-3 text-base text-anime-ink sm:text-lg">
            {eligibility.map((e) => (
              <li key={e} className="flex items-start gap-3.5">
                <span
                  className="mt-1.5 inline-block h-4 w-4 shrink-0 border-[2px] border-anime-ink bg-anime-lime"
                  aria-hidden
                />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div className="mt-16">
          <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-anime-ink sm:text-4xl">
            How to pay with Tabby or Tamara
          </h2>
          <ol className="mt-7 flex flex-col gap-4">
            {steps.map((s, i) => (
              <li
                key={s}
                className="flex items-start gap-5 rounded-md border-[2.5px] border-anime-ink bg-white p-5"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-[2.5px] border-anime-ink bg-anime-yellow font-display text-lg font-extrabold text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)]">
                  {i + 1}
                </span>
                <p className="pt-2 text-base leading-snug text-anime-ink sm:text-lg">
                  {s}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Learn more */}
        <div className="mt-16">
          <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-anime-ink sm:text-4xl">
            Learn more
          </h2>
          <p className="mt-4 text-base leading-relaxed text-anime-ink/70 sm:text-lg">
            To learn more about each payment provider, click the related link
            below:
          </p>
          <ul className="mt-6 flex flex-col gap-4">
            <li className="rounded-md border-[2.5px] border-anime-ink bg-white p-5 shadow-[3px_3px_0_0_var(--color-anime-ink)]">
              <a
                href="https://tabby.ai/en-AE/pay-later"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4"
              >
                <span className="font-display text-lg font-extrabold uppercase tracking-tight text-anime-ink sm:text-xl">
                  Tabby — learn more
                </span>
                <span
                  aria-hidden
                  className="font-display text-xl font-extrabold text-anime-pink transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
              <p className="mt-2 break-all text-sm text-anime-ink/60">
                tabby.ai/en-AE/pay-later
              </p>
            </li>
            <li className="rounded-md border-[2.5px] border-anime-ink bg-white p-5 shadow-[3px_3px_0_0_var(--color-anime-ink)]">
              <a
                href="https://support.tamara.co/hc/en-us/categories/360003035440-Customer"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4"
              >
                <span className="font-display text-lg font-extrabold uppercase tracking-tight text-anime-ink sm:text-xl">
                  Tamara — learn more
                </span>
                <span
                  aria-hidden
                  className="font-display text-xl font-extrabold text-anime-pink transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
              <p className="mt-2 break-all text-sm text-anime-ink/60">
                support.tamara.co/hc/en-us/categories/360003035440-Customer
              </p>
            </li>
          </ul>
        </div>

        {/* Footer help line */}
        <p className="mt-12 text-center text-base text-anime-ink/70 sm:text-lg">
          Question about BNPL on a specific order? Email{" "}
          <a
            href="mailto:caseclosed.me@gmail.com"
            className="font-semibold text-anime-pink underline-offset-2 hover:underline"
          >
            caseclosed.me@gmail.com
          </a>
          .
        </p>
      </section>
      <Footer />
    </>
  );
}
