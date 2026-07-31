// Suspense boundary for the PDP shell. Required under Next 16 cacheComponents:
// the page awaits `params` (request data), which must happen inside a boundary
// for the route's static shell to prerender.
export default function Loading() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-(--breakpoint-2xl) px-4 py-6 md:py-10">
      <div className="flex animate-pulse flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
        <div className="w-full min-w-0 lg:basis-3/5">
          <div className="rounded-2xl border-[2.5px] border-anime-ink bg-[#fffcea] p-5 shadow-[6px_6px_0_0_var(--color-anime-ink)] md:p-6">
            <div className="aspect-square w-full rounded-2xl border-[2.5px] border-anime-ink bg-white" />
          </div>
        </div>
        <div className="w-full min-w-0 lg:basis-2/5">
          <div className="flex h-full flex-col gap-4 rounded-2xl border-[2.5px] border-anime-ink bg-[#fffcea] p-6 shadow-[6px_6px_0_0_var(--color-anime-ink)] md:p-8">
            <div className="h-10 w-3/4 rounded-full bg-anime-ink/10" />
            <div className="h-8 w-1/3 rounded-full bg-anime-ink/10" />
            <div className="mt-auto h-14 w-full rounded-full bg-anime-ink/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
