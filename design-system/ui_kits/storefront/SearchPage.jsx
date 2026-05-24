// Search / collection results page — mirrors app/search/layout.tsx + page.tsx.

function FilterList({ list, title, activeSlug, onSelect }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontSize: 11, fontWeight: 600,
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: "var(--fg-3)",
        marginBottom: 10,
      }}>{title}</div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {list.map((item) => {
          const isActive = item.slug === activeSlug;
          return (
            <li key={item.title}>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onSelect(item.slug); }}
                style={{
                  display: "block",
                  padding: "4px 0",
                  fontSize: 14,
                  textDecoration: "none",
                  color: isActive ? "var(--accent)" : "var(--fg-2)",
                  fontWeight: isActive ? 600 : 500,
                  transition: "color var(--dur-fast)",
                }}
                onMouseEnter={(e) => !isActive && (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={(e) => !isActive && (e.currentTarget.style.color = "var(--fg-2)")}
              >{item.title}</a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchPage({ query, collection, sort, onNavigate, onSelect }) {
  // Filter
  let results = window.PRODUCTS;
  if (collection) {
    const cat = window.COLLECTIONS.find((c) => c.slug === collection);
    if (cat && cat.title !== "All products") {
      if (cat.slug === "just-dropped") results = results.filter((p) => p.badge === "New");
      else if (cat.slug === "sale") results = results.filter((p) => p.salePrice);
      else results = results.filter((p) => p.category === cat.title);
    }
  }
  if (query) {
    const q = query.toLowerCase();
    results = results.filter((p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }
  // Sort
  if (sort === "price-asc") results = [...results].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") results = [...results].sort((a, b) => b.price - a.price);
  if (sort === "latest-desc") results = [...results].reverse();

  return (
    <div style={{
      maxWidth: 1280,
      margin: "0 auto",
      padding: "16px 24px 24px",
      display: "grid",
      gridTemplateColumns: "180px 1fr 140px",
      gap: 28,
    }}>
      <aside>
        <FilterList
          list={window.COLLECTIONS}
          title="Collections"
          activeSlug={collection}
          onSelect={(slug) => onNavigate(slug ? `search:${slug}` : "search")}
        />
      </aside>

      <div>
        {query && (
          <p style={{ marginBottom: 16, color: "var(--fg-2)", fontSize: 14 }}>
            {results.length === 0
              ? "There are no products that match "
              : `Showing ${results.length} ${results.length === 1 ? "result" : "results"} for `}
            <strong style={{ color: "var(--fg-1)" }}>&quot;{query}&quot;</strong>
          </p>
        )}
        {results.length > 0 ? (
          <ul style={{
            listStyle: "none", margin: 0, padding: 0,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}>
            {results.map((p) => (
              <li key={p.handle} style={{ aspectRatio: "1 / 1" }}>
                <ProductCard product={p} onClick={onSelect} />
              </li>
            ))}
          </ul>
        ) : (
          <div style={{
            padding: "40px 24px",
            background: "var(--bg-elev-2)",
            borderRadius: "var(--r-xl)",
            textAlign: "center",
            color: "var(--fg-2)",
          }}>Try a broader term, or browse trending.</div>
        )}
      </div>

      <aside>
        <FilterList
          list={window.SORT_OPTIONS}
          title="Sort by"
          activeSlug={sort}
          onSelect={(slug) => onNavigate(
            collection ? `search:${collection}` : "search",
            { q: query, sort: slug }
          )}
        />
      </aside>
    </div>
  );
}

Object.assign(window, { SearchPage, FilterList });
