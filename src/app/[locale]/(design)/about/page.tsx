import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MediaSlot } from "@/components/design/media-slot";
import { designAbout } from "@/content/design-about";
import {
  hasMedia,
  visibleSlots,
  type DesignMediaSlot,
} from "@/content/design-media";
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
  const lead = designAbout.story?.[locale]?.[0]?.trim();

  return localizedMetadata({
    site: "design",
    locale,
    title: t("meta.title"),
    description: lead && lead.length > 0 ? lead : t("title"),
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
  const story = designAbout.story?.[locale] ?? [];
  const audience = designAbout.audience[locale];
  const workshop = visibleSlots("about-workshop-");
  const showPortrait = hasMedia("about-portrait");

  return (
    <main className="flex flex-1 flex-col">
      <section
        aria-labelledby="about-title"
        className="bg-woodax-bg px-5 pt-28 pb-[var(--home-section-y)] md:px-8 md:pt-32"
      >
        <div className="mx-auto grid w-full max-w-[1200px] items-start gap-12 lg:grid-cols-[minmax(0,60ch)_minmax(16rem,22rem)] lg:justify-between lg:gap-16">
          <div className="max-w-[60ch]">
            <h1
              id="about-title"
              className="max-w-[16ch] font-serif text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[1.05] font-light tracking-[-0.01em] text-balance"
            >
              {t("title")}
            </h1>
            {story.map((paragraph, index) =>
              index === 0 ? (
                <p
                  key={paragraph}
                  className="mt-8 font-serif text-[clamp(1.375rem,2.2vw,1.75rem)] leading-[1.35] font-normal tracking-[-0.01em] text-pretty"
                >
                  {paragraph}
                </p>
              ) : (
                <p
                  key={paragraph}
                  className="mt-5 text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.65] font-medium text-pretty"
                >
                  {paragraph}
                </p>
              ),
            )}
          </div>
          {showPortrait ? (
            <MediaSlot
              id="about-portrait"
              sizes="(min-width: 1024px) 22rem, 80vw"
            />
          ) : null}
        </div>
      </section>
      <section
        aria-labelledby="about-audience"
        className="home-section bg-woodax-sand px-5 md:px-8"
      >
        <div className="mx-auto w-full max-w-[1200px]">
          <h2
            id="about-audience"
            className="font-serif text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.01em] text-balance"
          >
            {t("audience")}
          </h2>
          <ul className="mt-8 flex flex-wrap gap-3">
            {audience.map((label) => (
              <li
                key={label}
                className="border-woodax-charcoal/70 bg-woodax-bg rounded-sm border px-4 py-2 text-[0.9375rem] leading-snug font-medium"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <WorkshopGallery slots={workshop} />
    </main>
  );
}

function WorkshopGallery({ slots }: { slots: readonly DesignMediaSlot[] }) {
  const photos = slots.filter((slot) => slot.src !== null);
  const frames = photos.length >= 3 ? photos : slots;
  if (frames.length === 0) return null;

  const [lead, second, third, ...rest] = frames;
  const editorial =
    lead !== undefined &&
    second !== undefined &&
    third !== undefined &&
    rest.length === 0 &&
    lead.src !== null &&
    second.src !== null &&
    third.src !== null;

  if (!editorial) {
    return (
      <section className="home-section bg-woodax-bg px-5 md:px-8">
        <ul className="mx-auto grid w-full max-w-[1200px] gap-5 sm:grid-cols-2">
          {frames.map((slot) => (
            <li key={slot.id}>
              <MediaSlot id={slot.id} sizes="(min-width: 640px) 40vw, 100vw" />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="home-section bg-woodax-bg px-5 md:px-8">
      <ul className="mx-auto grid w-full max-w-[1200px] grid-cols-2 gap-4 md:gap-5">
        <li className="col-span-2">
          <MediaSlot id={lead.id} sizes="(min-width: 1200px) 1200px, 100vw" />
        </li>
        {[second, third].map((slot) => (
          <li key={slot.id}>
            <MediaSlot id={slot.id} sizes="(min-width: 1200px) 590px, 50vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}
