// Footer — simplified version of components/layout/footer.tsx.

function Footer() {
  const year = new Date().getFullYear();
  const menu = [
    { title: "Shop",      items: ["All products", "Funko Pops", "Trading Cards", "Figures"] },
    { title: "Help",      items: ["Shipping", "Returns", "Track an order", "Contact"] },
    { title: "About",     items: ["Our story", "Authentication", "Press"] },
  ];
  return (
    <footer style={{
      fontSize: 14,
      color: "var(--fg-2)",
      marginTop: 40,
    }}>
      <div style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "40px 24px",
        borderTop: "1px solid var(--border-soft)",
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
        gap: 32,
      }}>
        <div>
          <a href="#" style={{
            display: "flex", alignItems: "center", gap: 8,
            textDecoration: "none", color: "var(--fg-1)",
          }}>
            <LogoSquare size="sm" />
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700, fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              color: "var(--fg-1)",
            }}>caseclosed.me</span>
          </a>
          <p style={{
            marginTop: 14,
            fontSize: 13,
            color: "var(--fg-3)",
            lineHeight: 1.6,
            maxWidth: 240,
          }}>
            Pop‑culture collectibles, hand‑checked and packed by hand.
            Shipped the next day.
          </p>
        </div>
        {menu.map((col) => (
          <div key={col.title}>
            <div style={{
              fontSize: 11, fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--fg-3)",
              marginBottom: 10,
            }}>{col.title}</div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {col.items.map((i) => (
                <li key={i}>
                  <a href="#" style={{ color: "var(--fg-2)", textDecoration: "none", fontSize: 14 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-2)")}
                  >{i}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{
        borderTop: "1px solid var(--border-divider)",
        padding: "18px 24px",
        maxWidth: 1280,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 13,
        color: "var(--fg-3)",
      }}>
        <span>© 2023–{year} caseclosed.me. All rights reserved.</span>
        <span>Made with care for collectors.</span>
      </div>
    </footer>
  );
}

Object.assign(window, { Footer });
