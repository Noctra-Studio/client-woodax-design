"use client";

import { useState, useSyncExternalStore } from "react";
import { AnalyticsAnchor } from "@/components/analytics/tracked-link";
import { WhatsAppIcon } from "@/components/icons/brand-social";
import { ArcMotif } from "@/components/design/arc-motif";
import { Reveal } from "@/components/design/reveal";
import { Button } from "@/components/ui/button";
import type { LeadCopy } from "@/features/leads/copy";
import { LeadForm } from "@/features/leads/components/lead-form";
import { LeadSheet } from "@/features/leads/components/lead-sheet";
import { useLeadUi } from "@/features/leads/components/lead-ui";
import {
  MobileCtaBar,
  useFormSectionInView,
} from "@/features/leads/components/mobile-cta-bar";
import { isDesignFull } from "@/lib/seo";
import { cn } from "@/lib/utils";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribe(onStoreChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", onStoreChange);
  return () => query.removeEventListener("change", onStoreChange);
}

function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

export function LeadCapture({ copy }: { copy: LeadCopy }) {
  if (copy.variant === "design" && isDesignFull()) {
    return <DesignLeadCapture copy={copy} />;
  }

  return <SheetLeadCapture copy={copy} />;
}

function DesignLeadCapture({ copy }: { copy: LeadCopy }) {
  return (
    <Reveal>
      <section
        id="contacto"
        aria-label={copy.title}
        className="bg-woodax-green text-woodax-charcoal relative scroll-mt-24 px-5 py-16 md:px-8 md:py-24 lg:py-40"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <ArcMotif className="absolute -top-24 -left-16 h-80 w-80" />
        </div>
        <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-8">
          <h2 className="max-w-[18ch] font-serif text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.01em] text-balance">
            {copy.title}
          </h2>
          <div className="md:max-w-[720px]">
            <LeadForm copy={copy} />
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function SheetLeadCapture({ copy }: { copy: LeadCopy }) {
  const leadUi = useLeadUi();
  const [localOpen, setLocalOpen] = useState(false);
  const open = leadUi?.open ?? localOpen;
  const setOpen = leadUi?.setOpen ?? setLocalOpen;
  const isMobile = useIsMobile();
  const inView = useFormSectionInView("contacto");
  const isDesign = copy.variant === "design";
  const sheetOpen = isMobile && open;

  const section = (
    <section
      id="contacto"
      aria-labelledby={`${copy.variant}-form-title`}
      className={cn(
        "relative scroll-mt-24 px-5",
        isDesign
          ? "bg-woodax-green text-woodax-charcoal py-16 md:px-8 md:py-24 lg:py-40"
          : "py-14 md:px-8 md:py-20 lg:py-24",
      )}
    >
      {isDesign ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <ArcMotif className="absolute -top-24 -left-16 h-80 w-80" />
        </div>
      ) : null}
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-8">
        <h2
          id={`${copy.variant}-form-title`}
          className={cn(
            "max-w-[18ch] text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal text-balance",
            isDesign ? "font-serif tracking-[-0.01em]" : "tracking-[-0.02em]",
          )}
        >
          {copy.title}
        </h2>
        <div
          className={cn("flex flex-col gap-4", isDesign && "md:max-w-[720px]")}
        >
          <div className="md:hidden">
            <Button
              type="button"
              variant={isDesign ? "design-primary" : "cnc-primary"}
              onClick={() => setOpen(true)}
            >
              {copy.mobileBar}
            </Button>
          </div>
          <LeadSheet
            open={sheetOpen}
            onClose={() => setOpen(false)}
            title={copy.title}
            titleId={`${copy.variant}-sheet-title`}
            closeLabel={copy.closeLabel}
            variant={copy.variant}
            active={isMobile}
          >
            <LeadForm copy={copy} />
            {copy.variant === "cnc" &&
            copy.whatsappHref &&
            copy.whatsappPrefer ? (
              <div className="border-cnc-line mt-6 border-t pt-5">
                <AnalyticsAnchor
                  href={copy.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={copy.whatsappAria}
                  tracking={{
                    event: "whatsapp_click",
                    params: { site: "cnc", location: "contact" },
                  }}
                  className="text-cnc-text focus-visible:outline-cnc-white inline-flex min-h-11 items-center gap-2 text-[15px] font-medium underline decoration-current/40 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 pointer-fine:hover:decoration-current"
                >
                  <WhatsAppIcon className="size-4 shrink-0" />
                  {copy.whatsappPrefer}
                </AnalyticsAnchor>
              </div>
            ) : null}
          </LeadSheet>
        </div>
      </div>
    </section>
  );

  return (
    <>
      <Reveal>{section}</Reveal>
      <MobileCtaBar
        label={copy.mobileBar}
        variant={copy.variant}
        hidden={sheetOpen || inView}
        onOpen={() => setOpen(true)}
        whatsappHref={copy.variant === "cnc" ? copy.whatsappHref : null}
        whatsappLabel={copy.whatsappChannel}
        whatsappAria={copy.whatsappAria}
      />
    </>
  );
}
