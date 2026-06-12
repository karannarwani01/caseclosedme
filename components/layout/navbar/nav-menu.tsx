"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

type LinkItem = { title: string; path: string };

type MegaSection = { heading: string; links: LinkItem[] };

// A featured tile shows a representative photo from `collection` (resolved at
// render from the featuredImages map) and links to that collection.
type FeaturedTile = {
  badge: string;
  title: string;
  collection: string;
  bg: string;
};

type MegaConfig = {
  sections: MegaSection[];
  featured?: FeaturedTile[];
};

const FIGURES_MEGA: MegaConfig = {
  sections: [
    {
      heading: "All Figures",
      links: [
        { title: "All Figures", path: "/search/figures" },
        { title: "Pre Order", path: "/search/pre-order" },
        { title: "New Arrivals", path: "/search/new-arrivals" },
      ],
    },
    {
      heading: "Type",
      links: [
        { title: "H0S", path: "/search/h0s" },
        { title: "PVC Figures", path: "/search/pvc-figures" },
        { title: "SH Figuarts", path: "/search/sh-figuarts" },
        { title: "Anime Figures", path: "/search/anime-figures" },
        { title: "Action Figures", path: "/search/action-figures" },
        { title: "Statues", path: "/search/statues" },
        { title: "Model Kits", path: "/search/model-kits" },
        { title: "1/6 Scale", path: "/search/1-6-scale" },
        { title: "1/8 Scale", path: "/search/1-8-scale" },
        { title: "Life Size Figures", path: "/search/life-size" },
      ],
    },
    {
      heading: "License",
      links: [
        { title: "Dragon Ball", path: "/search/dragon-ball" },
        { title: "Naruto", path: "/search/naruto" },
        { title: "One Piece", path: "/search/one-piece" },
        { title: "Attack on Titan", path: "/search/attack-on-titan" },
        { title: "My Hero Academia", path: "/search/my-hero-academia" },
        { title: "Demon Slayer", path: "/search/demon-slayer" },
        { title: "Marvel", path: "/search/marvel" },
        { title: "DC", path: "/search/dc" },
        { title: "Pokemon", path: "/search/pokemon" },
        { title: "Star Wars", path: "/search/star-wars" },
        { title: "Harry Potter", path: "/search/harry-potter" },
      ],
    },
    {
      heading: "Brands",
      links: [
        { title: "Tsume Art", path: "/search/tsume-art" },
        { title: "Banpresto", path: "/search/banpresto" },
        { title: "Ubisoft", path: "/search/ubisoft" },
        { title: "Good Smile Company", path: "/search/good-smile" },
        { title: "Espada Art", path: "/search/espada-art" },
        { title: "Tamashii Nations", path: "/search/tamashii-nations" },
        { title: "Hot Toys", path: "/search/hot-toys" },
        { title: "Bandai Spirits", path: "/search/bandai-spirits" },
        { title: "Bandai", path: "/search/bandai" },
        { title: "Kotobukiya", path: "/search/kotobukiya" },
        { title: "MegaHouse", path: "/search/megahouse" },
        { title: "Enterbay", path: "/search/enterbay" },
        { title: "Iron Studios", path: "/search/iron-studios" },
      ],
    },
  ],
  featured: [
    {
      badge: "New Drop",
      title: "New Figures",
      collection: "figures",
      bg: "linear-gradient(135deg, var(--color-anime-orange) 0%, var(--color-anime-pink) 100%)",
    },
    {
      badge: "Hot",
      title: "Top Picks",
      collection: "figures",
      bg: "linear-gradient(135deg, var(--color-anime-lime) 0%, var(--color-anime-cyan) 100%)",
    },
  ],
};

