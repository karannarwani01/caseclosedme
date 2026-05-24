// Cart drawer — slide-in from right, mirrors components/cart/modal.tsx.

function CartModal({ open, onClose, items, onUpdateQty, onRemove }) {
  // Animation: inject keyframes
  if (!document.getElementById("ck-cart-anim")) {
    const s = document.createElement("style");
    s.id = "ck-cart-anim";
    s.textContent = `
      @keyframes ck-cart-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
      @keyframes ck-fade-in { from { opacity: 0; } to { opacity: 1; } }
    `;
    document.head.appendChild(s);
  }

  if (!open) return null;

  const subtotal = items.reduce((s, i) => s + (i.salePrice ?? i.price) * i.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      animation: "ck-fade-in 200ms var(--ease-out)",
    }}>
      <div
        onClick={onClose}
        style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.30)",
          backdropFilter: "blur(0.5px)",
          WebkitBackdropFilter: "blur(0.5px)",
        }}
      />
      <div style={{
        position: "absolute",
        top: 0, right: 0, bottom: 0,
        width: 420,
        background: "color-mix(in srgb, var(--bg-elev-1) 90%, transparent)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderLeft: "1px solid var(--border-soft)",
        padding: 24,
        display: "flex", flexDirection: "column",
        animation: "ck-cart-in 300ms var(--ease-out)",
        boxSizing: "border-box",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 8,
        }}>
          <p style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 700, fontSize: 22,
            color: "var(--fg-1)",
          }}>My cart</p>
          <button
            onClick={onClose}
            aria-label="Close cart"
            style={{
              width: 40, height: 40,
              border: "1px solid var(--border-soft)",
              background: "var(--bg-elev-1)",
              borderRadius: "var(--r-md)",
              color: "var(--fg-1)",
              cursor: "pointer",
              display: "grid", placeItems: "center",
            }}
          ><IconClose /></button>
        </div>

        {items.length === 0 ? (
          <div style={{
            flex: 1,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            color: "var(--fg-2)",
            gap: 18,
          }}>
            <IconCart style={{ width: 56, height: 56 }} />
            <p style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 700, fontSize: 22,
              color: "var(--fg-1)",
            }}>Your cart is empty.</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--fg-3)" }}>Pick something up from the floor.</p>
          </div>
        ) : (
          <>
            <ul style={{
              flex: 1, overflow: "auto",
              listStyle: "none", margin: 0, padding: "16px 0 0",
            }}>
              {items.map((item, i) => (
                <li key={item.handle + i} style={{
                  display: "flex", flexDirection: "column",
                  borderBottom: "1px solid var(--ink-10)",
                }}>
                  <div style={{ position: "relative", display: "flex", padding: "16px 4px", gap: 12 }}>
                    <button
                      onClick={() => onRemove(item)}
                      aria-label="Remove item"
                      style={{
                        position: "absolute", top: 8, left: -4,
                        width: 24, height: 24,
                        background: "var(--brand-ink)", color: "white",
                        border: "none", borderRadius: 999,
                        display: "grid", placeItems: "center",
                        cursor: "pointer",
                        zIndex: 1,
                      }}
                    ><IconClose style={{ width: 14, height: 14 }} /></button>
                    <div style={{
                      position: "relative",
                      width: 64, height: 64,
                      borderRadius: 8,
                      background: "var(--bg-elev-1)",
                      border: "1px solid var(--border-soft)",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}>
                      <ProductImage product={item} />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 14, lineHeight: 1.3, color: "var(--fg-1)" }}>{item.title}</span>
                      {item.selectedSummary && (
                        <span style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>
                          {item.selectedSummary}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <span style={{ fontSize: 13, color: "var(--fg-1)", fontFeatureSettings: '"tnum"' }}>
                        {window.formatPrice((item.salePrice ?? item.price) * item.qty)}
                      </span>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 0,
                        height: 32,
                        border: "1px solid var(--border-soft)",
                        borderRadius: "var(--r-pill)",
                        background: "var(--bg-elev-1)",
                      }}>
                        <button
                          onClick={() => onUpdateQty(item, item.qty - 1)}
                          style={qtyBtnStyle}
                          aria-label="Decrease"
                        ><IconMinus style={{ width: 14, height: 14 }} /></button>
                        <span style={{
                          width: 24, textAlign: "center",
                          fontSize: 13, fontFeatureSettings: '"tnum"',
                        }}>{item.qty}</span>
                        <button
                          onClick={() => onUpdateQty(item, item.qty + 1)}
                          style={qtyBtnStyle}
                          aria-label="Increase"
                        ><IconPlus style={{ width: 14, height: 14 }} /></button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div style={{ padding: "16px 0", fontSize: 13, color: "var(--fg-2)" }}>
              <Row label="Taxes" value={window.formatPrice(tax)} />
              <Row label="Shipping" value="Calculated at checkout" />
              <Row label="Total" value={window.formatPrice(total)} bold />
            </div>

            <button
              onClick={() => alert("Demo: Checkout is a no-op in the UI kit.")}
              style={{
                display: "block", width: "100%",
                padding: 14,
                background: "var(--accent)",
                color: "white",
                fontWeight: 600, fontSize: 14,
                border: "none",
                borderRadius: "var(--r-pill)",
                cursor: "pointer",
                transition: "background var(--dur-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
            >Proceed to Checkout</button>
          </>
        )}
      </div>
    </div>
  );
}

const qtyBtnStyle = {
  width: 32, height: 32,
  display: "grid", placeItems: "center",
  background: "transparent", border: "none",
  color: "var(--fg-1)", cursor: "pointer",
  borderRadius: 999,
};

function Row({ label, value, bold }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      padding: "6px 0",
      borderBottom: "1px solid var(--ink-10)",
      fontWeight: bold ? 600 : 400,
      color: bold ? "var(--fg-1)" : "var(--fg-2)",
      fontSize: bold ? 14 : 13,
    }}>
      <span>{label}</span>
      <span style={{ fontFeatureSettings: '"tnum"' }}>{value}</span>
    </div>
  );
}

Object.assign(window, { CartModal });
