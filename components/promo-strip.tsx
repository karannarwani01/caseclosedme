export function PromoStrip() {
  const messages = [
    "★ PRE-ORDERS — get a hold of it early on",
    "✦ Best protectors for your collectibles",
    "♛ Just dropped: Luffy Gear 5 Pop! #1525",
    "◆ Slabbed PSA cards, fresh from the safe",
    "☠ One Piece Pops in stock — Luffy, Zoro, Ace & more",
    "⚡ Marvel & DC exclusives just landed",
    "✷ Pokémon TCG sealed booster boxes available now",
    "◈ Pop Mart × Labubu blind boxes — open at your own risk",
    "✦ MEFCC 2025 convention exclusives in stock",
    "♦ Glow-in-the-dark chase variants available",
    "✓ 100% authentic — every collectible verified",
    "✦ New arrivals weekly — be the first to cop",
  ];

  // Repeated once so the marquee can scroll a full copy and loop seamlessly.
  // With this many messages a single copy is wider than the viewport, so there
  // is never a blank gap at the wrap point.
  const doubled = [...messages, ...messages];

  // Ink on pink, not white: white on --color-anime-pink is only 3.46:1, which
  // fails AA at this text size. Ink keeps the brand pink and hits 5.6:1.
  return (
    <div className="relative z-30 overflow-hidden border-b-[2.5px] border-anime-ink bg-anime-pink py-4 text-anime-ink">
      <div className="flex animate-marquee whitespace-nowrap font-display text-base font-extrabold uppercase tracking-[0.12em] md:text-lg">
        {doubled.map((msg, i) => (
          <span key={i} className="mx-10 flex-none">
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
