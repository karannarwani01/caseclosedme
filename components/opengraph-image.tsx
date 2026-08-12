import { ImageResponse } from "next/og";
import { join } from "path";
import { readFile } from "fs/promises";

export type Props = {
  title?: string;
};

export default async function OpengraphImage(
  props?: Props,
): Promise<ImageResponse> {
  const { title } = {
    ...{
      title: process.env.SITE_NAME,
    },
    ...props,
  };

  const file = await readFile(join(process.cwd(), "./fonts/Inter-Bold.ttf"));
  const font = Uint8Array.from(file).buffer;

  const cube = await readFile(join(process.cwd(), "./public/logo-cube.png"));
  const cubeSrc = `data:image/png;base64,${cube.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#fff8f0",
          fontFamily: "Inter",
        }}
        tw="flex h-full w-full flex-col items-center justify-center"
      >
        <div tw="flex items-center" style={{ gap: "24px" }}>
          <div
            style={{
              background: "#1a1a2e",
              color: "#fff8f0",
              width: 120,
              height: 120,
              borderRadius: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cubeSrc} width={84} height={84} alt="" />
          </div>
        </div>
        <div
          style={{
            marginTop: 56,
            // Collection/page titles can be long — shrink so they stay on-card.
            fontSize: !title || title.length <= 16 ? 96 : 56,
            fontWeight: 800,
            color: "#0d0a1a",
            maxWidth: 1000,
            textAlign: "center",
          }}
        >
          {title || "caseclosed"}
        </div>
        <p
          style={{
            marginTop: 24,
            fontSize: 28,
            color: "rgba(26, 26, 46, 0.6)",
            fontWeight: 500,
          }}
        >
          Funko Pops · Trading Cards · Figures
        </p>
        <div
          style={{
            position: "absolute",
            top: 64,
            right: 80,
            background: "#ffd93d",
            color: "#1a1a2e",
            padding: "10px 20px",
            borderRadius: 9999,
            fontSize: 20,
            fontWeight: 700,
            transform: "rotate(6deg)",
          }}
        >
          NEW DROP
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: font,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
