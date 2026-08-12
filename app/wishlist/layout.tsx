import type { Metadata } from "next";

// page.tsx is a client component and so cannot export metadata itself. Without
// this the route fell back to the layout default and the tab just read
// "caseclosed". The root layout appends "| caseclosed".
export const metadata: Metadata = {
  title: "Wishlist",
  description:
    "The Funko Pops, blind boxes and trading cards you've saved on caseclosed.",
  openGraph: {
    type: "website",
    siteName: "caseclosed",
    url: "/wishlist",
    images: ["/opengraph-image"],
    title: "Wishlist",
    description:
      "The Funko Pops, blind boxes and trading cards you've saved on caseclosed.",
  },
  alternates: { canonical: "/wishlist" },
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
