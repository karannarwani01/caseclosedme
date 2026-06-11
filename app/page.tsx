import { CategoryCircles } from "components/category-circles";
import { PromoBannersRow } from "components/featured-banners";
import { HeroCarousel } from "components/hero-carousel";
import Footer from "components/layout/footer";
import {
  ArrivingSoonRow,
  JustArrivedRow,
  TopTenSection,
} from "components/section-row";

export const metadata = {
  title: {
    absolute:
      "caseclosed — Funko Pops, Pop Mart, Labubu & Trading Cards Online in the UAE",
  },
  description:
    "Shop Funko Pops, Pop Mart Labubu, anime figures, blind boxes and Pokémon & Dragon Ball trading cards online in the UAE. Officially licensed, fast delivery — caseclosed.",
  openGraph: {
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <CategoryCircles />
      <TopTenSection />
      <JustArrivedRow />
      <ArrivingSoonRow />
      <PromoBannersRow />
      <Footer />
    </>
  );
}
