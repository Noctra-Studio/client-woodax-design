"use client";

import { useEffect } from "react";
import { motion, useAnimationControls } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { HeroMedia } from "@/components/design/hero-media";
import { useIntro } from "@/components/design/intro-provider";
import { designGallery } from "@/content/design-gallery";
import { useLeadUi } from "@/features/leads/components/lead-ui";
import { cn } from "@/lib/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;

export function HeroSection() {
  const t = useTranslations("design.hero");
  const locale = useLocale();
  const leadUi = useLeadUi();
  const { status, skip } = useIntro();
  const poster = designGallery[0];
  const onPhoto = Boolean(poster);
  const mediaControls = useAnimationControls();
  const leadControls = useAnimationControls();
  const tailControls = useAnimationControls();
  const copyControls = useAnimationControls();

  useEffect(() => {
    if (status !== "play") {
      void mediaControls.set({
        clipPath: "inset(0% round 28px)",
        scale: 1,
      });
      void leadControls.set({ opacity: 1, y: 0 });
      void tailControls.set({ opacity: 1, y: 0 });
      void copyControls.set({ opacity: 1, y: 0 });
      return;
    }

    void mediaControls.set({ clipPath: "inset(12% round 28px)", scale: 1.06 });
    void mediaControls.start({
      clipPath: "inset(0% round 28px)",
      scale: 1,
      transition: { duration: 0.9, ease: easeOut },
    });

    void leadControls.set({ opacity: 0, y: 24 });
    void leadControls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.4, ease: easeOut },
    });

    void tailControls.set({ opacity: 0, y: 24 });
    void tailControls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.47, ease: easeOut },
    });

    void copyControls.set({ opacity: 0, y: 16 });
    void copyControls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.62, ease: easeOut },
    });
  }, [copyControls, leadControls, mediaControls, status, tailControls]);

  return (
    <section className="relative min-h-[100svh]" aria-labelledby="hero-title">
      <motion.div
        animate={mediaControls}
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius: 28 }}
      >
        {poster ? (
          <HeroMedia
            poster={poster.src}
            alt={poster.alt[locale === "en" ? "en" : "es"]}
          />
        ) : null}
        {onPhoto ? (
          <div
            aria-hidden="true"
            className="from-woodax-charcoal/35 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent"
          />
        ) : null}
      </motion.div>

      <div
        className={cn(
          "relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1200px] flex-col justify-end px-5 pt-24 pb-[calc(7.5rem+env(safe-area-inset-bottom))] md:px-8 md:pb-20",
          onPhoto ? "text-woodax-cream" : "text-woodax-charcoal",
        )}
      >
        <p className="text-[13px] font-semibold tracking-[0.18em] uppercase">
          {t("eyebrow")}
        </p>
        <h1
          id="hero-title"
          tabIndex={-1}
          className="mt-4 scroll-mt-24 font-serif text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[1.05] font-normal tracking-[-0.01em] text-balance focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <motion.span animate={leadControls} className="block">
            {t("headlineLead")}
          </motion.span>
          <motion.span animate={tailControls} className="block">
            {t("headlineTail")}
          </motion.span>
        </h1>
        <motion.div animate={copyControls}>
          <p className="mt-5 max-w-[62ch] text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.65] font-medium text-pretty">
            {t("subhead")}
          </p>
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
            <Button
              href="#contacto"
              variant="design-primary"
              arrow
              onClick={(event) => {
                if (!window.matchMedia("(max-width: 767px)").matches) return;
                event.preventDefault();
                leadUi?.setOpen(true);
              }}
            >
              {t("ctaPrimary")}
            </Button>
            {designGallery.length > 0 ? (
              <Button
                href="#proyectos"
                variant={onPhoto ? "design-primary" : "design-secondary"}
                className={
                  onPhoto
                    ? "bg-woodax-cream text-woodax-charcoal pointer-fine:hover:bg-woodax-sand focus-visible:outline-woodax-charcoal"
                    : undefined
                }
              >
                {t("ctaSecondary")}
              </Button>
            ) : null}
          </div>
        </motion.div>
      </div>
      {status === "play" ? (
        <button
          type="button"
          onClick={skip}
          className="text-woodax-charcoal focus-visible:outline-woodax-charcoal pointer-fine:hover:bg-woodax-sand bg-woodax-cream absolute right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:right-8 md:bottom-8"
        >
          {t("skipIntro")}
        </button>
      ) : null}
    </section>
  );
}
