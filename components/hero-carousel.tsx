"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";

type Banner = {
  eyebrow: string;
  titleA: string;
  titleB: string;
  subtitle: string;
  cta: string;
  href: string;
  bg: string;
  accent: string;
  highlight: string;
  glyph: string;
};

const BANNERS: Banner[] = [
  {
    eyebrow: "★ Just landed",
    titleA: "EID",
    titleB: "SUPER SALE",
    subtitle:
      "Limited Funkos, slabbed cards, 1/4-scale figures. Up to 50% off — only this week.",
    cta: "Shop now",
    href: "/search",
    bg: "var(--color-anime-pink)",
    accent: "var(--color-anime-lime)",
    highlight: "var(--color-anime-yellow)",
    glyph: "✦",
  },
  {
    eyebrow: "Trading cards",
    titleA: "SLABBED",
    titleB: "& GRADED",
    subtitle:
      "PSA 9 holos, sealed booster boxes, rainbow rares. Chase the grade.",
    cta: "Shop cards",
    href: "/search",
    bg: "var(--color-anime-cyan)",
    accent: "var(--color-anime-yellow)",
    highlight: "var(--color-anime-pink)",
    glyph: "◆",
  },
  {
    eyebrow: "Pre-order",
    titleA: "ARRIVING",
    titleB: "SOON",
    subtitle:
      "Pop! #1525, Stormtrooper bust, Naruto diorama — reserve yours.",
    cta: "Browse pre-orders",
    href: "/search",
    bg: "var(--color-anime-yellow)",
    accent: "var(--color-anime-purple)",
    highlight: "var(--color-anime-cyan)",
    glyph: "✸",
  },
];

export function HeroCarousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % BANNERS.length), 6000);
    return () => clearInterval(t);
  }, []);

  const banner = BANNERS[idx]!;

  return (
    <section
      className="relative w-full overflow-hidden border-b-[2.5px] border-anime-ink"
      style={{ background: banner.bg, transition: "background 500ms ease" }}
    >
      {/* Anime burst rays */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: `repeating-conic-gradient(from 0deg at 50% 50%, ${banner.highlight} 0deg 6deg, transparent 6deg 14deg)`,
          maskImage: "radial-gradient(circle at 50% 50%, black 0 30%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 0 30%, transparent 70%)",
        }}
      />

      {/* Halftone dots overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-anime-ink) 1px, transparent 1.5px)",
          backgroundSize: "10px 10px",
          maskImage:
            "linear-gradient(to right, black, transparent 25%, transparent 75%, black)",
          WebkitMaskImage:
            "linear-gradient(to right, black, transparent 25%, transparent 75%, black)",
        }}
      />

      <div className="relative mx-auto flex min-h-[42vh] max-w-[1800px] items-center px-6 py-10 md:min-h-[48vh] md:px-14 md:py-12 lg:min-h-[52vh]">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center rounded-full border-[2px] border-anime-ink bg-white px-3 py-1 font-display text-[11px] font-extrabold uppercase tracking-[0.12em] text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)]">
            {banner.eyebrow}
          </span>

          <h1 className="mt-5 font-display font-extrabold leading-[0.85] tracking-[-0.04em] text-white">
            <span
              className="inline-block rounded-md border-[3px] border-anime-ink px-3 py-1 text-anime-ink shadow-[4px_4px_0_0_var(--color-anime-ink)] -rotate-1"
              style={{ background: banner.highlight, fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              {banner.titleA}
            </span>
            <br />
            <span
              className="mt-2 inline-block leading-[0.82]"
              style={{
                fontSize: "clamp(3rem, 9vw, 8rem)",
                WebkitTextStroke: "3px var(--color-anime-ink)",
                textShadow:
                  "6px 6px 0 var(--color-anime-ink), 12px 12px 0 rgba(13,10,26,0.18)",
              }}
            >
              {banner.titleB}
            </span>
          </h1>

          <p className="mt-6 max-w-md font-medium text-anime-ink/85 md:text-lg">
            {banner.subtitle}
          </p>

          <Link
            href={banner.href}
            className="mt-8 inline-flex items-center gap-2 rounded-full border-[3px] border-anime-ink bg-anime-ink px-8 py-4 font-display text-base font-extrabold uppercase tracking-wider text-white shadow-[6px_6px_0_0_var(--color-anime-lime)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0_0_var(--color-anime-lime)] md:text-lg"
          >
            {banner.cta} →
          </Link>
        </div>

        {/* Decorative shapes — right side */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 hidden h-[80%] w-[40%] -translate-y-1/2 md:block lg:right-12"
        >
          <div
            className="absolute right-12 top-1/2 flex h-44 w-44 -translate-y-1/2 -rotate-6 items-center justify-center rounded-3xl border-[3px] border-anime-ink shadow-[8px_8px_0_0_var(--color-anime-ink)]"
            style={{ background: banner.accent }}
          >
            <span className="font-display text-[7rem] font-extrabold leading-none text-anime-ink">
              {banner.glyph}
            </span>
          </div>
          <div
            className="absolute left-0 top-2 h-20 w-20 rotate-12 rounded-2xl border-[3px] border-anime-ink shadow-[4px_4px_0_0_var(--color-anime-ink)]"
            style={{ background: "white" }}
          />
          <div
            className="absolute right-0 bottom-2 h-24 w-24 -rotate-12 rounded-full border-[3px] border-anime-ink shadow-[5px_5px_0_0_var(--color-anime-ink)]"
            style={{ background: banner.highlight }}
          />
          <div
            className="absolute right-44 bottom-0 rotate-12 rounded-xl border-[2.5px] border-anime-ink bg-anime-ink px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-white shadow-[3px_3px_0_0_var(--color-anime-lime)]"
          >
            New drop!
          </div>
        </div>
      </div>

      {/* Carousel nav */}
      <button
        aria-label="Previous banner"
        onClick={() => setIdx((i) => (i - 1 + BANNERS.length) % BANNERS.length)}
        className="absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-[2.5px] border-anime-ink bg-white text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[1px] hover:-translate-y-[calc(50%+1px)] hover:shadow-[4px_4px_0_0_var(--color-anime-ink)] md:flex"
      >
        <ChevronLeftIcon className="h-6 w-6" strokeWidth={3} />
      </button>
      <button
        aria-label="Next banner"
        onClick={() => setIdx((i) => (i + 1) % BANNERS.length)}
        className="absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-[2.5px] border-anime-ink bg-white text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[1px] hover:-translate-y-[calc(50%+1px)] hover:shadow-[4px_4px_0_0_var(--color-anime-ink)] md:flex"
      >
        <ChevronRightIcon className="h-6 w-6" strokeWidth={3} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to banner ${i + 1}`}
            onClick={() => setIdx(i)}
            className={
              "h-3 rounded-full border-[2px] border-anime-ink transition-all " +
              (i === idx
                ? "w-10 bg-anime-ink"
                : "w-3 bg-white hover:bg-anime-ink/20")
            }
          />
        ))}
      </div>
    </section>
  );
}
