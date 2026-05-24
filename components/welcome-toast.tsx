"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function WelcomeToast() {
  useEffect(() => {
    if (window.innerHeight < 650) return;
    if (!document.cookie.includes("welcome-toast=cc")) {
      toast(
        <span className="font-display text-base font-extrabold">
          <span className="rounded border-[2px] border-anime-ink bg-anime-cyan px-1.5">
            New drop!
          </span>{" "}
          The crate just landed.
        </span>,
        {
          id: "welcome-toast",
          duration: Infinity,
          onDismiss: () => {
            document.cookie = "welcome-toast=cc; max-age=31536000; path=/";
          },
          description: (
            <>
              Funkos, slabbed cards, and the figures collectors hunt.{" "}
              <a
                href="/search"
                className="font-bold text-anime-pink underline decoration-2 underline-offset-2"
              >
                Start the chase →
              </a>
            </>
          ),
        },
      );
    }
  }, []);

  return null;
}
