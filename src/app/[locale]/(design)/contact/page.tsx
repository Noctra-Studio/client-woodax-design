import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnalyticsAnchor } from "@/components/analytics/tracked-link";
import { MediaSlot } from "@/components/design/media-slot";
import { LeadCapture } from "@/features/leads/components/lead-capture";
import { getLeadCopy } from "@/features/leads/copy";
import { hasMedia } from "@/content/design-media";
import { designPages } from "@/content/design-pages";
import { publishedSocialUrl, siteConfig } from "@/content/site-config";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { absoluteUrl, localizedMetadata } from "@/lib/seo";
import { designContactJsonLd } from "@/lib/structured-data";
import { whatsappHref } from "@/lib/whatsapp";

const contactEmail = siteConfig.designEmail;

export const maxDuration = 15;
export const preferredRegion = "iad1";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  if (!designPages.contact.enabled) return {};

  const { locale: requested } = await params;
  const locale: Locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const t = await getTranslations({
    locale,
    namespace: "design.contact.meta",
  });

  return localizedMetadata({
    site: "design",
    locale,
    title: t("title"),
    description: t("description"),
    href: "/contact",
  });
}

export default async function ContactPage({
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

  if (!designPages.contact.enabled) notFound();

  const t = await getTranslations("design.contact");
  const nav = await getTranslations("nav");
  const footer = await getTranslations("design.footer");
  const copy = await getLeadCopy("design");
  const designWhatsappHref = whatsappHref("design", locale);
  const pageUrl = absoluteUrl(
    "design",
    getPathname({ href: "/contact", locale }),
  );
  const jsonLd = designContactJsonLd({
    name: t("meta.title"),
    description: t("meta.description"),
    url: pageUrl,
    breadcrumbs: [
      {
        name: nav("design.home"),
        url: absoluteUrl("design", getPathname({ href: "/", locale })),
      },
      { name: nav("design.contact"), url: pageUrl },
    ],
  });

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <section
        aria-labelledby="contact-title"
        className="bg-woodax-bg px-5 pt-28 pb-4 md:px-8 md:pt-32"
      >
        <div className="mx-auto grid w-full max-w-[1200px] items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
          <div>
            <h1
              id="contact-title"
              className="max-w-[16ch] font-serif text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[1.05] font-light tracking-[-0.01em] text-balance"
            >
              {t("title")}
            </h1>
            <p className="mt-5 max-w-[62ch] text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.65] font-medium text-pretty">
              {t("intro")}
            </p>
          </div>
          {hasMedia("contact-side") ? (
            <MediaSlot
              id="contact-side"
              sizes="(min-width: 1024px) 22rem, 100vw"
            />
          ) : null}
        </div>
      </section>
      <LeadCapture copy={copy} />
      <section
        aria-labelledby="contact-channels-title"
        className="home-section bg-woodax-sand px-5 md:px-8"
      >
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8">
          <h2
            id="contact-channels-title"
            className="font-serif text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.01em] text-balance"
          >
            {t("channels.title")}
          </h2>
          <ul className="flex flex-col gap-2">
            <li>
              <a
                href={`mailto:${contactEmail}`}
                className="focus-visible:outline-woodax-charcoal inline-flex min-h-11 items-center gap-3 underline decoration-current/40 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span>{t("channels.email")}</span>
                <span>{contactEmail}</span>
              </a>
            </li>
            {designWhatsappHref ? (
              <li>
                <AnalyticsAnchor
                  href={designWhatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("channels.whatsappAria")}
                  tracking={{
                    event: "whatsapp_click",
                    params: { site: "design", location: "contact" },
                  }}
                  className="focus-visible:outline-woodax-charcoal inline-flex min-h-11 items-center underline decoration-current/40 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {t("channels.whatsapp")}
                </AnalyticsAnchor>
              </li>
            ) : null}
          </ul>
          {publishedSocialUrl(siteConfig.instagramUrl) ||
          publishedSocialUrl(siteConfig.facebookUrl) ? (
            <div className="flex flex-col gap-2">
              <h3 className="text-[13px] font-semibold tracking-[0.18em] uppercase">
                {t("channels.social")}
              </h3>
              <ul className="flex flex-col">
                {publishedSocialUrl(siteConfig.instagramUrl) ? (
                  <li>
                    <a
                      href={publishedSocialUrl(siteConfig.instagramUrl)}
                      className="focus-visible:outline-woodax-charcoal inline-flex min-h-11 items-center underline decoration-current/40 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {nav("instagram")}
                    </a>
                  </li>
                ) : null}
                {publishedSocialUrl(siteConfig.facebookUrl) ? (
                  <li>
                    <a
                      href={publishedSocialUrl(siteConfig.facebookUrl)}
                      className="focus-visible:outline-woodax-charcoal inline-flex min-h-11 items-center underline decoration-current/40 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {nav("facebook")}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
          <p className="text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.65] font-medium">
            {footer("location")}
          </p>
        </div>
      </section>
    </main>
  );
}
