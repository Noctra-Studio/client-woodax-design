import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { requestSite } from "@/lib/request-site";
import { localizedMetadata } from "@/lib/seo";

const contactEmail = "hello@woodax.design";

export async function generatePrivacyMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: requested } = await params;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const site = await requestSite();
  const t = await getTranslations({ locale, namespace: "privacy" });
  return localizedMetadata({
    site,
    locale,
    title: t("title"),
    description: t("intro"),
    href: "/privacy",
  });
}

export async function PrivacyNotice({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const site = await requestSite();
  const isDesign = site === "design";
  const t = await getTranslations("privacy");
  const common = await getTranslations("common");
  const [beforeEmail, afterEmail] = t("contact").split(contactEmail);

  return (
    <main className="mx-auto flex w-full max-w-[62ch] flex-1 flex-col gap-6 px-5 py-16 md:py-28">
      <h1
        className={cn(
          "text-[clamp(1.875rem,4vw,3rem)] leading-[1.05] font-normal",
          isDesign ? "font-serif tracking-[-0.01em]" : "tracking-[-0.02em]",
        )}
      >
        {t("title")}
      </h1>
      <div className="flex flex-col gap-4 text-[17px] leading-relaxed font-medium">
        <p>{t("intro")}</p>
        <p>{t("purpose")}</p>
        <p>{t("sale")}</p>
        <p>
          {beforeEmail}
          <a
            href={`mailto:${contactEmail}`}
            className="underline decoration-current/40 underline-offset-4"
          >
            {contactEmail}
          </a>
          {afterEmail}
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex min-h-11 items-center underline underline-offset-4"
      >
        {common("backHome")}
      </Link>
    </main>
  );
}
