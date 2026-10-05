"use client";

import { useEffect } from "react";
import { motion, useAnimationControls } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { RegistrationMarks } from "@/components/cnc/registration-marks";
import { HeroMedia } from "@/components/design/hero-media";
import { useIntro } from "@/components/cnc/intro-provider";
import { Button } from "@/components/ui/button";
import { cncGallery } from "@/content/cnc-gallery";
import { useLeadUi } from "@/features/leads/components/lead-ui";
import { cn } from "@/lib/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;

const corners = [
  { place: "top-24 left-8 md:left-12", x: "0.000", y: "0.000" },
  { place: "top-24 right-8 text-right md:right-12", x: "1.000", y: "0.000" },
  {
    place:
      "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-8 md:bottom-10 md:left-12",
    x: "0.000",
    y: "1.000",
  },
  {
    place:
      "right-8 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] text-right md:right-12 md:bottom-10",
    x: "1.000",
    y: "1.000",
  },
] as const;

export function HeroSection() {
  const t = useTranslations("cnc.hero");
  const locale = useLocale();
  const leadUi = useLeadUi();
  const { status } = useIntro();
  const poster = cncGallery[0];
  const copyControls = useAnimationControls();

  useEffect(() => {
    if (status !== "play") {
      void copyControls.set({ opacity: 1 });
      return;
    }

    void copyControls.set({ opacity: 0 });
    void copyControls.start({
      opacity: 1,
      transition: { duration: 0.5, delay: 0.7, ease: easeOut },
    });
  }, [copyControls, status]);

  return (
    <section className="relative min-h-[100svh]" aria-labelledby="hero-title">
      {poster ? (
        <div className="absolute inset-0">
          <HeroMedia
            poster={poster.src}
            alt={poster.alt[locale === "en" ? "en" : "es"]}
          />
          <div aria-hidden="true" className="bg-cnc-bg/40 absolute inset-0" />
        </div>
      ) : null}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="cnc-hero-grid absolute inset-0" />
        <RegistrationMarks className="top-20 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-6" />
        {corners.map((corner) => (
          <p
            key={corner.place}
            className={cn(
              "text-cnc-muted absolute font-mono text-sm tracking-[0.08em] uppercase tabular-nums",
              corner.place,
            )}
          >
            {t("axisX")} {corner.x}
            <br />
            {t("axisY")} {corner.y}
          </p>
        ))}
      </div>

      <div className="relative z-10 flex min-h-[100svh] flex-col justify-end">
        <motion.div
          animate={copyControls}
          className={cn("w-full", poster && "bg-cnc-bg")}
        >
          <div className="mx-auto w-full max-w-[1200px] px-5 pt-28 pb-[calc(10.5rem+env(safe-area-inset-bottom))] md:px-8 md:pt-32 md:pb-28">
            <p className="text-cnc-text text-[13px] font-medium tracking-[0.18em] uppercase">
              {t("eyebrow")}
            </p>
            <h1
              id="hero-title"
              tabIndex={-1}
              className="text-cnc-text mt-4 max-w-[16ch] scroll-mt-24 text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] font-normal tracking-[-0.02em] text-balance focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cnc-white"
            >
              {t("headline")}
            </h1>
            <p className="text-cnc-text mt-5 max-w-[62ch] text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.6] font-light text-pretty">
              {t("subhead")}
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
              <Button
                href="#contacto"
                variant="cnc-primary"
                arrow
                onClick={(event) => {
                  if (!window.matchMedia("(max-width: 767px)").matches) return;
                  event.preventDefault();
                  leadUi?.setOpen(true);
                }}
              >
                {t("ctaPrimary")}
              </Button>
              <Button href="#proceso" variant="cnc-secondary">
                {t("ctaSecondary")}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
