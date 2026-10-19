"use client";

import type { MouseEvent, ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useIntro } from "@/components/design/intro-provider";
import { lockNavAnchor } from "@/components/site/site-nav";
import { Button } from "@/components/ui/button";
import { useLeadUi } from "@/features/leads/components/lead-ui";
import { analyticsLocale, track } from "@/lib/analytics";
import { isDesignFull } from "@/lib/seo";
import { cn } from "@/lib/utils";

export function HeroSection({
  children,
  hasPoster,
  showProjects,
}: {
  children?: ReactNode;
  hasPoster: boolean;
  showProjects: boolean;
}) {
  const t = useTranslations("design.hero");
  const home = useTranslations("design.home");
  const locale = useLocale();
  const leadUi = useLeadUi();
  const { status, skip } = useIntro();
  const full = isDesignFull();

  return (
    <section className="relative min-h-[100svh]" aria-labelledby="hero-title">
      {children ? (
        <div className="absolute inset-0 overflow-hidden rounded-[var(--radius-media)]">
          {children}
          {hasPoster ? (
            <div
              aria-hidden="true"
              className="from-woodax-charcoal/35 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent"
            />
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          "relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1200px] flex-col px-5 pt-24 pb-[calc(7.5rem+env(safe-area-inset-bottom))] md:px-8 md:pb-20",
          hasPoster ? "text-woodax-cream" : "text-woodax-charcoal",
        )}
      >
        <p className="mt-auto text-[13px] font-semibold tracking-[0.18em] uppercase">
          {full ? home("eyebrow") : t("eyebrow")}
        </p>
        <h1
          id="hero-title"
          tabIndex={-1}
          className="mt-4 scroll-mt-24 font-serif text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[1.05] font-light tracking-[-0.01em] text-balance focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <span className="block">{t("headlineLead")}</span>
          <span className="block">{t("headlineTail")}</span>
        </h1>
        <div>
          <p className="mt-5 max-w-[62ch] text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.65] font-medium text-pretty">
            {t("subhead")}
          </p>
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
            <Button
              href={full ? "/contact" : "#contacto"}
              variant="design-primary"
              arrow
              onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                track("cta_click", {
                  site: "design",
                  locale: analyticsLocale(locale),
                  location: "hero",
                });
                if (full) return;
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
            {showProjects ? (
              <Button
                href="#proyectos"
                variant={hasPoster ? "design-primary" : "design-secondary"}
                onClick={() => {
                  lockNavAnchor("proyectos");
                }}
                className={
                  hasPoster
                    ? "bg-woodax-cream text-woodax-charcoal pointer-fine:hover:bg-woodax-cream focus-visible:outline-woodax-charcoal"
                    : undefined
                }
              >
                {t("ctaSecondary")}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      {status === "play" ? (
        <button
          type="button"
          onClick={skip}
          className="text-woodax-charcoal focus-visible:outline-woodax-charcoal pointer-fine:hover:bg-woodax-cream bg-woodax-cream absolute right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 inline-flex min-h-11 items-center rounded-sm px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:right-8 md:bottom-8"
        >
          {t("skipIntro")}
        </button>
      ) : null}
    </section>
  );
}
