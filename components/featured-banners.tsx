import Link from "next/link";

type Brand = { name: string; href: string; bg: string };

const BRANDS: Brand[] = [
  {
    name: "Good Smile",
    href: "/search/good-smile",
    bg: "linear-gradient(135deg, var(--color-anime-orange) 0%, #ffaa00 100%)",
  },
  {
    name: "Bandai",
    href: "/search/bandai",
    bg: "linear-gradient(135deg, var(--color-anime-pink) 0%, var(--color-anime-purple) 100%)",
  },
  {
    name: "Funko",
    href: "/search/funko",
    bg: "linear-gradient(135deg, var(--color-anime-cyan) 0%, var(--color-anime-yellow) 100%)",
  },
  {
    name: "Pop Mart",
    href: "/search/pop-mart",
    bg: "linear-gradient(135deg, var(--color-anime-pink) 0%, var(--color-anime-lime) 100%)",
  },
  {
    name: "Hot Toys",
    href: "/search/hot-toys",
    bg: "linear-gradient(135deg, var(--color-anime-ink) 0%, var(--color-anime-purple) 100%)",
  },
  {
    name: "Lego",
    href: "/search/lego",
    bg: "linear-gradient(135deg, var(--color-anime-yellow) 0%, var(--color-anime-orange) 100%)",
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
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {BRANDS.map((b) => (
          <li key={b.name}>
            <Link
              href={b.href}
              className="flex h-32 items-center justify-center rounded-2xl border-[2.5px] border-anime-ink p-4 text-center shadow-[5px_5px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0_0_var(--color-anime-pink)] md:h-36"
              style={{ background: b.bg }}
            >
              <span className="font-display text-xl font-extrabold uppercase leading-tight tracking-tight text-white drop-shadow-[3px_3px_0_rgba(13,10,26,0.6)] md:text-2xl">
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
};

const PROMOS: PromoBanner[] = [
  {
    eyebrow: "Anime drops",
    title: "Naruto & Demon Slayer",
    subtitle: "New 1/4 scales just landed",
    cta: "Shop now",
    href: "/search/anime",
    bg: "linear-gradient(135deg, var(--color-anime-pink) 0%, var(--color-anime-orange) 100%)",
  },
  {
    eyebrow: "Trading cards",
    title: "Pokemon TCG",
    subtitle: "Slabbed singles & sealed boxes",
    cta: "Shop now",
    href: "/search/pokemon-tcg",
    bg: "linear-gradient(135deg, var(--color-anime-yellow) 0%, var(--color-anime-cyan) 100%)",
  },
  {
    eyebrow: "Hot Funko",
    title: "Vaulted Pop!",
    subtitle: "Chase variants & rare finds",
    cta: "Shop now",
    href: "/search/funko-vaulted",
    bg: "linear-gradient(135deg, var(--color-anime-purple) 0%, var(--color-anime-pink) 100%)",
  },
  {
    eyebrow: "Pre-orders",
    title: "Lock in the next drop",
    subtitle: "Reserve before they're gone",
    cta: "Shop now",
    href: "/search/pre-order",
    bg: "linear-gradient(135deg, var(--color-anime-lime) 0%, var(--color-anime-cyan) 100%)",
  },
];

export function PromoBannersRow() {
  return (
    <section className="mx-auto mt-14 w-full px-4 md:mt-20 md:px-8">
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PROMOS.map((p) => (
          <li key={p.title}>
            <Link
              href={p.href}
              className="group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-2xl border-[2.5px] border-anime-ink p-6 shadow-[6px_6px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0_0_var(--color-anime-pink)]"
              style={{ background: p.bg }}
            >
              <div>
                <span className="inline-flex items-center rounded-full border-[2px] border-anime-ink bg-white px-2.5 py-1 font-display text-[10px] font-extrabold uppercase tracking-wider text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)]">
                  {p.eyebrow}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-3xl font-extrabold leading-[0.95] tracking-[-0.02em] text-white drop-shadow-[3px_3px_0_rgba(13,10,26,0.5)] md:text-4xl">
                  {p.title}
                </h3>
                <p className="font-display text-sm font-bold text-white/95 md:text-base">
                  {p.subtitle}
                </p>
                <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full border-[2.5px] border-anime-ink bg-white px-4 py-2 font-display text-sm font-extrabold uppercase tracking-wider text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all group-hover:-translate-x-[1px] group-hover:-translate-y-[1px] group-hover:shadow-[4px_4px_0_0_var(--color-anime-pink)]">
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
