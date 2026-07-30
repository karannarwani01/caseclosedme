import Footer from "components/layout/footer";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  // The root layout appends "| caseclosed" via its title template.
  title: "Happy Collectors — Coming Soon",
  description:
    "The caseclosed wall of reviews. Real photos and ratings from UAE collectors who bought their Funko Pops, Labubu blind boxes and trading cards from us. Coming soon.",
  openGraph: { type: "website" },
};

const TEASERS = [
  {
    icon: "★",
    title: "Star ratings",
    sub: "Every review tied to a real order",
  },
  { icon: "📸", title: "Collector photos", sub: "See the haul before you buy" },
  { icon: "🗣️", title: "Honest words", sub: "Unedited, straight from buyers" },
];

export default function ReviewsPage() {
  return (
    <>
      <div className="relative overflow-hidden bg-anime-paper">
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
          <span className="inline-flex -rotate-2 items-center rounded-full border-[3px] border-anime-ink bg-anime-lime px-5 py-1.5 font-comic text-lg uppercase tracking-wider text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)]">
            ★ Reviews · Coming soon
          </span>

          <h1 className="mt-6 font-comic text-6xl uppercase leading-[0.9] tracking-wide text-anime-ink md:text-8xl">
            Happy
            <br />
            <span className="text-anime-pink">Collectors</span>
          </h1>

          <p className="mt-6 max-w-xl font-sans text-base font-semibold text-anime-ink/80 md:text-lg">
            We&apos;re building the wall — every rating, photo and story from
            UAE collectors who unboxed their grails with us, all in one place.
          </p>

          <p className="mt-4 max-w-xl font-sans text-sm font-medium text-anime-ink/60">
            In the meantime, every product page has its own reviews. Bought
            something from us? Leave a review there and it&apos;ll land on this
            wall the day it goes live.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/search"
              className="-rotate-1 rounded-full border-[3px] border-anime-ink bg-anime-pink px-7 py-3 font-comic text-lg uppercase tracking-wider text-white shadow-[5px_5px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:rotate-0 hover:shadow-[8px_8px_0_0_var(--color-anime-ink)]"
            >
              Shop the drop →
            </Link>
            <Link
              href="/drop-alerts"
              className="rotate-1 rounded-full border-[3px] border-anime-ink bg-anime-cyan px-7 py-3 font-comic text-lg uppercase tracking-wider text-anime-ink shadow-[5px_5px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:rotate-0 hover:shadow-[8px_8px_0_0_var(--color-anime-ink)]"
            >
              Get drop alerts
            </Link>
          </div>

          <ul className="mt-12 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
            {TEASERS.map((t) => (
              <li
                key={t.title}
                className="flex flex-col items-center gap-2 rounded-2xl border-[3px] border-anime-ink bg-white px-4 py-6 text-center shadow-[5px_5px_0_0_var(--color-anime-ink)]"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full border-[2.5px] border-anime-ink bg-anime-yellow text-2xl shadow-[2px_2px_0_0_var(--color-anime-ink)]">
                  {t.icon}
                </span>
                <span className="font-comic text-xl uppercase tracking-wide text-anime-ink">
                  {t.title}
                </span>
                <span className="text-sm font-medium text-anime-ink/60">
                  {t.sub}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <Footer />
    </>
  );
}
