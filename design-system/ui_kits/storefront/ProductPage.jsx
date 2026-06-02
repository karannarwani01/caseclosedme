// PDP — gallery, title/price, variant selector, add-to-cart, description.

function Gallery({ product }) {
  const [idx, setIdx] = React.useState(0);
  const images = [
    product.swatch,
    [product.swatch[1], product.swatch[0]],
    product.swatch,
  ];
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        width: "100%",
        maxHeight: 550,
        overflow: "hidden",
        borderRadius: "var(--r-2xl)",
        background: "var(--bg-elev-1)",
      }}
    >
      <ProductImage product={{ ...product, swatch: images[idx] }} />
      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "12%",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 44,
              background: "color-mix(in srgb, var(--bg-page) 80%, transparent)",
              border: "1px solid white",
              borderRadius: "var(--r-pill)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              color: "var(--fg-2)",
            }}
          >
            <button
              onClick={() => setIdx((idx - 1 + images.length) % images.length)}
              aria-label="Previous"
              style={pdpArrowStyle}
            >
              <IconArrowLeft />
            </button>
            <div
              style={{
                width: 1,
                height: 24,
                background: "var(--ink-30)",
                margin: "0 4px",
              }}
            />
            <button
              onClick={() => setIdx((idx + 1) % images.length)}
              aria-label="Next"
              style={pdpArrowStyle}
            >
              <IconArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const pdpArrowStyle = {
  height: "100%",
  padding: "0 22px",
  background: "transparent",
  border: "none",
  color: "inherit",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
  transition: "transform var(--dur-fast), color var(--dur-fast)",
};

function VariantSelector({ options, selected, onChange }) {
  if (!options || options.length === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        marginBottom: 24,
      }}
    >
      {options.map((opt) => (
        <div key={opt.name}>
          <div
            style={{
              marginBottom: 10,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--fg-3)",
            }}
          >
            {opt.name}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {opt.values.map((v, i) => {
              const isActive = selected[opt.name] === v;
              const isDisabled = v === "Played"; // demo
              return (
                <button
                  key={v}
                  disabled={isDisabled}
                  onClick={() =>
                    !isDisabled && onChange({ ...selected, [opt.name]: v })
                  }
                  style={{
                    minWidth: 48,
                    padding: "6px 14px",
                    border: "1px solid var(--ink-10)",
                    background: "var(--ink-05)",
                    borderRadius: "var(--r-pill)",
                    fontSize: 13,
                    color: isDisabled ? "var(--fg-disabled)" : "var(--fg-1)",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    boxShadow: isActive ? "0 0 0 2px var(--accent)" : "none",
                    position: "relative",
                    overflow: "hidden",
                    transition: "box-shadow var(--dur-fast)",
                  }}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function AddToCart({ product, selected, onAdd }) {
  const hasOptions = (product.variants || []).length > 0;
  const allSelected =
    !hasOptions || product.variants.every((o) => selected[o.name]);
  const disabled = !allSelected;
  return (
    <button
      disabled={disabled}
      onClick={() => onAdd(product, selected)}
      aria-label={allSelected ? "Add to cart" : "Please select an option"}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "16px 24px",
        background: "var(--accent)",
        color: "white",
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        fontSize: 14,
        letterSpacing: "0.02em",
        border: "none",
        borderRadius: "var(--r-pill)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "background var(--dur-fast), opacity var(--dur-fast)",
      }}
      onMouseEnter={(e) =>
        !disabled && (e.currentTarget.style.background = "var(--accent-hover)")
      }
      onMouseLeave={(e) =>
        !disabled && (e.currentTarget.style.background = "var(--accent)")
      }
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          marginLeft: 16,
          display: "grid",
          placeItems: "center",
        }}
      >
        <IconPlus />
      </div>
      Add to cart
    </button>
  );
}

function ProductPage({ product, onAdd }) {
  const [selected, setSelected] = React.useState(() => {
    // default first value per option
    const s = {};
    (product.variants || []).forEach((o) => {
      s[o.name] = o.values[0];
    });
    return s;
  });
  React.useEffect(() => {
    const s = {};
    (product.variants || []).forEach((o) => {
      s[o.name] = o.values[0];
    });
    setSelected(s);
  }, [product.handle]);

  return (
    <div
      style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 24px 24px" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 40,
          padding: 32,
          background: "var(--bg-elev-1)",
          border: "1px solid var(--border-soft)",
          borderRadius: "var(--r-2xl)",
        }}
      >
        <div style={{ flex: "0 0 60%" }}>
          <Gallery product={product} />
        </div>
        <div style={{ flex: "0 0 calc(40% - 40px)" }}>
          <div
            style={{
              paddingBottom: 24,
              marginBottom: 24,
              borderBottom: "1px solid var(--border-soft)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: 8,
              }}
            >
              {product.category}
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 36,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                margin: "0 0 14px",
              }}
            >
              {product.title}
            </h1>
            <PriceTag
              amount={product.price}
              salePrice={product.salePrice}
              showCurrency
            />
          </div>
          <VariantSelector
            options={product.variants}
            selected={selected}
            onChange={setSelected}
          />
          {product.description && (
            <p
              style={{
                fontSize: 14,
                color: "var(--fg-2)",
                lineHeight: 1.6,
                marginBottom: 24,
                textWrap: "pretty",
              }}
            >
              {product.description}
            </p>
          )}
          <AddToCart product={product} selected={selected} onAdd={onAdd} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProductPage, Gallery, VariantSelector, AddToCart });
