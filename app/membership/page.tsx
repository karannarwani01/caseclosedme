import { DropAlertForm } from "components/membership/drop-alert-form";
import Footer from "components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  // The root layout appends "| caseclosed" via its title template.
  title: "Drop Alerts Membership — Coming Soon",
  description:
    "Join the caseclosed Drop Alerts club. Be first to know when new Funko Pops, Pop Mart Labubu and trading-card drops land — plus member-only early access. Coming soon.",
  openGraph: { type: "website" },
  alternates: { canonical: "/membership" },
};

const PERKS = [
  {
    icon: "⚡",
    title: "First dibs",
    sub: "Alerts the second a drop goes live",
  },
  { icon: "🎁", title: "Exclusive drops", sub: "Member-only chases & grails" },
  { icon: "🔒", title: "Early access", sub: "Shop before it sells out" },
];

export default function MembershipPage() {
  return (
    <>
      <main className="relative overflow-hidden bg-anime-paper">
        {/* halftone dot texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(var(--color-anime-ink) 1.5px, transparent 1.5px)",
            backgroundSize: "22px 22px",
          }}
        />

        <section className="relative mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center md:py-24">
          <span className="inline-flex -rotate-2 items-center rounded-full border-[3px] border-anime-ink bg-anime-cyan px-5 py-1.5 font-comic text-lg uppercase tracking-wider text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)]">
            ★ Members only · Coming soon
          </span>

          <h1 className="mt-6 font-comic text-6xl uppercase leading-[0.9] tracking-wide text-anime-ink md:text-8xl">
            Drop
            <br />
            <span className="text-anime-pink">Alerts</span>
          </h1>

          <p className="mt-6 max-w-xl font-sans text-base font-semibold text-anime-ink/80 md:text-lg">
            The club for collectors who refuse to miss out. Get an instant alert
            the moment new Funko, Labubu &amp; TCG drops land — plus member-only
            early access before they sell out.
          </p>

          <div className="mt-9 w-full">
            <DropAlertForm />
          </div>

          <ul className="mt-12 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
            {PERKS.map((p) => (
              <li
                key={p.title}
                className="flex flex-col items-center gap-2 rounded-2xl border-[3px] border-anime-ink bg-white px-4 py-6 text-center shadow-[5px_5px_0_0_var(--color-anime-ink)]"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full border-[2.5px] border-anime-ink bg-anime-yellow text-2xl shadow-[2px_2px_0_0_var(--color-anime-ink)]">
                  {p.icon}
                </span>
                <span className="font-comic text-xl uppercase tracking-wide text-anime-ink">
                  {p.title}
                </span>
                <span className="text-sm font-medium text-anime-ink/60">
                  {p.sub}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
