import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { clientEnv } from "@/lib/env";
import { absoluteLocalizedUrl, languageAlternates } from "@/lib/seo";
import { getSite } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (clientEnv.NEXT_PUBLIC_APP_ENV !== "production") {
    return [];
  }

  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "";
  const site = getSite(host);
  const languages = languageAlternates(site);

  const privacyLanguages = {
    "es-MX": absoluteLocalizedUrl(site, "es", "/privacidad"),
    en: absoluteLocalizedUrl(site, "en", "/privacy"),
    "x-default": absoluteLocalizedUrl(site, "es", "/privacidad"),
  };

  return [
    {
      url: languages["x-default"],
      alternates: { languages },
    },
    {
      url: privacyLanguages["x-default"],
      alternates: { languages: privacyLanguages },
    },
  ];
}
