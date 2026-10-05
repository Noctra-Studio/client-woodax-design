import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AudienceSection } from "@/components/design/audience-section";
import { HeroSection } from "@/components/design/hero-section";
import { HomeCta } from "@/components/design/home-cta";
import { ProcessSection } from "@/components/design/process-section";
import { ProjectsSection } from "@/components/design/projects-section";
import { designGallery } from "@/content/design-gallery";
import { siteConfig } from "@/content/site-config";
import { routing, type Locale } from "@/i18n/routing";
import { localizedMetadata, siteOrigin } from "@/lib/seo";

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
    href: "/",
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
  const jsonLd = designJsonLd(t("title"));

  return (
    <main className="flex min-w-0 flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <HeroSection />
      <AudienceSection />
      <ProjectsSection instagramUrl={siteConfig.instagramUrl} />
      <ProcessSection />
      <HomeCta />
    </main>
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
