import { routing, type Locale } from "@/i18n/routing";
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

export function publicOrigin(headerStore: HeaderSource): string {
  const host = hostFromHeaders(headerStore).split(",")[0]?.trim() ?? "";
  if (!host) return "";

  const proto =
    headerStore.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  return `${proto}://${host}`;
}

/**
 * Design → CNC links. Preview deployments share one host, so CNC is that
 * origin with `?site=cnc` instead of `NEXT_PUBLIC_CNC_URL`. English keeps `/en`.
 */
export function cncHomeUrl(host: string, origin: string, locale: Locale): string {
  if (!allowsPreviewSiteOverride(host)) {
    return clientEnv.NEXT_PUBLIC_CNC_URL;
  }

  const pathname = locale === routing.defaultLocale ? "/" : `/${locale}`;
  const url = new URL(pathname, origin);
  url.searchParams.set("site", "cnc");
  return url.toString();
}

/** 301 target for a Design `/cnc` path. Previews stay on the request origin. */
export function cncRedirectUrl(
  host: string,
  origin: string,
  pathname: string,
  search: string,
): string {
  const preview = allowsPreviewSiteOverride(host);
  const destination = new URL(
    pathname,
    preview ? origin : clientEnv.NEXT_PUBLIC_CNC_URL,
  );
  destination.search = search;
  if (preview) {
    destination.searchParams.set("site", "cnc");
  }
  return destination.toString();
}

/**
 * CNC → Design links. Preview deployments share one host, so Design is that
 * origin with `?site=design`. English keeps the `/en` prefix.
 */
export function designHomeUrl(
  host: string,
  origin: string,
  locale: Locale,
): string {
  if (!allowsPreviewSiteOverride(host)) {
    return clientEnv.NEXT_PUBLIC_DESIGN_URL;
  }

  const pathname = locale === routing.defaultLocale ? "/" : `/${locale}`;
  const url = new URL(pathname, origin);
  url.searchParams.set("site", "design");
  return url.toString();
}

function hostnameFromHost(host: string): string {
  const first = host.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.replace(/:\d+$/, "");
}
