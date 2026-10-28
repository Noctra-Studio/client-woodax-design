"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useLocale } from "next-intl";
import { AnalyticsButton } from "@/components/analytics/tracked-link";
import { WhatsAppIcon } from "@/components/icons/brand-social";
import { lockNavAnchor } from "@/components/site/site-nav";
import { Button } from "@/components/ui/button";
import { analyticsLocale, track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function MobileCtaBar({
  label,
  variant,
  hidden,
  href,
  onOpen,
  whatsappHref,
  whatsappLabel,
  whatsappAria,
}: {
  label: string;
  variant: "design" | "cnc";
  hidden: boolean;
  href?: string;
  onOpen?: () => void;
  whatsappHref?: string | null;
  whatsappLabel?: string | null;
  whatsappAria?: string | null;
}) {
  const isDesign = variant === "design";
  const locale = useLocale();
  const showWhatsapp = Boolean(whatsappHref && whatsappLabel && whatsappAria);

  return (
    <div
      data-mobile-cta
      data-hidden={hidden ? "true" : undefined}
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
      className={cn(
        "mobile-cta-bar fixed inset-x-0 bottom-0 z-30 border-t px-4 pt-3 md:hidden",
        "pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
        isDesign
          ? "border-woodax-line bg-woodax-cream"
          : "border-cnc-line bg-cnc-bg",
      )}
    >
      <div className={cn(showWhatsapp && "flex items-center gap-3")}>
        <Button
          href={href}
          type={href ? undefined : "button"}
          variant={isDesign ? "design-primary" : "cnc-primary"}
          onClick={() => {
            track("cta_click", {
              site: variant,
              locale: analyticsLocale(locale),
              location: "mobile_bar",
            });
            if (href === "#contacto") {
              lockNavAnchor("contacto");
            }
            onOpen?.();
          }}
          className={cn(showWhatsapp ? "h-12 min-w-0 flex-1" : "w-full")}
          arrow
        >
          {label}
        </Button>
        {showWhatsapp && whatsappHref && whatsappAria ? (
          <AnalyticsButton
            href={whatsappHref}
            variant={isDesign ? "design-secondary" : "cnc-secondary"}
            target="_blank"
            rel="noopener noreferrer"
            className="size-12 shrink-0 px-0"
            aria-label={whatsappAria}
            tracking={{
              event: "whatsapp_click",
              params: { site: variant, location: "mobile_bar" },
            }}
          >
            <WhatsAppIcon className="size-5" />
          </AnalyticsButton>
        ) : null}
      </div>
    </div>
  );
}

export function useFormSectionInView(sectionId: string) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const section = document.getElementById(sectionId);
    if (!section) return;

    try {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setInView(Boolean(entry?.isIntersecting));
        },
        { threshold: 0.25 },
      );
      observer.observe(section);
      return () => observer.disconnect();
    } catch {
      return;
    }
  }, [sectionId]);

  return inView;
}

/** True while `elementId` intersects the viewport. Missing ids stay false. */
export function useHeroCtaInView(elementId: string | null) {
  const [inView, setInView] = useState(elementId !== null);

  useLayoutEffect(() => {
    if (!elementId || typeof IntersectionObserver === "undefined") return;

    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const observer = new IntersectionObserver(([entry]) => {
        setInView(Boolean(entry?.isIntersecting));
      });
      observer.observe(element);
      return () => observer.disconnect();
    } catch {
      return;
    }
  }, [elementId]);

  return elementId ? inView : false;
}
