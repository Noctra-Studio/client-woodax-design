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
import { cn } from "@/lib/utils";

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
      <section
        id="proyectos"
        aria-labelledby="projects-title"
        className="home-section bg-woodax-sand scroll-mt-24 px-5 md:px-8"
      >
        <div className="mx-auto w-full max-w-[1200px]">
          <Reveal stagger>
            <h2
              id="projects-title"
              className="font-serif text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.01em] text-balance"
            >
              {t("title")}
            </h2>
          </Reveal>
          <Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 md:mt-14 md:grid-cols-12 md:gap-5">
            {lead ? (
              <div className="relative md:col-span-7 md:row-start-1 lg:flex lg:flex-col">
                <ProjectCard
                  item={lead}
                  label={lead.tag ? t(`tags.${lead.tag}`) : null}
                  sizes="(min-width: 1024px) 42rem, (min-width: 768px) 58vw, 100vw"
                  frameClassName="md:max-lg:absolute md:max-lg:inset-0 md:max-lg:h-full md:max-lg:aspect-auto"
                />
                <ProjectStatement
                  title={t("statement.title")}
                  body={t("statement.body")}
                  className="hidden lg:mt-auto lg:block lg:pt-10"
                />
              </div>
            ) : null}
            <ProjectStatement
              title={t("statement.title")}
              body={t("statement.body")}
              className="md:col-span-12 md:row-start-2 lg:hidden"
            />
            {beside.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:col-span-5 md:col-start-8 md:row-start-1 md:gap-5">
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
              <ul className="grid grid-cols-1 gap-4 md:col-span-12 md:row-start-3 md:grid-cols-3 md:gap-5 lg:row-start-2">
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
          </Reveal>
        </div>
      </section>
  );
}

function ProjectStatement({
  title,
  body,
  className,
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <Reveal className={className}>
      <p className="font-serif text-[clamp(2.5rem,4.2vw,3.5rem)] leading-[1.05] font-light tracking-[-0.01em] text-balance">
        {title}
      </p>
      <p className="mt-4 max-w-[32ch] text-[clamp(1.25rem,1.5vw,1.5rem)] leading-[1.55] text-pretty">
        {body}
      </p>
    </Reveal>
  );
}

function ProjectCard({
  item,
  label,
  sizes,
  frameClassName,
}: {
  item: DesignMediaSlot;
  label: string | null;
  sizes: string;
  frameClassName?: string;
}) {
  return (
    <article
      className={cn(
        "relative",
        frameClassName && "md:max-lg:absolute md:max-lg:inset-0",
      )}
    >
      <MediaSlot
        id={item.id}
        sizes={sizes}
        surface="sand"
        className={frameClassName}
      />
      {label ? (
        <p className="border-woodax-charcoal/15 bg-woodax-cream text-woodax-charcoal absolute top-4 left-4 z-10 rounded-sm border px-3 py-1 text-[13px] font-semibold tracking-[0.18em] uppercase">
          {label}
        </p>
      ) : null}
    </article>
  );
}
