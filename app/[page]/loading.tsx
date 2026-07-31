// Suspense boundary for Shopify-served content pages. Required under Next 16
// cacheComponents: the page awaits `params` (request data), which must happen
// inside a boundary for the route's static shell to prerender.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl animate-pulse px-4 py-12">
      <div className="mb-8 h-12 w-2/3 rounded-full bg-anime-ink/10" />
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 w-full rounded-full bg-anime-ink/10" />
        ))}
      </div>
    </div>
  );
}
