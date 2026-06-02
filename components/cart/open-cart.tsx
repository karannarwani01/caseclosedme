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
    <div className="relative grid h-11 w-11 place-items-center rounded-2xl border-[2.5px] border-anime-ink bg-anime-pink text-white shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-anime-ink)] lg:h-12 lg:w-12">
      <ShoppingCartIcon
        className={clsx("h-5 w-5", className)}
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
