"use client";

import { useLayoutEffect, useRef } from "react";
import { armRouteTransition } from "@/lib/route-transition";

export default function DesignTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    const { animate, scroll } = armRouteTransition();

    if (animate) node?.setAttribute("data-route-enter", "");
    if (!scroll) return;

    const hash = window.location.hash;
    if (hash.length > 1) {
      const id = decodeURIComponent(hash.slice(1));
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView();
        return;
      }
    }

    window.scrollTo(0, 0);
  }, []);

  return (
    <div ref={ref} className="flex min-w-0 flex-1 flex-col">
      {children}
    </div>
  );
}
