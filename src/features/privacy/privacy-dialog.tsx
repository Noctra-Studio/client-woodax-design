"use client";

import { useRef, type RefObject } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PrivacyNoticeBody } from "@/features/privacy/privacy-notice-body";
import { fraunces } from "@/lib/font-design";
import { cn } from "@/lib/utils";

export function PrivacyDialog({
  open,
  onOpenChange,
  variant,
  closeLabel,
  triggerRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: "design" | "cnc";
  closeLabel: string;
  triggerRef?: RefObject<HTMLAnchorElement | null>;
}) {
  const t = useTranslations("privacy");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isDesign = variant === "design";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-variant={variant}
        aria-describedby={undefined}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          closeButtonRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          const trigger = triggerRef?.current;
          if (!trigger?.isConnected) return;
          event.preventDefault();
          trigger.focus();
        }}
        className={cn(
          "overflow-hidden md:border",
          isDesign
            ? `${fraunces.variable} bg-woodax-paper text-woodax-charcoal md:border-woodax-line`
            : "bg-cnc-surface text-cnc-text md:border-cnc-line",
        )}
      >
        <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain">
          <DialogHeader
            className={cn(
              "sticky top-0 z-10 border-b px-5 py-4 md:px-7 md:py-5",
              isDesign
                ? "bg-woodax-paper border-woodax-line"
                : "bg-cnc-surface border-cnc-line",
            )}
          >
            <DialogTitle
              className={cn(
                "text-[clamp(1.375rem,2.5vw,1.75rem)] leading-[1.15] font-normal",
                isDesign
                  ? "font-serif tracking-[-0.01em]"
                  : "tracking-[-0.02em]",
              )}
            >
              {t("title")}
            </DialogTitle>
            <DialogClose asChild>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label={closeLabel}
                className={cn(
                  "-mr-2 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center transition-colors duration-[var(--duration-press)] ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                  isDesign
                    ? "pointer-fine:hover:bg-woodax-cream/80 focus-visible:outline-woodax-charcoal rounded-sm"
                    : "text-cnc-muted pointer-fine:hover:bg-cnc-line/60 pointer-fine:hover:text-cnc-text focus-visible:outline-cnc-white rounded-sm",
                )}
              >
                <X aria-hidden="true" strokeWidth={1.5} className="size-5" />
              </button>
            </DialogClose>
          </DialogHeader>
          <div className="px-5 py-6 md:px-7 md:py-7">
            <PrivacyNoticeBody />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
