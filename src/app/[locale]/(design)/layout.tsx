import type { Viewport } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandIcon } from "@/components/brand/brand-icon";
import { WoodaxLogo } from "@/components/brand/woodax-logo";
import { DesignFrame } from "@/components/design/design-frame";
import { IntroProvider } from "@/components/design/intro-provider";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav, type SiteNavLink } from "@/components/site/site-nav";
import {
  designNavKeys,
  designPages,
  designSectionAnchors,
} from "@/content/design-pages";
import { publishedSocialUrl, siteConfig } from "@/content/site-config";
import { LeadUiProvider } from "@/features/leads/components/lead-ui";
import { routing, type Locale } from "@/i18n/routing";
import { fraunces } from "@/lib/font-design";
import { requestCncHomeUrl } from "@/lib/request-site";
import { isDesignFull } from "@/lib/seo";

export const viewport: Viewport = {
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3F1EA" },
    { media: "(prefers-color-scheme: dark)", color: "#F3F1EA" },
  ],
};

export default async function DesignLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (hasLocale(routing.locales, locale)) {
    setRequestLocale(locale);
  }

  const activeLocale: Locale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;
  const t = await getTranslations("design");
  const nav = await getTranslations("nav");
  const cncUrl = await requestCncHomeUrl(activeLocale);
  const full = isDesignFull();
  const links: SiteNavLink[] = full
    ? designNavKeys
        .filter((key) => designPages[key].enabled)
        .map((key) => ({
          type: "route" as const,
          href: designPages[key].href,
          label: nav(`design.${key}`),
        }))
    : designSectionAnchors().map((link) => ({
        type: "anchor" as const,
        id: link.id,
        label: nav(`design.${link.labelKey}`),
      }));

  return (
    <div
      data-site-font-root
      className={`${fraunces.variable} flex flex-1 flex-col`}
    >
      <LeadUiProvider>
        <IntroProvider>
          <a
            href="#content"
            className="bg-woodax-cream text-woodax-charcoal focus-visible:outline-woodax-charcoal sr-only z-50 rounded-sm focus-visible:not-sr-only focus-visible:fixed focus-visible:top-[max(1rem,env(safe-area-inset-top))] focus-visible:left-4 focus-visible:inline-flex focus-visible:min-h-11 focus-visible:items-center focus-visible:px-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t("skipToContent")}
          </a>
          <SiteNav
            variant="design"
            homeLabel={t("title")}
            logoLabel={nav("design.homeAria")}
            links={links}
            routeHomeLabel={full ? nav("design.home") : undefined}
            sheetContactLabel={full ? nav("design.contact") : undefined}
            ctaLabel={nav("design.cta")}
            menuLabel={nav("menu")}
            closeLabel={nav("close")}
            languageLabel={nav("language")}
            siblingHref={cncUrl}
            siblingLabel={nav("sibling.toCnc")}
            instagramUrl={publishedSocialUrl(siteConfig.instagramUrl)}
            instagramLabel={nav("instagram")}
            facebookUrl={publishedSocialUrl(siteConfig.facebookUrl)}
            facebookLabel={nav("facebook")}
            facebookAria={nav("facebookAria")}
            logo={<WoodaxLogo alt={t("title")} className="h-11 w-auto" />}
            logoCompact={<BrandIcon variant="design" className="h-8 w-auto" />}
          />
          <DesignFrame mobileCtaLabel={nav("design.cta")}>{children}</DesignFrame>
          <SiteFooter variant="design" />
        </IntroProvider>
      </LeadUiProvider>
    </div>
  );
}
