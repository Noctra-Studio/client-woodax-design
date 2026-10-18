"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { RegistrationMarks } from "@/components/cnc/registration-marks";
import { siteConfig, type CncSpecs } from "@/content/site-config";
import { cn } from "@/lib/utils";

type MaterialGroupKey = "wood" | "acrylic" | "aluminum";
type ExampleKey = "example1" | "example2" | "example3";

type SilhouetteDef = {
  key: ExampleKey;
  /** Single closed path (1.5px) traced by the CNC toolhead */
  cutPath: string;
  /** Secondary finished interior cutouts / pockets (1px, cnc-muted) */
  innerPaths: readonly string[];
  /** Dashed reference / toolpath offset / centerline guides (1px dashed, cnc-line) */
  guidePaths?: readonly string[];
  /** Drill / standoff crosshairs [cx, cy, r] */
  holes?: readonly (readonly [number, number, number])[];
};

const GROUPS: readonly {
  key: MaterialGroupKey;
  indexLabel: string;
  examples: readonly SilhouetteDef[];
}[] = [
  {
    key: "wood",
    indexLabel: "01",
    examples: [
      {
        // 1. Mueble o cajonera — Alzado frontal técnico de credenza/cajonera de 3 cajones con patas en escuadra
        key: "example1",
        cutPath:
          "M 46 22 H 194 A 2 2 0 0 1 196 24 V 112 A 2 2 0 0 1 194 114 H 182 V 130 H 170 V 114 H 70 V 130 H 58 V 114 H 46 A 2 2 0 0 1 44 112 V 24 A 2 2 0 0 1 46 22 Z",
        innerPaths: [
          // Espesor de casco interior y 3 frentes de cajón
          "M 51 29 H 189 V 52 H 51 Z",
          "M 51 56 H 189 V 79 H 51 Z",
          "M 51 83 H 189 V 107 H 51 Z",
          // Uñeros fresados al centro de cada frente
          "M 104 29 V 34 A 3 3 0 0 0 107 37 H 133 A 3 3 0 0 0 136 34 V 29",
          "M 104 56 V 61 A 3 3 0 0 0 107 64 H 133 A 3 3 0 0 0 136 61 V 56",
          "M 104 83 V 88 A 3 3 0 0 0 107 91 H 133 A 3 3 0 0 0 136 88 V 83",
        ],
        guidePaths: [
          "M 34 22 V 130",
          "M 31 22 H 37 M 31 114 H 37 M 31 130 H 37",
          "M 120 16 V 134",
        ],
      },
      {
        // 2. Panel decorativo calado — Tablero arquitectónico con celosía geométrica de ranuras oblongas
        key: "example2",
        cutPath:
          "M 44 20 H 196 A 3 3 0 0 1 199 23 V 127 A 3 3 0 0 1 196 130 H 44 A 3 3 0 0 1 41 127 V 23 A 3 3 0 0 1 44 20 Z",
        innerPaths: [
          // Fila superior de calados
          "M 60 36 A 5 5 0 0 1 70 36 V 58 A 5 5 0 0 1 60 58 Z",
          "M 82 36 A 5 5 0 0 1 92 36 V 72 A 5 5 0 0 1 82 72 Z",
          "M 104 36 A 5 5 0 0 1 114 36 V 58 A 5 5 0 0 1 104 58 Z",
          "M 126 36 A 5 5 0 0 1 136 36 V 72 A 5 5 0 0 1 126 72 Z",
          "M 148 36 A 5 5 0 0 1 158 36 V 58 A 5 5 0 0 1 148 58 Z",
          "M 170 36 A 5 5 0 0 1 180 36 V 72 A 5 5 0 0 1 170 72 Z",
          // Fila inferior alternada
          "M 60 78 A 5 5 0 0 1 70 78 V 114 A 5 5 0 0 1 60 114 Z",
          "M 82 92 A 5 5 0 0 1 92 92 V 114 A 5 5 0 0 1 82 114 Z",
          "M 104 78 A 5 5 0 0 1 114 78 V 114 A 5 5 0 0 1 104 114 Z",
          "M 126 92 A 5 5 0 0 1 136 92 V 114 A 5 5 0 0 1 126 114 Z",
          "M 148 78 A 5 5 0 0 1 158 78 V 114 A 5 5 0 0 1 148 114 Z",
          "M 170 92 A 5 5 0 0 1 180 92 V 114 A 5 5 0 0 1 170 114 Z",
        ],
        guidePaths: ["M 49 27 H 191 V 123 H 49 Z"],
      },
      {
        // 3. Plantilla de ensamble — Jig de router con peine de ensamble recto y ranuras de prensa
        key: "example3",
        cutPath:
          "M 38 42 H 60 V 24 H 78 V 42 H 96 V 24 H 114 V 42 H 126 V 24 H 144 V 42 H 162 V 24 H 180 V 42 H 202 V 114 H 170 V 128 H 70 V 114 H 38 Z",
        innerPaths: [
          // Ventana central de copiador para fresa con balero
          "M 90 58 H 150 A 4 4 0 0 1 154 62 V 82 A 4 4 0 0 1 150 86 H 90 A 4 4 0 0 1 86 82 V 62 A 4 4 0 0 1 90 58 Z",
          // Ranuras oblongas de sujeción (prensas)
          "M 56 96 H 84 A 4 4 0 0 1 84 104 H 56 A 4 4 0 0 1 56 96 Z",
          "M 156 96 H 184 A 4 4 0 0 1 184 104 H 156 A 4 4 0 0 1 156 96 Z",
        ],
        guidePaths: ["M 32 72 H 208", "M 120 18 V 132"],
        holes: [
          [60, 72, 6],
          [180, 72, 6],
        ],
      },
    ],
  },
  {
    key: "acrylic",
    indexLabel: "02",
    examples: [
      {
        // 1. Letrero con letras — Placa de señalética comercial con letras corpóreas fresadas y chapetones
        key: "example1",
        cutPath:
          "M 46 28 H 194 A 10 10 0 0 1 204 38 V 112 A 10 10 0 0 1 194 122 H 46 A 10 10 0 0 1 36 112 V 38 A 10 10 0 0 1 46 28 Z",
        innerPaths: [
          // Letra "A" geométrica + calado interior
          "M 76 54 H 88 L 100 96 H 90 L 87 86 H 77 L 74 96 H 64 Z",
          "M 82 64 L 85 78 H 79 Z",
          // Letra "B" geométrica + calados interiores
          "M 108 54 H 127 A 9 9 0 0 1 127 74 A 10 10 0 0 1 128 96 H 108 Z",
          "M 116 61 H 124 A 4 4 0 0 1 124 70 H 116 Z",
          "M 116 78 H 125 A 5 5 0 0 1 125 89 H 116 Z",
          // Letra "C" geométrica
          "M 174 64 H 164 A 10 10 0 0 0 154 75 A 10 10 0 0 0 164 86 H 174 V 96 H 163 A 18 21 0 0 1 144 75 A 18 21 0 0 1 163 54 H 174 Z",
        ],
        guidePaths: ["M 44 54 H 196", "M 44 96 H 196", "M 120 22 V 128"],
        holes: [
          [50, 42, 4],
          [190, 42, 4],
          [50, 108, 4],
          [190, 108, 4],
        ],
      },
      {
        // 2. Display o exhibidor — Exhibidor de mostrador con laterales encastrables (slot-fit) y 3 repisas
        key: "example2",
        cutPath:
          "M 56 26 H 184 A 6 6 0 0 1 190 32 V 52 H 198 V 64 H 190 V 84 H 198 V 96 H 190 V 116 H 198 V 126 H 174 V 118 H 66 V 126 H 42 V 116 H 50 V 96 H 42 V 84 H 50 V 64 H 42 V 52 H 50 V 32 A 6 6 0 0 1 56 26 Z",
        innerPaths: [
          // Cabezal / porta-marca superior calado
          "M 84 34 H 156 A 3 3 0 0 1 156 42 H 84 A 3 3 0 0 1 84 34 Z",
          // 3 repisas horizontales con pestañas de encastre (slot-fit)
          "M 50 54 H 190 V 62 H 50 Z",
          "M 50 86 H 190 V 94 H 50 Z",
          "M 50 112 H 190 V 118 H 50 Z",
          // Mortajas de encastre visibles en cada repisa
          "M 66 54 V 62 M 174 54 V 62",
          "M 66 86 V 94 M 174 86 V 94",
        ],
        guidePaths: ["M 120 18 V 132", "M 66 26 V 126", "M 174 26 V 126"],
      },
      {
        // 3. Cubierta o pieza de Corian — Planta de cubierta sólida con tarja integrada y canales de escurridor
        key: "example3",
        cutPath:
          "M 38 26 H 202 A 4 4 0 0 1 206 30 V 120 A 4 4 0 0 1 202 124 H 38 A 4 4 0 0 1 34 120 V 30 A 4 4 0 0 1 38 26 Z",
        innerPaths: [
          // Tarja submontada con radio higiénico Corian
          "M 122 46 H 186 A 8 8 0 0 1 194 54 V 104 A 8 8 0 0 1 186 112 H 122 A 8 8 0 0 1 114 104 V 54 A 8 8 0 0 1 122 46 Z",
          // Rebaje perimetral de tarja
          "M 120 42 H 188 A 11 11 0 0 1 199 53 V 105 A 11 11 0 0 1 188 116 H 120 A 11 11 0 0 1 109 105 V 53 A 11 11 0 0 1 120 42 Z",
          // Canales de escurridor fresados con fresa esférica
          "M 48 52 H 98 A 2.5 2.5 0 0 1 98 57 H 48 A 2.5 2.5 0 0 1 48 52 Z",
          "M 48 66 H 98 A 2.5 2.5 0 0 1 98 71 H 48 A 2.5 2.5 0 0 1 48 66 Z",
          "M 48 80 H 98 A 2.5 2.5 0 0 1 98 85 H 48 A 2.5 2.5 0 0 1 48 80 Z",
          "M 48 94 H 98 A 2.5 2.5 0 0 1 98 99 H 48 A 2.5 2.5 0 0 1 48 94 Z",
        ],
        guidePaths: ["M 154 20 V 128", "M 106 79 H 202"],
        holes: [
          [154, 34, 4],
          [154, 79, 7],
        ],
      },
    ],
  },
  {
    key: "aluminum",
    indexLabel: "03",
    examples: [
      {
        // 1. Placa con logo — Placa achaflanada a 45° con barrenos avellanados e isotipo geométrico grabado
        key: "example1",
        cutPath:
          "M 54 26 H 186 L 200 40 V 110 L 186 124 H 54 L 40 110 V 40 Z",
        innerPaths: [
          // Isotipo geométrico central grabado en aluminio
          "M 120 44 L 148 60 V 90 L 120 106 L 92 90 V 60 Z",
          "M 120 53 L 139 64 V 86 L 120 97 L 101 86 V 64 Z",
          "M 120 53 V 75 L 139 86 M 120 75 L 101 86",
          // Marco interior grabado
          "M 58 34 H 182 L 192 44 V 106 L 182 116 H 58 L 48 106 V 44 Z",
        ],
        guidePaths: ["M 120 20 V 130", "M 34 75 H 206"],
        holes: [
          [60, 44, 4.5],
          [180, 44, 4.5],
          [60, 106, 4.5],
          [180, 106, 4.5],
        ],
      },
      {
        // 2. Letra corpórea — Letra "A" arquitectónica en aluminio con puente interior y postes de fijación
        key: "example2",
        cutPath:
          "M 105 20 H 135 L 178 128 H 148 L 139 102 H 101 L 92 128 H 62 Z",
        innerPaths: [
          // Calado triangular interior de la "A"
          "M 120 46 L 134 84 H 106 Z",
        ],
        guidePaths: [
          // Trayectoria de compensación de herramienta (offset interior) y ejes
          "M 110 28 H 130 L 166 120 H 153 L 143 94 H 97 L 87 120 H 74 Z",
          "M 120 14 V 134",
          "M 50 128 H 190",
        ],
        holes: [
          [120, 34, 3.5],
          [98, 92, 3.5],
          [142, 92, 3.5],
          [77, 118, 3.5],
          [163, 118, 3.5],
        ],
      },
      {
        // 3. Pieza técnica con perforaciones — Brida mecánica en aluminio con alojamiento de rodamiento y ranuras
        key: "example3",
        cutPath:
          "M 82 22 H 158 L 170 46 H 200 V 104 H 170 L 158 128 H 82 L 70 104 H 40 V 46 H 70 Z",
        innerPaths: [
          // Alojamiento circular central de precisión
          "M 120 51 A 24 24 0 1 0 120 99 A 24 24 0 1 0 120 51 Z",
          // Ranuras oblongas laterales en las orejas de sujeción
          "M 51 60 A 4.5 4.5 0 0 1 60 60 V 90 A 4.5 4.5 0 0 1 51 90 Z",
          "M 180 60 A 4.5 4.5 0 0 1 189 60 V 90 A 4.5 4.5 0 0 1 180 90 Z",
        ],
        guidePaths: [
          // Círculo de paso (bolt circle) y ejes de simetría X/Y
          "M 120 37 A 38 38 0 1 0 120 113 A 38 38 0 1 0 120 37 Z",
          "M 120 16 V 134",
          "M 32 75 H 208",
        ],
        holes: [
          [93, 48, 4.5],
          [147, 48, 4.5],
          [93, 102, 4.5],
          [147, 102, 4.5],
        ],
      },
    ],
  },
] as const;

