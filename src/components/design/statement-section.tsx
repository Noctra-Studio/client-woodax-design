import { getTranslations } from "next-intl/server";

export async function StatementSection() {
  const t = await getTranslations("design.statement");

  return (
    <section
      aria-labelledby="statement-title"
      className="home-section px-5 md:px-8"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <p className="flex items-center gap-2 text-[13px] font-semibold tracking-[0.18em] uppercase">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-current"
          />
          {t("label")}
        </p>
        <p
          id="statement-title"
          className="text-woodax-charcoal/55 mt-6 max-w-[24ch] font-serif text-[clamp(1.625rem,3.2vw,2.5rem)] leading-[1.2] font-normal tracking-[-0.01em] text-pretty"
        >
          {t.rich("body", {
            b: (chunks) => (
              <strong className="text-woodax-charcoal font-medium">
                {chunks}
              </strong>
            ),
          })}
        </p>
      </div>
    </section>
  );
}
