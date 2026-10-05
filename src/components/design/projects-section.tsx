import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/design/reveal";
import { designGallery, type DesignGalleryTag } from "@/content/design-gallery";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const mosaic = [
  "md:col-span-7 md:row-span-2 md:min-h-[36rem]",
  "md:col-span-5 md:min-h-[17rem]",
  "md:col-span-5 md:min-h-[17rem]",
  "md:col-span-4 md:min-h-[20rem]",
  "md:col-span-8 md:min-h-[20rem]",
  "md:col-span-7 md:min-h-[22rem]",
];

export async function ProjectsSection({
  instagramUrl,
}: {
  instagramUrl?: string;
}) {
  if (designGallery.length === 0) return null;

  const t = await getTranslations("design.projects");
  const requested = await getLocale();
  const locale = hasLocale(routing.locales, requested) ? requested : "es";

  return (
    <Reveal>
      <section
        id="proyectos"
        aria-labelledby="projects-title"
        className="scroll-mt-24 py-16 md:py-24 lg:py-40"
      >
        <div className="mx-auto w-full max-w-[1200px]">
          <h2
            id="projects-title"
            className="px-5 text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.02em] text-balance md:px-8"
          >
            {t("title")}
          </h2>
          {designGallery.length > 0 ? (
            <ul className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-5 pb-2 md:grid md:grid-cols-12 md:gap-5 md:overflow-visible md:px-8 md:pb-0">
              {designGallery.map((item, index) => (
                <li
                  key={item.src}
                  className={cn(
                    "relative aspect-[4/5] w-[82vw] max-w-[28rem] shrink-0 snap-start overflow-hidden rounded-[var(--radius-media)] md:aspect-auto md:w-auto md:max-w-none",
                    mosaic[index] ?? "md:col-span-6 md:min-h-[18rem]",
                  )}
                >
                  <Image
                    src={item.src}
                    alt={item.alt[locale]}
                    fill
                    sizes="(min-width: 768px) 40vw, 82vw"
                    className="object-cover"
                  />
                  <p className="bg-woodax-cream text-woodax-charcoal absolute bottom-4 left-4 rounded-full px-3 py-1 text-[12px] font-medium tracking-[0.18em] uppercase">
                    {t(`tags.${item.tag as DesignGalleryTag}`)}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
          {instagramUrl ? (
            <div className="mt-8 px-5 md:px-8">
              <Button href={instagramUrl} variant="design-secondary" arrow>
                {t("instagramCta")}
              </Button>
            </div>
          ) : null}
        </div>
      </section>
    </Reveal>
  );
}
