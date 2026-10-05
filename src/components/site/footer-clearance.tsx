"use client";

import type { ReactNode } from "react";
import { useFormSectionInView } from "@/features/leads/components/mobile-cta-bar";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function FooterClearance({
  variant,
  children,
}: {
  variant: "design" | "cnc";
  children: ReactNode;
}) {
  const pathname = usePathname();
  const formInView = useFormSectionInView("contacto");
  const barVisible = variant === "design" ? pathname !== "/contact" : !formInView;

  return (
    <div className={cn(barVisible && "pb-28 md:pb-0")}>{children}</div>
  );
}