const TRADING_MEGA: MegaConfig = {
  sections: [
    {
      heading: "Shop Cards",
      links: [
        { title: "All Cards", path: "/search/cards" },
        { title: "Slabbed (PSA/BGS)", path: "/search/slabbed" },
        { title: "Singles", path: "/search/singles" },
        { title: "Sealed Boxes", path: "/search/sealed" },
      ],
    },
    {
      heading: "Game",
      links: [
        { title: "Pokemon TCG", path: "/search/pokemon-tcg" },
        { title: "Magic: The Gathering", path: "/search/mtg" },
        { title: "Yu-Gi-Oh!", path: "/search/yugioh" },
        { title: "One Piece TCG", path: "/search/op-tcg" },
        { title: "Sports", path: "/search/sports" },
      ],
    },
  ],
  featured: [
    {
      badge: "Sealed",
      title: "Booster Boxes",
      collection: "trading-cards",
      bg: "linear-gradient(135deg, var(--color-anime-yellow) 0%, var(--color-anime-orange) 100%)",
    },
    {
      badge: "Hot",
      title: "Just Dropped",
      collection: "trading-cards",
      bg: "linear-gradient(135deg, var(--color-anime-orange) 0%, var(--color-anime-pink) 100%)",
    },
  ],
};

const FUNKO_MEGA: MegaConfig = {
  sections: [
    {
      heading: "Shop",
      links: [
        { title: "All Pop!", path: "/search/funko" },
        { title: "New Releases", path: "/search/funko-new" },
        { title: "Exclusives", path: "/search/funko-exclusives" },
        { title: "Chase Variants", path: "/search/funko-chase" },
        { title: "Vaulted", path: "/search/funko-vaulted" },
      ],
    },
    {
      heading: "Type",
      links: [
        { title: "Pop! Vinyl", path: "/search/funko-pop-vinyl" },
        { title: "Pop! Soda", path: "/search/funko-soda" },
        { title: "Bitty Pop!", path: "/search/funko-bitty" },
        { title: "Pop! Rides", path: "/search/funko-rides" },
        { title: "Pop! Albums", path: "/search/funko-albums" },
        { title: "Mystery Mini", path: "/search/funko-mini" },
      ],
    },
    {
      heading: "License",
      links: [
        { title: "Marvel", path: "/search/funko-marvel" },
        { title: "DC", path: "/search/funko-dc" },
        { title: "Anime", path: "/search/funko-anime" },
        { title: "Disney", path: "/search/funko-disney" },
        { title: "Movies", path: "/search/funko-movies" },
        { title: "James Bond 007", path: "/search/james-bond-007" },
        { title: "Music", path: "/search/funko-music" },
        { title: "Games", path: "/search/funko-games" },
        { title: "Star Wars", path: "/search/funko-star-wars" },
        { title: "Sports", path: "/search/funko-sports" },
      ],
    },
  ],
  featured: [
    {
      badge: "New",
      title: "New Funko",
      collection: "funko-pops",
      bg: "linear-gradient(135deg, var(--color-anime-yellow) 0%, var(--color-anime-cyan) 100%)",
    },
    {
      badge: "Hot",
      title: "Hot Funko",
      collection: "funko-pops",
      bg: "linear-gradient(135deg, var(--color-anime-pink) 0%, var(--color-anime-ink) 100%)",
    },
  ],
};

