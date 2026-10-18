"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { RegistrationMarks } from "@/components/cnc/registration-marks";
import { siteConfig } from "@/content/site-config";
import { cn } from "@/lib/utils";

const MATERIAL_GROUPS = ["wood", "acrylic", "aluminum"] as const;
type MaterialGroupKey = (typeof MATERIAL_GROUPS)[number];

type SilhouetteExample = {
  id: "example1" | "example2" | "example3";
  /** Single outer or primary toolpath used by both <path pathLength={1}> and CSS offset-path */
  primaryPath: string;
  /** Inner / secondary cut paths that draw simultaneously via pathLength={1} */
  detailPaths: readonly string[];
  /** Optional subtle reference/guide geometry (rendered dashed or muted) */
  guidePaths?: readonly string[];
};

const SILHOUETTES_BY_GROUP: Record<
  MaterialGroupKey,
  readonly [SilhouetteExample, SilhouetteExample, SilhouetteExample]
> = {
  wood: [
    // 1. Mueble o cajonera — 3-drawer cabinet elevation with milled finger pulls and base legs
    {
      id: "example1",
      primaryPath:
        "M 44 20 H 196 V 118 H 182 V 132 H 168 V 118 H 72 V 132 H 58 V 118 H 44 Z",
      detailPaths: [
        "M 54 28 H 186 V 52 H 54 Z",
        "M 54 58 H 186 V 82 H 54 Z",
        "M 54 88 H 186 V 112 H 54 Z",
        "M 104 28 H 136 V 34 H 104 Z",
        "M 104 58 H 136 V 64 H 104 Z",
        "M 104 88 H 136 V 94 H 104 Z",
      ],
      guidePaths: ["M 36 20 H 204", "M 36 132 H 204"],
    },
    // 2. Panel decorativo calado — architectural fretwork panel with rounded slot matrix
    {
      id: "example2",
      primaryPath: "M 42 18 H 198 V 132 H 42 Z",
      detailPaths: [
        // Row 1 of vertical routed capsule cutouts
        "M 58 34 A 7 7 0 0 1 72 34 V 64 A 7 7 0 0 1 58 64 Z",
        "M 86 34 A 7 7 0 0 1 100 34 V 64 A 7 7 0 0 1 86 64 Z",
        "M 114 34 A 7 7 0 0 1 128 34 V 64 A 7 7 0 0 1 114 64 Z",
        "M 142 34 A 7 7 0 0 1 156 34 V 64 A 7 7 0 0 1 142 64 Z",
        "M 170 34 A 7 7 0 0 1 184 34 V 64 A 7 7 0 0 1 170 64 Z",
        // Row 2 of vertical routed capsule cutouts
        "M 58 86 A 7 7 0 0 1 72 86 V 116 A 7 7 0 0 1 58 116 Z",
        "M 86 86 A 7 7 0 0 1 100 86 V 116 A 7 7 0 0 1 86 116 Z",
        "M 114 86 A 7 7 0 0 1 128 86 V 116 A 7 7 0 0 1 114 116 Z",
        "M 142 86 A 7 7 0 0 1 156 86 V 116 A 7 7 0 0 1 142 116 Z",
        "M 170 86 A 7 7 0 0 1 184 86 V 116 A 7 7 0 0 1 170 116 Z",
      ],
      guidePaths: ["M 50 75 H 190"],
    },
    // 3. Plantilla de ensamble — precision box-joint / router jig with alignment slots & bushings
    {
      id: "example3",
      primaryPath:
        "M 34 26 H 60 V 44 H 82 V 26 H 108 V 44 H 132 V 26 H 158 V 44 H 180 V 26 H 206 V 124 H 34 Z",
      detailPaths: [
        // Central router guide window
        "M 74 64 H 166 V 90 H 74 Z",
        // Left & right clamping slots
        "M 52 104 H 96 V 112 H 52 Z",
        "M 144 104 H 188 V 112 H 144 Z",
        // Bushing alignment holes
        "M 54 71 A 6 6 0 1 0 54 83 A 6 6 0 1 0 54 71 Z",
        "M 186 71 A 6 6 0 1 0 186 83 A 6 6 0 1 0 186 71 Z",
      ],
      guidePaths: ["M 120 20 V 130"],
    },
  ],
  acrylic: [
    // 1. Letrero con letras — rounded sign backing plate with standoff mounts and dimensional letters
    {
      id: "example1",
      primaryPath:
        "M 42 28 H 198 A 10 10 0 0 1 208 38 V 112 A 10 10 0 0 1 198 122 H 42 A 10 10 0 0 1 32 112 V 38 A 10 10 0 0 1 42 28 Z",
      detailPaths: [
        // Corner standoff holes
        "M 46 39 A 3.5 3.5 0 1 0 46 46 A 3.5 3.5 0 1 0 46 39 Z",
        "M 194 39 A 3.5 3.5 0 1 0 194 46 A 3.5 3.5 0 1 0 194 39 Z",
        "M 46 104 A 3.5 3.5 0 1 0 46 111 A 3.5 3.5 0 1 0 46 104 Z",
        "M 194 104 A 3.5 3.5 0 1 0 194 111 A 3.5 3.5 0 1 0 194 104 Z",
        // Routed dimensional letters "A B C"
        "M 62 96 L 76 54 H 84 L 98 96 H 89 L 86 86 H 74 L 71 96 Z M 76 78 H 84 L 80 64 Z",
        "M 108 54 H 128 A 9 9 0 0 1 128 73 A 10 10 0 0 1 130 96 H 108 Z M 116 61 V 70 H 126 A 4.5 4.5 0 0 0 126 61 Z M 116 77 V 89 H 127 A 6 6 0 0 0 127 77 Z",
        "M 176 64 A 16 16 0 0 0 150 75 A 16 16 0 0 0 176 86 L 180 92 A 24 24 0 0 1 142 75 A 24 24 0 0 1 180 58 Z",
      ],
      guidePaths: ["M 54 96 H 186"],
    },
    // 2. Display o exhibidor — 3-tier interlocked acrylic retail display stand with slot-fit tabs
    {
      id: "example2",
      primaryPath:
        "M 46 22 H 194 L 206 126 H 34 Z",
      detailPaths: [
        // Top shelf tier with side tab slots
        "M 56 38 H 184 V 52 H 56 Z",
        "M 66 43 H 84 V 47 H 66 Z",
        "M 156 43 H 174 V 47 H 156 Z",
        // Middle shelf tier with side tab slots
        "M 50 68 H 190 V 84 H 50 Z",
        "M 62 74 H 82 V 78 H 62 Z",
        "M 158 74 H 178 V 78 H 158 Z",
        // Lower shelf tier with side tab slots
        "M 44 100 H 196 V 116 H 44 Z",
        "M 58 106 H 78 V 110 H 58 Z",
        "M 162 106 H 182 V 110 H 162 Z",
      ],
      guidePaths: ["M 120 16 V 132"],
    },
    // 3. Cubierta o pieza de Corian — solid-surface vanity countertop with integrated basin & drain grooves
    {
      id: "example3",
      primaryPath:
        "M 32 24 H 208 A 6 6 0 0 1 214 30 V 120 A 6 6 0 0 1 208 126 H 32 A 6 6 0 0 1 26 120 V 30 A 6 6 0 0 1 32 24 Z",
      detailPaths: [
        // Integrated oval/rounded sink cutout
        "M 110 46 H 182 A 12 12 0 0 1 194 58 V 98 A 12 12 0 0 1 182 110 H 110 A 12 12 0 0 1 98 98 V 58 A 12 12 0 0 1 110 46 Z",
        // Faucet hole
        "M 146 31 A 4.5 4.5 0 1 0 146 40 A 4.5 4.5 0 1 0 146 31 Z",
        // Drain hole
        "M 146 72 A 6 6 0 1 0 146 84 A 6 6 0 1 0 146 72 Z",
        // Milled drainboard grooves on left side
        "M 44 56 H 84",
        "M 44 68 H 84",
        "M 44 80 H 84",
        "M 44 92 H 84",
      ],
      guidePaths: ["M 146 20 V 130", "M 92 78 H 200"],
    },
  ],
  aluminum: [
    // 1. Placa con logo — chamfered anodized plate with corner countersinks and geometric emblem
    {
      id: "example1",
      primaryPath:
        "M 48 24 H 192 L 206 38 V 112 L 192 126 H 48 L 34 112 V 38 Z",
      detailPaths: [
        // 4 corner countersunk mounting holes
        "M 52 36 A 4 4 0 1 0 52 44 A 4 4 0 1 0 52 36 Z",
        "M 188 36 A 4 4 0 1 0 188 44 A 4 4 0 1 0 188 36 Z",
        "M 52 106 A 4 4 0 1 0 52 114 A 4 4 0 1 0 52 106 Z",
        "M 188 106 A 4 4 0 1 0 188 114 A 4 4 0 1 0 188 106 Z",
        // Central engraved geometric mark (isometric hex + inner diamond)
        "M 120 44 L 148 60 V 90 L 120 106 L 92 90 V 60 Z",
        "M 120 58 L 136 75 L 120 92 L 104 75 Z",
      ],
      guidePaths: ["M 70 75 H 170", "M 120 34 V 116"],
    },
    // 2. Letra corpórea — precision-routed dimensional letter "A" with counter and stud-mount points
    {
      id: "example2",
      primaryPath:
        "M 108 18 H 132 L 178 130 H 150 L 140 104 H 100 L 90 130 H 62 Z",
      detailPaths: [
        // Inner counter triangle
        "M 120 44 L 134 84 H 106 Z",
        // Rear threaded stud-mount points
        "M 120 26 A 3 3 0 1 0 120 32 A 3 3 0 1 0 120 26 Z",
        "M 82 114 A 3 3 0 1 0 82 120 A 3 3 0 1 0 82 114 Z",
        "M 158 114 A 3 3 0 1 0 158 120 A 3 3 0 1 0 158 114 Z",
      ],
      guidePaths: [
        "M 112 24 H 128 L 168 124 H 154 L 143 96 H 97 L 86 124 H 72 Z",
      ],
    },
    // 3. Pieza técnica con perforaciones — machined flange bracket with central bearing bore & bolt circle
    {
      id: "example3",
      primaryPath:
        "M 76 20 H 164 L 204 54 V 96 L 164 130 H 76 L 36 96 V 54 Z",
      detailPaths: [
        // Central bearing bore
        "M 120 51 A 24 24 0 1 0 120 99 A 24 24 0 1 0 120 51 Z",
        // 4 bolt-circle holes
        "M 86 34 A 5 5 0 1 0 86 44 A 5 5 0 1 0 86 34 Z",
        "M 154 34 A 5 5 0 1 0 154 44 A 5 5 0 1 0 154 34 Z",
        "M 86 106 A 5 5 0 1 0 86 116 A 5 5 0 1 0 86 106 Z",
        "M 154 106 A 5 5 0 1 0 154 116 A 5 5 0 1 0 154 106 Z",
        // Left & right precision mounting slots
        "M 50 65 A 5 5 0 0 1 60 65 V 85 A 5 5 0 0 1 50 85 Z",
        "M 180 65 A 5 5 0 0 1 190 65 V 85 A 5 5 0 0 1 180 85 Z",
      ],
      guidePaths: [
        "M 120 14 V 136",
        "M 28 75 H 212",
        "M 120 35 A 40 40 0 1 0 120 115 A 40 40 0 1 0 120 35 Z",
      ],
    },
  ],
};

