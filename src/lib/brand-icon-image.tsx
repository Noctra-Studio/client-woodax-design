import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { requestSite } from "@/lib/request-site";
import type { Site } from "@/lib/site";

const iconSvg: Record<Site, string> = {
  design: readFileSync(
    join(process.cwd(), "public/brand/woodax-design-icon.svg"),
    "utf8",
  ),
  cnc: readFileSync(
    join(process.cwd(), "public/brand/cnc-woodax-icon.svg"),
    "utf8",
  ),
};

const iconAspect = 1887.6 / 2157.15;

const tileBackground: Record<Site, string> = {
  design: "#F3F1EA",
  cnc: "#16171A",
};

export async function brandIconResponse(size: {
  width: number;
  height: number;
}) {
  const site = await requestSite();
  const svg = iconSvg[site];
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const pad = Math.max(2, Math.round(size.width * 0.08));
  const markHeight = size.height - pad * 2;
  const markWidth = Math.round(markHeight * iconAspect);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: tileBackground[site],
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={markWidth} height={markHeight} alt="" />
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=3600",
        Vary: "Host, X-Forwarded-Host, Cookie",
      },
    },
  );
}
