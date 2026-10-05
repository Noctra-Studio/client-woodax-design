import { getTranslations } from "next-intl/server";
import { RegistrationMarks } from "@/components/cnc/registration-marks";
import { Reveal } from "@/components/design/reveal";

const panels = [
  { label: "rentLabel", title: "rentTitle", body: "rentBody" },
  { label: "volumeLabel", title: "volumeTitle", body: "volumeBody" },
] as const;

export async function WaysSection() {
  const t = await getTranslations("cnc.ways");

  return (
    <Reveal>
      <section
        id="servicio"
        aria-labelledby="ways-title"
        className="relative scroll-mt-24 px-5 py-16 md:px-8 md:py-24 lg:py-32"
      >
        <RegistrationMarks />
        <div className="relative mx-auto w-full max-w-[1200px]">
          <h2
            id="ways-title"
            className="max-w-[16ch] text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.02em] text-balance"
          >
            {t("title")}
          </h2>
          <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2 md:gap-5">
            {panels.map((panel) => (
              <article
                key={panel.label}
                className="border-cnc-line bg-cnc-surface rounded-[var(--radius-card)] border p-6 md:p-8"
              >
                <p className="text-cnc-muted font-mono text-sm tracking-[0.08em] uppercase tabular-nums">
                  {t(panel.label)}
                </p>
                <h3 className="mt-4 text-[clamp(1.25rem,2vw,1.5rem)] font-medium text-balance">
                  {t(panel.title)}
                </h3>
                <p className="mt-3 max-w-[62ch] text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.6] font-medium text-pretty">
                  {t(panel.body)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}
