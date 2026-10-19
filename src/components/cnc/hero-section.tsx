"use client";

import { useEffect, useState } from "react";
import { animate } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { RegistrationMarks } from "@/components/cnc/registration-marks";
import { HeroMedia } from "@/components/design/hero-media";
import { useIntro } from "@/components/cnc/intro-provider";
import { lockNavAnchor } from "@/components/site/site-nav";
import { Button } from "@/components/ui/button";
import { siteConfig, type CncHero } from "@/content/site-config";
import { useLeadUi } from "@/features/leads/components/lead-ui";
import { CNC_HERO_CTA_ID } from "@/features/leads/mobile-cta";
import { analyticsLocale, track } from "@/lib/analytics";

const easeOut = [0.22, 1, 0.36, 1] as const;

export function HeroSection() {
  const t = useTranslations("cnc.hero");
  const locale = useLocale();
  const leadUi = useLeadUi();
  const { status, skip } = useIntro();
  const media = heroMedia(siteConfig.cncHero, locale === "en" ? "en" : "es");

  return (
    <section
      id="hero"
      className="relative min-h-[100svh]"
      aria-labelledby="hero-title"
    >
      {media ? (
        <div className="absolute inset-0">
          <HeroMedia
            poster={media.poster}
            mobilePoster={media.mobilePoster}
            alt={media.alt}
            videoSrc={media.videoSrc}
          />
          <div
            aria-hidden="true"
            className="bg-cnc-bg/60 absolute inset-0 hidden md:block"
          />
          <div
            aria-hidden="true"
            className="from-cnc-bg/95 via-cnc-bg/60 pointer-events-none absolute inset-0 bg-gradient-to-t from-0% via-35% to-transparent to-60% md:hidden"
          />
          <div
            aria-hidden="true"
            className="from-cnc-bg via-cnc-bg/55 pointer-events-none absolute inset-0 hidden bg-gradient-to-r to-transparent md:block"
          />
        </div>
      ) : null}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="cnc-hero-grid absolute inset-0"
          data-over-media={media ? "true" : undefined}
        />
        <RegistrationMarks className="top-20 bottom-[max(1.25rem,env(safe-area-inset-bottom))] md:bottom-6" />
      </div>

      <div className="relative z-10 flex min-h-[100svh] flex-col pt-24">
        <div className="mt-auto w-full">
          <div className="mx-auto w-full max-w-[1200px] px-5 pt-28 pb-[calc(2.5rem+env(safe-area-inset-bottom))] md:px-8 md:pt-32 md:pb-28">
            <p className="text-cnc-text text-[13px] font-medium tracking-[0.18em] uppercase">
              {t("eyebrow")}
            </p>
            <h1
              id="hero-title"
              tabIndex={-1}
              className="text-cnc-text focus-visible:outline-cnc-white mt-4 max-w-[16ch] scroll-mt-24 text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] font-normal tracking-[-0.02em] text-balance focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {t("headline")}
            </h1>
            <p className="text-cnc-text mt-5 max-w-[62ch] text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.6] font-medium text-pretty">
              {t("subhead")}
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
              <Button
                id={CNC_HERO_CTA_ID}
                href="#contacto"
                variant="cnc-primary"
                arrow
                onClick={(event) => {
                  track("cta_click", {
                    site: "cnc",
                    locale: analyticsLocale(locale),
                    location: "hero",
                  });
                  if (!window.matchMedia("(max-width: 767px)").matches) {
                    lockNavAnchor("contacto");
                    return;
                  }
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
        </div>
      </div>
      {status === "play" ? <CoordinateReadout /> : null}
      {status === "play" ? (
        <button
          type="button"
          onClick={skip}
          className="border-cnc-muted text-cnc-text focus-visible:outline-cnc-white pointer-fine:hover:border-cnc-text pointer-fine:hover:bg-cnc-surface bg-cnc-bg absolute right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20 inline-flex min-h-11 items-center rounded-sm border px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:right-8 md:bottom-8"
        >
          {t("skipIntro")}
        </button>
      ) : null}
    </section>
  );
}

function heroMedia(hero: CncHero, locale: "es" | "en") {
  if (hero.type === "image") {
    return {
      poster: hero.src,
      mobilePoster: hero.mobilePoster,
      alt: hero.alt[locale],
      videoSrc: undefined,
    };
  }

  if (hero.type === "video") {
    const videoSrc =
      hero.src.webm || hero.src.mp4 || hero.src.mobileMp4 || hero.src.desktopMp4
        ? {
            webm: hero.src.webm,
            mp4: hero.src.mp4,
            mobileMp4: hero.src.mobileMp4,
            desktopMp4: hero.src.desktopMp4,
          }
        : undefined;
    return {
      poster: hero.poster,
      mobilePoster: hero.mobilePoster,
      alt: hero.alt[locale],
      videoSrc,
    };
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
