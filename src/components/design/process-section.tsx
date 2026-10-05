import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/design/reveal";

const steps = ["step1", "step2", "step3"] as const;

export async function ProcessSection() {
  const t = await getTranslations("design.process");

  return (
    <Reveal>
      <section
        id="proceso"
        aria-labelledby="process-title"
        className="scroll-mt-24 px-5 py-16 md:px-8 md:py-24 lg:py-40"
      >
        <div className="mx-auto w-full max-w-[1200px]">
          <h2
            id="process-title"
            className="max-w-[16ch] font-serif text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.01em] text-balance"
          >
            {t("title")}
          </h2>
          <ol className="mt-12 grid gap-12 md:mt-16 md:grid-cols-3 md:gap-10">
            {steps.map((key, index) => {
              const [title, body] = t(key).split(" — ");
              return (
                <li key={key} className="max-w-[62ch]">
                  <p className="text-woodax-charcoal/75 font-serif text-[clamp(1.25rem,2vw,1.5rem)] leading-none font-normal tracking-[-0.01em] tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 font-serif text-[clamp(1.25rem,2vw,1.5rem)] font-bold text-balance">
                    {title}
                  </h3>
                  {body ? (
                    <p className="mt-3 text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.65] font-medium text-pretty">
                      {body}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </Reveal>
  );
}
