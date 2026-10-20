import { hasLocale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { AnalyticsAnchor } from "@/components/analytics/tracked-link";
import { FooterPrivacyLink } from "@/components/site/footer-privacy-link";
import { CncLogo } from "@/components/brand/cnc-logo";
import { WoodaxLogo } from "@/components/brand/woodax-logo";
import { FacebookIcon, InstagramIcon } from "@/components/icons/brand-social";
import { FooterClearance } from "@/components/site/footer-clearance";
import { LocaleSlot } from "@/components/site/locale-switch";
import {
  designNavKeys,
  designPages,
  designSectionAnchors,
} from "@/content/design-pages";
import {
  cncSectionAnchors,
  siteConfig,
  siteEmail,
} from "@/content/site-config";
import { Link } from "@/i18n/navigation";
import { routing, type Locale, type Pathname } from "@/i18n/routing";
import { requestCncHomeUrl, requestDesignHomeUrl } from "@/lib/request-site";
import { isDesignFull } from "@/lib/seo";
import { cn } from "@/lib/utils";

const NOCTRA_URL = "https://noctra.studio";

export async function SiteFooter({ variant }: { variant: "design" | "cnc" }) {
  const requested = await getLocale();
  const locale: Locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const isDesign = variant === "design";
  const t = await getTranslations(isDesign ? "design.footer" : "cnc.footer");
  const locationLabel = isDesign
    ? (await getTranslations("design.footer"))("location")
    : siteConfig.cncOffer.location.label[locale];
  const shared = await getTranslations("siteFooter");
  const nav = await getTranslations("nav");
  const year = new Date().getFullYear();
  const siblingHref = isDesign
    ? await requestCncHomeUrl(locale)
    : await requestDesignHomeUrl(locale);
  const focus = isDesign
    ? "focus-visible:outline-woodax-charcoal"
    : "focus-visible:outline-cnc-white";
  const linkClass = cn(
    "inline-flex min-h-11 items-center underline decoration-current/40 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 pointer-fine:hover:decoration-current",
    focus,
  );
  const noctraSrc = isDesign
    ? "/images/design/noctra-light.svg"
    : "/images/design/noctra-dark.svg";
  const email = siteEmail(variant);

  return (
    <FooterClearance variant={variant}>
      <footer
        className={cn(
          "px-5 pt-16 pb-8 md:px-8 md:pt-24",
          isDesign
            ? "border-woodax-line bg-woodax-bg border-t"
            : "border-cnc-line border-t",
        )}
      >
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
              <div translate="no">
                {isDesign ? (
                  <WoodaxLogo className="h-14 w-auto" loading="lazy" />
                ) : (
                  <CncLogo className="h-8 w-auto" loading="lazy" />
                )}
              </div>
              <p
                className={cn(
                  "max-w-[36ch] text-pretty",
                  isDesign
                    ? "font-serif text-[clamp(1.25rem,1.6vw,1.5rem)] leading-snug font-normal tracking-[-0.01em]"
                    : "text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.6] font-medium",
                )}
              >
                {t("description")}
              </p>
            </div>

            <nav aria-label={shared("navAria")}>
              <ul className="flex flex-col items-center sm:items-start">
                {isDesign
                  ? isDesignFull()
                    ? designFooterLinks().map((link) => (
                        <li key={link.href}>
                          <Link href={link.href} className={linkClass}>
                            {nav(`design.${link.key}`)}
                          </Link>
                        </li>
                      ))
                    : designSectionAnchors().map((link) => (
                        <li key={link.id}>
                          <a href={`#${link.id}`} className={linkClass}>
                            {nav(`design.${link.labelKey}`)}
                          </a>
                        </li>
                      ))
                  : cncSectionAnchors().map((link) => (
                      <li key={link.id}>
                        <a href={`#${link.id}`} className={linkClass}>
                          {nav(`cnc.${link.labelKey}`)}
                        </a>
                      </li>
                    ))}
              </ul>
            </nav>

            <div className="flex flex-col items-center sm:items-start">
              <a href={`mailto:${email}`} className={linkClass}>
                {email}
              </a>
              <p className="inline-flex min-h-11 items-center text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.6] font-medium">
                {locationLabel}
              </p>
              {siteConfig.instagramUrl || siteConfig.facebookUrl ? (
                <ul className="flex items-center justify-center sm:justify-start">
                  {siteConfig.instagramUrl ? (
                    <li>
                      <AnalyticsAnchor
                        href={siteConfig.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={shared("instagramAria")}
                        tracking={{
                          event: "social_click",
                          params: {
                            site: variant,
                            locale,
                            platform: "instagram",
                            location: "footer",
                          },
                        }}
                        className={cn(
                          "inline-flex size-11 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                          focus,
                        )}
                      >
                        <InstagramIcon className="size-5" />
                      </AnalyticsAnchor>
                    </li>
                  ) : null}
                  {siteConfig.facebookUrl ? (
                    <li>
                      <AnalyticsAnchor
                        href={siteConfig.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={shared("facebookAria")}
                        tracking={{
                          event: "social_click",
                          params: {
                            site: variant,
                            locale,
                            platform: "facebook",
                            location: "footer",
                          },
                        }}
                        className={cn(
                          "inline-flex size-11 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                          focus,
                        )}
                      >
                        <FacebookIcon className="size-5" />
                      </AnalyticsAnchor>
                    </li>
                  ) : null}
                </ul>
              ) : null}
            </div>

            <div className="flex justify-center sm:justify-start">
              <AnalyticsAnchor
                href={siblingHref}
                tracking={{
                  event: "sister_site_click",
                  params: {
                    site: variant,
                    locale,
                    from: variant,
                    to: isDesign ? "cnc" : "design",
                    location: "footer",
                  },
                }}
                className={cn(
                  linkClass,
                  "max-w-[28ch] text-center sm:text-left",
                )}
              >
                {t("sibling")}
              </AnalyticsAnchor>
            </div>
          </div>

          <div
            className={cn(
              "flex flex-col items-center gap-1 border-t pt-6 text-center sm:items-start sm:text-left md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-6",
              isDesign ? "border-woodax-line" : "border-cnc-line",
            )}
          >
            <p className="text-sm font-medium">{t("copyright", { year })}</p>
            <FooterPrivacyLink className={cn(linkClass, "text-sm")}>
              {t("privacy")}
            </FooterPrivacyLink>
            <LocaleSlot variant={variant} label={nav("language")} size="bar" />
            <a
              href={NOCTRA_URL}
              rel="noopener"
              aria-label={shared("developedByAria")}
              className={cn(
                "group inline-flex min-h-11 items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                focus,
              )}
            >
              <span
                className={cn(
                  "text-xs font-medium",
                  isDesign ? "text-woodax-charcoal" : "text-cnc-muted",
                )}
              >
                {shared("developedBy")}
              </span>
              <Image
                src={noctraSrc}
                alt=""
                width={isDesign ? 126 : 123}
                height={32}
                className="h-8 w-auto opacity-75 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
              />
            </a>
          </div>
        </div>
      </footer>
    </FooterClearance>
  );
}

function designFooterLinks(): {
  key: "about" | "services" | "clients" | "contact";
  href: Pathname;
}[] {
  const keys = [
    ...designNavKeys.filter((key) => designPages[key].enabled),
    ...(designPages.contact.enabled ? (["contact"] as const) : []),
  ];

  return keys.map((key) => ({
    key,
    href: designPages[key].href,
  }));
}
