import type { Metadata, Viewport } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandIcon } from "@/components/brand/brand-icon";
import { CncLogo } from "@/components/brand/cnc-logo";
import { AudienceSection } from "@/components/cnc/audience-section";
import { CapabilitiesSection } from "@/components/cnc/capabilities-section";
import { HeroSection } from "@/components/cnc/hero-section";
import { IntroProvider } from "@/components/cnc/intro-provider";
import { MaterialsSection } from "@/components/cnc/materials-section";
import { ProcessSection } from "@/components/cnc/process-section";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { WaysSection } from "@/components/cnc/ways-section";
import { WorkSection } from "@/components/cnc/work-section";
import { cncGallery } from "@/content/cnc-gallery";
import {
  cncSectionAnchors,
  publishedSocialUrl,
  siteConfig,
} from "@/content/site-config";
import { LeadCapture } from "@/features/leads/components/lead-capture";
import { LeadUiProvider } from "@/features/leads/components/lead-ui";
import { getLeadCopy } from "@/features/leads/copy";
import { routing, type Locale } from "@/i18n/routing";
import { requestDesignHomeUrl } from "@/lib/request-site";
import { localizedMetadata, siteOrigin } from "@/lib/seo";

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
  const metadata = localizedMetadata({
    site: "cnc",
    locale,
    title: t("title"),
    description: t("description"),
  });
  const poster = cncGallery[0];
  if (!poster) return metadata;

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      images: [
        {
          url: poster.src,
          width: poster.width,
          height: poster.height,
          alt: poster.alt[locale],
        },
      ],
    },
  };
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
  const design = await getTranslations("design");
  const copy = await getLeadCopy("cnc");
  const jsonLd = cncJsonLd(t("title"), design("title"));

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
              <CncLogo
                priority={cncGallery.length === 0}
                className="h-7 w-auto"
              />
            }
            logoCompact={
              <BrandIcon
                variant="cnc"
                priority={cncGallery.length === 0}
                className="h-7 w-auto"
              />
            }
          />
          <main className="flex min-w-0 flex-1 flex-col overflow-x-clip pb-28 md:pb-0">
            <HeroSection />
            <WaysSection />
            <CapabilitiesSection />
            <MaterialsSection />
            <AudienceSection />
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

function cncJsonLd(name: string, parentName: string) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    url: siteOrigin("cnc"),
    areaServed: "Querétaro",
    parentOrganization: {
      "@type": "Organization",
      name: parentName,
      url: siteOrigin("design"),
    },
    knowsAbout: [
      "CNC router cutting",
      "CNC router rental",
      "acrylic cutting",
      "aluminum cutting",
      "MDF cutting",
      "signage",
    ],
  };

  const sameAs = [siteConfig.instagramUrl, siteConfig.facebookUrl].flatMap(
    (url) => {
      const published = publishedSocialUrl(url);
      return published ? [published] : [];
    },
  );
  if (sameAs.length > 0) {
    data.sameAs = sameAs;
  }

  return JSON.stringify(data).replace(/</g, "\\u003c");
}
