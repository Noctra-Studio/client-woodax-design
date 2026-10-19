import type { MetadataRoute } from "next";
import { designPageKeys, designPages } from "@/content/design-pages";
import type { Pathname } from "@/i18n/routing";
import { requestSite } from "@/lib/request-site";
import { isDesignFull, isIndexingAllowed, languageAlternates } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexingAllowed()) {
    return [];
  }

  const site = await requestSite();

  if (site === "design") {
    if (!isDesignFull()) {
      return [...sitemapEntries(site, "/"), ...sitemapEntries(site, "/privacy")];
    }

    return designPageKeys
      .filter((key) => designPages[key].enabled)
      .flatMap((key) => sitemapEntries(site, designPages[key].href))
      .concat(sitemapEntries(site, "/privacy"));
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
