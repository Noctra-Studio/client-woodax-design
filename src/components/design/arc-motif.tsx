"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const paths = [
  "M28 156C28 84 84 28 156 28",
  "M44 172C44 100 100 44 172 44",
  "M28 44C100 44 156 100 156 172",
  "M44 28C116 28 172 84 172 156",
];

export function ArcMotif({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    node.dataset.arcs = "wait";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        node.dataset.arcs = "draw";
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={cn(
        "arc-motif text-woodax-cream pointer-events-none opacity-35",
        className,
      )}
    >
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          pathLength={1}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
