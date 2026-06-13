import { DirhamSign } from "./dirham-sign";

// Pricing across the store is constant in AED, displayed with the Dirham
// symbol. `currencyCode`/`currencyCodeClassName` are accepted for backward
// compatibility with existing call sites but no longer affect the output.
const Price = ({
  amount,
  className,
}: {
  amount: string;
  className?: string;
  currencyCode?: string;
  currencyCodeClassName?: string;
} & React.ComponentProps<"p">) => {
  const value = new Intl.NumberFormat("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(amount));
  return (
    <p suppressHydrationWarning={true} className={className}>
      <DirhamSign className="mr-1.5" />
      {value}
    </p>
  );
};

export default Price;
