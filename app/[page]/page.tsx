import type { Metadata } from "next";

import Prose from "components/prose";
import { getPage } from "lib/shopify";
import { seoPageTitle } from "lib/seo-title";
import { notFound } from "next/navigation";

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

  return (
    <>
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
