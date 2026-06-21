import Image from "next/image";
import Link from "next/link";

type Brand = {
  name: string;
  href: string;
  bg: string;
  glyph: string;
};

const BRANDS: Brand[] = [
  {
    name: "Naruto",
    href: "/search/naruto",
    bg: "linear-gradient(135deg, #ff6a1f 0%, #ffaa00 100%)",
    glyph: "🍥",
  },
  {
    name: "One Piece",
    href: "/search/one-piece",
    bg: "linear-gradient(135deg, #e23636 0%, #ffd60a 100%)",
    glyph: "☠️",
  },
  {
    name: "DC",
    href: "/search/dc",
    bg: "linear-gradient(135deg, #0476f2 0%, #0d0a1a 100%)",
    glyph: "⚡",
  },
  {
    name: "Barbie",
    href: "/search/barbie",
    bg: "linear-gradient(135deg, #ff6fa3 0%, #ff2e93 100%)",
    glyph: "💖",
  },
  {
    name: "Super Mario",
    href: "/search/super-mario",
    bg: "linear-gradient(135deg, #e23636 0%, #1ee3ff 100%)",
    glyph: "🍄",
  },
  {
    name: "Lego",
    href: "/search/lego",
    bg: "linear-gradient(135deg, #ffd60a 0%, #e23636 100%)",
    glyph: "🧱",
  },
  {
    name: "Hot Wheels",
    href: "/search/hot-wheels",
    bg: "linear-gradient(135deg, #ff6a1f 0%, #e23636 100%)",
    glyph: "🏎️",
  },
  {
    name: "Pop Mart",
    href: "/search/pop-mart",
    bg: "linear-gradient(135deg, #ff2e93 0%, #8a2be8 100%)",
    glyph: "🎁",
  },
  {
    name: "Funko",
    href: "/search/funko",
    bg: "linear-gradient(135deg, #1ee3ff 0%, #ffd60a 100%)",
    glyph: "🤖",
  },
];

export function FeaturedBrandsRow() {
  return (
    <section className="mx-auto mt-14 w-full px-4 md:mt-20 md:px-8">
      <div className="mb-8 flex flex-col items-center gap-3 text-center md:mb-10">
        <span className="inline-flex items-center rounded-full border-[2.5px] border-anime-ink bg-anime-cyan px-4 py-1.5 font-display text-xs font-extrabold uppercase tracking-[0.14em] text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)] md:text-sm">
          ◆ Brand collabs
        </span>
        <h2 className="font-display text-4xl font-extrabold leading-[1] tracking-[-0.02em] text-anime-ink md:text-6xl lg:text-7xl">
          Most viewed brands
        </h2>
      </div>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-9">
        {BRANDS.map((b) => (
          <li key={b.name}>
            <Link
              href={b.href}
              className="flex h-36 flex-col items-center justify-center gap-2 rounded-2xl border-[2.5px] border-anime-ink p-3 text-center shadow-[5px_5px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0_0_var(--color-anime-pink)] md:h-40"
              style={{ background: b.bg }}
            >
              <span className="text-4xl drop-shadow-[2px_2px_0_rgba(13,10,26,0.6)] md:text-5xl">
                {b.glyph}
              </span>
              <span className="font-display text-sm font-extrabold uppercase leading-tight tracking-tight text-white drop-shadow-[2px_2px_0_rgba(13,10,26,0.7)] md:text-base">
                {b.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

type PromoBanner = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  bg: string;
  /**
   * Optional banner artwork for the category. Drop a file at
   * /public/banners/<name> and set `image: "/banners/<name>"`. It fills the
   * card behind a dark gradient (so the text stays readable); the `bg` gradient
   * shows until an image is added. The brand logo is baked into the artwork
   * (see Downloads/make_banner.py), so there's no separate logo field.
   */
  image?: string;
};

// Top 4 shopping categories (by catalogue size + distinct departments).
const PROMOS: PromoBanner[] = [
  {
    eyebrow: "Vinyl figures",
    title: "Funko Pops",
    subtitle: "Chases, exclusives & grails",
    cta: "Shop now",
    href: "/search/funko-pops",
    bg: "linear-gradient(135deg, var(--color-anime-pink) 0%, var(--color-anime-orange) 100%)",
    image: "/banners/funko-pops-v4.webp",
  },
  {
    eyebrow: "TCG",
    title: "Trading Cards",
    subtitle: "Pokémon, One Piece & sealed boxes",
    cta: "Shop now",
    href: "/search/trading-cards",
    bg: "linear-gradient(135deg, var(--color-anime-yellow) 0%, var(--color-anime-cyan) 100%)",
    image: "/banners/trading-cards.webp",
  },
  {
    eyebrow: "Die-cast",
    title: "Hot Wheels",
    subtitle: "Premium & mainline cars",
    cta: "Shop now",
    href: "/search/hot-wheels",
    bg: "linear-gradient(135deg, var(--color-anime-purple) 0%, var(--color-anime-pink) 100%)",
    image: "/banners/hot-wheels-v4.webp",
  },
  {
    eyebrow: "Surprise",
    title: "Blind Boxes",
    subtitle: "Labubu & Pop Mart drops",
    cta: "Shop now",
    href: "/search/blind-box",
    bg: "linear-gradient(135deg, var(--color-anime-lime) 0%, var(--color-anime-cyan) 100%)",
    image: "/banners/blind-box.webp",
  },
];

export function PromoBannersRow() {
  return (
    <section className="mx-auto mt-14 w-full px-4 md:mt-20 md:px-8">
      <div className="mb-8 flex flex-col items-center gap-3 text-center md:mb-10">
        <span className="inline-flex items-center rounded-full border-[2.5px] border-anime-ink bg-anime-lime px-4 py-1.5 font-display text-xs font-extrabold uppercase tracking-[0.14em] text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)] md:text-sm">
          ◆ Browse
        </span>
        <h2 className="font-display text-4xl font-extrabold leading-[1] tracking-[-0.02em] text-anime-ink md:text-6xl lg:text-7xl">
          Shop by Category
        </h2>
      </div>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PROMOS.map((p) => (
          <li key={p.title}>
            <Link
              href={p.href}
              className="group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-2xl border-[2.5px] border-anime-ink p-6 shadow-[6px_6px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0_0_var(--color-anime-pink)]"
              style={{ background: p.bg }}
            >
              {p.image ? (
                <>
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="(min-width:1024px) 23vw, (min-width:640px) 46vw, 92vw"
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  />
                  {/* Dark gradient so the bottom title/CTA stay readable. */}
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-anime-ink/85 via-anime-ink/25 to-anime-ink/10"
                  />
                </>
              ) : null}
              <div className="relative z-10">
                <span className="inline-flex items-center rounded-full border-[2px] border-anime-ink bg-white px-2.5 py-1 font-display text-[10px] font-extrabold uppercase tracking-wider text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)]">
                  {p.eyebrow}
                </span>
              </div>
              <div className="relative z-10 flex flex-col gap-2">
                <h3 className="font-display text-lg font-extrabold leading-[0.95] tracking-[-0.02em] text-white drop-shadow-[3px_3px_0_rgba(13,10,26,0.5)] md:text-2xl">
                  {p.title}
                </h3>
                <p className="font-display text-[11px] font-bold text-white/95 md:text-xs">
                  {p.subtitle}
                </p>
                <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full border-[2.5px] border-anime-ink bg-white px-3.5 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all group-hover:-translate-x-[1px] group-hover:-translate-y-[1px] group-hover:shadow-[4px_4px_0_0_var(--color-anime-pink)]">
                  {p.cta} →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
