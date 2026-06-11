"use client";

// Comic-book category banner tiles, full-width row above the catalogue.
// Halftone dot texture + rotated italic word-stack in white with hard shadow.
// Clicking a tile toggles a quick filter handled by the parent.

export type QuickFilter =
  | { kind: "badge"; value: string }
  | { kind: "category"; value: string }
  | { kind: "categories"; value: string[] };

type Tile = {
  id: string;
  label: string; // supports \n for the stacked word layout
  sub: string;
  color: string;
  filter: QuickFilter | null;
};

const TILES: Tile[] = [
  {
    id: "preorder",
    label: "PRE-\nORDER",
    sub: "Pre order",
    color: "#e63946",
    filter: { kind: "badge", value: "preorder" },
  },
  {
    id: "new",
    label: "NEW\nARRIVALS",
    sub: "New arrivals",
    color: "#ff3d7f",
    filter: { kind: "badge", value: "new" },
  },
  {
    id: "figures",
    label: "FIGURE\nTYPES",
    sub: "Type",
    color: "#ff6b3d",
    filter: { kind: "category", value: "Figures" },
  },
  {
    id: "popscards",
    label: "POPS\n+ CARDS",
    sub: "License",
    color: "#7a3dc2",
    filter: { kind: "categories", value: ["Funko Pops", "Trading Cards"] },
  },
  {
    id: "vault",
    label: "FROM\nTHE VAULT",
    sub: "Brands",
    color: "#1a1a2e",
    filter: { kind: "badge", value: "vault" },
  },
];

export function BannerTiles({
  activeId,
  onSelect,
}: {
  activeId: string | null;
  onSelect: (id: string, filter: QuickFilter | null) => void;
}) {
  return (
    <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
      {TILES.map((t) => {
        const active = activeId === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id, t.filter)}
            className="group block w-full text-center"
          >
            <div
              className="relative aspect-[5/4] overflow-hidden rounded-2xl transition-transform duration-200 ease-out group-hover:-translate-y-[3px] group-hover:rotate-[-0.6deg]"
              style={{
                background: t.color,
                boxShadow: active
                  ? "0 0 0 2.5px var(--color-anime-ink), 0 10px 24px rgba(0,0,0,0.18)"
                  : "0 6px 16px rgba(0,0,0,0.12)",
                outline: active ? "2.5px solid var(--color-anime-ink)" : "none",
                outlineOffset: 4,
              }}
            >
              {/* halftone dots */}
              <div
                className="absolute inset-0 opacity-80"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1.5px)",
                  backgroundSize: "10px 10px",
                }}
              />
              <div className="absolute inset-0 grid -rotate-6 place-items-center">
                <span
                  className="whitespace-pre-line px-2 text-center font-display text-lg font-extrabold uppercase italic leading-[0.95] tracking-[-0.02em] text-white sm:text-xl lg:text-2xl"
                  style={{ textShadow: "3px 3px 0 rgba(0,0,0,0.35)" }}
                >
                  {t.label}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </section>
  );
}
