"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { RegistrationMarks } from "@/components/cnc/registration-marks";
import {
  cncMaterialLabel,
  hasCncCapabilities,
  isCncMaterialKey,
  siteConfig,
} from "@/content/site-config";
import { formatSpecMm } from "@/lib/cnc-specs";
import { cn } from "@/lib/utils";

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
      className={cn(
        "relative overflow-hidden lg:scroll-mt-[-6rem] lg:px-8",
        !machineImage && "px-5 py-14 md:px-8 md:py-20 lg:py-24",
      )}
    >
      <RegistrationMarks className="z-20" />

      {machineImage ? (
        <div className="cnc-capabilities-mask-mobile relative aspect-[4/3] w-full overflow-hidden lg:hidden">
          <Image
            src={machineImage.src}
            alt={imageAlt}
            fill
            loading="lazy"
            sizes="100vw"
            className="object-cover object-[50%_52%]"
          />
          <div className="bg-cnc-bg/25 absolute inset-0" />
        </div>
      ) : null}

      <div
        className={cn(
          "relative z-10 w-full",
          machineImage &&
            "-mt-8 px-5 pb-14 md:-mt-12 md:px-8 md:pb-20 lg:mt-0 lg:p-0",
        )}
      >
        <div
          className={cn(
            "relative mx-auto w-full max-w-[1200px]",
            machineImage && "lg:flex lg:min-h-[480px] lg:items-center lg:py-24",
          )}
        >
          {machineImage ? (
            <div className="cnc-capabilities-mask-desktop pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 lg:block">
              <Image
                src={machineImage.src}
                alt={imageAlt}
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-cover object-[50%_52%]"
              />
              <div className="bg-cnc-bg/25 absolute inset-0" />
            </div>
          ) : null}

          <div className="relative z-10 w-full lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6">
              <h2
                id="capabilities-title"
                className="max-w-[16ch] text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.02em] text-balance lg:max-w-[24ch]"
              >
                {t("title")}
              </h2>
              <div className="mt-10 md:mt-14">
                <div
                  ref={listRef}
                  role="table"
                  aria-labelledby="capabilities-title"
                  className="border-cnc-line w-full border-t"
                >
                  {rows.map((row, index) => (
                    <div
                      key={row.key}
                      role="row"
                      className="cnc-plotter border-cnc-line grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 border-b py-4 md:gap-8"
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
                        className="text-cnc-muted text-right font-mono text-sm tracking-[0.08em] uppercase tabular-nums"
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
            </div>
          </div>
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
        width: formatSpecMm(locale, widthMm),
        length: formatSpecMm(locale, lengthMm),
      }),
    });
  }

  for (const range of specs.maxThicknessByMaterial) {
    if (!isCncMaterialKey(range.group) || range.group === "other") continue;
    rows.push({
      key: range.group,
      label: cncMaterialLabel(range.group, locale),
      value: t("thicknessValue", {
        min: formatSpecMm(locale, range.minMm),
        max: formatSpecMm(locale, range.maxMm),
      }),
    });
  }

  return rows;
}
