import type { Metadata } from "next";

// page.tsx is a client component and so cannot export metadata itself. Without
// this the route fell back to the layout default (tab read just "caseclosed")
// and — worse — a login-only personal dashboard was left indexable.
export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
