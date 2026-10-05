import Image from "next/image";
import { hasLocale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { RegistrationMarks } from "@/components/cnc/registration-marks";
import { Reveal } from "@/components/design/reveal";
import { cncGallery } from "@/content/cnc-gallery";
import { routing } from "@/i18n/routing";

export async function WorkSection() {
  if (cncGallery.length === 0) return null;

  const t = await getTranslations("cnc.work");
  const requested = await getLocale();
  const locale = hasLocale(routing.locales, requested) ? requested : "es";

  return (
    <Reveal>
      <section
        id="trabajos"
        aria-labelledby="cnc-work-title"
        className="relative scroll-mt-24 px-5 py-16 md:px-8 md:py-24 lg:py-32"
      >
        <RegistrationMarks />
        <div className="relative mx-auto w-full max-w-[1200px]">
          <h2
            id="cnc-work-title"
            className="max-w-[16ch] text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.02em] text-balance"
          >
            {t("title")}
          </h2>
          <ul className="mt-10 flex flex-col gap-5 md:mt-14">
            {cncGallery.map((item) => (
              <li
                key={item.src}
                className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)]"
              >
                <Image
                  src={item.src}
                  alt={item.alt[locale]}
                  fill
                  sizes="(min-width: 768px) 1200px, 100vw"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Reveal>
  );
}
