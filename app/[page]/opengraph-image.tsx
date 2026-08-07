import OpengraphImage from "components/opengraph-image";
import { getPage } from "lib/shopify";

export default async function Image(props: {
  params: Promise<{ page: string }>;
}) {
  // Next 16: `params` is a Promise in metadata image routes too. Reading
  // `params.page` synchronously yields undefined, which made getPage always
  // miss and the unguarded `page.seo` access throw — every Shopify page's
  // og image 500'd.
  const params = await props.params;
  const page = await getPage(params.page);
  const title = page?.seo?.title || page?.title;

  return await OpengraphImage({ title });
}
