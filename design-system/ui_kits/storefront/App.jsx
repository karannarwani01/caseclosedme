// Top-level App — routes Home / Search / Product. Holds cart state.

function App() {
  // Route shape: { name: "home" | "search" | "product", q?, sort?, collection?, handle? }
  const [route, setRoute] = React.useState({ name: "home" });
  const [cart, setCart] = React.useState([]);
  const [cartOpen, setCartOpen] = React.useState(false);

  function navigate(target, params = {}) {
    setCartOpen(false);
    if (target === "home") return setRoute({ name: "home" });
    if (target === "search") return setRoute({ name: "search", q: params.q || "", sort: params.sort || null, collection: null });
    if (target.startsWith("search:")) {
      const slug = target.slice("search:".length);
      return setRoute({ name: "search", q: params.q || "", sort: params.sort || null, collection: slug });
    }
    if (target === "product") return setRoute({ name: "product", handle: params.handle });
  }

  function openProduct(p) { navigate("product", { handle: p.handle }); window.scrollTo({ top: 0 }); }

  function addToCart(product, selected) {
    const summary = selected && Object.keys(selected).length
      ? Object.values(selected).join(" · ")
      : "";
    setCart((prev) => {
      const key = product.handle + ":" + summary;
      const idx = prev.findIndex((x) => x._key === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [
        ...prev,
        { ...product, qty: 1, selectedSummary: summary, _key: key },
      ];
    });
    setCartOpen(true);
  }
  function updateQty(item, qty) {
    if (qty < 1) return removeItem(item);
    setCart((prev) => prev.map((x) => x._key === item._key ? { ...x, qty } : x));
  }
  function removeItem(item) {
    setCart((prev) => prev.filter((x) => x._key !== item._key));
  }

  const cartCount = cart.reduce((s, x) => s + x.qty, 0);

  // Pick which navbar pill is active
  const activeNav =
    route.name === "search"
      ? (route.collection ? `search:${route.collection}` : "search")
      : route.name === "home" ? "home" : "";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", color: "var(--fg-1)" }}>
      <Navbar
        active={activeNav}
        onNavigate={navigate}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
      />

      <main style={{ paddingTop: 16 }}>
        {route.name === "home" && (
          <>
            <HeroGrid products={window.PRODUCTS.slice(0, 3)} onSelect={openProduct} />
            <Carousel products={window.PRODUCTS.slice(2)} onSelect={openProduct} />
          </>
        )}
        {route.name === "search" && (
          <SearchPage
            query={route.q || ""}
            collection={route.collection}
            sort={route.sort}
            onNavigate={navigate}
            onSelect={openProduct}
          />
        )}
        {route.name === "product" && (
          <ProductPage
            product={window.findProduct(route.handle)}
            onAdd={addToCart}
          />
        )}
      </main>

      <Footer />

      <CartModal
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQty={updateQty}
        onRemove={removeItem}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