function formatMm(locale: string, value: number) {
  return new Intl.NumberFormat(locale === "en" ? "en" : "es-MX", {
    maximumFractionDigits: 1,
    useGrouping: false,
  }).format(value);
}

export function MaterialsSection() {
  const t = useTranslations("cnc.materials");
  const locale = useLocale();
  const gridRef = useRef<HTMLDivElement>(null);

  const [activeIndices, setActiveIndices] = useState<
    Record<MaterialGroupKey, number>
  >({
    wood: 0,
    acrylic: 0,
    aluminum: 0,
  });

  const [traceKeys, setTraceKeys] = useState<Record<MaterialGroupKey, number>>({
    wood: 0,
    acrylic: 0,
    aluminum: 0,
  });

  const [inView, setInView] = useState(false);
  const hasEnteredViewportRef = useRef(false);
  const pointerDownTypeRef = useRef<string | null>(null);

  // Plotter reveal for cards on first scroll into view
  useLayoutEffect(() => {
    const root = gridRef.current;
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
  }, []);

  // Viewport observer: runs initial cut trace once when entering viewport, pauses animations when offscreen
  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setInView(entry.isIntersecting);

        if (entry.isIntersecting && !hasEnteredViewportRef.current) {
          hasEnteredViewportRef.current = true;
          if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setTraceKeys({
              wood: 1,
              acrylic: 1,
              aluminum: 1,
            });
          }
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const retraceCurrent = (group: MaterialGroupKey) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setTraceKeys((prev) => ({
      ...prev,
      [group]: prev[group] + 1,
    }));
  };

  const advanceExample = (group: MaterialGroupKey) => {
    setActiveIndices((prev) => ({
      ...prev,
      [group]: (prev[group] + 1) % 3,
    }));
    setTraceKeys((prev) => ({
      ...prev,
      [group]: prev[group] + 1,
    }));
  };

  const specs = siteConfig.cncSpecs;

  return (
    <section
      id="materiales"
      aria-labelledby="materials-title"
      className="relative scroll-mt-24 px-5 py-16 md:px-8 md:py-24 lg:py-32"
    >
      <RegistrationMarks />
      <div className="relative mx-auto w-full max-w-[1200px]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2
            id="materials-title"
            className="max-w-[16ch] text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.02em] text-balance"
          >
            {t("title")}
          </h2>
          <p className="text-cnc-muted font-mono text-xs tracking-[0.08em] uppercase">
            {t("ideasTitle")}
          </p>
        </div>

        <div
          ref={gridRef}
          data-in-view={inView ? "true" : "false"}
          className="mt-10 grid grid-cols-1 gap-4 md:mt-14 md:grid-cols-3 md:gap-5"
        >
          {MATERIAL_GROUPS.map((group, groupIndex) => {
            const range = specs?.maxThicknessByMaterial.find(
              (item) => item.group === group,
            );
            const thicknessLabel = range
              ? t("thicknessValue", {
                  min: formatMm(locale, range.minMm),
                  max: formatMm(locale, range.maxMm),
                })
              : null;

            const activeIdx = activeIndices[group];
            const examples = SILHOUETTES_BY_GROUP[group];
            const currentExample = examples[activeIdx] ?? examples[0];
            const traceKey = traceKeys[group];
            const isCutting = traceKey > 0;
            const groupNumber = String(groupIndex + 1).padStart(2, "0");
            const exampleCounter = `${String(activeIdx + 1).padStart(2, "0")} / 03`;
            const exampleName = t(`groups.${group}.${currentExample.id}`);

            return (
              <button
                key={group}
                type="button"
                data-plotter=""
                onPointerDown={(e) => {
                  pointerDownTypeRef.current = e.pointerType;
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") {
                    retraceCurrent(group);
                  }
                }}
                onFocus={(e) => {
                  // Only retrace on keyboard focus-visible, not when focus comes from a click/tap
                  if (
                    pointerDownTypeRef.current === null &&
                    e.currentTarget.matches(":focus-visible")
                  ) {
                    retraceCurrent(group);
                  }
                  pointerDownTypeRef.current = null;
                }}
                onClick={() => {
                  pointerDownTypeRef.current = null;
                  advanceExample(group);
                }}
                style={{ transitionDelay: `${groupIndex * 70}ms` }}
                className={cn(
                  "cnc-plotter group border-cnc-line bg-cnc-surface/65 hover:border-cnc-muted/60 focus-visible:ring-cnc-white relative flex w-full cursor-pointer flex-col justify-between rounded-[var(--radius-card)] border p-5 text-left transition-colors duration-[var(--duration-ui)] focus-visible:ring-2 focus-visible:outline-none md:p-6",
                )}
              >
                {/* Header: Group Index + Thickness Badge + Group Name */}
                <div className="w-full">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-cnc-muted font-mono text-xs tracking-[0.08em] uppercase tabular-nums">
                      {groupNumber}
                    </span>
                    {thicknessLabel ? (
                      <span className="border-cnc-line bg-cnc-bg/80 text-cnc-muted rounded-[var(--radius-control)] border px-2 py-0.5 font-mono text-xs tracking-[0.06em] uppercase tabular-nums">
                        {thicknessLabel}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-cnc-text mt-3 text-[clamp(1.125rem,1.5vw,1.25rem)] leading-[1.3] font-medium text-pretty">
                    {t(`groups.${group}.name`)}
                  </h3>
                </div>

                {/* CAD Bed Canvas with SVG Silhouette + Synchronized CSS Offset-Path Toolhead */}
                <div
                  key={`${group}-${activeIdx}-${traceKey}`}
                  data-cutting={isCutting ? "true" : "false"}
                  aria-hidden="true"
                  className="cnc-cut-bed border-cnc-line/80 bg-cnc-bg/90 relative my-5 aspect-[8/5] w-full overflow-hidden rounded-[var(--radius-control)] border"
                >
                  {/* Corner bed ticks */}
                  <span className="border-cnc-muted/40 pointer-events-none absolute top-2 left-2 size-2 border-t border-l" />
                  <span className="border-cnc-muted/40 pointer-events-none absolute top-2 right-2 size-2 border-t border-r" />
                  <span className="border-cnc-muted/40 pointer-events-none absolute bottom-2 left-2 size-2 border-b border-l" />
                  <span className="border-cnc-muted/40 pointer-events-none absolute right-2 bottom-2 size-2 border-r border-b" />

                  <svg
                    viewBox="0 0 240 150"
                    aria-hidden="true"
                    className="h-full w-full"
                  >
                    {/* Faint base blueprint paths (always visible so there is zero layout shift and clear context) */}
                    {currentExample.guidePaths?.map((d, idx) => (
                      <path
                        key={`guide-${idx}`}
                        d={d}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        vectorEffect="non-scaling-stroke"
                        className="text-cnc-line"
                      />
                    ))}

                    <path
                      d={currentExample.primaryPath}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      className="text-cnc-line/90"
                    />

                    {currentExample.detailPaths.map((d, idx) => (
                      <path
                        key={`base-detail-${idx}`}
                        d={d}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        className="text-cnc-line/90"
                      />
                    ))}

                    {/* Active CNC Cut Paths (animated via stroke-dashoffset 1 -> 0) */}
                    <path
                      d={currentExample.primaryPath}
                      pathLength={1}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      className="cnc-cut-path text-cnc-white"
                    />

                    {currentExample.detailPaths.map((d, idx) => (
                      <path
                        key={`cut-detail-${idx}`}
                        d={d}
                        pathLength={1}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        className="cnc-cut-path text-cnc-text"
                      />
                    ))}

                    {/* Synchronized CNC Toolhead moving along primaryPath via CSS Motion Path */}
                    <g
                      className="cnc-toolhead"
                      style={{
                        offsetPath: `path("${currentExample.primaryPath}")`,
                      }}
                    >
                      <circle
                        r="5.5"
                        className="fill-cnc-white/15 stroke-cnc-white/60"
                        strokeWidth="1"
                      />
                      <circle r="2.25" className="fill-cnc-white" />
                      <path
                        d="M -8 0 H -4 M 4 0 H 8 M 0 -8 V -4 M 0 4 V 8"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-cnc-white/75"
                      />
                    </g>
                  </svg>
                </div>

                {/* Footer: Example counter + Polite live region for example name + Step dots */}
                <div className="border-cnc-line/80 flex w-full items-center justify-between gap-3 border-t pt-3.5">
                  <div className="flex min-w-0 items-baseline gap-2.5">
                    <span className="text-cnc-muted shrink-0 font-mono text-xs tracking-[0.06em] uppercase tabular-nums">
                      {exampleCounter}
                    </span>
                    <span
                      aria-live="polite"
                      aria-atomic="true"
                      className="text-cnc-text truncate text-sm font-medium"
                    >
                      {exampleName}
                    </span>
                  </div>

                  {/* 3-step indicator */}
                  <span
                    aria-hidden="true"
                    className="flex shrink-0 items-center gap-1.5"
                  >
                    {[0, 1, 2].map((dotIdx) => (
                      <span
                        key={dotIdx}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-[var(--duration-ui)]",
                          dotIdx === activeIdx
                            ? "bg-cnc-white w-4"
                            : "bg-cnc-line group-hover:bg-cnc-muted/50 w-1.5",
                        )}
                      />
                    ))}
                  </span>
                </div>

                <span className="sr-only">{t("nextIdea")}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
