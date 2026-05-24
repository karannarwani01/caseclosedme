import Price from "./price";

const Label = ({
  title,
  amount,
  currencyCode,
}: {
  title: string;
  amount: string;
  currencyCode: string;
  position?: "bottom" | "center";
}) => {
  return (
    <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 @container/label">
      <div
        className="flex items-center gap-2 rounded-xl border-[2.5px] border-anime-ink bg-white pl-3.5 pr-2 py-2"
        style={{ boxShadow: "3px 3px 0 0 var(--color-anime-ink)" }}
      >
        <h3 className="line-clamp-2 grow font-display text-[15px] font-extrabold leading-[1.15] tracking-[-0.005em] text-anime-ink md:text-base">
          {title}
        </h3>
        <Price
          className="flex-none rotate-[-3deg] rounded-full border-[2px] border-anime-ink bg-anime-lime px-3 py-1.5 font-display text-[13px] font-extrabold tabular-nums text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)]"
          amount={amount}
          currencyCode={currencyCode}
          currencyCodeClassName="hidden @[300px]/label:inline"
        />
      </div>
    </div>
  );
};

export default Label;
