import Link from "next/link";

type Category = {
  name: string;
  color: string;
  glyph: string;
  href: string;
};

const CATEGORIES: Category[] = [
  { name: "Naruto", color: "var(--color-anime-orange)", glyph: "鳴", href: "/search" },
  { name: "One Piece", color: "var(--color-anime-cyan)", glyph: "海", href: "/search" },
  { name: "Jujutsu Kaisen", color: "var(--color-anime-purple)", glyph: "呪", href: "/search" },
  { name: "Demon Slayer", color: "var(--color-anime-pink)", glyph: "鬼", href: "/search" },
  { name: "Super Mario", color: "var(--color-anime-yellow)", glyph: "★", href: "/search" },
  { name: "Marvel", color: "#e23636", glyph: "✦", href: "/search" },
  { name: "Harry Potter", color: "#4a3a1c", glyph: "⚡", href: "/search" },
  { name: "DC", color: "#0476f2", glyph: "◆", href: "/search" },
  { name: "Barbie", color: "#ff6fa3", glyph: "♥", href: "/search" },
];

export function CategoryCircles() {
  return (
    <section className="mx-auto mt-14 w-full px-4 md:mt-20 md:px-8">
      <div className="flex gap-6 overflow-x-auto pb-6 md:justify-between md:gap-4 md:overflow-visible">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="group flex flex-none flex-col items-center gap-4 md:flex-1 md:min-w-0"
          >
            <div
              className="flex h-28 w-28 items-center justify-center rounded-full border-[2.5px] border-anime-ink shadow-[5px_5px_0_0_var(--color-anime-ink)] transition-all duration-150 ease-out group-hover:-translate-x-[2px] group-hover:-translate-y-[2px] group-hover:rotate-[-4deg] group-hover:shadow-[7px_7px_0_0_var(--color-anime-pink)] md:h-36 md:w-36 lg:h-44 lg:w-44 xl:h-48 xl:w-48"
              style={{ background: cat.color }}
            >
              <span className="font-display text-5xl font-extrabold text-white drop-shadow-[3px_3px_0_rgba(13,10,26,0.6)] md:text-6xl lg:text-7xl xl:text-8xl">
                {cat.glyph}
              </span>
            </div>
            <p className="text-center font-display text-sm font-extrabold uppercase tracking-[0.06em] text-anime-ink md:text-base">
              {cat.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
