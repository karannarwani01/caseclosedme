import Footer from "components/layout/footer";
import { ContactForm } from "components/contact-form";

export const metadata = {
  title: "Contact Us",
  description:
    "Questions about an order, shipping, returns or anything else — message the caseclosed team. We reply within 1–3 business days.",
  openGraph: {
    type: "website",
    siteName: "caseclosed",
    url: "/contact",
    title: "Contact Us",
    description:
      "Questions about an order, shipping, returns or anything else — message the caseclosed team. We reply within 1–3 business days.",
  },
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-2xl px-6 py-16 sm:py-24">
        <div className="mb-12 text-center">
          <span className="inline-flex items-center rounded-md border-[2.5px] border-anime-ink bg-anime-pink px-3.5 py-1.5 font-display text-sm font-extrabold uppercase tracking-widest text-white shadow-[3px_3px_0_0_var(--color-anime-ink)]">
            ★ Say hi
          </span>
          <h1 className="mt-6 text-6xl uppercase tracking-wide text-anime-ink [font-family:var(--font-bangers)] sm:text-7xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-anime-ink/70 [font-family:var(--font-spacegrotesk)] sm:text-lg">
            Questions about an order, a drop, shipping or anything else — drop
            us a message and we&apos;ll get back to you. For refunds, use the{" "}
            <a
              href="/refund-request"
              className="font-semibold text-anime-pink underline-offset-2 hover:underline"
            >
              refund request form
            </a>
            .
          </p>
        </div>

        <ContactForm />
      </section>
      <Footer />
    </>
  );
}
