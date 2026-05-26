import type { Metadata } from "next";

import Prose from "components/prose";
import { getPage } from "lib/shopify";
import { notFound } from "next/navigation";

export async function generateMetadata(props: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = await getPage(params.page);

  if (!page) return notFound();

  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.bodySummary,
    openGraph: {
      publishedTime: page.createdAt,
      modifiedTime: page.updatedAt,
      type: "article",
    },
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
      <h1 className="mb-10 font-display text-5xl font-extrabold uppercase tracking-tight text-anime-ink sm:text-6xl">
        {page.title}
      </h1>
      <Prose
        className="mb-10 text-base leading-relaxed text-anime-ink sm:text-lg"
        html={page.body}
      />
      <p className="text-sm italic text-anime-ink/60 sm:text-base">
        {`This document was last updated on ${new Intl.DateTimeFormat(
          undefined,
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        ).format(new Date(page.updatedAt))}.`}
      </p>
    </>
  );
}
