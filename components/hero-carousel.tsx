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
  /**
   * Background treatment. Default is the comic sunburst + halftone. "pitch"
   * swaps in the floodlit stadium scene (converging mown stripes, centre
   * circle, crowd) used by the TCG slide.
   */
  scene?: "pitch";
};

// Shared figure base classes — anchored to the bottom, never intercept the
// slide's link click, with a soft drop shadow so they pop off the burst.
const FIG =
  "pointer-events-none absolute bottom-0 w-auto object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.4)]";
// Same, minus the bottom anchor — for figures that stand *on* the pitch and
// set their own `bottom-[…]` so they land on the grass, not the slide edge.
const FIG_FREE =
  "pointer-events-none absolute w-auto object-contain drop-shadow-[0_16px_18px_rgba(0,0,0,0.45)]";

const PROMOS: Promo[] = [
  {
    id: "op13",
    href: "/search/trading-cards",
    ariaLabel:
      "One Piece Card Game OP-13, Carrying On His Will — English booster boxes. Shop trading cards.",
    scene: "pitch",
    // Night sky over the stands; the grass itself is drawn by <PitchScene/>.
    gradient:
      "linear-gradient(180deg, #04162b 0%, #0a2f52 30%, #0d4a6b 44%, #0d4a6b 100%)",
    rays: "rgba(215,245,255,0.55)",
    badge: "OP-13 · English",
    headline: "One Piece TCG",
    subtitle:
      "‘Carrying On His Will’ booster boxes — 24 sealed packs, straight from Bandai.",
    cta: "Shop Trading Cards",
    figures: [
      {
        src: "/banners/luffy-football.webp",
        width: 558,
        height: 640,
        className: `${FIG_FREE} bottom-[7%] left-[1%] z-20 hidden h-[56%] sm:block md:left-[4%] lg:h-[64%]`,
      },
      {
        src: "/banners/op13-box.webp",
        width: 563,
        height: 600,
        className: `${FIG_FREE} bottom-[13%] left-[22%] z-30 h-[42%] -translate-x-1/2 sm:left-[34%] sm:h-[50%] lg:h-[56%]`,
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

/**
 * Floodlit stadium scene, drawn entirely in CSS so it stays crisp at every
 * breakpoint and costs no image bytes. Layers, back to front: floodlight
 * beams → crowd → hoardings → grass with converging mown stripes → pitch
 * markings → the bloom and contact shadow that seat the booster box on the
 * turf. Figure placement mirrors the `figures` entries of the "pitch" slide,
 * so move both together.
 */
function PitchScene({ rays }: { rays: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* Floodlight banks: two hard glares at the top corners plus a wide,
          low-contrast wash — deliberately unlike the grass fan below, so the
          slide doesn't read as one symmetrical starburst. */}
      <div
        className="absolute inset-x-0 top-0 h-[48%]"
        style={{
          background: `radial-gradient(closest-side at 16% -6%, ${rays} 0%, transparent 74%), radial-gradient(closest-side at 84% -6%, ${rays} 0%, transparent 74%), radial-gradient(140% 100% at 50% 0%, rgba(255,255,255,0.14) 0%, transparent 70%)`,
          maskImage: "linear-gradient(to bottom, black 0, transparent 96%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0, transparent 96%)",
        }}
      />
      {/* Stand roof line + the dark bowl of the stadium behind the crowd */}
      <div
        className="absolute inset-x-0 top-0 h-[40%]"
        style={{
          background:
            "linear-gradient(180deg, rgba(2,10,22,0.94) 0%, rgba(3,18,34,0.6) 30%, rgba(6,30,52,0.15) 100%)",
          maskImage:
            "radial-gradient(150% 112% at 50% 0%, black 56%, transparent 84%)",
          WebkitMaskImage:
            "radial-gradient(150% 112% at 50% 0%, black 56%, transparent 84%)",
        }}
      />
      {/* Crowd in the stands — dotted texture, blurred back into the dark */}
      <div
        className="absolute inset-x-0 top-[13%] h-[29%] opacity-55 blur-[1.6px]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.95) 1.5px, transparent 2.1px), radial-gradient(circle, rgba(255,128,128,0.9) 1.5px, transparent 2.1px), radial-gradient(circle, rgba(255,216,110,0.85) 1.5px, transparent 2.1px), radial-gradient(circle, rgba(120,190,255,0.8) 1.5px, transparent 2.1px)",
          backgroundSize: "9px 7px, 19px 14px, 31px 12px, 43px 17px",
          backgroundPosition: "0 0, 4px 3px, 11px 5px, 17px 9px",
          maskImage:
            "linear-gradient(to bottom, transparent 0, black 26%, black 86%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0, black 26%, black 86%, transparent 100%)",
        }}
      />
      {/* Pitch-side advertising hoardings along the horizon */}
      <div
        className="absolute inset-x-0 top-[41%] h-[4.5%] border-y-[2px] border-black/50"
        style={{
          background:
            "repeating-linear-gradient(90deg, #b81818 0 7%, #f2f2f2 7% 12%, #0d0a1a 12% 19%, #b81818 19% 26%)",
          opacity: 0.85,
        }}
      />
      {/* Grass: base tone + mown stripes converging to a vanishing point */}
      <div className="absolute inset-x-0 bottom-0 top-[45.5%] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #10743a 0%, #158f45 42%, #0f7a38 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-conic-gradient(from 0deg at 50% -14%, rgba(255,255,255,0.085) 0deg 5deg, transparent 5deg 10deg)",
          }}
        />
        {/* Distance haze at the far end + warm light pooling near the camera */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(190,235,255,0.35) 0%, transparent 26%), radial-gradient(120% 80% at 50% 100%, rgba(255,245,200,0.18) 0%, transparent 60%)",
          }}
        />
      </div>
      {/* Goal at the far end — netting, posts, and the shadow it casts on the
          six-yard box. Sits behind the booster box, which frames it. */}
      <div className="absolute left-[22%] top-[31%] h-[16%] w-[38%] -translate-x-1/2 sm:left-[34%] sm:top-[29%] sm:h-[18%] sm:w-[40%]">
        {/* Net: crosshatch over a slight darkening, so it reads against grass */}
        <div
          className="absolute inset-x-[4px] bottom-0 top-[6px]"
          style={{
            background:
              "repeating-linear-gradient(48deg, rgba(255,255,255,0.42) 0 1px, transparent 1px 9px), repeating-linear-gradient(-48deg, rgba(255,255,255,0.42) 0 1px, transparent 1px 9px), linear-gradient(180deg, rgba(3,20,36,0.32) 0%, rgba(3,20,36,0.12) 100%)",
          }}
        />
        {/* Crossbar + posts */}
        <div className="absolute inset-x-0 top-0 h-[6px] rounded-[2px] bg-white/95 shadow-[0_2px_4px_rgba(0,0,0,0.45)]" />
        <div className="absolute bottom-0 left-0 top-0 w-[6px] rounded-[2px] bg-white/95 shadow-[0_2px_4px_rgba(0,0,0,0.45)]" />
        <div className="absolute bottom-0 right-0 top-0 w-[6px] rounded-[2px] bg-white/95 shadow-[0_2px_4px_rgba(0,0,0,0.45)]" />
      </div>
      {/* Six-yard box in front of the goal */}
      <div className="absolute left-[22%] top-[47%] hidden h-[7%] w-[62%] -translate-x-1/2 border-x-[3px] border-b-[3px] border-white/40 sm:left-[34%] sm:block sm:w-[46%]" />
      {/* Pitch markings: far touchline, centre circle, spot */}
      <div className="absolute inset-x-0 top-[46.5%] h-[2px] bg-white/45" />
      <div className="absolute bottom-[6%] left-[22%] h-[26%] w-[46%] -translate-x-1/2 rounded-[50%] border-[3px] border-white/45 sm:left-[34%] sm:w-[40%]" />
      <div className="absolute bottom-[17%] left-[22%] h-[6px] w-[14px] -translate-x-1/2 rounded-[50%] bg-white/50 sm:left-[34%]" />
      {/* Floodlight bloom behind the box */}
      <div
        className="absolute bottom-[8%] left-[22%] h-[62%] w-[70%] -translate-x-1/2 sm:left-[34%] sm:w-[56%]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.16) 45%, transparent 72%)",
        }}
      />
      {/* Contact shadow so the box sits *on* the grass */}
      <div className="absolute bottom-[10.5%] left-[22%] h-[6%] w-[30%] -translate-x-1/2 rounded-[50%] bg-black/55 blur-[8px] sm:left-[34%] sm:w-[24%]" />
      {/* Cards bursting out of the box. The BVB × One Piece Luffy leader is the
          football tie-in, so it gets the biggest, most upright placement. */}
      <FloatingCard
        src="/banners/op13-card-g4.webp"
        ratio="350 / 470"
        className="bottom-[68%] left-[19%] hidden h-[21%] -rotate-[19deg] md:block"
      />
      <FloatingCard
        src="/banners/op13-card-ace.webp"
        ratio="337 / 470"
        className="bottom-[57%] left-[24%] hidden h-[23%] -rotate-[8deg] sm:block"
      />
      <FloatingCard
        src="/banners/op13-card-bvb.webp"
        ratio="336 / 470"
        className="bottom-[13%] left-[43%] hidden h-[30%] rotate-[8deg] sm:block"
        glow
      />
      <FloatingCard
        src="/banners/op13-card-sabo.webp"
        ratio="336 / 470"
        className="bottom-[52%] left-[41%] hidden h-[20%] rotate-[22deg] md:block"
      />
      {/* Edge vignette to seat the whole scene */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 45%, transparent 52%, rgba(2,12,24,0.45) 100%)",
        }}
      />
    </div>
  );
}

