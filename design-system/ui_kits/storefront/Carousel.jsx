// Featured products carousel — auto-scrolling marquee.

function Carousel({ products, onSelect }) {
  // Tripled for seamless loop, like the source.
  const items = [...products, ...products, ...products];

  // Inject keyframes once.
  if (!document.getElementById("ck-carousel-anim")) {
    const s = document.createElement("style");
    s.id = "ck-carousel-anim";
    s.textContent = `
      @keyframes ck-carousel { 0% { transform: translateX(0%); } 100% { transform: translateX(-33.333%); } }
    `;
    document.head.appendChild(s);
  }

  return (
    <div style={{ width: "100%", overflow: "hidden", padding: "8px 0 24px" }}>
      <ul
        style={{
          display: "flex", gap: 16,
          margin: 0, padding: "4px 0",
          listStyle: "none",
          animation: "ck-carousel 60s linear infinite",
          width: "max-content",
        }}
      >
        {items.map((p, i) => (
          <li
            key={p.handle + i}
            style={{
              position: "relative",
              aspectRatio: "1 / 1",
              height: "32vh",
              maxHeight: 275,
              minHeight: 220,
              width: "auto",
              flex: "none",
            }}
          >
            <div style={{ aspectRatio: "1 / 1", height: "100%" }}>
              <ProductCard product={p} size="half" onClick={onSelect} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

Object.assign(window, { Carousel });
