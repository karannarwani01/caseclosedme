import clsx from "clsx";
import Image from "next/image";

export default function LogoSquare({ size }: { size?: "sm" | undefined }) {
  const dim = size === "sm" ? 36 : 64;
  const innerDim = size === "sm" ? 24 : 46;
  return (
    <div
      className={clsx(
        "flex flex-none items-center justify-center border-[2.5px] border-anime-ink bg-anime-ink shadow-[4px_4px_0_0_var(--color-anime-pink)] rounded-2xl",
        size === "sm" ? "p-[4px]" : "p-[7px]",
      )}
      style={{ width: dim, height: dim }}
      aria-label="caseclosed logo"
    >
      <Image
        src="/logo-mark.png"
        alt=""
        width={innerDim}
        height={innerDim}
        quality={100}
        className="object-contain"
      />
    </div>
  );
}
