import { hasLocale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { AnalyticsButton } from "@/components/analytics/tracked-link";
import { MediaSlot } from "@/components/design/media-slot";
import { Reveal } from "@/components/design/reveal";
import {
  featuredProjectSlots,
  type DesignMediaSlot,
} from "@/content/design-media";
import { routing } from "@/i18n/routing";

export async function ProjectsSection({
  instagramUrl,
}: {
  instagramUrl?: string;
}) {
  const projects = featuredProjectSlots();
  if (projects.length === 0) return null;

  const t = await getTranslations("design.projects");
  const requested = await getLocale();
  const locale = hasLocale(routing.locales, requested) ? requested : "es";
  const [lead, ...rest] = projects;
  const beside = rest.slice(0, 2);
  const below = rest.slice(2);

  return (
    <Reveal>
      <section
        id="proyectos"
        aria-labelledby="projects-title"
        className="scroll-mt-24 px-5 py-16 md:px-8 md:py-24 lg:py-40"
      >
        <div className="mx-auto w-full max-w-[1200px]">
          <h2
            id="projects-title"
            className="font-serif text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.01em] text-balance"
          >
            {t("title")}
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 md:mt-14 md:grid-cols-12 md:gap-5">
            {lead ? (
              <div className="md:col-span-7">
                <ProjectCard
                  item={lead}
                  label={lead.tag ? t(`tags.${lead.tag}`) : null}
                  sizes="(min-width: 768px) 42rem, 100vw"
                />
              </div>
            ) : null}
            {beside.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:col-span-5 md:gap-5">
                {beside.map((item) => (
                  <ProjectCard
                    key={item.id}
                    item={item}
                    label={item.tag ? t(`tags.${item.tag}`) : null}
                    sizes="(min-width: 768px) 28rem, 100vw"
                  />
                ))}
              </div>
            ) : null}
            {below.length > 0 ? (
              <ul className="grid grid-cols-1 gap-4 md:col-span-12 md:grid-cols-3 md:gap-5">
                {below.map((item) => (
                  <li key={item.id}>
                    <ProjectCard
                      item={item}
                      label={item.tag ? t(`tags.${item.tag}`) : null}
                      sizes="(min-width: 768px) 24rem, 100vw"
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {instagramUrl ? (
            <div className="mt-8 md:mt-10">
              <AnalyticsButton
                href={instagramUrl}
                variant="design-secondary"
                arrow
                tracking={{
                  event: "social_click",
                  params: {
                    site: "design",
                    locale,
                    platform: "instagram",
                    location: "projects",
                  },
                }}
              >
                {t("instagramCta")}
              </AnalyticsButton>
            </div>
          ) : null}
        </div>
      </section>
    </Reveal>
  );
}

function ProjectCard({
  item,
  label,
  sizes,
}: {
  item: DesignMediaSlot;
  label: string | null;
  sizes: string;
}) {
  return (
    <article className="relative">
      <MediaSlot id={item.id} sizes={sizes} />
      {label ? (
        <p className="border-woodax-charcoal/15 bg-woodax-cream text-woodax-charcoal absolute top-4 left-4 z-10 rounded-sm border px-3 py-1 text-[13px] font-semibold tracking-[0.18em] uppercase">
          {label}
        </p>
      ) : null}
    </article>
  );
}
