"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return;

    element.dataset.reveal = "hidden";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        element.dataset.reveal = "shown";
        observer.disconnect();
      },
      { threshold: 0.18 },
    );
    observer.observe(element);

    const onFocus = () => {
      element.dataset.reveal = "shown";
      observer.disconnect();
    };

    element.addEventListener("focusin", onFocus);
    return () => {
      observer.disconnect();
      element.removeEventListener("focusin", onFocus);
    };
  }, []);

  return (
    <div ref={ref} className={cn("design-reveal", className)}>
      {children}
    </div>
  );
}
