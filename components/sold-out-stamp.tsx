import Image from "next/image";

// Half-transparent rubber "SOLD OUT" stamp laid diagonally across a product
// image. Replaces the old starburst sold-out sticker on listing cards — the
// tilt is baked into the artwork, so no extra rotation is needed.
export function SoldOutStamp({
  className = "w-[80%] max-w-[280px]",
}: {
  // Controls how wide the stamp sits inside its tile.
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 grid place-items-center"
    >
      <Image
        src="/sold-out-stamp.png"
        alt=""
        width={386}
        height={177}
        // Local asset: the custom Shopify CDN loader can't resize it.
        unoptimized
        className={`h-auto opacity-90 mix-blend-multiply ${className}`}
      />
    </span>
  );
}
