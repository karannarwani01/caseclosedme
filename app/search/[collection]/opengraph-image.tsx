import OpengraphImage from "components/opengraph-image";
import { getCollection } from "lib/shopify";

export default async function Image(props: {
  params: Promise<{ collection: string }>;
}) {
  // Next 16: `params` is a Promise in metadata image routes too; synchronous
  // access yielded undefined and the collection lookup always missed.
  const params = await props.params;
  const collection = await getCollection(params.collection);
  const title = collection?.seo?.title || collection?.title;

  return await OpengraphImage({ title });
}
