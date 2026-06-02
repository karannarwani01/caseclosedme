// Product image placeholder + product card.
// Card recreates components/grid/tile.tsx + components/label.tsx.

function ProductImage({ product, size = "lg" }) {
  // Soft duotone radial — we have no licensed product photography.
  const [a, b] = product.swatch;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div
        className="ck-figure"
        style={{
          width: "100%",
          height: "100%",
          background: `
            radial-gradient(circle at 50% 35%, ${a} 0 22%, transparent 24%),
            radial-gradient(circle at 50% 65%, ${b} 0 28%, transparent 30%),
            radial-gradient(circle at 50% 50%, color-mix(in srgb, ${a} 30%, white) 0 60%, white 60%)
          `,
          borderRadius: 16,
          transition: "transform var(--dur-slow) var(--ease-out)",
        }}
      />
    </div>
  );
}

function PriceTag({
  amount,
  currency = "USD",
  showCurrency = false,
  salePrice,
}) {
  return (
    <span
      style={{
        flex: "none",
        padding: "5px 12px",
        background: "var(--anime-lime, var(--accent))",
        color: "var(--anime-ink, #fff)",
        border: "2.5px solid var(--anime-ink, var(--brand-ink))",
        borderRadius: 999,
        boxShadow: "3px 3px 0 0 var(--anime-ink, var(--brand-ink))",
        fontFamily: "var(--font-display)",
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: "0.04em",
        fontFeatureSettings: '"tnum"',
        whiteSpace: "nowrap",
      }}
    >
      {window.formatPrice(salePrice ?? amount, currency)}
      {showCurrency && (
        <span style={{ opacity: 0.7, fontWeight: 400, marginLeft: 4 }}>
          {currency}
        </span>
      )}
    </span>
  );
}

function ProductCard({ product, size = "half", onClick, active }) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick && onClick(product);
      }}
      className="ck-card"
      style={{
        position: "relative",
        display: "block",
        aspectRatio: size === "full" ? "1 / 1" : "1 / 1",
        height: "100%",
        width: "100%",
        borderRadius: "var(--r-2xl)",
        background: "var(--bg-elev-1)",
        boxShadow: "var(--shadow-card-rest)",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        outline: active ? "2px solid var(--accent)" : "none",
        transition:
          "transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out), outline-color var(--dur-base)",
      }}
    >
      <ProductImage product={product} size={size} />
      {product.badge && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            padding: "5px 12px",
            borderRadius: 999,
            background: product.badge.startsWith("−")
              ? "var(--anime-pink)"
              : "var(--anime-yellow)",
            color: "var(--anime-ink)",
            border: "2.5px solid var(--anime-ink)",
            boxShadow: "3px 3px 0 0 var(--anime-ink)",
            fontFamily: "var(--font-display)",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            transform: "rotate(-4deg)",
          }}
        >
          {product.badge}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: 6,
          background: "color-mix(in srgb, var(--bg-elev-1) 90%, transparent)",
          border: "1px solid var(--border-soft)",
          borderRadius: "var(--r-xl)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h3
          style={{
            flex: 1,
            margin: 0,
            marginLeft: 6,
            fontFamily: "var(--font-display)",
            fontSize: size === "full" ? 16 : 14,
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            color: "var(--fg-1)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.title}
        </h3>
        <PriceTag amount={product.price} salePrice={product.salePrice} />
      </div>
    </a>
  );
}

// Compound hover styles via global stylesheet injection (so we get :hover support).
if (!document.getElementById("ck-card-hover-styles")) {
  const style = document.createElement("style");
  style.id = "ck-card-hover-styles";
  style.textContent = `
    .ck-card:hover {
      transform: translateY(-4px) rotate(-0.5deg);
      box-shadow: var(--shadow-card-hover);
      outline: 2px solid var(--accent);
    }
    .ck-card:hover .ck-figure { transform: scale(1.05); }
  `;
  document.head.appendChild(style);
}

Object.assign(window, { ProductCard, ProductImage, PriceTag });
