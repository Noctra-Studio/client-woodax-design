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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { fraunces } from "@/lib/font-design";
import { cn } from "@/lib/utils";
import type { ConsentChoice } from "@/lib/consent-config";

export function CookiePreferencesDialog({
  open,
  onOpenChange,
  variant,
  draft,
  onDraft,
  onSave,
  triggerRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: "design" | "cnc";
  draft: ConsentChoice;
  onDraft: (choice: ConsentChoice) => void;
  onSave: () => void;
  triggerRef: RefObject<HTMLElement | null>;
}) {
  const t = useTranslations("cookies");
  const closeLabel = useTranslations("nav")("close");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isDesign = variant === "design";
  const primary = isDesign ? "design-primary" : "cnc-primary";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-variant={variant}
        aria-describedby={undefined}
        overlayClassName="z-[70]"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          closeButtonRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          const trigger = triggerRef.current;
          if (!trigger?.isConnected) return;
          event.preventDefault();
          trigger.focus();
        }}
        className={cn(
          "z-[70] overflow-hidden md:border",
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
                ? "border-woodax-line bg-woodax-paper"
                : "border-cnc-line bg-cnc-surface",
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
              {t("footer")}
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
          <div className="flex flex-col gap-3 px-5 py-6 md:px-7 md:py-7">
            <Category
              id="cookie-necessary"
              variant={variant}
              title={t("necessaryTitle")}
              description={t("necessaryDescription")}
              checked
              disabled
            />
            <Category
              id="cookie-analytics"
              variant={variant}
              title={t("analyticsTitle")}
              description={t("analyticsDescription")}
              checked={draft.analytics}
              onCheckedChange={(analytics) => onDraft({ ...draft, analytics })}
            />
            <Category
              id="cookie-marketing"
              variant={variant}
              title={t("marketingTitle")}
              description={t("marketingDescription")}
              checked={draft.marketing}
              onCheckedChange={(marketing) => onDraft({ ...draft, marketing })}
            />
            <Button variant={primary} onClick={onSave} className="mt-2 w-full">
              {t("save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Category({
  id,
  variant,
  title,
  description,
  checked,
  disabled = false,
  onCheckedChange,
}: {
  id: string;
  variant: "design" | "cnc";
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  const isDesign = variant === "design";
  const descriptionId = `${id}-description`;

  return (
    <div
      className={cn(
        "flex min-h-11 items-center justify-between gap-4 border p-4",
        isDesign
          ? "border-woodax-line bg-woodax-cream rounded-md"
          : "border-cnc-line bg-cnc-bg rounded-sm",
      )}
    >
      <span className="min-w-0">
        <span className="font-medium">{title}</span>
        <span
          id={descriptionId}
          className={cn(
            "mt-1 block text-[15px] leading-relaxed",
            isDesign ? "text-woodax-charcoal/75" : "text-cnc-muted",
          )}
        >
          {description}
        </span>
      </span>
      <Switch
        id={id}
        variant={variant}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-describedby={descriptionId}
        aria-label={title}
        className="relative before:absolute before:-inset-3"
      />
    </div>
  );
}
