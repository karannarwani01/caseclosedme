// The floating pill navbar — recreated from caseclosedme/components/layout/navbar/index.tsx

function Navbar({ active, onNavigate, cartCount, onOpenCart }) {
  const links = [
    { title: "Shop", path: "search" },
    { title: "Funko Pops", path: "search:funko-pops" },
    { title: "Trading Cards", path: "search:trading-cards" },
    { title: "Figures", path: "search:figures" },
  ];

  return (
    <div
      style={{
        position: "sticky",
        top: 20,
        zIndex: 40,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "0 24px",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          width: "100%",
          maxWidth: 1120,
          padding: "10px 14px 10px 12px",
          background: "color-mix(in srgb, var(--bg-elev-1) 75%, transparent)",
          border: "1px solid var(--border-soft)",
          borderRadius: "var(--r-pill)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "var(--shadow-nav)",
        }}
      >
        <a
          onClick={(e) => {
            e.preventDefault();
            onNavigate("home");
          }}
          href="#"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}
          aria-label="caseclosedme home"
        >
          <LogoSquare />
          <Wordmark />
        </a>

        <ul
          style={{
            display: "flex",
            alignItems: "center",
            gap: 26,
            listStyle: "none",
            margin: 0,
            padding: 0,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {links.map((l) => {
            const isActive =
              active === l.path || (active === "search" && l.path === "search");
            return (
              <li key={l.path}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(l.path);
                  }}
                  style={{
                    color: isActive ? "var(--accent)" : "var(--fg-2)",
                    textDecoration: "none",
                    transition: "color var(--dur-fast) var(--ease-out)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--accent)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = isActive
                      ? "var(--accent)"
                      : "var(--fg-2)")
                  }
                >
                  {l.title}
                </a>
              </li>
            );
          })}
        </ul>

        <NavSearch onSubmit={(q) => onNavigate("search", { q })} />

        <button
          aria-label="Open cart"
          onClick={onOpenCart}
          style={{
            position: "relative",
            width: 40,
            height: 40,
            border: "1px solid var(--border-soft)",
            background: "var(--bg-elev-1)",
            borderRadius: "var(--r-md)",
            display: "grid",
            placeItems: "center",
            color: "var(--fg-1)",
            cursor: "pointer",
          }}
        >
          <IconCart />
          {cartCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                minWidth: 18,
                height: 18,
                padding: "0 5px",
                background: "var(--accent)",
                color: "white",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                display: "grid",
                placeItems: "center",
                fontFeatureSettings: '"tnum"',
              }}
            >
              {cartCount}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
}

function NavSearch({ onSubmit }) {
  const [v, setV] = React.useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
      style={{ position: "relative", width: 200 }}
    >
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="Search products..."
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "6px 30px 6px 14px",
          background:
            "color-mix(in srgb, var(--brand-cream-2) 60%, transparent)",
          border: "none",
          borderRadius: "var(--r-pill)",
          fontSize: 13,
          fontFamily: "var(--font-sans)",
          color: "var(--fg-1)",
          outline: "none",
        }}
        onFocus={(e) => {
          e.target.style.background = "var(--bg-elev-1)";
          e.target.style.boxShadow =
            "0 0 0 2px color-mix(in srgb, var(--accent) 40%, transparent)";
        }}
        onBlur={(e) => {
          e.target.style.background =
            "color-mix(in srgb, var(--brand-cream-2) 60%, transparent)";
          e.target.style.boxShadow = "none";
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--fg-3)",
          pointerEvents: "none",
        }}
      >
        <IconSearch style={{ width: 14, height: 14 }} />
      </div>
    </form>
  );
}

Object.assign(window, { Navbar });
