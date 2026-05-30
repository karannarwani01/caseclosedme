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
  href: string;
};

const CATEGORIES: Category[] = [
  { slug: "naruto", name: "Naruto", color: "var(--color-anime-orange)", glyph: "鳴", href: "/search" },
  { slug: "one-piece", name: "One Piece", color: "var(--color-anime-cyan)", glyph: "海", href: "/search" },
  { slug: "jujutsu-kaisen", name: "Jujutsu Kaisen", color: "var(--color-anime-purple)", glyph: "呪", href: "/search" },
  { slug: "demon-slayer", name: "Demon Slayer", color: "var(--color-anime-pink)", glyph: "鬼", href: "/search" },
  { slug: "super-mario", name: "Super Mario", color: "var(--color-anime-yellow)", glyph: "★", href: "/search" },
  { slug: "marvel", name: "Marvel", color: "#e23636", glyph: "✦", href: "/search" },
  { slug: "harry-potter", name: "Harry Potter", color: "#4a3a1c", glyph: "⚡", href: "/search" },
  { slug: "dc", name: "DC", color: "#0476f2", glyph: "◆", href: "/search" },
  { slug: "barbie", name: "Barbie", color: "#ff6fa3", glyph: "♥", href: "/search" },
];

// Resolve which file is the "default" (static poster) and which is the "hover" (GIF)
// for each franchise. Drop files at /public/franchises/<slug>.<ext> and they
// auto-wire on the next request — no code change needed.
//
// Static extensions tried in order: png, jpg, jpeg, webp, svg
// Hover GIF expected at: <slug>.gif (if absent, no hover swap)
const FRANCHISE_DIR = path.join(process.cwd(), "public", "franchises");
const STATIC_EXTS = ["png", "jpg", "jpeg", "webp", "svg"] as const;

function resolveAssets(slug: string): { logo?: string; logoHover?: string } {
  let logo: string | undefined;
  for (const ext of STATIC_EXTS) {
    if (fs.existsSync(path.join(FRANCHISE_DIR, `${slug}.${ext}`))) {
      logo = `/franchises/${slug}.${ext}`;
      break;
    }
  }
  const hoverPath = path.join(FRANCHISE_DIR, `${slug}.gif`);
  const logoHover = fs.existsSync(hoverPath) ? `/franchises/${slug}.gif` : undefined;
  // If no static was found but a GIF exists, use the GIF for both states.
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
              href={cat.href}
              className="group flex flex-none flex-col items-center gap-4 md:flex-1 md:min-w-0"
            >
              <div
                className="relative h-28 w-28 overflow-hidden rounded-full border-[2.5px] border-anime-ink shadow-[5px_5px_0_0_var(--color-anime-ink)] transition-transform duration-150 ease-out group-hover:-translate-x-[2px] group-hover:-translate-y-[2px] md:h-36 md:w-36 lg:h-44 lg:w-44 xl:h-48 xl:w-48"
                style={{ background: cat.color }}
              >
                {logo ? (
                  <>
                    {/* Default image — fades out on hover. */}
                    <Image
                      src={logo}
                      alt={`${cat.name} — collectibles`}
                      fill
                      sizes="(max-width: 768px) 112px, (max-width: 1024px) 144px, (max-width: 1280px) 176px, 192px"
                      unoptimized={logo.endsWith(".gif")}
                      className="object-cover transition-opacity duration-300 ease-out group-hover:opacity-0"
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
                      className="object-cover opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                    />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-display text-5xl font-extrabold text-white drop-shadow-[3px_3px_0_rgba(13,10,26,0.6)] md:text-6xl lg:text-7xl xl:text-8xl">
                      {cat.glyph}
                    </span>
                  </div>
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
