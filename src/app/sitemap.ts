import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { designPageKeys, designPages } from "@/content/design-pages";
import type { Pathname } from "@/i18n/routing";
import { clientEnv } from "@/lib/env";
import { languageAlternates } from "@/lib/seo";
import { getSite, hostFromHeaders } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headerStore = await headers();
  const site = getSite(hostFromHeaders(headerStore));
  const indexable =
    clientEnv.NEXT_PUBLIC_APP_ENV === "production" && site === "cnc";

  if (site === "design") {
    return designPageKeys
      .filter((key) => designPages[key].enabled)
      .map((key) => sitemapEntry(site, designPages[key].href))
      .concat(sitemapEntry(site, "/privacy"));
  }

  if (!indexable) {
    return [];
  }

  return [sitemapEntry(site, "/"), sitemapEntry(site, "/privacy")];
}

function sitemapEntry(
  site: "design" | "cnc",
  href: Pathname,
): MetadataRoute.Sitemap[number] {
  const languages = languageAlternates(site, href);

  return {
    url: languages["x-default"],
    alternates: { languages },
  };
}
