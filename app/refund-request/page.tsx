import Footer from "components/layout/footer";
import { RefundRequestForm } from "components/refund-request-form";

export const metadata = {
  title: "Refund Request Form",
  description:
    "Submit a refund request for your caseclosed order. We reply to all requests within 1–3 business days.",
  alternates: { canonical: "/refund-request" },
};

export default function RefundRequestPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-2xl px-6 py-16 sm:py-24">
        <div className="mb-12 text-center">
          <span className="inline-flex items-center rounded-md border-[2.5px] border-anime-ink bg-anime-pink px-3.5 py-1.5 font-display text-sm font-extrabold uppercase tracking-widest text-white shadow-[3px_3px_0_0_var(--color-anime-ink)]">
            ★ Returns
          </span>
          <h1 className="mt-6 text-6xl uppercase tracking-wide text-anime-ink [font-family:var(--font-bangers)] sm:text-7xl">
            Refund Request Form
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-anime-ink/70 [font-family:var(--font-spacegrotesk)] sm:text-lg">
            Complete this form to start a refund request for any eligible
            purchase from caseclosed. Please review our{" "}
            <a
              href="/returns"
              className="font-semibold text-anime-pink underline-offset-2 hover:underline"
            >
              Returns / Refunds / Exchange Policy
            </a>{" "}
            before submitting.
          </p>
        </div>

        <RefundRequestForm />
      </section>
      <Footer />
    </>
  );
}
