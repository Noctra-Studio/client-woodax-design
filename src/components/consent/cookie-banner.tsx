"use client";

import { useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { FooterPrivacyLink } from "@/components/site/footer-privacy-link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SUBMIT_GAP = 12;

export function CookieBanner({
  variant,
  onAccept,
  onReject,
  onPreferences,
}: {
  variant: "design" | "cnc";
  onAccept: () => void;
  onReject: () => void;
  onPreferences: (trigger: HTMLElement) => void;
}) {
  const t = useTranslations("cookies");
  const bannerRef = useRef<HTMLElement>(null);
  const isDesign = variant === "design";
  const primary = isDesign ? "design-primary" : "cnc-primary";
  const secondary = isDesign ? "design-secondary" : "cnc-secondary";

  useLayoutEffect(() => {
    const banner = bannerRef.current;
    if (!banner) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      placeBanner(banner);
    };
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-hidden", "data-open", "data-state"],
    });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
      observer.disconnect();
      document.documentElement.style.removeProperty("--cookie-banner-height");
    };
  }, []);

  return (
    <section
      ref={bannerRef}
      data-cookie-banner
      data-at-edge="true"
      role="region"
      aria-label={t("bannerLabel")}
      className={cn(
        "cookie-banner fixed inset-x-0 bottom-0 z-[35] border-t px-5 pt-3 md:px-8",
        "data-[at-edge=false]:pb-3 data-[at-edge=true]:pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        isDesign
          ? "border-woodax-line bg-woodax-cream text-woodax-charcoal rounded-t-[var(--radius-lg)]"
          : "border-cnc-line bg-cnc-surface text-cnc-text rounded-t-[var(--radius-lg)]",
      )}
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[15px] leading-relaxed">
          {t("bannerText")}{" "}
          <FooterPrivacyLink
            className={cn(
              "underline decoration-current/40 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
              isDesign
                ? "focus-visible:outline-woodax-charcoal"
                : "focus-visible:outline-cnc-white",
            )}
          >
            {t("bannerLink")}
          </FooterPrivacyLink>
        </p>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:shrink-0">
          <Button
            variant={primary}
            onClick={onAccept}
            className="w-full px-2 text-[15px] sm:w-auto sm:px-5 sm:text-base"
          >
            {t("accept")}
          </Button>
          <Button
            variant={secondary}
            onClick={onReject}
            className="w-full px-2 text-[15px] sm:w-auto sm:px-5 sm:text-base"
          >
            {t("reject")}
          </Button>
          <Button
            variant={secondary}
            onClick={(event) => onPreferences(event.currentTarget)}
            className="w-full px-2 text-[15px] sm:w-auto sm:px-5 sm:text-base"
          >
            {t("preferences")}
          </Button>
        </div>
      </div>
    </section>
  );
}

function placeBanner(banner: HTMLElement) {
  const ctaHeight = visibleCtaHeight();
  banner.dataset.atEdge = "false";
  banner.style.bottom = `${ctaHeight}px`;
  const bannerHeight = banner.offsetHeight;
  let bottom = ctaHeight;

  if (!document.querySelector("[data-slot='dialog-content'][data-state='open']")) {
    const bannerTop = window.innerHeight - ctaHeight - bannerHeight;
    const bannerBottom = window.innerHeight - ctaHeight;
    for (const button of document.querySelectorAll<HTMLElement>(
      "form button[type='submit']",
    )) {
      if (coveredBySheet(button)) continue;
      const rect = button.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const overlaps =
        rect.bottom > bannerTop + SUBMIT_GAP && rect.top < bannerBottom;
      if (!overlaps) continue;
      const needed = window.innerHeight - rect.top + SUBMIT_GAP;
      if (needed > bottom) bottom = needed;
    }
  }

  const maxBottom = Math.max(ctaHeight, window.innerHeight - bannerHeight - 96);
  bottom = Math.min(Math.max(bottom, ctaHeight), maxBottom);
  const atEdge = bottom === 0;
  banner.dataset.atEdge = atEdge ? "true" : "false";
  banner.style.bottom = `${bottom}px`;
  const height = banner.offsetHeight;
  document.documentElement.style.setProperty(
    "--cookie-banner-height",
    `${height}px`,
  );
}

function visibleCtaHeight() {
  let height = 0;
  for (const bar of document.querySelectorAll<HTMLElement>("[data-mobile-cta]")) {
    if (bar.dataset.hidden === "true") continue;
    const rect = bar.getBoundingClientRect();
    if (rect.height === 0 || rect.top >= window.innerHeight - 1) continue;
    height = Math.max(height, rect.height);
  }
  return height;
}

function coveredBySheet(button: HTMLElement) {
  if (button.closest("[data-slot='dialog-content'], [data-slot='sheet-content']")) {
    return true;
  }
  if (!window.matchMedia("(max-width: 767px)").matches) return false;
  const sheet = button.closest<HTMLElement>(".lead-sheet");
  return sheet?.dataset.open === "true";
}
