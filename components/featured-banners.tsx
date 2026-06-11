import { getCollectionProducts } from "lib/shopify";
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

type FeaturedCategory = {
  handle: string;
  title: string;
  badge: string;
  bg: string;
};

// Each card is a category; its photo is pulled from the first product in that
// collection. Categories with no products are skipped.
const FEATURED: FeaturedCategory[] = [
  {
    handle: "funko-pops",
    title: "Funko Pops",
    badge: "Bestsellers",
    bg: "linear-gradient(135deg, var(--color-anime-cyan) 0%, var(--color-anime-purple) 100%)",
  },
  {
    handle: "pop-mart",
    title: "Pop Mart & Labubu",
    badge: "Hot drop",
    bg: "linear-gradient(135deg, var(--color-anime-pink) 0%, var(--color-anime-purple) 100%)",
  },
  {
    handle: "trading-cards",
    title: "Trading Cards",
    badge: "Sealed",
    bg: "linear-gradient(135deg, var(--color-anime-lime) 0%, var(--color-anime-cyan) 100%)",
  },
  {
    handle: "one-piece",
    title: "One Piece",
    badge: "Fan favourite",
    bg: "linear-gradient(135deg, var(--color-anime-orange) 0%, var(--color-anime-yellow) 100%)",
  },
];

export async function PromoBannersRow() {
  const cards = await Promise.all(
    FEATURED.map(async (f) => {
      const products = await getCollectionProducts({ collection: f.handle });
      const image = products.find((p) => p.featuredImage?.url)?.featuredImage;
      return { ...f, image };
    }),
  );
  const visible = cards.filter((c) => c.image);
  if (!visible.length) return null;

  return (
    <section className="mx-auto mt-14 w-full px-4 md:mt-20 md:px-8">
      <div className="mb-8 flex flex-col items-center gap-3 text-center md:mb-10">
        <span className="inline-flex items-center rounded-full border-[2.5px] border-anime-ink bg-anime-pink px-4 py-1.5 font-display text-xs font-extrabold uppercase tracking-[0.14em] text-white shadow-[2px_2px_0_0_var(--color-anime-ink)] md:text-sm">
          ★ Featured
        </span>
        <h2 className="font-display text-4xl font-extrabold leading-[1] tracking-[-0.02em] text-anime-ink md:text-6xl lg:text-7xl">
          Shop by category
        </h2>
      </div>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((c) => (
          <li key={c.handle}>
            <Link
              href={`/search/${c.handle}`}
              className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl border-[2.5px] border-anime-ink shadow-[6px_6px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0_0_var(--color-anime-pink)]"
              style={{ background: c.bg }}
            >
              <span className="absolute right-3 top-3 z-10 inline-flex items-center rounded-full border-[2px] border-anime-ink bg-white px-2.5 py-1 font-display text-[10px] font-extrabold uppercase tracking-wider text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)]">
                {c.badge}
              </span>
              {/* product picture floating on the gradient */}
              <div className="relative flex-1">
                <Image
                  src={c.image!.url}
                  alt={c.image!.altText || c.title}
                  fill
                  loading="eager"
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                  className="object-contain p-5 drop-shadow-[3px_6px_8px_rgba(13,10,26,0.4)] transition-transform duration-300 ease-out group-hover:scale-105 group-hover:-rotate-2"
                />
              </div>
              <div className="relative z-10 m-3 rounded-xl border-[2.5px] border-anime-ink bg-white p-3 shadow-[3px_3px_0_0_var(--color-anime-ink)]">
                <h3 className="font-display text-base font-extrabold uppercase leading-tight tracking-tight text-anime-ink">
                  {c.title}
                </h3>
                <span className="mt-1.5 inline-flex items-center gap-1 font-display text-xs font-extrabold uppercase tracking-wider text-anime-pink">
                  Shop now →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
