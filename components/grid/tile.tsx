import clsx from "clsx";
import Image from "next/image";
import Label from "../label";

export function GridTileImage({
  isInteractive = true,
  active,
  label,
  swatch,
  badge,
  ...props
}: {
  isInteractive?: boolean;
  active?: boolean;
  swatch?: [string, string];
  badge?: string;
  label?: {
    title: string;
    amount: string;
    currencyCode: string;
    position?: "bottom" | "center";
  };
} & React.ComponentProps<typeof Image>) {
  const hasImage = Boolean(props.src);

  return (
    <div
      className={clsx(
        "group relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-white border-[2.5px] border-anime-ink transition-all duration-150 ease-out",
        "shadow-[5px_5px_0_0_var(--color-anime-ink)]",
        {
          "hover:-translate-x-[3px] hover:-translate-y-[3px] hover:rotate-[-1.5deg] hover:shadow-[9px_9px_0_0_var(--color-anime-pink)]":
            isInteractive,
          "shadow-[9px_9px_0_0_var(--color-anime-pink)]": active,
        },
      )}
    >
      {/* Anime speed-lines burst behind the figure */}
      <div
        aria-hidden
        className={clsx(
          "absolute inset-[10%] opacity-55 transition-transform duration-500 ease-out",
          { "group-hover:rotate-[40deg]": isInteractive },
        )}
        style={{
          background:
            "repeating-conic-gradient(from 0deg at 50% 45%, var(--color-anime-yellow) 0deg 8deg, transparent 8deg 16deg)",
          maskImage:
            "radial-gradient(circle at 50% 45%, black 0 36%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 45%, black 0 36%, transparent 70%)",
        }}
      />

      {hasImage ? (
        <Image
          className={clsx("relative z-10 h-full w-full object-contain p-6", {
            "transition-transform duration-500 ease-out group-hover:scale-[1.08] group-hover:rotate-[6deg]":
              isInteractive,
          })}
          {...props}
        />
      ) : swatch ? (
        <CircleFigure swatch={swatch} isInteractive={isInteractive} />
      ) : null}

      {badge ? <Badge text={badge} /> : null}

      {label ? (
        <Label
          title={label.title}
          amount={label.amount}
          currencyCode={label.currencyCode}
          position={label.position}
        />
      ) : null}
    </div>
  );
}

function CircleFigure({
  swatch,
  isInteractive,
}: {
  swatch: [string, string];
  isInteractive: boolean;
}) {
  const [a, b] = swatch;
  return (
    <div className="relative z-10 flex h-full w-full items-center justify-center px-6 pb-16 pt-7 box-border">
      <div
        className={clsx(
          "aspect-square w-[70%] rounded-full border-[2.5px] border-anime-ink transition-transform duration-500 ease-out",
          {
            "group-hover:scale-[1.08] group-hover:rotate-[6deg]": isInteractive,
          },
        )}
        style={{
          background: `
            radial-gradient(circle at 50% 35%, ${a} 0 28%, transparent 28%),
            radial-gradient(circle at 50% 60%, ${b} 0 32%, transparent 32%),
            white
          `,
          filter: "drop-shadow(4px 4px 0 var(--color-anime-ink))",
        }}
      />
    </div>
  );
}

function Badge({ text }: { text: string }) {
  const isDiscount = text.startsWith("−") || text.startsWith("-");
  const isNew = text.toLowerCase().includes("new");
  const isPreOrder = text.toLowerCase().includes("pre");

  let palette = "bg-anime-yellow text-anime-ink"; /* default: NEW yellow */
  let rotate = "rotate-[-3deg]";

  if (isDiscount) {
    palette = "bg-anime-pink text-white";
    rotate = "rotate-[2deg]";
  } else if (isPreOrder) {
    palette = "bg-white text-anime-ink";
    rotate = "rotate-[-4deg]";
  } else if (isNew) {
    palette = "bg-anime-yellow text-anime-ink";
    rotate = "rotate-[-3deg]";
  } else {
    palette = "bg-anime-cyan text-anime-ink";
    rotate = "rotate-[-2deg]";
  }

  return (
    <div
      className={clsx(
        "absolute left-3 top-3 z-20 border-[2.5px] border-anime-ink rounded-full px-3 py-1 font-display text-[11px] font-extrabold uppercase tracking-[0.08em]",
        palette,
        rotate,
      )}
      style={{ boxShadow: "3px 3px 0 0 var(--color-anime-ink)" }}
    >
      {text}
    </div>
  );
}
