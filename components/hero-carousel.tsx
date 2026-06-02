"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Figure = {
  src: string;
  width: number;
  height: number;
  // Positioning + sizing classes for this figure within the slide.
  className: string;
};

type Promo = {
  id: string;
  href: string;
  ariaLabel: string;
  // Full-slide background and the colour of the sunburst rays behind figures.
  gradient: string;
  rays: string;
  badge: string;
  headline: string;
  // Body copy shown under the headline. Edit freely per slide.
  subtitle: string;
  cta: string;
  figures: Figure[];
};

// Shared figure base classes — anchored to the bottom, never intercept the
// slide's link click, with a soft drop shadow so they pop off the burst.
const FIG =
  "pointer-events-none absolute bottom-0 w-auto object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.4)]";

const PROMOS: Promo[] = [
  {
    id: "eid",
    href: "/search",
    ariaLabel: "Eid Super Sale — up to 50% off. Shop now.",
    gradient:
      "linear-gradient(100deg, #f6a31e 0%, #f3851d 25%, #ea5a1c 46%, #d2271b 67%, #b81818 100%)",
    rays: "rgba(255,238,155,0.95)",
    badge: "Up to 50% Off",
    headline: "Eid Super Sale",
    subtitle:
      "Funkos, slabbed cards & 1/4-scale figures — up to 50% off, this week only.",
    cta: "Shop Now",
    figures: [
      {
        src: "/banners/carrot-pop.png",
        width: 676,
        height: 946,
        className: `${FIG} left-[20%] z-10 hidden h-[50%] sm:block lg:h-[56%]`,
      },
      {
        src: "/banners/luffy-run.png",
        width: 745,
        height: 1025,
        className: `${FIG} left-[1%] z-20 h-[66%] sm:h-[82%] md:left-[4%] lg:h-[94%]`,
      },
    ],
  },
  {
    id: "one-piece",
    href: "/search/one-piece",
    ariaLabel: "One Piece drop — new arrivals. Shop One Piece.",
    gradient:
      "linear-gradient(100deg, #1ea7d6 0%, #1f7fd1 30%, #1b53b0 60%, #0f2f7a 100%)",
    rays: "rgba(185,238,255,0.9)",
    badge: "New Arrivals",
    headline: "One Piece Drop",
    subtitle:
      "Straw Hat Crew figures & Pops, fresh off the ship — grab the latest landings.",
    cta: "Shop One Piece",
    figures: [
      {
        src: "/banners/luffy-punch.png",
        width: 944,
        height: 1388,
        className: `${FIG} left-[0%] z-20 h-[70%] sm:h-[86%] md:left-[3%] lg:h-[98%]`,
      },
    ],
  },
  {
    id: "funko-vault",
    href: "/search/funko",
    ariaLabel: "Funko Pop vault — exclusives. Shop Funko.",
    gradient:
      "linear-gradient(100deg, #c026d3 0%, #9d1fc9 35%, #6d28d9 70%, #4c1d95 100%)",
    rays: "rgba(255,205,255,0.85)",
    badge: "Exclusives",
    headline: "Funko Pop Vault",
    subtitle:
      "Chase variants, grails & vaulted exclusives — hand-checked, while they last.",
    cta: "Shop Funko",
    figures: [
      {
        src: "/banners/carrot-box.png",
        width: 676,
        height: 938,
        className: `${FIG} left-[3%] z-10 hidden h-[60%] sm:block lg:h-[70%]`,
      },
      {
        src: "/banners/carrot-pop.png",
        width: 676,
        height: 946,
        className: `${FIG} left-[22%] z-20 h-[58%] sm:h-[72%] md:left-[24%] lg:h-[82%]`,
      },
    ],
  },
];

