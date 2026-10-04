import { clientEnv } from "@/lib/env";

export type Site = "design" | "cnc";

export const PREVIEW_SITE_COOKIE = "preview-site";
export const PREVIEW_SITE_HEADER = "x-preview-site";

type HeaderSource = {
  get(name: string): string | null;
};

/**
 * CNC is served from hosts that start with `cnc.` (including `cnc.localhost`
 * in development) or `cnc-staging.`.
 */
export function isCncHost(host: string): boolean {
  const hostname = hostnameFromHost(host);
  return hostname.startsWith("cnc.") || hostname.startsWith("cnc-staging.");
}

export function getSite(host: string): Site {
  return isCncHost(host) ? "cnc" : "design";
}

export function hostFromHeaders(headerStore: HeaderSource): string {
  return headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "";
}

/**
 * Vercel preview URLs share one host, so `?site=` can force Design or CNC.
 * Production ignores the override, including on a `*.vercel.app` hostname.
 */
export function allowsPreviewSiteOverride(host: string): boolean {
  return (
    clientEnv.NEXT_PUBLIC_APP_ENV !== "production" &&
    hostnameFromHost(host).endsWith(".vercel.app")
  );
}

export function parseSite(value: string | null | undefined): Site | null {
  const normalized = value?.trim().toLowerCase();
  return normalized === "design" || normalized === "cnc" ? normalized : null;
}

export function resolveSite(host: string, previewSite?: string | null): Site {
  if (!allowsPreviewSiteOverride(host)) {
    return getSite(host);
  }

  return parseSite(previewSite) ?? getSite(host);
}

function hostnameFromHost(host: string): string {
  const first = host.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.replace(/:\d+$/, "");
}
