import type { Metadata } from "next";

import Prose from "components/prose";
import { getPage } from "lib/shopify";
import { seoPageTitle } from "lib/seo-title";
import { notFound } from "next/navigation";

// FAQPage structured data, extracted from the page's native <details>/<summary>
// Q&A markup (the FAQ page is authored that way in Shopify). Pages without
// Q&A blocks emit nothing. Text-only: tags are stripped from both sides.
function extractFaqPairs(html: string): { q: string; a: string }[] {
  const strip = (s: string) =>
    s
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const out: { q: string; a: string }[] = [];
  for (const m of html.matchAll(
    /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi,
  )) {
    const q = strip(m[1]!);
    const a = strip(m[2]!);
    if (q && a) out.push({ q, a });
  }
  return out;
}

// Group the policy HTML into one box per section: each top-level <h2> heading
// and everything after it (paragraphs, sub-headings, lists) up to the next <h2>
// is wrapped in a single card. Pages with no <h2> become one box.
function boxBySection(html: string): string {
  if (!html) return html;
  const parts = html.split(/(?=<h2[\s>])/i).filter((s) => s.trim());
  if (parts.length <= 1)
    return `<section class="policy-card">${html}</section>`;
  return parts
    .map((s) => `<section class="policy-card">${s}</section>`)
    .join("");
}

export async function generateMetadata(props: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = await getPage(params.page);

  if (!page) return notFound();

  const description = page.seo?.description || page.bodySummary;

  return {
    // Same guard as products/collections: these titles come from Shopify and a
    // merchant may well type the brand into one.
    title: seoPageTitle(page.seo?.title, page.title),
    description,
    openGraph: {
      title: page.title,
      description,
      url: `/${params.page}`,
      siteName: "caseclosed",
      publishedTime: page.createdAt,
      modifiedTime: page.updatedAt,
      type: "article",
    },
    alternates: { canonical: `/${params.page}` },
  };
}

export default async function Page(props: {
  params: Promise<{ page: string }>;
}) {
  const params = await props.params;
  const page = await getPage(params.page);

  if (!page) return notFound();

  const faqPairs = extractFaqPairs(page.body);
  const faqJsonLd =
    faqPairs.length >= 3
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqPairs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <h1 className="mb-10 text-3xl uppercase tracking-wide text-anime-ink text-balance [font-family:var(--font-bangers)] sm:text-5xl">
        {page.title}
      </h1>
      <Prose
        className="prose-sections !text-xl leading-relaxed text-anime-ink [font-family:var(--font-spacegrotesk)] sm:!text-2xl prose-headings:!text-anime-pink prose-headings:!tracking-wide prose-headings:[font-family:var(--font-bangers)]"
        html={boxBySection(page.body)}
      />
    </>
  );
}
