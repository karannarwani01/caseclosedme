// Mega-menu configuration shared by the desktop NavMenu (client) and the
// server Navbar (which filters the mobile menu). Kept free of "use client" so
// both can import the data and the pure filter helpers below.

export type LinkItem = { title: string; path: string };
export type MegaSection = { heading: string; links: LinkItem[] };

// A featured tile shows a representative photo from `collection` (resolved at
// render from the featuredImages map) and links to that collection.
export type FeaturedTile = {
  badge: string;
  title: string;
  collection: string;
  bg: string;
};

export type MegaConfig = {
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

const CARS_MEGA: MegaConfig = {
  sections: [
    {
      heading: "Shop",
      links: [
        { title: "All Cars", path: "/search/die-cast" },
        { title: "Hot Wheels", path: "/search/hot-wheels" },
        { title: "New Arrivals", path: "/search/new-arrivals" },
      ],
    },
    {
      heading: "Type",
      links: [
        { title: "Mainline", path: "/search/mainline" },
        { title: "Premium", path: "/search/premium" },
        { title: "2 Pack", path: "/search/2-pack" },
        { title: "Team Transport", path: "/search/team-transport" },
      ],
    },
    {
      heading: "Series",
      links: [
        { title: "Car Culture", path: "/search/car-culture" },
        { title: "Pop Culture", path: "/search/pop-culture" },
        { title: "Fast & Furious", path: "/search/fast-furious" },
        { title: "Formula 1", path: "/search/formula-1" },
        { title: "Boulevard", path: "/search/boulevard" },
      ],
    },
  ],
  featured: [
    {
      badge: "New",
      title: "Hot Wheels",
      collection: "hot-wheels",
      bg: "linear-gradient(135deg, var(--color-anime-orange) 0%, var(--color-anime-yellow) 100%)",
    },
    {
      badge: "Hot",
      title: "Die-Cast",
      collection: "die-cast",
      bg: "linear-gradient(135deg, var(--color-anime-cyan) 0%, var(--color-anime-purple) 100%)",
    },
  ],
};

const PROTECTORS_MEGA: MegaConfig = {
  sections: [
    {
      heading: "Shop Protectors",
      links: [
        { title: "All Protectors", path: "/search/protectors" },
        { title: "Funko Protectors", path: "/search/funko-protectors" },
        { title: "TCG Protectors", path: "/search/tcg-protectors" },
        {
          title: "Hot Wheels Protectors",
          path: "/search/hot-wheels-protectors",
        },
      ],
    },
  ],
  featured: [
    {
      badge: "",
      title: "Funko",
      collection: "funko-protectors",
      bg: "linear-gradient(135deg, var(--color-anime-yellow) 0%, var(--color-anime-cyan) 100%)",
    },
    {
      badge: "",
      title: "TCG",
      collection: "tcg-protectors",
      bg: "linear-gradient(135deg, var(--color-anime-lime) 0%, var(--color-anime-orange) 100%)",
    },
    {
      badge: "",
      title: "Hot Wheels",
      collection: "hot-wheels-protectors",
      bg: "linear-gradient(135deg, var(--color-anime-orange) 0%, var(--color-anime-pink) 100%)",
    },
  ],
};

export const MEGA_BY_TITLE: Record<string, MegaConfig> = {
  Figures: FIGURES_MEGA,
  Funko: FUNKO_MEGA,
  "Blind Box": BLIND_BOX_MEGA,
  "Trading Cards": TRADING_MEGA,
  Novelty: NOVELTY_MEGA,
  Toys: TOYS_MEGA,
  Cars: CARS_MEGA,
  Protectors: PROTECTORS_MEGA,
  Retro: RETRO_MEGA,
  Gaming: GAMING_MEGA,
  "Still Good": STILL_GOOD_MEGA,
};

// "/search/<handle>" -> "<handle>" (null for the bare "/search" landing link).
function handleFromPath(path: string): string | null {
  const prefix = "/search/";
  return path.startsWith(prefix) ? path.slice(prefix.length) : null;
}

// Keep a link if it has no specific collection handle (e.g. a landing page) or
// its collection currently has products.
function linkIsVisible(link: LinkItem, nonEmpty: Set<string>): boolean {
  const handle = handleFromPath(link.path);
  return handle === null || nonEmpty.has(handle);
}

// Drop empty links + empty sections + featured tiles whose collection is empty.
export function filterMega(
  mega: MegaConfig,
  nonEmpty: Set<string>,
): MegaConfig {
  const sections = mega.sections
    .map((sec) => ({
      ...sec,
      links: sec.links.filter((l) => linkIsVisible(l, nonEmpty)),
    }))
    .filter((sec) => sec.links.length > 0);
  const featured = mega.featured?.filter((f) => nonEmpty.has(f.collection));
  return { sections, featured };
}

// Top-level menus to hide even when their collections technically have
// products. Gaming only contains Funko "game" Pops (Astro Bot, King Groot…)
// which already live under Funko — there's no real gaming stock. Remove a
// title from this set once it has genuine inventory of its own.
const FORCE_HIDDEN_TOP_LEVEL = new Set<string>(["Gaming"]);

// A top-level nav item is shown if it isn't force-hidden and either has no mega
// (plain link) or its mega still has at least one non-empty section.
export function megaHasContent(title: string, nonEmpty: Set<string>): boolean {
  if (FORCE_HIDDEN_TOP_LEVEL.has(title)) return false;
  const mega = MEGA_BY_TITLE[title];
  if (!mega) return true;
  return filterMega(mega, nonEmpty).sections.length > 0;
}
