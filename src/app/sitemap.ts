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
      .flatMap((key) => sitemapEntries(site, designPages[key].href))
      .concat(sitemapEntries(site, "/privacy"));
  }

  if (!indexable) {
    return [];
  }

  return [...sitemapEntries(site, "/"), ...sitemapEntries(site, "/privacy")];
}

function sitemapEntries(
  site: "design" | "cnc",
  href: Pathname,
): MetadataRoute.Sitemap {
  const languages = languageAlternates(site, href);

  return [languages["es-MX"], languages.en].map((url) => ({
    url,
    alternates: { languages },
  }));
}
