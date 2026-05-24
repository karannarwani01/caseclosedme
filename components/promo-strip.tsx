export function PromoStrip() {
  const messages = [
    "★ PRE-ORDERS — get a hold of it early on",
    "✦ Worldwide shipping on orders $100+",
    "♛ Just dropped: Luffy Gear 5 Pop! #1525",
    "◆ Slabbed PSA cards, fresh from the safe",
  ];

  const doubled = [...messages, ...messages];

  return (
    <div className="relative z-30 overflow-hidden border-b-[2.5px] border-anime-ink bg-anime-pink py-4 text-white">
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
