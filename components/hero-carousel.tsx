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
   * swaps in the floodlit stadium scene used by the TCG slide; "lab" swaps in
   * Stark's workshop (holo table, blueprint grid, workbench) for the Funko
   * slide.
   */
  scene?: "pitch" | "lab" | "track";
  /**
   * Painted backdrop for the slide, drawn full-bleed behind the figures. Used
   * where illustration beats anything CSS can draw (the lab interior).
   */
  sceneImage?: string;
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
    id: "hot-wheels",
    href: "/search/hot-wheels",
    ariaLabel: "Hot Wheels die-cast — new arrivals. Shop Hot Wheels.",
    scene: "track",
    sceneImage: "/banners/hot-wheels-track.webp",
    // Warm track orange behind the artwork; the art carries the scene.
    gradient:
      "linear-gradient(160deg, #3a1405 0%, #7a2c07 44%, #c2560f 74%, #7a2c07 100%)",
    rays: "rgba(255,196,120,0.55)",
    badge: "Die-cast",
    headline: "Hot Wheels",
    subtitle:
      "Premium & mainline 1:64 — Car Culture, Boulevard and Real Riders, fresh off the peg.",
    cta: "Shop Hot Wheels",
    figures: [
      {
        src: "/banners/hw-card-nissan.webp",
        width: 474,
        height: 620,
        className: `${FIG_FREE} bottom-[9%] left-[5%] z-10 hidden h-[48%] sm:block lg:h-[54%]`,
      },
      {
        src: "/banners/hw-card-bugatti.webp",
        width: 412,
        height: 620,
        className: `${FIG_FREE} bottom-[9%] left-[33%] z-10 hidden h-[48%] md:block lg:h-[54%]`,
      },
      {
        src: "/banners/hw-card-reventon.webp",
        width: 502,
        height: 620,
        className: `${FIG_FREE} bottom-[6%] left-[17%] z-20 h-[50%] sm:h-[56%] lg:h-[62%]`,
      },
    ],
  },
  {
    id: "funko-vault",
    href: "/search/funko",
    ariaLabel: "Funko Pop vault — Marvel exclusives. Shop Funko.",
    scene: "lab",
    // Fallback under the scene; <LabScene/> paints the lab itself.
    gradient:
      "linear-gradient(160deg, #0a1f34 0%, #123855 46%, #235a83 78%, #0a1f34 100%)",
    rays: "rgba(120,210,250,0.42)",
    badge: "Exclusives",
    headline: "Funko Pop Vault",
    subtitle:
      "Chase variants, grails & vaulted exclusives — hand-checked, while they last.",
    cta: "Shop Funko",
    figures: [
      {
        src: "/banners/pop-spiderman.webp",
        width: 380,
        height: 600,
        className: `${FIG_FREE} bottom-[11%] left-[6%] z-10 hidden h-[44%] sm:block lg:h-[50%]`,
      },
      {
        src: "/banners/pop-cap.webp",
        width: 308,
        height: 420,
        className: `${FIG_FREE} bottom-[12%] left-[28%] z-10 hidden h-[38%] sm:block lg:h-[43%]`,
      },
      {
        src: "/banners/pop-ironman.webp",
        width: 379,
        height: 640,
        className: `${FIG_FREE} bottom-[8%] left-[17%] z-20 h-[46%] sm:h-[54%] lg:h-[61%]`,
      },
    ],
  },
];

/**
 * Egghead-style laboratory, drawn entirely in CSS: luminous cyan room with a
 * white-hot energy vortex behind the figures, floating holographic panels,
 * ribbed ceiling with recessed fixtures, wall console and a lit floor run.
 * Figure placement mirrors the `figures` entries of the "lab" slide.
 */
function HoloPanel({
  style,
  kind,
}: {
  style: React.CSSProperties;
  kind: "rows" | "bars" | "gauge";
}) {
  return (
    <div
      className="absolute rounded-[8px] border-[1.5px] border-[#8ff0ff]"
      style={{
        ...style,
        background:
          "linear-gradient(160deg, rgba(8,58,96,0.62) 0%, rgba(12,78,124,0.46) 60%, rgba(18,98,148,0.3) 100%)",
        boxShadow:
          "0 0 26px rgba(120,225,255,0.75), inset 0 0 26px rgba(120,225,255,0.4)",
      }}
    >
      <span className="absolute left-[8%] top-[7%] h-[3px] w-[34%] rounded-full bg-[#d6faff]" />
      {kind === "rows" &&
        [24, 38, 52, 66, 80].map((t, i) => (
          <span
            key={t}
            className="absolute left-[8%] h-[3.5px] rounded-full bg-[#9ff0ff]"
            style={{ top: `${t}%`, width: `${[64, 42, 56, 32, 48][i]}%` }}
          />
        ))}
      {kind === "bars" &&
        [22, 36, 50, 64, 78].map((x, i) => (
          <span
            key={x}
            className="absolute bottom-[14%] w-[8%] rounded-t bg-[#7fe9ff]"
            style={{ left: `${x - 8}%`, height: `${[26, 48, 34, 62, 40][i]}%` }}
          />
        ))}
      {kind === "gauge" && (
        <>
          <span className="absolute left-1/2 top-1/2 h-[54%] w-[54%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#9ff0ff]" />
          <span className="absolute left-1/2 top-1/2 h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[#d6faff]" />
        </>
      )}
    </div>
  );
}

