import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { brandAssets } from "@/lib/brand-assets";

export const CNC_NAV_LOGO_PATH = brandAssets.cnc.nav;

export type BrandLogoAsset = {
  src: string;
  width: number;
  height: number;
};

const CNC_FULL_LOGO: BrandLogoAsset = {
  src: brandAssets.cnc.logo,
  width: 1787,
  height: 733,
};

function readPublicSvgSize(publicPath: string): BrandLogoAsset | null {
  const abs = join(process.cwd(), "public", publicPath.replace(/^\//, ""));
  if (!existsSync(abs)) return null;

  const svg = readFileSync(abs, "utf8");
  const match = svg.match(/viewBox="([^"]+)"/);
  if (!match) return null;

  const parts = match[1].trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some((value) => !Number.isFinite(value))) {
    return null;
  }

  return {
    src: publicPath,
    width: Math.round(parts[2] ?? 0),
    height: Math.round(parts[3] ?? 0),
  };
}

const cncNavLogo = readPublicSvgSize(CNC_NAV_LOGO_PATH);

export const hasCncNavLogo = cncNavLogo !== null;

export function cncLogoAsset(variant: "full" | "nav" = "full"): BrandLogoAsset {
  if (variant === "nav" && cncNavLogo) return cncNavLogo;
  return CNC_FULL_LOGO;
}
