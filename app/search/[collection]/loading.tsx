// Suspense boundary for collection pages. Required under Next 16
// cacheComponents: the page awaits `params` (request data), which must happen
// inside a boundary for the route's static shell to prerender.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1800px] animate-pulse px-4 py-6 lg:px-8">
      <div className="mb-6 h-10 w-56 rounded-full bg-anime-ink/10" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-2xl border-[2.5px] border-anime-ink bg-white"
          />
        ))}
      </div>
    </div>
  );
}
