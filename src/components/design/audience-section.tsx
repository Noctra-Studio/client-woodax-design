import { Briefcase, House } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ArcMotif } from "@/components/design/arc-motif";
import { Reveal } from "@/components/design/reveal";

export async function AudienceSection() {
  const t = await getTranslations("design.audience");

  return (
    <Reveal>
      <section
        aria-labelledby="audience-title"
        className="bg-woodax-green text-woodax-charcoal relative scroll-mt-24 overflow-hidden py-16 md:py-24 lg:py-40"
      >
        <ArcMotif className="absolute -right-16 -bottom-20 h-72 w-72 md:h-96 md:w-96" />
        <div className="relative mx-auto w-full max-w-[1200px] px-5 md:px-8">
          <h2
            id="audience-title"
            className="max-w-[16ch] text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.02em] text-balance"
          >
            {t("title")}
          </h2>
          <div className="mt-12 grid gap-12 md:mt-16 md:grid-cols-2 md:gap-16">
            <article className="max-w-[62ch]">
              <House aria-hidden="true" strokeWidth={1.5} className="size-7" />
              <h3 className="mt-4 text-[clamp(1.25rem,2vw,1.5rem)] font-medium text-balance">
                {t("homeTitle")}
              </h3>
              <p className="mt-3 text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.6] font-light text-pretty">
                {t("homeBody")}
              </p>
            </article>
            <article className="max-w-[62ch]">
              <Briefcase
                aria-hidden="true"
                strokeWidth={1.5}
                className="size-7"
              />
              <h3 className="mt-4 text-[clamp(1.25rem,2vw,1.5rem)] font-medium text-balance">
                {t("businessTitle")}
              </h3>
              <p className="mt-3 text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.6] font-light text-pretty">
                {t("businessBody")}
              </p>
            </article>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
