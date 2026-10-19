import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale, type Pathname } from "@/i18n/routing";
import { clientEnv } from "@/lib/env";
import { isDesignFull, isIndexingAllowed } from "@/lib/flags";
import type { Site } from "@/lib/site";

export { isDesignFull, isIndexingAllowed };

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

export function absoluteUrl(site: Site, pathname: string): string {
  const origin = siteOrigin(site);
  return pathname === "/" ? origin : `${origin}${pathname}`;
}

export function absoluteLocalizedUrl(
  site: Site,
  locale: Locale,
  pathname = "/",
): string {
  return absoluteUrl(site, localizedPath(locale, pathname));
}

export function languageAlternates(site: Site, href: Pathname = "/") {
  const esPath = getPathname({ href, locale: "es" });
  const enPath = getPathname({ href, locale: "en" });

  return {
    [hreflang.es]: absoluteUrl(site, esPath),
    [hreflang.en]: absoluteUrl(site, enPath),
    "x-default": absoluteUrl(site, esPath),
  };
}

export function siteBrandName(site: Site): string {
  return site === "cnc" ? "CNC by Woodax Design" : "Woodax Design";
}

export function ogImageUrl(site: Site, locale: Locale): string {
  return `${siteOrigin(site)}/api/og?site=${site}&locale=${locale}`;
}

export function localizedMetadata({
  site,
  locale,
  title,
  description,
  href = "/",
}: {
  site: Site;
  locale: Locale;
  title: string;
  description: string;
  href?: Pathname;
}): Metadata {
  const canonical = absoluteUrl(site, getPathname({ href, locale }));
  const currentOgLocale = ogLocale[locale];
  const alternateOgLocale = locale === "es" ? ogLocale.en : ogLocale.es;
  const siteName = siteBrandName(site);
  const imageUrl = ogImageUrl(site, locale);

  return {
    metadataBase: new URL(siteOrigin(site)),
    title,
    description,
    alternates: {
      canonical,
      languages: languageAlternates(site, href),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      locale: currentOgLocale,
      alternateLocale: [alternateOgLocale],
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function unlistedPageMetadata({
  site,
  title,
  description,
}: {
  site: Site;
  title: string;
  description: string;
}): Metadata {
  return {
    metadataBase: new URL(siteOrigin(site)),
    title,
    description,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
    alternates: {
      canonical: null,
      languages: {},
    },
    openGraph: {
      title,
      description,
      siteName: siteBrandName(site),
      url: undefined,
      images: [],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [],
    },
  };
}
