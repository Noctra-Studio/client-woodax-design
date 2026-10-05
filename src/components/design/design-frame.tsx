"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function DesignFrame({
  mobileCtaLabel,
  children,
}: {
  mobileCtaLabel: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const showBar = pathname !== "/contact";

  return (
    <>
      <div
        id="content"
        tabIndex={-1}
        className={cn(
          "flex min-w-0 flex-1 flex-col overflow-x-clip outline-none",
          showBar && "pb-28 md:pb-0",
        )}
      >
        {children}
      </div>
      {showBar ? (
        <div
          className={cn(
            "border-woodax-line bg-woodax-cream fixed inset-x-0 bottom-0 z-30 border-t px-4 pt-3 md:hidden",
            "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
          )}
        >
          <Button
            href="/contact"
            variant="design-primary"
            className="w-full"
            arrow
          >
            {mobileCtaLabel}
          </Button>
        </div>
      ) : null}
    </>
  );
}
