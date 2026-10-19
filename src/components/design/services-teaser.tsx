import { hasLocale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { AnalyticsButton } from "@/components/analytics/tracked-link";
import { MediaSlot } from "@/components/design/media-slot";
import { hasMedia, type DesignMediaId } from "@/content/design-media";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const services = [
  { key: "kitchens", id: "services-kitchens", hash: "kitchens" },
  { key: "closets", id: "services-closets", hash: "closets" },
  { key: "custom", id: "services-custom", hash: "custom" },
  { key: "commercial", id: "services-commercial", hash: "commercial" },
] as const satisfies ReadonlyArray<{
  key: "kitchens" | "closets" | "custom" | "commercial";
  id: DesignMediaId;
  hash: string;
}>;

export async function ServicesTeaser() {
  const home = await getTranslations("design.home.servicesTeaser");
  const servicesCopy = await getTranslations("design.services");
  const requested = await getLocale();
  const locale = hasLocale(routing.locales, requested) ? requested : "es";

  return (
    <section aria-labelledby="services-teaser-title" className="px-5 md:px-8">
      <div className="mx-auto w-full max-w-[1200px] py-16 md:py-24 lg:py-40">
        <h2
          id="services-teaser-title"
          className="max-w-[16ch] font-serif text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.01em] text-balance"
        >
          {home("title")}
        </h2>
        <ul className="mt-12 grid gap-12 md:mt-16 md:grid-cols-2 md:gap-x-10 md:gap-y-16">
          {services.map((service, index) => {
            const [title, body] = servicesCopy(service.key).split(" — ");
            const showMedia = hasMedia(service.id);
            return (
              <li key={service.key}>
                <Link
                  href={{ pathname: "/services", hash: service.hash }}
                  className="focus-visible:outline-woodax-charcoal group block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  {showMedia ? (
                    <div className="mb-5 hidden md:block">
                      <MediaSlot
                        id={service.id}
                        sizes="(min-width: 768px) 36rem, 100vw"
                      />
                    </div>
                  ) : null}
                  <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-4 md:grid-cols-1">
                    <p className="text-woodax-charcoal/75 font-serif text-[clamp(1.25rem,2vw,1.5rem)] leading-none font-normal tracking-[-0.01em] tabular-nums md:hidden">
                      {`${String(index + 1).padStart(2, "0")}.`}
                    </p>
                    <div className="max-w-[62ch]">
                      <h3 className="font-serif text-[clamp(1.25rem,2vw,1.5rem)] font-normal tracking-[-0.01em] text-balance">
                        {title}
                      </h3>
                      {body ? (
                        <p className="mt-3 text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.65] font-medium text-pretty">
                          {body}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
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
