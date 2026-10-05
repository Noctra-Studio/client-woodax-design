import { Factory, Hammer, Signpost } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { RegistrationMarks } from "@/components/cnc/registration-marks";
import { Reveal } from "@/components/design/reveal";

const blocks = [
  { key: "workshops", icon: Hammer },
  { key: "companies", icon: Factory },
  { key: "signs", icon: Signpost },
] as const;

export async function AudienceSection() {
  const t = await getTranslations("cnc.audience");

  return (
    <Reveal>
      <section
        aria-labelledby="cnc-audience-title"
        className="relative scroll-mt-24 px-5 py-16 md:px-8 md:py-24 lg:py-32"
      >
        <RegistrationMarks />
        <div className="relative mx-auto w-full max-w-[1200px]">
          <h2
            id="cnc-audience-title"
            className="max-w-[16ch] text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.02em] text-balance"
          >
            {t("title")}
          </h2>
          <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-3 md:gap-8">
            {blocks.map((block) => {
              const [title, body] = t(block.key).split(" — ");
              const Icon = block.icon;
              return (
                <article key={block.key} className="max-w-[62ch]">
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="size-7"
                  />
                  <h3 className="mt-4 text-[clamp(1.25rem,2vw,1.5rem)] font-medium text-balance">
                    {title}
                  </h3>
                  {body ? (
                    <p className="mt-3 text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.6] font-medium text-pretty">
                      {body}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </Reveal>
  );
}