function LabScene({ rays }: { rays: string }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* Luminous room: white-hot core behind the figures out to steel navy */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 92% at 26% 54%, #f6fdff 0%, #d3f1ff 16%, #93d4f2 34%, #4d97c8 54%, #235a83 72%, #123855 88%, #0a1f34 100%)",
        }}
      />
      {/* Back wall panel seams */}
      <div
        className="absolute inset-x-0 top-0 h-[80%] opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(220,250,255,0.5) 1px, transparent 1px), linear-gradient(180deg, rgba(220,250,255,0.32) 1px, transparent 1px)",
          backgroundSize: "116px 100%, 100% 58px",
          maskImage:
            "radial-gradient(70% 90% at 26% 54%, transparent 20%, black 70%)",
          WebkitMaskImage:
            "radial-gradient(70% 90% at 26% 54%, transparent 20%, black 70%)",
        }}
      />
      {/* Ceiling: structural ribs + recessed fixtures with halos */}
      <div className="absolute inset-x-0 top-0 h-[36%] overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute inset-x-[-22%] rounded-[50%] border-t-[12px] border-[#0f3050]"
            style={{
              top: `${-20 + i * 14}%`,
              height: `${50 + i * 9}%`,
              boxShadow: "inset 0 10px 0 rgba(150,235,255,0.5)",
            }}
          />
        ))}
        {[13, 33, 53, 73, 91].map((x, i) => (
          <span key={x}>
            <span
              className="absolute h-[9%] w-[6%] -translate-x-1/2 rounded-[50%] bg-white"
              style={{
                left: `${x}%`,
                top: `${18 + (i % 2) * 10}%`,
                boxShadow: "0 0 40px 16px rgba(190,240,255,0.95)",
              }}
            />
            <span
              className="absolute h-[16%] w-[11%] -translate-x-1/2 rounded-[50%] border border-[rgba(190,240,255,0.5)]"
              style={{ left: `${x}%`, top: `${14 + (i % 2) * 10}%` }}
            />
          </span>
        ))}
      </div>
      {/* Energy vortex behind the centre figure */}
      <div className="absolute bottom-[14%] left-[19%] h-[104%] w-[52%] -translate-x-1/2">
        <div
          className="absolute inset-0 rounded-[50%]"
          style={{
            background: `radial-gradient(closest-side, rgba(255,255,255,0.98) 0%, rgba(205,247,255,0.8) 22%, ${rays} 46%, rgba(60,150,220,0.16) 66%, transparent 80%)`,
          }}
        />
        {[8, 18, 28, 38].map((i, n) => (
          <div
            key={i}
            className={`absolute rounded-[50%] border-2 ${n % 2 ? "border-dashed" : ""}`}
            style={{
              inset: `${i}%`,
              borderColor: `rgba(215,250,255,${0.85 - n * 0.15})`,
              boxShadow: "0 0 30px rgba(160,235,255,0.85)",
            }}
          />
        ))}
        {/* Radial spokes, the vortex pulling inward */}
        <div
          className="absolute inset-[4%] rounded-[50%] opacity-70"
          style={{
            background:
              "repeating-conic-gradient(from 0deg at 50% 50%, rgba(235,252,255,0.55) 0deg 1.2deg, transparent 1.2deg 9deg)",
            maskImage:
              "radial-gradient(closest-side, transparent 34%, black 62%, transparent 92%)",
            WebkitMaskImage:
              "radial-gradient(closest-side, transparent 34%, black 62%, transparent 92%)",
          }}
        />
        {/* Lightning arcing off the core */}
        {[14, 68, 132, 205, 262, 318].map((deg) => (
          <span
            key={deg}
            className="absolute left-1/2 top-1/2 h-[52%] w-[6px] origin-top bg-white"
            style={{
              transform: `rotate(${deg}deg)`,
              clipPath:
                "polygon(38% 0, 62% 0, 44% 30%, 78% 34%, 30% 66%, 58% 70%, 20% 100%, 40% 66%, 12% 62%, 46% 32%, 22% 28%)",
              boxShadow: "0 0 18px rgba(190,245,255,0.95)",
              opacity: 0.9,
            }}
          />
        ))}
      </div>
      {/* Wall consoles left and right */}
      <div className="absolute bottom-[22%] left-0 hidden h-[26%] w-[13%] rounded-r-[10px] border-y-2 border-r-2 border-[rgba(180,240,255,0.5)] bg-[rgba(10,52,86,0.6)] sm:block">
        <span className="absolute inset-x-[10%] top-[16%] h-[8%] rounded bg-[#8ff0ff]/80" />
        <span className="absolute inset-x-[10%] top-[34%] h-[8%] w-[54%] rounded bg-[#8ff0ff]/60" />
        <span className="absolute inset-x-[10%] bottom-[18%] h-[22%] rounded bg-[rgba(140,235,255,0.25)]" />
      </div>
      {/* Floating holo panels */}
      <HoloPanel
        kind="rows"
        style={{
          left: "2%",
          top: "14%",
          width: "16%",
          height: "30%",
          transform: "rotate(-7deg)",
        }}
      />
      <HoloPanel
        kind="bars"
        style={{
          left: "33%",
          top: "10%",
          width: "13%",
          height: "26%",
          transform: "rotate(6deg)",
        }}
      />
      <HoloPanel
        kind="gauge"
        style={{
          left: "42%",
          top: "46%",
          width: "10%",
          height: "26%",
          transform: "rotate(-5deg)",
        }}
      />
      <HoloPanel
        kind="rows"
        style={{
          left: "56%",
          top: "20%",
          width: "12%",
          height: "24%",
          transform: "rotate(4deg)",
        }}
      />
      {/* Floor: console run with a lit lip, then perspective tiling */}
      <div className="absolute inset-x-0 bottom-0 h-[24%]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(232,250,255,0.95) 0%, rgba(150,210,240,0.92) 34%, rgba(46,110,158,0.95) 100%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-[3px] bg-white shadow-[0_0_22px_7px_rgba(190,240,255,0.9)]" />
        <div
          className="absolute inset-0 opacity-45"
          style={{
            background:
              "repeating-conic-gradient(from 0deg at 26% -46%, rgba(255,255,255,0.55) 0deg 0.5deg, transparent 0.5deg 6deg)",
          }}
        />
      </div>
      {/* Drifting shards */}
      {[
        [9, 28],
        [24, 16],
        [37, 62],
        [49, 24],
        [55, 70],
        [64, 44],
      ].map(([l, t], i) => (
        <span
          key={`${l}-${t}`}
          className="absolute bg-white/80"
          style={{
            left: `${l}%`,
            top: `${t}%`,
            height: `${2 + (i % 3)}%`,
            width: `${0.9 + (i % 2) * 0.6}%`,
            transform: `rotate(${18 + i * 23}deg)`,
            boxShadow: "0 0 14px rgba(210,248,255,0.95)",
          }}
        />
      ))}
      {/* Contact shadows seating each Pop on the floor run */}
      {[
        ["6%", "17%", "10%"],
        ["28%", "12%", "11%"],
        ["17%", "21%", "7%"],
      ].map(([left, w, bottom]) => (
        <div
          key={left}
          className="absolute hidden h-[3.5%] -translate-x-1/2 rounded-[50%] bg-[#0a2136]/45 blur-[7px] sm:block"
          style={{ left: `calc(${left} + ${w} / 2)`, width: w, bottom }}
        />
      ))}
      {/* Corner falloff so the core reads as the light source */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(118% 100% at 26% 54%, transparent 44%, rgba(6,26,46,0.6) 100%)",
        }}
      />
    </div>
  );
}

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
      ) : promo.scene === "lab" ? (
        <LabScene rays={promo.rays} />
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
      {/* Scene slides: darken the right third so the copy stays legible. */}
      {promo.scene && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[6]"
          style={{
            background:
              "linear-gradient(to right, transparent 34%, rgba(6,18,34,0.58) 66%, rgba(6,18,34,0.8) 100%)",
          }}
        />
      )}

      {/* Painted backdrop, where the slide uses artwork instead of CSS */}
      {promo.sceneImage && (
        <Image
          src={promo.sceneImage}
          alt=""
          width={1600}
          height={534}
          priority={eager}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5] h-full w-full object-cover"
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
