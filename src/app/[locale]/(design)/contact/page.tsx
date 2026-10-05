import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LeadCapture } from "@/features/leads/components/lead-capture";
import { getLeadCopy } from "@/features/leads/copy";
import { publishedSocialUrl, siteConfig } from "@/content/site-config";
import { routing, type Locale } from "@/i18n/routing";
import { clientEnv } from "@/lib/env";
import { localizedMetadata } from "@/lib/seo";

const contactEmail = "hello@woodax.design";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
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
  const { locale } = await params;

  if (hasLocale(routing.locales, locale)) {
    setRequestLocale(locale);
  }

  const t = await getTranslations("design.contact");
  const footer = await getTranslations("design.footer");
  const nav = await getTranslations("nav");
  const copy = await getLeadCopy("design");
  const whatsappNumber = clientEnv.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : null;

  return (
    <main className="flex flex-1 flex-col">
      <section
        aria-labelledby="contact-title"
        className="px-5 pt-28 pb-4 md:px-8 md:pt-32"
      >
        <div className="mx-auto w-full max-w-[1200px]">
          <h1
            id="contact-title"
            className="max-w-[16ch] font-serif text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[1.05] font-normal tracking-[-0.01em] text-balance"
          >
            {t("title")}
          </h1>
          <p className="mt-5 max-w-[62ch] text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.65] font-medium text-pretty">
            {t("intro")}
          </p>
        </div>
      </section>
      <LeadCapture copy={copy} />
      <section
        aria-labelledby="contact-channels-title"
        className="px-5 py-16 md:px-8 md:py-24"
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
            {whatsappHref ? (
              <li>
                <a
                  href={whatsappHref}
                  className="focus-visible:outline-woodax-charcoal inline-flex min-h-11 items-center underline decoration-current/40 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {t("channels.whatsapp")}
                </a>
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
