"use client";

import { useState, useSyncExternalStore } from "react";
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
        "relative scroll-mt-24 px-5 py-16 md:px-8 md:py-24 lg:py-40",
        isDesign && "bg-woodax-green text-woodax-charcoal",
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
        <div className="md:hidden">
          <Button
            type="button"
            variant={isDesign ? "design-primary" : "cnc-primary"}
            onClick={() => setOpen(true)}
          >
            {copy.mobileBar}
          </Button>
        </div>
        <div className={cn(isDesign && "md:max-w-[720px]")}>
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
      />
    </>
  );
}
