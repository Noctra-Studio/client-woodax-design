import type { Metadata, Viewport } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandIcon } from "@/components/brand/brand-icon";
import { CncLogo } from "@/components/brand/cnc-logo";
import { AudienceSection } from "@/components/cnc/audience-section";
import { HeroSection } from "@/components/cnc/hero-section";
import { IntroProvider } from "@/components/cnc/intro-provider";
import { MaterialsSection } from "@/components/cnc/materials-section";
import { ProcessSection } from "@/components/cnc/process-section";
import { SiteFooter } from "@/components/cnc/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { WaysSection } from "@/components/cnc/ways-section";
import { WorkSection } from "@/components/cnc/work-section";
import { cncGallery } from "@/content/cnc-gallery";
import { siteConfig } from "@/content/site-config";
import { LeadCapture } from "@/features/leads/components/lead-capture";
import { LeadUiProvider } from "@/features/leads/components/lead-ui";
import { getLeadCopy } from "@/features/leads/copy";
import { routing, type Locale } from "@/i18n/routing";
import { clientEnv } from "@/lib/env";
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
  const { locale } = await params;

  if (hasLocale(routing.locales, locale)) {
    setRequestLocale(locale);
  }

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
            links={[
              { type: "anchor", id: "servicio", label: nav("cnc.how") },
              { type: "anchor", id: "materiales", label: nav("cnc.materials") },
              { type: "anchor", id: "contacto", label: nav("cnc.contact") },
            ]}
            ctaLabel={nav("cnc.cta")}
            menuLabel={nav("menu")}
            closeLabel={nav("close")}
            languageLabel={nav("language")}
            siblingHref={clientEnv.NEXT_PUBLIC_DESIGN_URL}
            siblingLabel={nav("sibling.toDesign")}
            instagramUrl={siteConfig.instagramUrl}
            instagramLabel={nav("instagram")}
            facebookUrl={siteConfig.facebookUrl}
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
            <MaterialsSection />
            <AudienceSection />
            <ProcessSection />
            <WorkSection />
            <LeadCapture copy={copy} />
          </main>
        </IntroProvider>
      </LeadUiProvider>
      <SiteFooter
        logo={<CncLogo className="h-8 w-auto" />}
        designUrl={clientEnv.NEXT_PUBLIC_DESIGN_URL}
        instagramUrl={siteConfig.instagramUrl}
        instagramHandle={siteConfig.instagramHandle}
      />
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

  if (siteConfig.instagramUrl) {
    data.sameAs = [siteConfig.instagramUrl];
  }

  return JSON.stringify(data).replace(/</g, "\\u003c");
}
