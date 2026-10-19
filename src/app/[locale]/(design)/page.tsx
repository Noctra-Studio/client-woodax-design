import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AudienceSection } from "@/components/design/audience-section";
import { HeroSection } from "@/components/design/hero-section";
import { HomeCta } from "@/components/design/home-cta";
import { ProcessSection } from "@/components/design/process-section";
import { ProjectsSection } from "@/components/design/projects-section";
import {
  publishedSocialUrl,
  siteConfig,
} from "@/content/site-config";
import { LeadCapture } from "@/features/leads/components/lead-capture";
import { getLeadCopy } from "@/features/leads/copy";
import { routing, type Locale } from "@/i18n/routing";
import { isDesignFull, localizedMetadata } from "@/lib/seo";
import { designJsonLd } from "@/lib/structured-data";

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
  return localizedMetadata({
    site: "design",
    locale,
    title: t("title"),
    description: t("description"),
    href: "/",
  });
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
  const jsonLd = designJsonLd({
    name: t("title"),
    description: t("meta.description"),
    knowsAbout: [
      t("form.options.kitchen"),
      t("form.options.closet"),
      t("form.options.custom-piece"),
      t("form.options.commercial-space"),
    ],
  });
  const full = isDesignFull();
  const copy = full ? null : await getLeadCopy("design");

  return (
    <main className="flex min-w-0 flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <HeroSection />
      <AudienceSection />
      <ProjectsSection
        instagramUrl={publishedSocialUrl(siteConfig.instagramUrl)}
      />
      <ProcessSection />
      {copy ? <LeadCapture copy={copy} /> : <HomeCta />}
    </main>
  );
}
