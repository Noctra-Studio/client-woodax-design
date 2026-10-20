"use client";

import type { MouseEvent, ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArcMotif } from "@/components/design/arc-motif";
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
    <section className="bg-woodax-bg relative overflow-hidden" aria-labelledby="hero-title">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[1200px] flex-col px-5 pt-24 pb-[max(var(--home-section-y),calc(6.5rem+env(safe-area-inset-bottom)))] md:px-8 md:pb-[var(--home-section-y)]">
        <div className="mt-auto grid items-end gap-10 md:grid-cols-12 md:gap-8">
          <div
            data-intro={status}
            className="text-woodax-charcoal relative z-10 md:col-span-6 md:pb-6"
          >
            <p
              className="design-headline-line text-[13px] font-semibold tracking-[0.18em] uppercase"
              style={{ animationDelay: "0ms" }}
            >
              {full ? home("eyebrow") : t("eyebrow")}
            </p>
            <h1
              id="hero-title"
              tabIndex={-1}
              className="mt-4 scroll-mt-24 font-serif text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[1.05] font-light tracking-[-0.01em] text-balance focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <span className="design-headline-line block" style={{ animationDelay: "70ms" }}>
                {t("headlineLead")}
              </span>
              <span className="design-headline-line block" style={{ animationDelay: "140ms" }}>
                {t("headlineTail")}
              </span>
            </h1>
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
                  variant="design-secondary"
                  onClick={() => {
                    lockNavAnchor("proyectos");
                  }}
                >
                  {t("ctaSecondary")}
                </Button>
              ) : null}
            </div>
          </div>

          <div className="relative md:col-span-5 md:col-start-8">
            <ArcMotif className="text-woodax-stripe absolute -top-16 -right-20 h-72 w-72 opacity-[0.22] md:-top-28 md:-right-28 md:h-[32rem] md:w-[32rem]" />
            {children ? (
              <div
                className={cn(
                  "relative z-10",
                  hasPoster &&
                    "overflow-hidden rounded-[var(--radius-media)]",
                )}
              >
                {children}
                {hasPoster ? (
                  <div
                    aria-hidden="true"
                    className="from-woodax-charcoal/35 pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t to-transparent"
                  />
                ) : null}
              </div>
            ) : (
              <div className="relative z-10 h-48 md:h-[28rem]" aria-hidden="true" />
            )}
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