const BLIND_BOX_MEGA: MegaConfig = {
  sections: [
    {
      heading: "Shop",
      links: [
        { title: "All Blind Boxes", path: "/search/blind-box" },
        { title: "Just Dropped", path: "/search/blind-box-new" },
        { title: "Whole Cases", path: "/search/blind-box-cases" },
        { title: "Mystery Lots", path: "/search/blind-box-lots" },
      ],
    },
    {
      heading: "Brands",
      links: [
        { title: "Pop Mart", path: "/search/pop-mart" },
        { title: "Sonny Angel", path: "/search/sonny-angel" },
        { title: "Smiski", path: "/search/smiski" },
        { title: "Tokidoki", path: "/search/tokidoki" },
        { title: "Kidrobot", path: "/search/kidrobot" },
        { title: "Bearbrick", path: "/search/bearbrick" },
      ],
    },
    {
      heading: "Series",
      links: [
        { title: "Labubu", path: "/search/labubu" },
        { title: "Skullpanda", path: "/search/skullpanda" },
        { title: "Dimoo", path: "/search/dimoo" },
        { title: "Crybaby", path: "/search/crybaby" },
        { title: "Molly", path: "/search/molly" },
        { title: "Hirono", path: "/search/hirono" },
      ],
    },
  ],
  featured: [
    {
      badge: "Hot",
      title: "New Drops",
      collection: "blind-box",
      bg: "linear-gradient(135deg, var(--color-anime-pink) 0%, var(--color-anime-purple) 100%)",
    },
    {
      badge: "New",
      title: "Top Picks",
      collection: "blind-box",
      bg: "linear-gradient(135deg, var(--color-anime-cyan) 0%, var(--color-anime-purple) 100%)",
    },
  ],
};

const NOVELTY_MEGA: MegaConfig = {
  sections: [
    {
      heading: "Shop",
      links: [
        { title: "All Novelty", path: "/search/novelty" },
        { title: "New In", path: "/search/novelty-new" },
        { title: "Bundles", path: "/search/novelty-bundles" },
      ],
    },
    {
      heading: "Type",
      links: [
        { title: "Plushies", path: "/search/plushies" },
        { title: "Keychains", path: "/search/keychains" },
        { title: "Enamel Pins", path: "/search/pins" },
        { title: "Stickers", path: "/search/stickers" },
        { title: "Posters", path: "/search/posters" },
        { title: "Apparel", path: "/search/apparel" },
        { title: "Mugs & Drinkware", path: "/search/drinkware" },
      ],
    },
    {
      heading: "License",
      links: [
        { title: "Anime", path: "/search/novelty-anime" },
        { title: "Gaming", path: "/search/novelty-gaming" },
        { title: "Movies", path: "/search/novelty-movies" },
        { title: "Music", path: "/search/novelty-music" },
      ],
    },
  ],
  featured: [
    {
      badge: "Cute",
      title: "Pop Mart Picks",
      collection: "pop-mart",
      bg: "linear-gradient(135deg, var(--color-anime-lime) 0%, var(--color-anime-yellow) 100%)",
    },
  ],
};

const TOYS_MEGA: MegaConfig = {
  sections: [
    {
      heading: "Shop",
      links: [
        { title: "All Toys", path: "/search/toys" },
        { title: "New", path: "/search/toys-new" },
        { title: "On Sale", path: "/search/toys-sale" },
      ],
    },
    {
      heading: "Type",
      links: [
        { title: "Lego", path: "/search/lego" },
        { title: "Hot Wheels", path: "/search/hot-wheels" },
        { title: "RC Cars", path: "/search/rc" },
        { title: "Board Games", path: "/search/board-games" },
        { title: "Puzzles", path: "/search/puzzles" },
        { title: "Building Sets", path: "/search/building-sets" },
        { title: "Plush Toys", path: "/search/plush-toys" },
      ],
    },
    {
      heading: "Brands",
      links: [
        { title: "Lego", path: "/search/lego-brand" },
        { title: "Mattel", path: "/search/mattel" },
        { title: "Hasbro", path: "/search/hasbro" },
        { title: "Bandai", path: "/search/bandai-toys" },
        { title: "Tomy", path: "/search/tomy" },
      ],
    },
  ],
  featured: [
    {
      badge: "Fun",
      title: "Blind Boxes",
      collection: "blind-box",
      bg: "linear-gradient(135deg, var(--color-anime-cyan) 0%, var(--color-anime-yellow) 100%)",
    },
  ],
};

