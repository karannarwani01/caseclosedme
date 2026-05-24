import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export default function OpenCart({
  className,
  quantity,
}: {
  className?: string;
  quantity?: number;
}) {
  return (
    <div className="relative grid h-14 w-14 place-items-center rounded-2xl border-[2.5px] border-anime-ink bg-anime-pink text-white shadow-[4px_4px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_0_var(--color-anime-ink)]">
      <ShoppingCartIcon
        className={clsx("h-6 w-6", className)}
        strokeWidth={2.5}
      />
      {quantity ? (
        <div className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-[2px] border-anime-ink bg-anime-lime px-1 font-display text-[13px] font-extrabold tabular-nums text-anime-ink">
          {quantity}
        </div>
      ) : null}
    </div>
  );
}
