"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileCtaBar({
  label,
  variant,
  hidden,
  onOpen,
}: {
  label: string;
  variant: "design" | "cnc";
  hidden: boolean;
  onOpen: () => void;
}) {
  const isDesign = variant === "design";

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t px-4 pt-3 md:hidden",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        "duration-ui transition-transform ease-out motion-reduce:transition-none",
        hidden && "translate-y-full",
        isDesign
          ? "border-woodax-line bg-woodax-cream"
          : "border-cnc-line bg-cnc-bg",
      )}
    >
      <Button
        type="button"
        variant={isDesign ? "design-primary" : "cnc-primary"}
        onClick={onOpen}
        className="w-full"
        arrow
      >
        {label}
      </Button>
    </div>
  );
}

export function useFormSectionInView(sectionId: string) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.25 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [sectionId]);

  return inView;
}
