import { AccessibilityMenu } from "components/a11y/accessibility-menu";
import { CartProvider } from "components/cart/cart-context";
import { BottomTabBar } from "components/layout/bottom-tab-bar";
import { Navbar } from "components/layout/navbar";
import { SearchOverlay } from "components/layout/search-overlay";
import { SignupPopup } from "components/newsletter/signup-popup";
import { PromoStrip } from "components/promo-strip";
import { WishlistProvider } from "components/wishlist/wishlist-context";
import {
  Atkinson_Hyperlegible,
  Bangers,
  Bricolage_Grotesque,
  Inter,
  Space_Grotesk,
} from "next/font/google";
import { getCart } from "lib/shopify";
import { ReactNode, Suspense } from "react";
import { Toaster } from "sonner";
import "./globals.css";
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

// High-legibility font used only when the "Dyslexia Font" accessibility toggle
// is on. preload:false so its two weights aren't downloaded for every visitor —
// the browser fetches it on demand when the toggle applies var(--font-dyslexia).
const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-dyslexia",
  display: "swap",
  preload: false,
});

// Re-applies saved accessibility preferences to <html> before paint (no flash).
const a11yInitScript = `(function(){try{var s=JSON.parse(localStorage.getItem('cc-a11y')||'{}');var m={contrast:'a11y-contrast',links:'a11y-links',biggerText:'a11y-bigger-text',spacing:'a11y-spacing',noMotion:'a11y-no-motion',hideImages:'a11y-hide-images',dyslexia:'a11y-dyslexia',lineHeight:'a11y-line-height'};var e=document.documentElement;for(var k in m){if(s[k])e.classList.add(m[k]);}}catch(e){}})();`;

// units.gr button hover: track the cursor over any `.cc-units` element and
// expose it as --mx/--my so the fill circle expands from the pointer position.
const unitsHoverScript = `(function(){function u(e){var t=e.target&&e.target.closest&&e.target.closest('.cc-units');if(!t)return;var r=t.getBoundingClientRect();t.style.setProperty('--mx',(e.clientX-r.left)+'px');t.style.setProperty('--my',(e.clientY-r.top)+'px');}document.addEventListener('pointermove',u,{passive:true});document.addEventListener('pointerdown',u,{passive:true});})();`;

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
      suppressHydrationWarning
      className={`${bricolage.variable} ${inter.variable} ${bangers.variable} ${spaceGrotesk.variable} ${atkinson.variable}`}
    >
      <body className="flex min-h-screen flex-col overflow-x-clip bg-brand-bg text-brand-ink antialiased">
        <script dangerouslySetInnerHTML={{ __html: a11yInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: unitsHoverScript }} />
        <CartProvider cartPromise={cart}>
          <WishlistProvider>
            <PromoStrip />
            <Navbar />
            <main className="flex flex-1 flex-col pb-[calc(64px+env(safe-area-inset-bottom))] lg:pb-0">
              {children}
              <Toaster closeButton />
            </main>
            {/* Both suspend on request data (cart cookie / search params);
                Next 16 requires that inside a boundary. Fixed-position UI, so
                a null fallback causes no layout shift. */}
            <Suspense fallback={null}>
              <BottomTabBar />
            </Suspense>
            <Suspense fallback={null}>
              <SearchOverlay />
            </Suspense>
            <AccessibilityMenu />
            <SignupPopup />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
