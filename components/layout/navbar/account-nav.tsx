"use client";

import { UserIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";

type AccountState = {
  configured: boolean;
  loggedIn: boolean;
  email: string | null;
};

// Account button. Until the Customer Account API is configured it links to the
// hosted Shopify account page (current behaviour). Once configured it drives the
// in-app OAuth login/logout so the wishlist can sync.
export function AccountNav() {
  const [state, setState] = useState<AccountState>({
    configured: false,
    loggedIn: false,
    email: null,
  });

  useEffect(() => {
    fetch("/api/account")
      .then((r) => r.json())
      .then((d) => setState(d))
      .catch(() => {});
  }, []);

  // Always route through /api/auth/login — that handler itself falls back to the
  // hosted account page when the Customer Account API isn't configured, so this
  // works whether or not it's set up, and avoids a hydration-timing fl/detour.
  const href = state.loggedIn ? "/api/auth/logout" : "/api/auth/login";

  const label = state.loggedIn
    ? `Log out${state.email ? ` (${state.email})` : ""}`
    : "Log in to your account";

  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="relative grid h-11 w-11 place-items-center rounded-2xl border-[2.5px] border-anime-ink bg-anime-cyan text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-anime-ink)] lg:h-12 lg:w-12"
    >
      <UserIcon className="h-5 w-5" strokeWidth={2.5} />
      {state.loggedIn ? (
        <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-anime-ink bg-anime-lime" />
      ) : null}
    </Link>
  );
}
