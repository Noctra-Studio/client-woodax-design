import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProcessSection } from "@/components/design/process-section";
import { Button } from "@/components/ui/button";
import { routing, type Locale } from "@/i18n/routing";
import { clientEnv } from "@/lib/env";
import { localizedMetadata } from "@/lib/seo";

const serviceKeys = ["kitchens", "closets", "custom", "commercial"] as const;

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
  const { locale } = await params;

  if (hasLocale(routing.locales, locale)) {
    setRequestLocale(locale);
  }

  const t = await getTranslations("design.services");
  const footer = await getTranslations("design.footer");

  return (
    <main className="flex flex-1 flex-col">
      <section
        aria-labelledby="services-title"
        className="px-5 pt-28 pb-16 md:px-8 md:pt-32 md:pb-24"
      >
        <div className="mx-auto w-full max-w-[1200px]">
          <h1
            id="services-title"
            className="max-w-[16ch] font-serif text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[1.05] font-normal tracking-[-0.01em] text-balance"
          >
            {t("title")}
          </h1>
          <p className="mt-5 max-w-[62ch] text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.65] font-medium text-pretty">
            {t("intro")}
          </p>
          <ol className="mt-16 grid gap-12 md:mt-20">
            {serviceKeys.map((key, index) => {
              const [title, body] = t(key).split(" — ");
              return (
                <li
                  key={key}
                  className="grid max-w-[62ch] gap-3 md:grid-cols-[4.5rem_1fr] md:gap-8"
                >
                  <p className="text-woodax-charcoal/75 font-serif text-[clamp(1.25rem,2vw,1.5rem)] leading-none font-normal tracking-[-0.01em] tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <div>
                    <h2 className="font-serif text-[clamp(1.25rem,2vw,1.5rem)] font-bold text-balance">
                      {title}
                    </h2>
                    {body ? (
                      <p className="mt-3 text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.65] font-medium text-pretty">
                        {body}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
      <ProcessSection />
      <section className="px-5 pb-16 md:px-8 md:pb-24">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-6">
          <a
            href={clientEnv.NEXT_PUBLIC_CNC_URL}
            className="focus-visible:outline-woodax-charcoal inline-flex min-h-11 max-w-[62ch] items-center underline decoration-current/40 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 pointer-fine:hover:decoration-current"
          >
            {footer("cncLink")}
          </a>
          <Button href="/contact" variant="design-primary" arrow>
            {t("cta")}
          </Button>
        </div>
      </section>
    </main>
  );
}
