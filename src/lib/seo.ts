import type { Metadata } from "next";
import { clientEnv } from "@/lib/env";
import type { Site } from "@/lib/site";
import { routing, type Locale } from "@/i18n/routing";

const hreflang = {
  es: "es-MX",
  en: "en",
} as const;

const ogLocale = {
  es: "es_MX",
  en: "en_US",
} as const;

export function siteOrigin(site: Site): string {
  const url =
    site === "cnc"
      ? clientEnv.NEXT_PUBLIC_CNC_URL
      : clientEnv.NEXT_PUBLIC_DESIGN_URL;
  return url.replace(/\/$/, "");
}

export function localizedPath(locale: Locale, pathname = "/"): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const suffix = normalized === "/" ? "" : normalized.replace(/\/$/, "");

  if (locale === routing.defaultLocale) {
    return suffix || "/";
  }

  return `/${locale}${suffix}`;
}

export function absoluteLocalizedUrl(
  site: Site,
  locale: Locale,
  pathname = "/",
): string {
  const path = localizedPath(locale, pathname);
  const origin = siteOrigin(site);
  return path === "/" ? origin : `${origin}${path}`;
}

export function languageAlternates(site: Site, pathname = "/") {
  return {
    [hreflang.es]: absoluteLocalizedUrl(site, "es", pathname),
    [hreflang.en]: absoluteLocalizedUrl(site, "en", pathname),
    "x-default": absoluteLocalizedUrl(site, routing.defaultLocale, pathname),
  };
}

export function localizedMetadata({
  site,
  locale,
  title,
  description,
}: {
  site: Site;
  locale: Locale;
  title: string;
  description: string;
}): Metadata {
  const canonical = absoluteLocalizedUrl(site, locale);
  const currentOgLocale = ogLocale[locale];
  const alternateOgLocale = locale === "es" ? ogLocale.en : ogLocale.es;

  return {
    metadataBase: new URL(siteOrigin(site)),
    title,
    description,
    alternates: {
      canonical,
      languages: languageAlternates(site),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: currentOgLocale,
      alternateLocale: [alternateOgLocale],
      type: "website",
    },
  };
}
