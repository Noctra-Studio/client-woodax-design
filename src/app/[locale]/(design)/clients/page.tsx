import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MediaSlot } from "@/components/design/media-slot";
import {
  designClients,
  visibleDesignClients,
} from "@/content/design-clients";
import { visibleSlots } from "@/content/design-media";
import { designPages } from "@/content/design-pages";
import { routing, type Locale } from "@/i18n/routing";
import { localizedMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  if (!designPages.clients.enabled) return {};

  const { locale: requested } = await params;
  const locale: Locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "design.clients" });

  return localizedMetadata({
    site: "design",
    locale,
    title: t("meta.title"),
    description: t("meta.description"),
    href: "/clients",
  });
}

export default async function ClientsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: requested } = await params;

  if (hasLocale(routing.locales, requested)) {
    setRequestLocale(requested);
  }

  if (!designPages.clients.enabled) notFound();

  const t = await getTranslations("design.clients");
  const clients = visibleDesignClients(designClients);
  const logos = visibleSlots("clients-logo-");

  return (
    <main className="flex flex-1 flex-col">
      <section
        aria-labelledby="clients-title"
        className="px-5 pt-28 pb-16 md:px-8 md:pt-32 md:pb-24"
      >
        <div className="mx-auto w-full max-w-[1200px]">
          <h1
            id="clients-title"
            className="max-w-[16ch] font-serif text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[1.05] font-light tracking-[-0.01em] text-balance"
          >
            {t("title")}
          </h1>
          <p className="mt-5 max-w-[62ch] text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.65] font-medium text-pretty">
            {t("intro")}
          </p>
          {clients.length > 0 ? (
            <ul className="mt-16 grid gap-10 md:mt-20">
              {clients.map((client) => (
                <li key={client.name}>
                  <h2 className="font-serif text-[clamp(1.25rem,2vw,1.5rem)] font-normal tracking-[-0.01em] text-balance">
                    {client.name}
                  </h2>
                </li>
              ))}
            </ul>
          ) : null}
          {logos.length > 0 ? (
            <ul className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-3">
              {logos.map((slot) => (
                <li key={slot.id}>
                  <MediaSlot
                    id={slot.id}
                    sizes="(min-width: 768px) 30vw, 45vw"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </main>
  );
}
