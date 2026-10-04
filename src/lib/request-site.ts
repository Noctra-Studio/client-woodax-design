import { cookies, headers } from "next/headers";
import {
  hostFromHeaders,
  PREVIEW_SITE_COOKIE,
  PREVIEW_SITE_HEADER,
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
