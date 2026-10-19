import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MediaSlot } from "@/components/design/media-slot";
import { designAbout } from "@/content/design-about";
import { hasMedia, visibleSlots } from "@/content/design-media";
import { designPages } from "@/content/design-pages";
import { routing, type Locale } from "@/i18n/routing";
import { localizedMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  if (!designPages.about.enabled) return {};

  const { locale: requested } = await params;
  const locale: Locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "design.about" });
  const story = designAbout.story?.[locale]?.trim();

  return localizedMetadata({
    site: "design",
    locale,
    title: t("meta.title"),
    description: story && story.length > 0 ? story : t("title"),
    href: "/about",
  });
}

export default async function AboutPage({
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

  if (!designPages.about.enabled) notFound();

  const t = await getTranslations("design.about");
  const story = designAbout.story?.[locale];
  const workshop = visibleSlots("about-workshop-");

  return (
    <main className="flex flex-1 flex-col">
      <section
        aria-labelledby="about-title"
        className="px-5 pt-28 pb-16 md:px-8 md:pt-32 md:pb-24"
      >
        <div className="mx-auto grid w-full max-w-[1200px] items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
          <div>
            <h1
              id="about-title"
              className="max-w-[16ch] font-serif text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[1.05] font-light tracking-[-0.01em] text-balance"
            >
              {t("title")}
            </h1>
            {story ? (
              <p className="mt-5 max-w-[62ch] text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.65] font-medium text-pretty">
                {story}
              </p>
            ) : null}
          </div>
          {hasMedia("about-portrait") ? (
            <MediaSlot
              id="about-portrait"
              sizes="(min-width: 1024px) 22rem, 80vw"
            />
          ) : null}
        </div>
      </section>
      {workshop.length > 0 ? (
        <div className="px-5 pb-16 md:px-8 md:pb-24">
          <ul className="mx-auto grid w-full max-w-[1200px] gap-5 sm:grid-cols-2">
            {workshop.map((slot) => (
              <li key={slot.id}>
                <MediaSlot
                  id={slot.id}
                  sizes="(min-width: 640px) 40vw, 100vw"
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </main>
  );
}
