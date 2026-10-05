"use client";

import { useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { RegistrationMarks } from "@/components/cnc/registration-marks";
import { siteConfig, type CncMaterial } from "@/content/site-config";
import { cn } from "@/lib/utils";

const materials = ["wood", "acrylic", "aluminum"] as const;

export function MaterialsSection() {
  const t = useTranslations("cnc.materials");
  const listRef = useRef<HTMLDivElement>(null);
  const specs = siteConfig.cncSpecs;
  const rows = materials.map((key) => {
    const [name, ...rest] = t(key).split(" · ");
    return {
      key,
      name: name ?? t(key),
      description: rest.join(" · "),
      thickness: specs?.maxThicknessByMaterial?.[key as CncMaterial],
      area: specs?.cuttingArea,
    };
  });
  const showThickness = rows.some((row) => Boolean(row.thickness));
  const showArea = rows.some((row) => Boolean(row.area));
  const columns = columnClass(showThickness, showArea);

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
          {showThickness || showArea ? (
            <div role="row" className={cn("hidden md:grid", columns)}>
              <span role="columnheader">
                <span className="sr-only">{t("title")}</span>
              </span>
              <span role="columnheader" />
              {showThickness ? (
                <span
                  role="columnheader"
                  className="text-cnc-muted font-mono text-sm tracking-[0.08em] uppercase md:text-right"
                >
                  {t("maxThickness")}
                </span>
              ) : null}
              {showArea ? (
                <span
                  role="columnheader"
                  className="text-cnc-muted font-mono text-sm tracking-[0.08em] uppercase md:text-right"
                >
                  {t("cuttingArea")}
                </span>
              ) : null}
            </div>
          ) : null}
          {rows.map((row, index) => (
            <div
              key={row.key}
              role="row"
              data-plotter=""
              className={cn("cnc-plotter border-cnc-line grid border-b", columns)}
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
                    ? "max-w-[62ch] text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.6] font-light text-pretty"
                    : "hidden md:block"
                }
              >
                {row.description}
              </p>
              {showThickness ? (
                <p
                  role="cell"
                  className="text-cnc-muted font-mono text-sm tracking-[0.08em] uppercase tabular-nums md:text-right"
                >
                  {row.thickness ? (
                    <>
                      <span className="md:sr-only">{t("maxThickness")} </span>
                      {row.thickness}
                    </>
                  ) : null}
                </p>
              ) : null}
              {showArea ? (
                <p
                  role="cell"
                  className="text-cnc-muted font-mono text-sm tracking-[0.08em] uppercase tabular-nums md:text-right"
                >
                  {row.area ? (
                    <>
                      <span className="md:sr-only">{t("cuttingArea")} </span>
                      {row.area}
                    </>
                  ) : null}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function columnClass(showThickness: boolean, showArea: boolean) {
  const specs = Number(showThickness) + Number(showArea);
  if (specs === 2) {
    return "items-baseline gap-2 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_9rem_9rem] md:gap-6";
  }
  if (specs === 1) {
    return "items-baseline gap-2 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_11rem] md:gap-6";
  }
  return "items-baseline gap-2 py-4 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:gap-6";
}
