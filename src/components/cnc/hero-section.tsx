"use client";

import { useEffect, useState } from "react";
import { animate, motion, useAnimationControls } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { RegistrationMarks } from "@/components/cnc/registration-marks";
import { HeroMedia } from "@/components/design/hero-media";
import { useIntro } from "@/components/cnc/intro-provider";
import { Button } from "@/components/ui/button";
import { siteConfig, type CncHero } from "@/content/site-config";
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
      "right-8 bottom-[calc(8.75rem+env(safe-area-inset-bottom))] text-right md:right-12 md:bottom-24",
    x: "1.000",
    y: "1.000",
  },
] as const;

export function HeroSection() {
  const t = useTranslations("cnc.hero");
  const locale = useLocale();
  const leadUi = useLeadUi();
  const { status, skip } = useIntro();
  const media = heroMedia(siteConfig.cncHero, locale === "en" ? "en" : "es");
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
      {media ? (
        <div className="absolute inset-0">
          <HeroMedia
            poster={media.poster}
            alt={media.alt}
            videoSrc={media.videoSrc}
          />
          <div aria-hidden="true" className="bg-cnc-bg/80 absolute inset-0" />
        </div>
      ) : null}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="cnc-hero-grid absolute inset-0"
          data-over-media={media ? "true" : undefined}
        />
        <RegistrationMarks className="top-20 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-6" />
        {corners.map((corner) => (
          <p
            key={corner.place}
            className={cn(
              "absolute font-mono text-sm tracking-[0.08em] uppercase tabular-nums",
              media ? "text-cnc-text" : "text-cnc-muted",
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
          className="w-full"
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
            <p className="text-cnc-text mt-5 max-w-[62ch] text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.6] font-medium text-pretty">
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
      {status === "play" ? <CoordinateReadout /> : null}
      {status === "play" ? (
        <button
          type="button"
          onClick={skip}
          className="border-cnc-muted text-cnc-text focus-visible:outline-cnc-white pointer-fine:hover:border-cnc-text pointer-fine:hover:bg-cnc-surface bg-cnc-bg absolute right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 inline-flex min-h-11 items-center rounded-[4px] border px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:right-8 md:bottom-8"
        >
          {t("skipIntro")}
        </button>
      ) : null}
    </section>
  );
}

function heroMedia(hero: CncHero, locale: "es" | "en") {
  if (hero.type === "image") {
    return { poster: hero.src, alt: hero.alt[locale], videoSrc: undefined };
  }

  if (hero.type === "video") {
    const videoSrc =
      hero.src.webm || hero.src.mp4
        ? { webm: hero.src.webm, mp4: hero.src.mp4 }
        : undefined;
    return { poster: hero.poster, alt: hero.alt[locale], videoSrc };
  }

  return null;
}

function CoordinateReadout() {
  const t = useTranslations("cnc.hero");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const controls = animate(0, 1, {
      duration: 0.9,
      ease: easeOut,
      onUpdate: (value) => setProgress(value),
    });
    return () => controls.stop();
  }, []);

  const value = progress.toFixed(3);

  return (
    <p
      aria-hidden="true"
      className="text-cnc-muted absolute top-24 left-1/2 z-10 -translate-x-1/2 font-mono text-sm tracking-[0.08em] uppercase tabular-nums"
    >
      {t("axisX")} {value}
      <span className="px-2">{t("axisY")}</span>
      {value}
    </p>
  );
}
