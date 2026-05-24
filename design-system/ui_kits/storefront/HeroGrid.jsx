// Homepage hero mosaic — 1 full + 2 half tiles. Mirrors components/grid/three-items.tsx.

function HeroGrid({ products, onSelect }) {
  if (products.length < 3) return null;
  const [a, b, c] = products;
  return (
    <section
      style={{
        margin: "0 auto",
        maxWidth: 1280,
        padding: "16px 24px 16px",
        display: "grid",
        gap: 16,
        gridTemplateColumns: "repeat(6, 1fr)",
        gridTemplateRows: "repeat(2, minmax(220px, 1fr))",
      }}
    >
      <div style={{ gridColumn: "span 4", gridRow: "span 2" }}>
        <ProductCard product={a} size="full" onClick={onSelect} />
      </div>
      <div style={{ gridColumn: "span 2", gridRow: "span 1" }}>
        <ProductCard product={b} size="half" onClick={onSelect} />
      </div>
      <div style={{ gridColumn: "span 2", gridRow: "span 1" }}>
        <ProductCard product={c} size="half" onClick={onSelect} />
      </div>
    </section>
  );
}

Object.assign(window, { HeroGrid });
