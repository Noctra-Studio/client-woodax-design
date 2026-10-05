import { cookies, headers } from "next/headers";
import type { Locale } from "@/i18n/routing";
import {
  cncHomeUrl,
  designHomeUrl,
  hostFromHeaders,
  PREVIEW_SITE_COOKIE,
  PREVIEW_SITE_HEADER,
  publicOrigin,
  resolveSite,
  type Site,
} from "@/lib/site";

export async function requestSite(): Promise<Site> {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const host = hostFromHeaders(headerStore);
  const previewSite =
    headerStore.get(PREVIEW_SITE_HEADER) ??
    cookieStore.get(PREVIEW_SITE_COOKIE)?.value;

  return resolveSite(host, previewSite);
}

export async function requestCncHomeUrl(locale: Locale): Promise<string> {
  const headerStore = await headers();
  return cncHomeUrl(
    hostFromHeaders(headerStore),
    publicOrigin(headerStore),
    locale,
  );
}

export async function requestDesignHomeUrl(locale: Locale): Promise<string> {
  const headerStore = await headers();
  return designHomeUrl(
    hostFromHeaders(headerStore),
    publicOrigin(headerStore),
    locale,
  );
}
