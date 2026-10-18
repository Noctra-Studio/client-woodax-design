import type { Metadata, Viewport } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandIcon } from "@/components/brand/brand-icon";
import { CncLogo } from "@/components/brand/cnc-logo";
import { CapabilitiesSection } from "@/components/cnc/capabilities-section";
import { HeroSection } from "@/components/cnc/hero-section";
import { IntroProvider } from "@/components/cnc/intro-provider";
import { MaterialsSection } from "@/components/cnc/materials-section";
import { ProcessSection } from "@/components/cnc/process-section";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { WaysSection } from "@/components/cnc/ways-section";
import { WorkSection } from "@/components/cnc/work-section";
import {
  cncSectionAnchors,
  publishedSocialUrl,
  siteConfig,
} from "@/content/site-config";
import { LeadCapture } from "@/features/leads/components/lead-capture";
import { LeadUiProvider } from "@/features/leads/components/lead-ui";
import { getLeadCopy } from "@/features/leads/copy";
import { mobileCtaClearanceClass } from "@/features/leads/mobile-cta";
import { routing, type Locale } from "@/i18n/routing";
import { cncLogoAsset } from "@/lib/cnc-nav-logo";
import { requestDesignHomeUrl } from "@/lib/request-site";
import { localizedMetadata } from "@/lib/seo";
import { cncJsonLd, cncSpecPropertyValues } from "@/lib/structured-data";
import { cn } from "@/lib/utils";

const introBoot = `(function(){try{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;if(sessionStorage.getItem("woodax-cnc-intro")==="1")return;document.documentElement.setAttribute("data-cnc-intro","play");}catch(e){}})();`;

export const viewport: Viewport = {
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16171A" },
    { media: "(prefers-color-scheme: dark)", color: "#16171A" },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: requested } = await params;
  const locale: Locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "cnc.meta" });
  return localizedMetadata({
    site: "cnc",
    locale,
    title: t("title"),
    description: t("description"),
  });
}

export default async function CncPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: requested } = await params;
  const locale: Locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  if (hasLocale(routing.locales, requested)) {
    setRequestLocale(requested);
  }

  const designUrl = await requestDesignHomeUrl(locale);

  const t = await getTranslations("cnc");
  const nav = await getTranslations("nav");
  const copy = await getLeadCopy("cnc");
  const jsonLd = cncJsonLd({
    name: t("title"),
    description: t("meta.description"),
    serviceType: t("ways.serviceType"),
    knowsAbout: [
      t("ways.serviceType"),
      t("ways.workshopTitle"),
      t("ways.volumeServiceTitle"),
      t("materials.groups.wood.name"),
      t("materials.groups.acrylic.name"),
      t("materials.groups.aluminum.name"),
    ],
    services: [
      {
        name: t("ways.workshopTitle"),
        description: t("ways.workshopBody"),
      },
      {
        name: t("ways.volumeServiceTitle"),
        description: t("ways.volumeBody"),
      },
    ],
    specProperties: cncSpecPropertyValues(locale, {
      area: t("capabilities.area"),
      areaValue: t.raw("capabilities.areaValue"),
      thicknessValue: t.raw("capabilities.thicknessValue"),
      groupNames: {
        wood: t("materials.groups.wood.name"),
        acrylic: t("materials.groups.acrylic.name"),
        aluminum: t("materials.groups.aluminum.name"),
      },
    }),
  });

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: introBoot }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <a
        href="#hero-title"
        className="bg-cnc-bg text-cnc-text focus-visible:outline-cnc-white sr-only z-50 rounded-[4px] focus-visible:not-sr-only focus-visible:fixed focus-visible:top-[max(1rem,env(safe-area-inset-top))] focus-visible:left-4 focus-visible:inline-flex focus-visible:min-h-11 focus-visible:items-center focus-visible:px-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {t("skipToContent")}
      </a>
      <LeadUiProvider>
        <IntroProvider>
          <SiteNav
            variant="cnc"
            homeLabel={t("title")}
            links={cncSectionAnchors().map((link) => ({
              type: "anchor" as const,
              id: link.id,
              label: nav(`cnc.${link.labelKey}`),
            }))}
            ctaLabel={nav("cnc.cta")}
            menuLabel={nav("menu")}
            closeLabel={nav("close")}
            languageLabel={nav("language")}
            siblingHref={designUrl}
            siblingLabel={nav("sibling.toDesign")}
            instagramUrl={publishedSocialUrl(siteConfig.instagramUrl)}
            instagramLabel={nav("instagram")}
            facebookUrl={publishedSocialUrl(siteConfig.facebookUrl)}
            facebookLabel={nav("facebook")}
            logo={
              <CncLogo variant="nav" alt={t("title")} className="h-11 w-auto" />
            }
            logoCompact={<BrandIcon variant="cnc" className="h-8 w-auto" />}
            logoTraceSrc={cncLogoAsset("nav").src}
          />
          <main
            className={cn(
              "flex min-w-0 flex-1 flex-col overflow-x-clip",
              mobileCtaClearanceClass(copy.whatsappHref !== null),
            )}
          >
            <HeroSection />
            <WaysSection />
            <CapabilitiesSection />
            <MaterialsSection />
            <ProcessSection />
            <WorkSection />
            <LeadCapture copy={copy} />
          </main>
        </IntroProvider>
      </LeadUiProvider>
      <SiteFooter variant="cnc" />
    </>
  );
}