function PromoSlide({ promo, eager }: { promo: Promo; eager: boolean }) {
  return (
    <Link
      href={promo.href}
      aria-label={promo.ariaLabel}
      className="group relative z-10 block min-h-[42vh] w-full overflow-hidden md:min-h-[48vh] lg:min-h-[52vh]"
    >
      {/* Full-bleed themed background */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: promo.gradient }}
      />
      {/* Sunburst rays behind the figures (left) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-[-30%] left-[-15%] w-[75%]"
        style={{
          background: `repeating-conic-gradient(from 0deg at 40% 50%, ${promo.rays} 0deg 4deg, transparent 4deg 11deg)`,
          maskImage:
            "radial-gradient(circle at 40% 50%, black 0 28%, transparent 68%)",
          WebkitMaskImage:
            "radial-gradient(circle at 40% 50%, black 0 28%, transparent 68%)",
        }}
      />
      {/* Halftone dots over the right side */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.5) 1px, transparent 1.5px)",
          backgroundSize: "12px 12px",
          maskImage: "linear-gradient(to right, transparent 45%, black 82%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 45%, black 82%)",
        }}
      />

      {/* Figures bursting from the left */}
      {promo.figures.map((f) => (
        <Image
          key={f.src}
          src={f.src}
          alt=""
          width={f.width}
          height={f.height}
          priority={eager}
          className={f.className}
        />
      ))}

      {/* Headline + CTA on the right */}
      <div className="absolute inset-y-0 right-[4%] z-30 flex max-w-[60%] flex-col items-end justify-center gap-2 text-right md:right-[6%] md:gap-3">
        <span className="-rotate-2 rounded-[3px] border-[2.5px] border-anime-ink bg-anime-yellow px-2.5 py-1 font-display text-xs font-extrabold uppercase tracking-tight text-anime-ink shadow-[3px_3px_0_0_rgba(13,10,26,0.55)] sm:text-base md:text-xl">
          {promo.badge}
        </span>
        <h2
          className="font-display font-extrabold uppercase italic leading-[0.82] text-white"
          style={{
            fontSize: "clamp(1.9rem, 7vw, 6.5rem)",
            transform: "skewX(-7deg)",
            WebkitTextStroke: "2.5px #0d0a1a",
            textShadow: "5px 6px 0 rgba(13,10,26,0.55)",
            letterSpacing: "-0.01em",
          }}
        >
          {promo.headline}
        </h2>
        <p className="hidden max-w-[36ch] text-right text-sm font-semibold leading-snug text-white drop-shadow-[2px_2px_0_rgba(13,10,26,0.6)] sm:block md:text-base lg:text-lg">
          {promo.subtitle}
        </p>
        <span className="mt-1 inline-flex items-center rounded-full border-[2.5px] border-anime-ink bg-gradient-to-b from-[#ff5151] to-[#c21212] px-6 py-2 font-display text-sm font-extrabold uppercase tracking-widest text-white shadow-[4px_4px_0_0_rgba(13,10,26,0.6)] transition-transform group-hover:-translate-y-[2px] sm:px-8 sm:py-2.5 md:text-xl">
          {promo.cta} →
        </span>
      </div>
    </Link>
  );
}

export function HeroCarousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % PROMOS.length), 6000);
    return () => clearInterval(t);
  }, []);

  const promo = PROMOS[idx]!;

  return (
    <section className="relative w-full overflow-hidden border-b-[2.5px] border-anime-ink bg-anime-ink">
      <PromoSlide promo={promo} eager={idx === 0} />

      {/* Carousel nav */}
      <button
        aria-label="Previous banner"
        onClick={() => setIdx((i) => (i - 1 + PROMOS.length) % PROMOS.length)}
        className="absolute left-4 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-[2.5px] border-anime-ink bg-white text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[1px] hover:-translate-y-[calc(50%+1px)] hover:shadow-[4px_4px_0_0_var(--color-anime-ink)] md:flex"
      >
        <ChevronLeftIcon className="h-6 w-6" strokeWidth={3} />
      </button>
      <button
        aria-label="Next banner"
        onClick={() => setIdx((i) => (i + 1) % PROMOS.length)}
        className="absolute right-4 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-[2.5px] border-anime-ink bg-white text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[1px] hover:-translate-y-[calc(50%+1px)] hover:shadow-[4px_4px_0_0_var(--color-anime-ink)] md:flex"
      >
        <ChevronRightIcon className="h-6 w-6" strokeWidth={3} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2">
        {PROMOS.map((p, i) => (
          <button
            key={p.id}
            aria-label={`Go to banner ${i + 1}`}
            onClick={() => setIdx(i)}
            className={
              "h-3 rounded-full border-[2px] border-anime-ink transition-all " +
              (i === idx
                ? "w-10 bg-white"
                : "w-3 bg-white/50 hover:bg-white/80")
            }
          />
        ))}
      </div>
    </section>
  );
}
