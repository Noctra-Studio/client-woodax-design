"use client";

import type { ReactNode } from "react";
import { useLocale } from "next-intl";
import { useFormSectionInView } from "@/features/leads/components/mobile-cta-bar";
import { mobileCtaClearanceClass } from "@/features/leads/mobile-cta";
import { usePathname } from "@/i18n/navigation";
import { analyticsLocale } from "@/lib/analytics";
import { isDesignFull } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { whatsappHref } from "@/lib/whatsapp";

export function FooterClearance({
  variant,
  children,
}: {
  variant: "design" | "cnc";
  children: ReactNode;
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const formInView = useFormSectionInView("contacto");
  const full = isDesignFull();
  const barVisible =
    pathname !== "/privacy" &&
    (variant === "design" && full ? pathname !== "/contact" : !formInView);
  const secondary =
    variant === "cnc" && whatsappHref("cnc", analyticsLocale(locale)) !== null;

  return (
    <div className={cn(barVisible && mobileCtaClearanceClass(secondary))}>
      {children}
    </div>
  );
}
