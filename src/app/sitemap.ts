import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { clientEnv } from "@/lib/env";
import { languageAlternates } from "@/lib/seo";
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

  return [
    {
      url: languages["x-default"],
      alternates: { languages },
    },
  ];
}
