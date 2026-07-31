import Footer from "components/layout/footer";
import type { Metadata } from "next";
import Link from "next/link";

// Without this, a bad URL fell through to Next's built-in 404 — unstyled black
// Helvetica on white, no branding, and no way back into the shop. Dead links do
// happen (old drops, shared URLs, a collection that emptied out), so the miss
// should still look like the store and offer a way forward.
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-24 text-center sm:py-32">
        <span className="inline-flex items-center rounded-full border-[2.5px] border-anime-ink bg-anime-lime px-4 py-1.5 font-display text-xs font-extrabold uppercase tracking-[0.14em] text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)]">
          ◆ 404
        </span>

        <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1] tracking-[-0.02em] text-anime-ink md:text-7xl">
          This one got away
        </h1>

        <p className="mt-4 font-comic text-base text-anime-ink/70">
          That page isn&apos;t here. It may have sold out, been renamed, or
          never existed.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/search"
            className="inline-flex items-center rounded-full border-[2.5px] border-anime-ink bg-anime-pink px-6 py-3 font-display text-sm font-extrabold uppercase tracking-wide text-white shadow-[4px_4px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-anime-ink)]"
          >
            Shop everything →
          </Link>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border-[2.5px] border-anime-ink bg-white px-6 py-3 font-display text-sm font-extrabold uppercase tracking-wide text-anime-ink shadow-[4px_4px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-anime-ink)]"
          >
            Back home
          </Link>
        </div>
      </section>
      <Footer />
    </>
  );
}
