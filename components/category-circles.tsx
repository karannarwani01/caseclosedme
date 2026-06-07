import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";

type Category = {
  /** URL-safe slug — also the filename stem used in /public/franchises/. */
  slug: string;
  name: string;
  /** Brand color shown if no image files are present yet. */
  color: string;
  /** Glyph fallback rendered when no `<slug>.png/jpg/svg` is found. */
  glyph: string;
};

const CATEGORIES: Category[] = [
  {
    slug: "naruto",
    name: "Naruto",
    color: "var(--color-anime-orange)",
    glyph: "鳴",
  },
  {
    slug: "one-piece",
    name: "One Piece",
    color: "var(--color-anime-cyan)",
    glyph: "海",
  },
  {
    slug: "bleach",
    name: "Bleach",
    color: "var(--color-anime-purple)",
    glyph: "死",
  },
  {
    slug: "demon-slayer",
    name: "Demon Slayer",
    color: "var(--color-anime-pink)",
    glyph: "鬼",
  },
  {
    slug: "wwe",
    name: "WWE",
    color: "var(--color-anime-yellow)",
    glyph: "W",
  },
  {
    slug: "marvel",
    name: "Marvel",
    color: "#e23636",
    glyph: "✦",
  },
  {
    slug: "harry-potter",
    name: "Harry Potter",
    color: "#4a3a1c",
    glyph: "⚡",
  },
  { slug: "dc", name: "DC", color: "#0476f2", glyph: "◆" },
  {
    slug: "barbie",
    name: "Barbie",
    color: "#ff6fa3",
    glyph: "♥",
  },
];

// Resolve which file is the "default" (static poster) and which is the "hover" (GIF)
// for each franchise. Drop files at /public/franchises/<slug>.<ext> and they
// auto-wire on the next request — no code change needed.
//
// Static extensions tried in order: png, jpg, jpeg, webp, svg
// Hover GIF expected at: <slug>.gif (if absent, no hover swap)
const FRANCHISE_DIR = path.join(process.cwd(), "public", "franchises");
const STATIC_EXTS = ["png", "jpg", "jpeg", "webp", "svg"] as const;

// Append the file's modified-time so the browser refetches whenever an image
// is swapped — filenames stay the same, so without this a replaced image keeps
// serving from cache.
function publicUrl(rel: string, abs: string): string {
  try {
    return `${rel}?v=${Math.round(fs.statSync(abs).mtimeMs)}`;
  } catch {
    return rel;
  }
}

function resolveAssets(slug: string): { logo?: string; logoHover?: string } {
  let logo: string | undefined;
  for (const ext of STATIC_EXTS) {
    const abs = path.join(FRANCHISE_DIR, `${slug}.${ext}`);
    if (fs.existsSync(abs)) {
      logo = publicUrl(`/franchises/${slug}.${ext}`, abs);
      break;
    }
  }
  // Hover image: a second still (`<slug>-hover.<ext>`) wins, else an animated
  // `<slug>.gif`. Either one crossfades in on hover (figure → face, like
  // littlethings.me).
  let logoHover: string | undefined;
  for (const ext of STATIC_EXTS) {
    const abs = path.join(FRANCHISE_DIR, `${slug}-hover.${ext}`);
    if (fs.existsSync(abs)) {
      logoHover = publicUrl(`/franchises/${slug}-hover.${ext}`, abs);
      break;
    }
  }
  const gifAbs = path.join(FRANCHISE_DIR, `${slug}.gif`);
  if (!logoHover && fs.existsSync(gifAbs)) {
    logoHover = publicUrl(`/franchises/${slug}.gif`, gifAbs);
  }
  // If no static was found but a hover exists, use the hover for both states.
  if (!logo && logoHover) return { logo: logoHover, logoHover };
  return { logo, logoHover };
}

export function CategoryCircles() {
  return (
    <section className="mx-auto mt-14 w-full px-4 md:mt-20 md:px-8">
      <div className="flex gap-6 overflow-x-auto pb-6 md:justify-between md:gap-4 md:overflow-visible">
        {CATEGORIES.map((cat) => {
          const { logo, logoHover } = resolveAssets(cat.slug);
          return (
            <Link
              key={cat.slug}
              href={`/search/${cat.slug}`}
              className="group flex flex-none flex-col items-center gap-4 md:flex-1 md:min-w-0"
            >
              <div
                className="relative h-28 w-28 overflow-hidden rounded-full border-[2.5px] border-anime-ink shadow-[5px_5px_0_0_var(--color-anime-ink)] transition-transform duration-150 ease-out group-hover:-translate-x-[2px] group-hover:-translate-y-[2px] md:h-36 md:w-36 lg:h-44 lg:w-44 xl:h-48 xl:w-48"
                style={{
                  background: `radial-gradient(circle at 50% 28%, color-mix(in srgb, ${cat.color} 50%, #fff) 0%, ${cat.color} 72%)`,
                }}
              >
                {logo ? (
                  <>
                    {/* Default image — fades out on hover. */}
                    <Image
                      src={logo}
                      alt={`${cat.name} — collectibles`}
                      fill
                      sizes="(max-width: 768px) 112px, (max-width: 1024px) 144px, (max-width: 1280px) 176px, 192px"
                      unoptimized={/\.gif(\?|$)/i.test(logo)}
                      className="object-contain transition-opacity duration-300 ease-out group-hover:opacity-0"
                    />
                    {/* Hover image — fades in on hover. Usually an animated GIF.
                        `unoptimized` keeps Next's image pipeline from stripping the animation. */}
                    <Image
                      src={logoHover ?? logo}
                      alt=""
                      aria-hidden
                      fill
                      sizes="(max-width: 768px) 112px, (max-width: 1024px) 144px, (max-width: 1280px) 176px, 192px"
                      unoptimized
                      className="object-contain opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                    />
                  </>
                ) : (
                  <>
                    {/* Rest face — the glyph, fades out on hover. */}
                    <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-out group-hover:opacity-0">
                      <span className="font-display text-5xl font-extrabold text-white drop-shadow-[3px_3px_0_rgba(13,10,26,0.6)] md:text-6xl lg:text-7xl xl:text-8xl">
                        {cat.glyph}
                      </span>
                    </div>
                    {/* Hover face — dark panel with the franchise name, fades in. */}
                    <div className="absolute inset-0 flex items-center justify-center bg-anime-ink px-3 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
                      <span className="text-center font-display text-base font-extrabold uppercase leading-tight tracking-[0.04em] text-white md:text-xl lg:text-2xl">
                        {cat.name}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <p className="text-center font-display text-sm font-extrabold uppercase tracking-[0.06em] text-anime-ink md:text-base">
                {cat.name}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
