"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import type { LeadCopy } from "@/features/leads/copy";
import { LeadForm } from "@/features/leads/components/lead-form";
import { LeadSheet } from "@/features/leads/components/lead-sheet";
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
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const inView = useFormSectionInView("contacto");
  const isDesign = copy.variant === "design";
  const sheetOpen = isMobile && open;

  return (
    <>
      <section
        id="contacto"
        className={cn(
          "scroll-mt-6 px-5 py-16 md:px-8 md:py-28",
          isDesign && "bg-woodax-green text-woodax-charcoal",
        )}
      >
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
          <h2 className="max-w-[18ch] text-[clamp(1.875rem,4vw,3rem)] leading-[1.05] font-normal tracking-[-0.02em]">
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
      </section>
      <MobileCtaBar
        label={copy.mobileBar}
        variant={copy.variant}
        hidden={sheetOpen || inView}
        onOpen={() => setOpen(true)}
      />
    </>
  );
}
