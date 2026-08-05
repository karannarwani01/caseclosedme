import { CategoryCircles } from "components/category-circles";
import { PromoBannersRow } from "components/featured-banners";
import { HeroCarousel } from "components/hero-carousel";
import Footer from "components/layout/footer";
import {
  ArrivingSoonRow,
  JustArrivedRow,
  TopTenSection,
} from "components/section-row";
import { FACEBOOK_URL, INSTAGRAM_URL } from "lib/constants";
import { baseUrl } from "lib/utils";

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
  alternates: { canonical: "/" },
};

// Organization + WebSite markup. Gives search engines the brand entity and the
// sitelinks search box; the site had no structured data outside product pages.
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      // OnlineStore is a schema.org subtype of Organization — same entity,
      // richer e-commerce semantics for search/AI engines.
      "@type": "OnlineStore",
      "@id": `${baseUrl}/#organization`,
      name: "caseclosed",
      legalName: "Pumpy General Trading LLC",
      url: baseUrl,
      logo: `${baseUrl}/logo-mark.png`,
      email: "caseclosed.me@gmail.com",
      telephone: "+971501269270",
      areaServed: "AE",
      currenciesAccepted: "AED",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dubai",
        addressCountry: "AE",
      },
      sameAs: [INSTAGRAM_URL, FACEBOOK_URL],
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: "caseclosed",
      publisher: { "@id": `${baseUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />
      {/* The page's only h1. Visually hidden because the design opens straight
          into the carousel, whose slide titles are h2s — but the document still
          needs a top-level heading. */}
      <h1 className="sr-only">
        caseclosed — Funko Pops, Pop Mart Labubu, anime figures and trading
        cards in the UAE
      </h1>
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
