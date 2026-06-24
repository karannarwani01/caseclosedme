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
        className="flex flex-col gap-1.5 rounded-xl border-[2.5px] border-anime-ink bg-white px-3 py-2 @[230px]/label:flex-row @[230px]/label:items-center @[230px]/label:gap-2 @[230px]/label:pl-3.5 @[230px]/label:pr-2"
        style={{ boxShadow: "3px 3px 0 0 var(--color-anime-ink)" }}
      >
        <h3 className="line-clamp-2 font-display text-[13px] font-extrabold leading-[1.15] tracking-[-0.005em] text-anime-ink @[230px]/label:grow @[230px]/label:text-base">
          {title}
        </h3>
        <Price
          className="flex-none self-start rotate-[-3deg] rounded-full border-[2px] border-anime-ink bg-anime-lime px-3 py-1 font-display text-[13px] font-extrabold tabular-nums text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)] @[230px]/label:self-auto @[230px]/label:py-1.5"
          amount={amount}
          currencyCode={currencyCode}
          currencyCodeClassName="hidden @[300px]/label:inline"
        />
      </div>
    </div>
  );
};

export default Label;
