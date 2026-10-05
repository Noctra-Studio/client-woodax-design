import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export async function HomeCta() {
  const t = await getTranslations("design.homeCta");
  const hero = await getTranslations("design.hero");

  return (
    <section
      aria-labelledby="home-cta-title"
      className="scroll-mt-24 px-5 py-16 md:px-8 md:py-24"
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-5">
        <h2
          id="home-cta-title"
          className="max-w-[16ch] font-serif text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.01em] text-balance"
        >
          {t("title")}
        </h2>
        <p className="max-w-[62ch] text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.65] font-medium text-pretty">
          {t("body")}
        </p>
        <Button href="/contact" variant="design-primary" arrow>
          {hero("ctaPrimary")}
        </Button>
      </div>
    </section>
  );
}
