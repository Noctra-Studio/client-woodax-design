import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { LeadCapture } from "@/features/leads/components/lead-capture";
import { getLeadCopy } from "@/features/leads/copy";
import { routing } from "@/i18n/routing";

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
  const common = await getTranslations("common");
  const copy = await getLeadCopy("design");

  return (
    <main data-site="design" className="flex flex-1 flex-col pb-28 md:pb-0">
      <div className="flex min-h-[100svh] flex-col justify-end px-5 pb-16">
        <p>{common("language")}</p>
        <h1 className="max-w-[16ch] text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] font-normal tracking-[-0.02em]">
          {t("headline")}
        </h1>
      </div>
      <LeadCapture copy={copy} />
    </main>
  );
}