export function MaterialsSection() {
  const t = useTranslations("cnc.materials");
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [activeIndices, setActiveIndices] = useState<
    Record<MaterialGroupKey, number>
  >({
    wood: 0,
    acrylic: 0,
    aluminum: 0,
  });

  // 0 = idle (solid contour), >0 = animated cut pass (key increments to restart CSS animation)
  const [cutRuns, setCutRuns] = useState<Record<MaterialGroupKey, number>>({
    wood: 0,
    acrylic: 0,
    aluminum: 0,
  });

  const [inView, setInView] = useState(true);
  const pointerDownRef = useRef(false);

  const specs = siteConfig.cncSpecs;

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

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let mobilePlayedOnce = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        setInView(entry.isIntersecting);

        if (
          entry.isIntersecting &&
          !mobilePlayedOnce &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
          window.matchMedia("(hover: none), (pointer: coarse), (max-width: 767px)")
            .matches
        ) {
          mobilePlayedOnce = true;
          setCutRuns((prev) => ({
            wood: prev.wood + 1,
            acrylic: prev.acrylic + 1,
            aluminum: prev.aluminum + 1,
          }));
        }
      },
      { threshold: 0.18 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const retraceCurrent = (group: MaterialGroupKey) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setCutRuns((prev) => ({
      ...prev,
      [group]: prev[group] + 1,
    }));
  };

  const advanceExample = (group: MaterialGroupKey) => {
    setActiveIndices((prev) => ({
      ...prev,
      [group]: (prev[group] + 1) % 3,
    }));
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCutRuns((prev) => ({
        ...prev,
        [group]: prev[group] + 1,
      }));
    }
  };

  return (
    <section
      ref={sectionRef}
      id="materiales"
      aria-labelledby="materials-title"
      data-in-view={inView ? "true" : "false"}
      className="relative scroll-mt-24 px-5 py-16 md:px-8 md:py-24 lg:py-32"
    >
      <RegistrationMarks />
      <div className="relative mx-auto w-full max-w-[1200px]">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-8">
          <h2
            id="materials-title"
            className="max-w-[16ch] text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.02em] text-balance"
          >
            {t("title")}
          </h2>
          <p className="text-cnc-muted font-mono text-sm tracking-[0.08em] uppercase">
            {t("ideasTitle")}
          </p>
        </div>

        <div
          ref={gridRef}
          className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-5"
        >
          {GROUPS.map((group, groupIdx) => {
            const activeIdx = activeIndices[group.key];
            const activeExample = group.examples[activeIdx] ?? group.examples[0];
            const runId = cutRuns[group.key];
            const thickness = resolveGroupThickness(
              specs,
              group.key,
              locale,
              t,
            );
            const groupName = t(`groups.${group.key}.name`);
            const exampleLabel = t(
              `groups.${group.key}.${activeExample.key}`,
            );

            return (
              <button
                key={group.key}
                type="button"
                data-plotter=""
                style={{ transitionDelay: `${groupIdx * 70}ms` }}
                onPointerDown={() => {
                  pointerDownRef.current = true;
                }}
                onMouseEnter={() => {
                  if (
                    window.matchMedia("(hover: hover) and (pointer: fine)")
                      .matches
                  ) {
                    retraceCurrent(group.key);
                  }
                }}
                onFocus={(event) => {
                  const fromPointer = pointerDownRef.current;
                  pointerDownRef.current = false;
                  if (
                    !fromPointer &&
                    event.currentTarget.matches(":focus-visible")
                  ) {
                    retraceCurrent(group.key);
                  }
                }}
                onClick={() => {
                  pointerDownRef.current = false;
                  advanceExample(group.key);
                }}
                className={cn(
                  "cnc-plotter group border-cnc-line bg-cnc-surface focus-visible:outline-cnc-white pointer-fine:hover:border-cnc-muted/70 relative flex w-full cursor-pointer flex-col justify-between rounded-[var(--radius-card)] border p-5 text-left transition-colors duration-[var(--duration-ui)] ease-[var(--ease-out)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.99] md:p-6",
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-cnc-muted font-mono text-sm tracking-[0.08em] uppercase tabular-nums">
                      {group.indexLabel}
                    </span>
                    {thickness ? (
                      <span className="border-cnc-line bg-cnc-bg/60 text-cnc-muted rounded-[var(--radius-control)] border px-2 py-0.5 font-mono text-xs tracking-[0.08em] uppercase tabular-nums">
                        {thickness}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-cnc-text mt-3 min-h-[3.2rem] text-[clamp(1.125rem,1.6vw,1.3125rem)] leading-[1.25] font-medium text-balance">
                    {groupName}
                  </h3>
                </div>

                <div
                  aria-hidden="true"
                  data-cutting={runId > 0 ? "true" : "false"}
                  className="cnc-cut-bed border-cnc-line bg-cnc-bg/80 relative my-4 aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-control)] border"
                >
                  <svg
                    viewBox="0 0 240 150"
                    className="h-full w-full"
                    aria-hidden="true"
                  >
                    {/* Corner registration marks (+) inside drawing bed */}
                    <g
                      className="text-cnc-line"
                      stroke="currentColor"
                      strokeWidth="1"
                      fill="none"
                    >
                      <path d="M12 8v8M8 12h8" />
                      <path d="M228 8v8M224 12h8" />
                      <path d="M12 134v8M8 138h8" />
                      <path d="M228 134v8M224 138h8" />
                    </g>

                    {/* Dashed CAD reference guides & toolpath offsets */}
                    {activeExample.guidePaths ? (
                      <g
                        className="text-cnc-line"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        fill="none"
                      >
                        {activeExample.guidePaths.map((d) => (
                          <path key={d} d={d} />
                        ))}
                      </g>
                    ) : null}

                    {/* Base silhouette guide (always faintly present underneath the cut) */}
                    <path
                      d={activeExample.cutPath}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-cnc-muted/35"
                    />

                    {/* Interior cutouts and milled details */}
                    <g
                      className="text-cnc-muted"
                      stroke="currentColor"
                      strokeWidth="1.15"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    >
                      {activeExample.innerPaths.map((d) => (
                        <path key={d} d={d} />
                      ))}
                    </g>

                    {/* Drill holes with center crosshairs */}
                    {activeExample.holes ? (
                      <g
                        className="text-cnc-muted"
                        stroke="currentColor"
                        strokeWidth="1"
                        fill="none"
                      >
                        {activeExample.holes.map(([cx, cy, r]) => (
                          <g key={`${cx}-${cy}`}>
                            <circle cx={cx} cy={cy} r={r} />
                            <path
                              d={`M${cx - (r + 2.5)} ${cy}H${cx + (r + 2.5)}M${cx} ${cy - (r + 2.5)}V${cy + (r + 2.5)}`}
                              className="text-cnc-line"
                            />
                          </g>
                        ))}
                      </g>
                    ) : null}

                    {/* Active cut contour + synchronized toolhead */}
                    <g key={`${activeExample.key}-${runId}`}>
                      <path
                        d={activeExample.cutPath}
                        pathLength={1}
                        className="cnc-cut-path"
                      />
                      <g
                        className="cnc-toolhead"
                        style={{
                          offsetPath: `path("${activeExample.cutPath}")`,
                        }}
                      >
                        <circle
                          r="5"
                          fill="none"
                          stroke="var(--color-cnc-text)"
                          strokeWidth="1"
                          opacity="0.55"
                        />
                        <path
                          d="M-7 0H7M0 -7V7"
                          stroke="var(--color-cnc-text)"
                          strokeWidth="1"
                          opacity="0.75"
                        />
                        <circle r="2.25" fill="var(--color-cnc-white)" />
                      </g>
                    </g>
                  </svg>
                </div>

                <div className="border-cnc-line flex items-center justify-between gap-3 border-t pt-3">
                  <div className="min-w-0">
                    <p className="text-cnc-muted font-mono text-xs tracking-[0.08em] uppercase tabular-nums">
                      {`0${activeIdx + 1} / 03`}
                    </p>
                    <p
                      aria-live="polite"
                      aria-atomic="true"
                      className="text-cnc-text mt-1 truncate text-[clamp(1rem,1.1vw,1.0625rem)] leading-[1.4] font-medium"
                    >
                      {exampleLabel}
                    </p>
                  </div>
                  <div
                    aria-hidden="true"
                    className="flex shrink-0 items-center gap-1.5"
                  >
                    {[0, 1, 2].map((step) => (
                      <span
                        key={step}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-[var(--duration-ui)] ease-[var(--ease-out)]",
                          step === activeIdx
                            ? "bg-cnc-white w-4"
                            : "bg-cnc-line w-1.5",
                        )}
                      />
                    ))}
                  </div>
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

function resolveGroupThickness(
  specs: CncSpecs | undefined,
  groupKey: MaterialGroupKey,
  locale: string,
  t: ReturnType<typeof useTranslations<"cnc.materials">>,
): string | null {
  if (!specs) return null;
  const match =
    specs.maxThicknessByMaterial.find((item) => item.group === groupKey) ??
    (groupKey !== "aluminum"
      ? specs.maxThicknessByMaterial.find((item) => item.group === "panels")
      : undefined);

  if (!match) return null;

  return t("thicknessValue", {
    min: formatMm(locale, match.minMm),
    max: formatMm(locale, match.maxMm),
  });
}

function formatMm(locale: string, value: number) {
  return new Intl.NumberFormat(locale === "en" ? "en" : "es-MX", {
    maximumFractionDigits: 1,
    useGrouping: false,
  }).format(value);
}
