import { CartProvider } from "components/cart/cart-context";
import { Navbar } from "components/layout/navbar";
import { PromoStrip } from "components/promo-strip";
import { WishlistProvider } from "components/wishlist/wishlist-context";
import {
  Bangers,
  Bricolage_Grotesque,
  Inter,
  Space_Grotesk,
} from "next/font/google";
import { getCart } from "lib/shopify";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
import { baseUrl } from "lib/utils";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

// Quirky comic/anime display font, used for content-page headings.
const bangers = Bangers({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bangers",
  display: "swap",
});

// Body font for content pages.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-spacegrotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const { SITE_NAME } = process.env;

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME!,
    template: `%s | ${SITE_NAME}`,
  },
  robots: {
    follow: true,
    index: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cart = getCart();

  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} ${bangers.variable} ${spaceGrotesk.variable}`}
    >
      <body className="flex min-h-screen flex-col overflow-x-clip bg-brand-bg text-brand-ink antialiased">
        <CartProvider cartPromise={cart}>
          <WishlistProvider>
            <PromoStrip />
            <Navbar />
            <main className="flex flex-1 flex-col">
              {children}
              <Toaster closeButton />
            </main>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