const RETRO_MEGA: MegaConfig = {
  sections: [
    {
      heading: "Shop",
      links: [
        { title: "All Retro", path: "/search/retro" },
        { title: "New In", path: "/search/retro-new" },
        { title: "Limited", path: "/search/retro-limited" },
      ],
    },
    {
      heading: "Type",
      links: [
        { title: "Cameras", path: "/search/cameras" },
        { title: "Vinyl Records", path: "/search/vinyl" },
        { title: "Cassettes", path: "/search/cassettes" },
        { title: "Walkmans", path: "/search/walkmans" },
        { title: "VHS", path: "/search/vhs" },
        { title: "Polaroid", path: "/search/polaroid" },
      ],
    },
    {
      heading: "Era",
      links: [
        { title: "70s", path: "/search/retro-70s" },
        { title: "80s", path: "/search/retro-80s" },
        { title: "90s", path: "/search/retro-90s" },
        { title: "Y2K", path: "/search/retro-y2k" },
      ],
    },
  ],
  featured: [
    {
      badge: "Iconic",
      title: "Funko Pops",
      collection: "funko-pops",
      bg: "linear-gradient(135deg, var(--color-anime-orange) 0%, var(--color-anime-pink) 100%)",
    },
  ],
};

const GAMING_MEGA: MegaConfig = {
  sections: [
    {
      heading: "Shop",
      links: [
        { title: "All Gaming", path: "/search/gaming" },
        { title: "New Releases", path: "/search/gaming-new" },
        { title: "On Sale", path: "/search/gaming-sale" },
        { title: "Bundles", path: "/search/gaming-bundles" },
      ],
    },
    {
      heading: "Category",
      links: [
        { title: "Consoles", path: "/search/consoles" },
        { title: "Controllers", path: "/search/controllers" },
        { title: "Games", path: "/search/games" },
        { title: "Headsets", path: "/search/headsets" },
        { title: "Merch", path: "/search/gaming-merch" },
        { title: "Collectibles", path: "/search/gaming-collectibles" },
      ],
    },
    {
      heading: "Platform",
      links: [
        { title: "Nintendo", path: "/search/nintendo" },
        { title: "PlayStation", path: "/search/playstation" },
        { title: "Xbox", path: "/search/xbox" },
        { title: "PC", path: "/search/pc-gaming" },
        { title: "Retro", path: "/search/retro-gaming" },
        { title: "Steam Deck", path: "/search/steam-deck" },
      ],
    },
  ],
  featured: [
    {
      badge: "Drop",
      title: "Funko Pops",
      collection: "funko-pops",
      bg: "linear-gradient(135deg, var(--color-anime-purple) 0%, var(--color-anime-pink) 100%)",
    },
  ],
};

const STILL_GOOD_MEGA: MegaConfig = {
  sections: [
    {
      heading: "Shop",
      links: [
        { title: "All Pre-Loved", path: "/search/still-good" },
        { title: "Just In", path: "/search/still-good-new" },
        { title: "Last Chance", path: "/search/still-good-last" },
      ],
    },
    {
      heading: "Condition",
      links: [
        { title: "Mint", path: "/search/condition-mint" },
        { title: "Near Mint", path: "/search/condition-near-mint" },
        { title: "Lightly Used", path: "/search/condition-lightly-used" },
        { title: "Well Loved", path: "/search/condition-well-loved" },
      ],
    },
    {
      heading: "Category",
      links: [
        { title: "Figures", path: "/search/still-good-figures" },
        { title: "Cards", path: "/search/still-good-cards" },
        { title: "Funko", path: "/search/still-good-funko" },
        { title: "Toys", path: "/search/still-good-toys" },
        { title: "Retro", path: "/search/still-good-retro" },
        { title: "Gaming", path: "/search/still-good-gaming" },
      ],
    },
  ],
  featured: [
    {
      badge: "Deal",
      title: "Figures",
      collection: "figures",
      bg: "linear-gradient(135deg, var(--color-anime-purple) 0%, var(--color-anime-yellow) 100%)",
    },
  ],
};

