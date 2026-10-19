import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { requestSite } from "@/lib/request-site";
import { siteBrandName, unlistedPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: requested } = await params;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const site = await requestSite();
  const t = await getTranslations({ locale, namespace: "common" });
  const brand = siteBrandName(site);

  return unlistedPageMetadata({
    site,
    title: `${t("notFoundTitle")} · ${brand}`,
    description: t("notFoundDescription"),
  });
}

export default function UnknownPage() {
  notFound();
}
