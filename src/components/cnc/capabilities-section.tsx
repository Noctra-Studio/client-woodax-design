"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { RegistrationMarks } from "@/components/cnc/registration-marks";
import { hasCncCapabilities, siteConfig } from "@/content/site-config";

export function CapabilitiesSection() {
  const t = useTranslations("cnc.capabilities");
  const locale = useLocale();
  const listRef = useRef<HTMLDivElement>(null);
  const specs = siteConfig.cncSpecs;
  const rows =
    specs && hasCncCapabilities(specs) ? capabilityRows(specs, locale, t) : [];
  const machineImage = specs?.machineImage;
  const imageAlt = machineImage
    ? machineImage.alt[locale === "en" ? "en" : "es"]
    : "";

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

  if (rows.length === 0) return null;

  return (
    <section
      id="capacidades"
      aria-labelledby="capabilities-title"
      className="relative scroll-mt-24 px-5 py-16 md:px-8 md:py-24 lg:py-32"
    >
      <RegistrationMarks />
      <div className="relative mx-auto w-full max-w-[1200px]">
        <h2
          id="capabilities-title"
          className="max-w-[16ch] text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.02em] text-balance"
        >
          {t("title")}
        </h2>
        <div
          className={
            machineImage
              ? "mt-10 grid items-start gap-10 md:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)] lg:gap-12"
              : "mt-10 md:mt-14"
          }
        >
          <div>
            <div
              ref={listRef}
              role="table"
              aria-labelledby="capabilities-title"
              className="border-cnc-line border-t"
            >
              {rows.map((row, index) => (
                <div
                  key={row.key}
                  role="row"
                  className="cnc-plotter border-cnc-line grid items-baseline gap-2 border-b py-4 md:grid-cols-[minmax(0,1fr)_auto] md:gap-8"
                  style={{ transitionDelay: `${index * 70}ms` }}
                >
                  <p
                    role="cell"
                    className="max-w-[62ch] text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.6] font-medium text-pretty"
                  >
                    {row.label}
                  </p>
                  <p
                    role="cell"
                    className="text-cnc-muted font-mono text-sm tracking-[0.08em] uppercase tabular-nums md:text-right"
                  >
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-cnc-muted mt-6 max-w-[62ch] text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.6] font-medium text-pretty">
              {t("note")}
            </p>
          </div>
          {machineImage ? (
            <div className="border-cnc-line bg-cnc-surface overflow-hidden rounded-[var(--radius-card)] border">
              <Image
                src={machineImage.src}
                alt={imageAlt}
                width={machineImage.width}
                height={machineImage.height}
                sizes="(min-width: 1024px) 416px, 100vw"
                className="h-auto w-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function capabilityRows(
  specs: NonNullable<typeof siteConfig.cncSpecs>,
  locale: string,
  t: ReturnType<typeof useTranslations<"cnc.capabilities">>,
) {
  const rows: { key: string; label: string; value: string }[] = [];
  const { widthMm, lengthMm } = specs.cuttingArea;

  if (widthMm > 0 && lengthMm > 0) {
    rows.push({
      key: "area",
      label: t("area"),
      value: t("areaValue", {
        width: formatMm(locale, widthMm),
        length: formatMm(locale, lengthMm),
      }),
    });
  }

  const list = new Intl.ListFormat(locale === "en" ? "en" : "es-MX", {
    type: "conjunction",
    style: "long",
  });

  for (const range of specs.maxThicknessByMaterial) {
    if (range.materials.length === 0) continue;
    const formatted = list.format(
      range.materials.map((material) => t(`materials.${material}`)),
    );
    rows.push({
      key: range.group,
      label: formatted.charAt(0).toUpperCase() + formatted.slice(1),
      value: t("thicknessValue", {
        min: formatMm(locale, range.minMm),
        max: formatMm(locale, range.maxMm),
      }),
    });
  }

  return rows;
}

function formatMm(locale: string, value: number) {
  return new Intl.NumberFormat(locale === "en" ? "en" : "es-MX", {
    maximumFractionDigits: 1,
    useGrouping: false,
  }).format(value);
}
