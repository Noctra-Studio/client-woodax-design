import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

export default async function CncPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (hasLocale(routing.locales, locale)) {
    setRequestLocale(locale);
  }

  const t = await getTranslations("cnc");
  const common = await getTranslations("common");

  return (
    <main className="flex flex-1 flex-col">
      <p>{common("language")}</p>
      <h1>{t("headline")}</h1>
    </main>
  );
}
