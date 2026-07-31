"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { PhoneCard } from "components/account/phone-card";
import { useEffect, useState } from "react";

type Order = {
  id: string;
  name: string;
  processedAt: string | null;
  total: { amount: string; currencyCode: string } | null;
  status: string | null;
};

// "FULFILLED" / "PARTIALLY_FULFILLED" -> "Fulfilled" / "Partially fulfilled"
function prettyStatus(s: string | null): string | null {
  if (!s) return null;
  const t = s.replace(/_/g, " ").toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

type AccountData = {
  loggedIn: boolean;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  orders: Order[];
  canSavePhone?: boolean;
};

function money(t: Order["total"]): string {
  if (!t) return "—";
  const n = Number(t.amount);
  return `${t.currencyCode} ${Number.isFinite(n) ? n.toFixed(2) : t.amount}`;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function AccountPage() {
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/account/data")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/api/auth/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const name =
    [data?.firstName, data?.lastName].filter(Boolean).join(" ") ||
    data?.email ||
    "there";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-28 pt-8 lg:pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight text-anime-pink lg:text-5xl">
            My Account
          </h1>
          <p className="mt-1 font-comic text-sm uppercase tracking-wide text-anime-ink/70">
            {loading ? "Loading…" : `Hey, ${name}! 👋`}
          </p>
        </div>
        <a
          href="/api/auth/logout"
          className="inline-flex items-center rounded-xl border-[2.5px] border-anime-ink bg-white px-4 py-2 font-display text-sm font-extrabold uppercase tracking-wide text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-anime-ink)]"
        >
          Log out
        </a>
      </div>

      {/* Account details */}
      <section className="mt-8 rounded-2xl border-[2.5px] border-anime-ink bg-white p-5 shadow-[4px_4px_0_0_var(--color-anime-ink)]">
        <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-anime-ink">
          Account details
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="font-comic text-[11px] uppercase tracking-wide text-anime-ink/60">
              Name
            </dt>
            <dd className="font-display text-base font-bold text-anime-ink">
              {loading ? "…" : name}
            </dd>
          </div>
          <div>
            <dt className="font-comic text-[11px] uppercase tracking-wide text-anime-ink/60">
              Email
            </dt>
            <dd className="font-display text-base font-bold text-anime-ink">
              {loading ? "…" : data?.email || "—"}
            </dd>
          </div>
        </dl>
      </section>

      {/* Only rendered once the Admin token can actually write it. */}
      {data?.canSavePhone ? <PhoneCard /> : null}

      {/* Order history */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-anime-ink">
          Order history
        </h2>

        {loading ? (
          <p className="mt-4 font-comic text-sm text-anime-ink/60">
            Loading your orders…
          </p>
        ) : data && data.orders.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {data.orders.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-[2.5px] border-anime-ink bg-white p-4 shadow-[3px_3px_0_0_var(--color-anime-ink)]"
              >
                <div>
                  <p className="font-display text-base font-extrabold text-anime-ink">
                    {o.name}
                  </p>
                  <p className="font-comic text-[11px] uppercase tracking-wide text-anime-ink/60">
                    {fmtDate(o.processedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {prettyStatus(o.status) ? (
                    <span className="inline-block rounded-full border-2 border-anime-ink bg-anime-cyan px-2.5 py-0.5 font-comic text-[10px] uppercase tracking-wide text-anime-ink">
                      {prettyStatus(o.status)}
                    </span>
                  ) : null}
                  <span className="inline-block rotate-1 rounded-md border-[2.5px] border-anime-ink bg-anime-lime px-2.5 py-0.5 font-display text-sm font-extrabold tabular-nums text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)]">
                    {money(o.total)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-2xl border-[2.5px] border-dashed border-anime-ink/40 bg-white p-8 text-center">
            <p className="font-display text-lg font-extrabold uppercase text-anime-ink">
              No orders yet
            </p>
            <p className="mt-1 font-comic text-sm text-anime-ink/60">
              Your orders will show up here once you check out.
            </p>
            <Link
              href="/search"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border-[2.5px] border-anime-ink bg-anime-cyan px-5 py-2.5 font-display text-sm font-extrabold uppercase tracking-wide text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-anime-ink)]"
            >
              Start shopping{" "}
              <ArrowRightIcon className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
