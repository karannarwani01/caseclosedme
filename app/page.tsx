import { CategoryCircles } from "components/category-circles";
import {
  FeaturedBrandsRow,
  PromoBannersRow,
} from "components/featured-banners";
import { HeroCarousel } from "components/hero-carousel";
import Footer from "components/layout/footer";
import { JustArrivedRow, TopTenSection } from "components/section-row";

export const metadata = {
  description:
    "caseclosed — Funko Pops, slabbed cards, anime figures and exclusive drops. Curated for collectors.",
  openGraph: {
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <CategoryCircles />
      <FeaturedBrandsRow />
      <JustArrivedRow />
      <PromoBannersRow />
      <TopTenSection />
      <Footer />
    </>
  );
}
