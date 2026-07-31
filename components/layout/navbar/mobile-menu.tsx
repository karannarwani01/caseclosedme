"use client";

import { Dialog, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Menu } from "lib/shopify/types";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment, Suspense, useEffect, useMemo, useState } from "react";

import { filterMega, MEGA_BY_TITLE } from "./mega-config";
import Search, { SearchSkeleton } from "./search";

// Mobile slide-in menu. Each top-level category expands (accordion) to reveal
// its full mega-menu sections + links — the same structure the desktop NavMenu
// shows on hover — filtered to collections that currently have products.
export default function MobileMenu({
  menu,
  nonEmpty = [],
}: {
  menu: Menu[];
  nonEmpty?: string[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const nonEmptySet = useMemo(() => new Set(nonEmpty), [nonEmpty]);

  const openMobileMenu = () => setIsOpen(true);
  const closeMobileMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  // Each top-level item with its filtered mega sections (empty = plain link).
  const items = useMemo(
    () =>
      menu.map((m) => {
        const mega = MEGA_BY_TITLE[m.title];
        const sections = mega ? filterMega(mega, nonEmptySet).sections : [];
        return { title: m.title, path: m.path, sections };
      }),
    [menu, nonEmptySet],
  );

  return (
    <>
      <button
        onClick={openMobileMenu}
        aria-label="Open mobile menu"
        className="flex h-11 w-11 items-center justify-center rounded-2xl border-[2.5px] border-anime-ink bg-white text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all active:translate-y-[1px] xl:hidden"
      >
        <Bars3Icon className="h-6 w-6" strokeWidth={2.5} />
      </button>
      <Transition show={isOpen}>
        <Dialog onClose={closeMobileMenu} className="relative z-[60]">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-[-100%]"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-[-100%]"
          >
            <Dialog.Panel className="fixed bottom-0 left-0 top-0 flex h-full w-[88%] max-w-sm flex-col border-r-[2.5px] border-anime-ink bg-white">
              {/* Header */}
              <div className="flex items-center justify-between border-b-[2.5px] border-anime-ink p-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
                <span className="font-comic text-2xl uppercase tracking-wide text-anime-ink">
                  Menu
                </span>
                <button
                  onClick={closeMobileMenu}
                  aria-label="Close mobile menu"
                  className="grid h-10 w-10 place-items-center rounded-2xl border-[2.5px] border-anime-ink bg-white text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)] active:translate-y-[1px]"
                >
                  <XMarkIcon className="h-6 w-6" strokeWidth={2.5} />
                </button>
              </div>

              {/* Search */}
              <div className="border-b border-anime-ink/10 p-4">
                <Suspense fallback={<SearchSkeleton />}>
                  <Search />
                </Suspense>
              </div>

              {/* Category accordions */}
              <nav className="flex-1 overflow-y-auto overscroll-contain pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                <ul className="divide-y divide-anime-ink/10">
                  {items.map((it) => {
                    const hasSub = it.sections.length > 0;
                    const isExp = expanded === it.title;
                    return (
                      <li key={it.title}>
                        {hasSub ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setExpanded(isExp ? null : it.title)
                              }
                              aria-expanded={isExp}
                              className="flex w-full items-center justify-between px-5 py-4 text-left font-display text-base font-extrabold uppercase tracking-wide text-anime-ink"
                            >
                              {it.title}
                              <ChevronDownIcon
                                className={clsx(
                                  "h-5 w-5 shrink-0 transition-transform duration-200",
                                  isExp && "rotate-180",
                                )}
                                strokeWidth={2.5}
                              />
                            </button>
                            {isExp ? (
                              <div className="bg-anime-paper/60 px-5 pb-4">
                                {it.sections.map((sec) => (
                                  <div key={sec.heading} className="pt-3">
                                    <p className="mb-1.5 font-display text-[11px] font-extrabold uppercase tracking-[0.16em] text-anime-ink/45">
                                      {sec.heading}
                                    </p>
                                    <ul className="flex flex-col">
                                      {sec.links.map((l) => (
                                        <li key={l.path}>
                                          <Link
                                            href={l.path}
                                            prefetch={false}
                                            onClick={closeMobileMenu}
                                            className="block py-1.5 text-sm font-medium text-anime-ink/80 active:text-anime-pink"
                                          >
                                            {l.title}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <Link
                            href={it.path}
                            onClick={closeMobileMenu}
                            className="block px-5 py-4 font-display text-base font-extrabold uppercase tracking-wide text-anime-ink"
                          >
                            {it.title}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
