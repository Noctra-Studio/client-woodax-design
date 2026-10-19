import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/design/reveal";
import { siteConfig } from "@/content/site-config";

const panels = [
  {
    label: "workshopLabel",
    title: "workshopTitle",
    body: "workshopBody",
    tags: ["workshopTag1", "workshopTag2"] as const,
  },
  {
    label: "volumeLabel",
    title: "volumeTitle",
    body: "volumeBody",
    tags: ["volumeTag1", "volumeTag2"] as const,
  },
] as const;

export async function WaysSection() {
  const t = await getTranslations("cnc.ways");

  return (
    <Reveal>
      <section
        id="servicio"
        aria-labelledby="ways-title"
        className="relative scroll-mt-24 px-5 py-14 md:px-8 md:py-20 lg:py-24"
      >
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
                className="border-cnc-line bg-cnc-surface flex flex-col justify-between rounded-[var(--radius-card)] border p-6 md:p-8"
              >
                <div>
                  <p className="text-cnc-muted font-mono text-sm tracking-[0.08em] uppercase tabular-nums">
                    {t(panel.label)}
                  </p>
                  <h3 className="mt-4 text-[clamp(1.25rem,2vw,1.5rem)] font-medium text-balance">
                    {t(panel.title)}
                  </h3>
                  <p className="mt-3 max-w-[62ch] text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.6] font-medium text-pretty">
                    {panel.body === "workshopBody"
                      ? t("workshopBody", {
                          days: siteConfig.cncDelivery
                            .smallProjectFromBusinessDays,
                        })
                      : t(panel.body)}
                  </p>
                </div>

                <div className="border-cnc-line/80 mt-6 flex flex-wrap items-center gap-2 border-t pt-4">
                  <span className="text-cnc-muted mr-1 font-mono text-xs tracking-[0.08em] uppercase">
                    {t("forLabel")}
                  </span>
                  {panel.tags.map((tagKey) => (
                    <span
                      key={tagKey}
                      className="border-cnc-line bg-cnc-bg/80 text-cnc-muted rounded-[var(--radius-control)] border px-2.5 py-1 font-mono text-xs tracking-[0.08em] uppercase"
                    >
                      {t(tagKey)}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}
