"use client";

import { useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { RegistrationMarks } from "@/components/cnc/registration-marks";
import { cn } from "@/lib/utils";

const materials = ["wood", "acrylic", "aluminum"] as const;

export function MaterialsSection() {
  const t = useTranslations("cnc.materials");
  const listRef = useRef<HTMLDivElement>(null);
  const rows = materials.map((key) => {
    const [name, ...rest] = t(key).split(" · ");
    return {
      key,
      name: name ?? t(key),
      description: rest.join(" · "),
    };
  });

  useLayoutEffect(() => {
    const root = listRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = [...root.querySelectorAll<HTMLElement>(".cnc-plotter")];
    let frame = 0;
    let revealed = false;

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      frame = requestAnimationFrame(() => {
        for (const item of items) item.dataset.plot = "shown";
      });
      window.removeEventListener("scroll", onScroll);
    };

    const onScroll = () => {
      const rect = root.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) reveal();
    };

    for (const item of items) item.dataset.plot = "hidden";
    onScroll();
    if (!revealed) {
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    root.addEventListener("focusin", reveal);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      root.removeEventListener("focusin", reveal);
    };
  }, [rows.length]);

  return (
    <section
      id="materiales"
      aria-labelledby="materials-title"
      className="relative scroll-mt-24 px-5 py-16 md:px-8 md:py-24 lg:py-32"
    >
      <RegistrationMarks />
      <div className="relative mx-auto w-full max-w-[1200px]">
        <h2
          id="materials-title"
          className="max-w-[16ch] text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.02em] text-balance"
        >
          {t("title")}
        </h2>
        <div
          ref={listRef}
          role="table"
          aria-labelledby="materials-title"
          className="border-cnc-line mt-10 border-t md:mt-14"
        >
          {rows.map((row, index) => (
            <div
              key={row.key}
              role="row"
              data-plotter=""
              className={cn(
                "cnc-plotter border-cnc-line grid items-baseline gap-2 border-b py-4 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:gap-6",
              )}
              style={{ transitionDelay: `${index * 70}ms` }}
            >
              <p
                role="cell"
                className="text-[clamp(1.25rem,2vw,1.5rem)] font-medium"
              >
                {row.name}
              </p>
              <p
                role="cell"
                className={
                  row.description
                    ? "max-w-[62ch] text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.6] font-medium text-pretty"
                    : "hidden md:block"
                }
              >
                {row.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
