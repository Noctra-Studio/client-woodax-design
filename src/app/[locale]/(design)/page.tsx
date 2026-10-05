import type { Metadata, Viewport } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { WoodaxLogo } from "@/components/brand/woodax-logo";
import { AudienceSection } from "@/components/design/audience-section";
import { HeroSection } from "@/components/design/hero-section";
import { IntroProvider } from "@/components/design/intro-provider";
import { ProcessSection } from "@/components/design/process-section";
import { ProjectsSection } from "@/components/design/projects-section";
import { SiteFooter } from "@/components/design/site-footer";
import { SiteHeader } from "@/components/design/site-header";
import { designGallery } from "@/content/design-gallery";
import { siteConfig } from "@/content/site-config";
import { LeadCapture } from "@/features/leads/components/lead-capture";
import { LeadUiProvider } from "@/features/leads/components/lead-ui";
import { getLeadCopy } from "@/features/leads/copy";
import { routing, type Locale } from "@/i18n/routing";
import { clientEnv } from "@/lib/env";
import { localizedMetadata, siteOrigin } from "@/lib/seo";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F1EC" },
    { media: "(prefers-color-scheme: dark)", color: "#F4F1EC" },
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
  const t = await getTranslations({ locale, namespace: "design.meta" });
  const metadata = localizedMetadata({
    site: "design",
    locale,
    title: t("title"),
    description: t("description"),
  });
  const poster = designGallery[0];
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

export default async function DesignPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (hasLocale(routing.locales, locale)) {
    setRequestLocale(locale);
  }

  const t = await getTranslations("design");
  const copy = await getLeadCopy("design");
  const jsonLd = designJsonLd(t("title"));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <a
        href="#hero-title"
        className="bg-woodax-cream text-woodax-charcoal focus-visible:outline-woodax-charcoal sr-only z-50 rounded-full focus-visible:not-sr-only focus-visible:fixed focus-visible:top-[max(1rem,env(safe-area-inset-top))] focus-visible:left-4 focus-visible:inline-flex focus-visible:min-h-11 focus-visible:items-center focus-visible:px-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {t("skipToContent")}
      </a>
      <LeadUiProvider>
        <IntroProvider>
          <SiteHeader
            logo={
              <WoodaxLogo
                priority={designGallery.length === 0}
                className="h-9 w-auto"
              />
            }
            skipLabel={t("hero.skipIntro")}
          />
          <main className="flex flex-1 flex-col pb-28 md:pb-0">
            <HeroSection />
            <AudienceSection />
            <ProjectsSection instagramUrl={siteConfig.instagramUrl} />
            <ProcessSection />
            <LeadCapture copy={copy} />
          </main>
        </IntroProvider>
      </LeadUiProvider>
      <SiteFooter
        logo={<WoodaxLogo className="h-8 w-auto" />}
        cncUrl={clientEnv.NEXT_PUBLIC_CNC_URL}
        instagramUrl={siteConfig.instagramUrl}
        instagramHandle={siteConfig.instagramHandle}
      />
    </>
  );
}

function designJsonLd(name: string) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name,
    url: siteOrigin("design"),
    areaServed: "Querétaro",
    knowsAbout: [
      "custom kitchens",
      "closets",
      "custom furniture",
      "commercial interiors",
    ],
  };

  if (siteConfig.instagramUrl) {
    data.sameAs = [siteConfig.instagramUrl];
  }

  return JSON.stringify(data).replace(/</g, "\\u003c");
}
