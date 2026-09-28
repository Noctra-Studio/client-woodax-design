import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
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

  return (
    <main data-site="design" className="flex flex-1 flex-col">
      <p>{common("language")}</p>
      <h1>{t("headline")}</h1>
    </main>
  );
}
