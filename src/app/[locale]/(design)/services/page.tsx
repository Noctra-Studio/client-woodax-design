import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnalyticsAnchor } from "@/components/analytics/tracked-link";
import { MediaSlot } from "@/components/design/media-slot";
import { ProcessSection } from "@/components/design/process-section";
import { Button } from "@/components/ui/button";
import { hasMedia, type DesignMediaId } from "@/content/design-media";
import { designPages } from "@/content/design-pages";
import { routing, type Locale } from "@/i18n/routing";
import { requestCncHomeUrl } from "@/lib/request-site";
import { localizedMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

const serviceKeys = ["kitchens", "closets", "custom", "commercial"] as const;

const serviceMedia = {
  kitchens: "services-kitchens",
  closets: "services-closets",
  custom: "services-custom",
  commercial: "services-commercial",
} as const satisfies Record<(typeof serviceKeys)[number], DesignMediaId>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  if (!designPages.services.enabled) return {};

  const { locale: requested } = await params;
  const locale: Locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const t = await getTranslations({
    locale,
    namespace: "design.services.meta",
  });

  return localizedMetadata({
    site: "design",
    locale,
    title: t("title"),
    description: t("description"),
    href: "/services",
  });
}

export default async function ServicesPage({
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

  if (!designPages.services.enabled) notFound();

  const t = await getTranslations("design.services");
  const footer = await getTranslations("design.footer");
  const cncUrl = await requestCncHomeUrl(locale);

  return (
    <main className="flex flex-1 flex-col">
      <section
        aria-labelledby="services-title"
        className="bg-woodax-bg px-5 pt-28 pb-[var(--home-section-y)] md:px-8 md:pt-32"
      >
        <div className="mx-auto w-full max-w-[1200px]">
          <h1
            id="services-title"
            className="max-w-[16ch] font-serif text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[1.05] font-light tracking-[-0.01em] text-balance"
          >
            {t("title")}
          </h1>
          <p className="mt-5 max-w-[62ch] text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.65] font-medium text-pretty">
            {t("intro")}
          </p>
        </div>
      </section>
      <section
        aria-labelledby="services-title"
        className="home-section bg-woodax-sand px-5 md:px-8"
      >
        <div className="mx-auto w-full max-w-[1200px]">
          <ol className="grid gap-12 md:gap-20">
            {serviceKeys.map((key, index) => {
              const [title, body] = t(key).split(" — ");
              const mediaId = serviceMedia[key];
              const showMedia = hasMedia(mediaId);
              return (
                <li
                  key={key}
                  id={key}
                  className={cn(
                    "scroll-mt-28",
                    "grid items-start gap-8",
                    showMedia &&
                      "md:grid-cols-[minmax(0,1fr)_minmax(16rem,24rem)] md:gap-12",
                  )}
                >
                  <div className="grid max-w-[62ch] gap-3 md:grid-cols-[4.5rem_1fr] md:gap-8">
                    <p className="text-woodax-charcoal/80 font-serif text-[clamp(1.25rem,2vw,1.5rem)] leading-none font-normal tracking-[-0.01em] tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <div>
                      <h2 className="font-serif text-[clamp(1.25rem,2vw,1.5rem)] font-normal tracking-[-0.01em] text-balance">
                        {title}
                      </h2>
                      {body ? (
                        <p className="mt-3 text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.65] font-medium text-pretty">
                          {body}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {showMedia ? (
                    <MediaSlot
                      id={mediaId}
                      sizes="(min-width: 768px) 24rem, 100vw"
                      surface="sand"
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </section>
      <ProcessSection />
      <section className="home-section bg-woodax-bg px-5 md:px-8">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-6">
          <AnalyticsAnchor
            href={cncUrl}
            tracking={{
              event: "sister_site_click",
              params: {
                site: "design",
                locale,
                from: "design",
                to: "cnc",
                location: "services",
              },
            }}
            className="focus-visible:outline-woodax-charcoal inline-flex min-h-11 max-w-[62ch] items-center underline decoration-current/40 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 pointer-fine:hover:decoration-current"
          >
            {footer("cncLink")}
          </AnalyticsAnchor>
          <Button href="/contact" variant="design-primary" arrow>
            {t("cta")}
          </Button>
        </div>
      </section>
    </main>
  );
}
