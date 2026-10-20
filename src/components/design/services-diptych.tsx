import { ArrowRight } from "lucide-react";
import { hasLocale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { AnalyticsButton } from "@/components/analytics/tracked-link";
import { ArcMotif } from "@/components/design/arc-motif";
import { MediaSlot } from "@/components/design/media-slot";
import { Reveal } from "@/components/design/reveal";
import type { DesignMediaId } from "@/content/design-media";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type ServiceKey = "kitchens" | "closets" | "custom" | "commercial";

const panels = [
  {
    mediaId: "home-audience-home",
    title: "homeTitle",
    body: "homeBody",
    services: ["kitchens", "closets", "custom"],
    offset: false,
  },
  {
    mediaId: "home-audience-business",
    title: "businessTitle",
    body: "businessBody",
    services: ["commercial"],
    offset: true,
  },
] as const satisfies ReadonlyArray<{
  mediaId: DesignMediaId;
  title: "homeTitle" | "businessTitle";
  body: "homeBody" | "businessBody";
  services: readonly ServiceKey[];
  offset: boolean;
}>;

export async function ServicesDiptych() {
  const home = await getTranslations("design.home.servicesTeaser");
  const audience = await getTranslations("design.audience");
  const servicesCopy = await getTranslations("design.services");
  const requested = await getLocale();
  const locale = hasLocale(routing.locales, requested) ? requested : "es";

  return (
    <section
      aria-labelledby="services-teaser-title"
      className="home-section scroll-mt-24 px-5 md:px-8"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <Reveal>
          <h2
            id="services-teaser-title"
            className="font-serif text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.01em] text-balance"
          >
            {home("title")}
          </h2>
        </Reveal>
        <Reveal
          stagger
          className="design-diptych-stagger mt-12 grid items-start gap-y-16 md:mt-16 md:grid-cols-2 md:gap-x-12 lg:gap-x-16"
        >
          {panels.map((panel) => (
            <article
              key={panel.mediaId}
              className={cn("relative", panel.offset && "lg:mt-16")}
            >
              {panel.offset ? (
                <ArcMotif
                  strokeWidth={7}
                  className="text-woodax-green absolute -top-16 left-0 z-0 h-72 w-72 opacity-[0.22] md:-top-28 md:-left-16 md:h-[32rem] md:w-[32rem]"
                />
              ) : null}
              <div className="relative z-10">
                <MediaSlot
                  id={panel.mediaId}
                  radius="card"
                  sizes="(min-width: 1024px) 34rem, (min-width: 768px) 46vw, 100vw"
                />
                <h3 className="mt-6 font-serif text-[clamp(1.25rem,2vw,1.5rem)] leading-[1.2] font-normal tracking-[-0.01em] text-balance">
                  {audience(panel.title)}
                </h3>
                <p className="mt-3 max-w-[38ch] text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.65] font-medium text-pretty">
                  {audience(panel.body)}
                </p>
                <ul className="mt-8">
                  {panel.services.map((service) => {
                    const [title] = servicesCopy(service).split(" — ");
                    return (
                      <li key={service}>
                        <Link
                          href={{ pathname: "/services", hash: service }}
                          className="group border-woodax-line focus-visible:outline-woodax-charcoal pointer-fine:hover:border-woodax-green flex min-h-11 items-center justify-between gap-4 border-t py-2 transition-colors duration-(--duration-press) ease-[var(--ease-out)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 active:opacity-70 motion-reduce:transition-none"
                        >
                          <span className="text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-snug font-medium">
                            {title}
                          </span>
                          <ArrowRight
                            aria-hidden
                            strokeWidth={1.5}
                            className="pointer-fine:group-hover:text-woodax-green size-4 shrink-0 transition-[transform,color] duration-(--duration-press) ease-[var(--ease-out)] motion-reduce:transition-none pointer-fine:group-hover:translate-x-1"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </article>
          ))}
        </Reveal>
        <div className="mt-12 md:mt-16">
          <AnalyticsButton
            href="/services"
            variant="design-secondary"
            arrow
            tracking={{
              event: "cta_click",
              params: { site: "design", locale, location: "home" },
            }}
          >
            {home("cta")}
          </AnalyticsButton>
        </div>
      </div>
    </section>
  );
}