const MEGA_BY_TITLE: Record<string, MegaConfig> = {
  Figures: FIGURES_MEGA,
  Funko: FUNKO_MEGA,
  "Blind Box": BLIND_BOX_MEGA,
  "Trading Cards": TRADING_MEGA,
  Novelty: NOVELTY_MEGA,
  Toys: TOYS_MEGA,
  Retro: RETRO_MEGA,
  Gaming: GAMING_MEGA,
  "Still Good": STILL_GOOD_MEGA,
};

export function NavMenu({
  links,
  featuredImages = {},
}: {
  links: LinkItem[];
  featuredImages?: Record<string, string[]>;
}) {
  const [active, setActive] = useState<string | null>(null);
  const activeMega = active ? MEGA_BY_TITLE[active] : null;
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openMenu = (title: string) => {
    cancelClose();
    setActive(title);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setActive(null), 150);
  };

  return (
    <>
      <ul
        onMouseLeave={scheduleClose}
        className="hidden shrink-0 items-center justify-center font-display font-extrabold uppercase tracking-[0.02em] xl:flex xl:gap-3 xl:text-sm 2xl:gap-5 2xl:text-base"
      >
        {links.map((l) => (
          <li key={l.title} onMouseEnter={() => openMenu(l.title)}>
            <Link
              href={l.path}
              prefetch={true}
              className="inline-block whitespace-nowrap text-anime-ink transition-colors duration-100 hover:text-anime-pink"
            >
              {l.title}
            </Link>
          </li>
        ))}
      </ul>

      {activeMega && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className="absolute inset-x-0 top-full z-40 border-b-[2.5px] border-anime-ink bg-white"
        >
          <div className="mx-auto grid w-full max-w-[1800px] gap-10 px-6 py-12 lg:px-8 lg:grid-cols-[1fr_1.1fr_1.2fr_1.2fr_1.4fr]">
            {activeMega.sections.map((sec) => (
              <div key={sec.heading} className="flex flex-col gap-4">
                <h3 className="font-display text-sm font-extrabold uppercase tracking-[0.18em] text-anime-ink">
                  {sec.heading}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {sec.links.map((link) => (
                    <li key={link.title}>
                      <Link
                        href={link.path}
                        prefetch={true}
                        className="text-sm font-semibold text-anime-ink/80 transition-colors hover:text-anime-pink"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {activeMega.featured && activeMega.featured.length > 0 && (
              <div className="flex flex-col gap-4">
                <h3 className="font-display text-sm font-extrabold uppercase tracking-[0.18em] text-anime-ink">
                  Featured
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {activeMega.featured.map((f, i) => {
                    const img = featuredImages[f.collection]?.[i];
                    return (
                      <Link
                        key={f.title}
                        href={`/search/${f.collection}`}
                        className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border-[2.5px] border-anime-ink p-4 shadow-[5px_5px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0_0_var(--color-anime-pink)]"
                        style={{ background: f.bg }}
                      >
                        {img ? (
                          <>
                            <Image
                              src={img}
                              alt={f.title}
                              fill
                              sizes="220px"
                              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                            />
                            <div
                              aria-hidden
                              className="absolute inset-0 bg-gradient-to-t from-anime-ink/70 via-anime-ink/10 to-transparent"
                            />
                          </>
                        ) : null}
                        <div className="absolute right-3 top-3 z-10 inline-flex items-center rounded-full border-[2px] border-anime-ink bg-white px-2.5 py-0.5 font-display text-[10px] font-extrabold uppercase tracking-wider text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)]">
                          {f.badge}
                        </div>
                        <div className="relative z-10 rounded-lg border-[2px] border-anime-ink bg-white px-3 py-2 shadow-[2px_2px_0_0_var(--color-anime-ink)]">
                          <p className="font-display text-sm font-extrabold leading-tight text-anime-ink">
                            {f.title}
                          </p>
                          <p className="mt-1 font-display text-[11px] font-extrabold uppercase tracking-wider text-anime-pink">
                            Shop now →
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