/**
 * A tilted OP-13 card bursting out of the box. The face is real set art
 * (cropped from the box lid); the overlay is the foil sheen that makes it
 * catch the floodlights. Sized by the caller's `h-[…]`, 5:7 card ratio.
 */
function FloatingCard({
  src,
  ratio,
  className,
  glow,
}: {
  src: string;
  /** The scan's own w/h — the frame takes the image's exact shape, so the
   *  whole card fits with nothing cropped off the sides or the bottom. */
  ratio: string;
  className: string;
  glow?: boolean;
}) {
  return (
    <span
      className={`absolute z-20 overflow-hidden rounded-[5px] border-2 border-white/85 bg-[#961616] bg-contain bg-center bg-no-repeat ${
        glow
          ? "shadow-[0_0_0_3px_rgba(255,232,120,0.55),0_14px_24px_rgba(0,0,0,0.5)]"
          : "shadow-[0_10px_16px_rgba(0,0,0,0.45)]"
      } ${className}`}
      style={{ backgroundImage: `url(${src})`, aspectRatio: ratio }}
    >
      <span
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 26%, transparent 52%), linear-gradient(0deg, rgba(0,0,0,0.3) 0%, transparent 42%)",
        }}
      />
    </span>
  );
}

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
      {/* Sunburst rays behind the figures (left) — or the stadium scene */}
      {promo.scene === "pitch" ? (
        <PitchScene rays={promo.rays} />
      ) : (
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
      )}
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
      {/* Stadium slide only: darken the right third so the copy stays legible
          over the bright grass. */}
      {promo.scene === "pitch" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, transparent 42%, rgba(4,16,30,0.5) 74%, rgba(4,16,30,0.72) 100%)",
          }}
        />
      )}

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

  // Auto-rotate only after the visitor first interacts (scroll/touch/pointer).
  // A carousel that rotates before the user has engaged repeatedly re-claims
  // the page's Largest Contentful Paint (each new slide = a fresh, larger
  // paint), tanking the metric that mirrors perceived load speed. Real users
  // interact within seconds and still get the rotation.
  const [engaged, setEngaged] = useState(false);
  useEffect(() => {
    if (engaged) return;
    const arm = () => setEngaged(true);
    window.addEventListener("scroll", arm, { once: true, passive: true });
    window.addEventListener("pointerdown", arm, { once: true });
    return () => {
      window.removeEventListener("scroll", arm);
      window.removeEventListener("pointerdown", arm);
    };
  }, [engaged]);
  useEffect(() => {
    if (!engaged) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % PROMOS.length), 8000);
    return () => clearInterval(t);
  }, [engaged]);

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
