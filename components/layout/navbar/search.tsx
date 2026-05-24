"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Form from "next/form";
import { useSearchParams } from "next/navigation";

export default function Search() {
  const searchParams = useSearchParams();

  return (
    <Form action="/search" className="relative w-full">
      <input
        key={searchParams?.get("q")}
        type="text"
        name="q"
        placeholder="Search drops..."
        autoComplete="off"
        defaultValue={searchParams?.get("q") || ""}
        className="w-full rounded-xl border-[2.5px] border-anime-ink bg-anime-cyan px-4 py-3 pr-11 text-sm font-medium text-anime-ink placeholder:text-anime-ink/55 focus:outline-none shadow-[3px_3px_0_0_var(--color-anime-ink)]"
      />
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-anime-ink">
        <MagnifyingGlassIcon className="h-5 w-5" strokeWidth={2.75} />
      </div>
    </Form>
  );
}

export function SearchSkeleton() {
  return (
    <form className="relative w-full">
      <input
        placeholder="Search drops..."
        className="w-full rounded-xl border-[2.5px] border-anime-ink bg-anime-cyan px-4 py-3 pr-11 text-sm font-medium text-anime-ink placeholder:text-anime-ink/55 shadow-[3px_3px_0_0_var(--color-anime-ink)]"
      />
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-anime-ink">
        <MagnifyingGlassIcon className="h-5 w-5" strokeWidth={2.75} />
      </div>
    </form>
  );
}
