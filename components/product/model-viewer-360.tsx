"use client";

import { useEffect, useState } from "react";

const SCRIPT_SRC =
  "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace React {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
      interface IntrinsicElements {
        "model-viewer": React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement>,
          HTMLElement
        > & {
          src?: string;
          poster?: string;
          alt?: string;
          "camera-controls"?: boolean;
          "auto-rotate"?: boolean;
          "auto-rotate-delay"?: string;
          "rotation-per-second"?: string;
          "shadow-intensity"?: string;
          "shadow-softness"?: string;
          "environment-image"?: string;
          "tone-mapping"?: string;
          exposure?: string;
          "interaction-prompt"?: string;
          "touch-action"?: string;
          loading?: string;
          "camera-orbit"?: string;
          "min-camera-orbit"?: string;
          "max-camera-orbit"?: string;
        };
      }
    }
  }
}

/** Interactive 360° product viewer. The model-viewer web component is only
 *  fetched when this component first mounts, i.e. when the shopper actually
 *  opens the 3D view — the PDP itself stays script-free. */
export function ModelViewer360({
  src,
  poster,
  alt,
}: {
  src: string;
  poster?: string;
  alt: string;
}) {
  const [ready, setReady] = useState(
    () =>
      typeof window !== "undefined" &&
      !!window.customElements?.get("model-viewer"),
  );

  useEffect(() => {
    if (ready) return;
    let cancelled = false;
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    const script = existing ?? document.createElement("script");
    const onLoad = () => {
      if (!cancelled) setReady(true);
    };
    if (window.customElements?.get("model-viewer")) {
      setReady(true);
      return;
    }
    script.addEventListener("load", onLoad);
    if (!existing) {
      script.type = "module";
      script.src = SCRIPT_SRC;
      document.head.appendChild(script);
    }
    return () => {
      cancelled = true;
      script.removeEventListener("load", onLoad);
    };
  }, [ready]);

  if (!ready) {
    return (
      <div className="grid h-full w-full place-items-center text-sm text-neutral-500">
        Loading 3D view…
      </div>
    );
  }

  return (
    <model-viewer
      src={src}
      poster={poster}
      alt={alt}
      camera-controls
      camera-orbit="0deg 90deg auto"
      min-camera-orbit="-Infinity 80deg auto"
      max-camera-orbit="Infinity 100deg auto"
      auto-rotate
      auto-rotate-delay="1500"
      rotation-per-second="25deg"
      /* Clear acrylic reads through reflections, so it needs an environment to
         catch. No ground shadow: the case is open-bottomed and the shadow fell
         straight across the etched base logo, muddying it. */
      environment-image="neutral"
      shadow-intensity="0"
      exposure="1.15"
      interaction-prompt="none"
      touch-action="pan-y"
      style={{
        width: "100%",
        height: "100%",
        background:
          "radial-gradient(circle at 50% 38%, #ffffff 0%, #f2f1ee 55%, #e2e0da 100%)",
      }}
    />
  );
}
