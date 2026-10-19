"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { RegistrationMarks } from "@/components/cnc/registration-marks";
import { cncMaterialLabel, siteConfig } from "@/content/site-config";
import { formatSpecMm } from "@/lib/cnc-specs";
import { cn } from "@/lib/utils";

const MATERIAL_GROUPS = ["wood", "acrylic", "aluminum"] as const;
type MaterialGroupKey = (typeof MATERIAL_GROUPS)[number];

type MaterialFinishKind =
  | "wood-mdf"
  | "wood-ply"
  | "acrylic"
  | "corian"
  | "aluminum";

type SurfaceFeature = {
  d: string;
  fill?: string;
  fillRule?: "nonzero" | "evenodd";
  stroke?: string;
  strokeWidth?: number;
};

type SilhouetteExample = {
  id: "example1" | "example2" | "example3";
  finish: MaterialFinishKind;
  /** Single outer or primary toolpath used by both <path pathLength={1}> and CSS offset-path */
  primaryPath: string;
  /** Through-cut holes/slots punched out of the solid body and shadow via fill-rule="evenodd" */
  throughPaths: readonly string[];
  /** All secondary cut/milled paths that trace simultaneously during the 1.4s cut phase */
  detailPaths: readonly string[];
  /** Optional subtle reference/guide geometry (rendered dashed, dims on finish) */
  guidePaths?: readonly string[];
  /** 3–5 subtle grain, brush, or diagonal sheen lines clipped to the solid piece */
  textureLines?: readonly string[];
  /** Additional crisp highlight line (e.g. brushed aluminum linear highlight or MDF smooth edge) */
  highlightLines?: readonly {
    d: string;
    stroke: string;
    strokeWidth?: number;
  }[];
  /** Layered pockets, drawer fronts, raised letters, or recessed basins in finished state */
  surfaceFeatures?: readonly SurfaceFeature[];
};

const SILHOUETTES_BY_GROUP: Record<
  MaterialGroupKey,
  readonly [SilhouetteExample, SilhouetteExample, SilhouetteExample]
> = {
  wood: [
    // 1. Mueble o cajonera — 3-drawer cabinet elevation in MDF/melamine & wood veneer with milled finger pulls
    {
      id: "example1",
      finish: "wood-mdf",
      primaryPath:
        "M 44 20 H 196 A 2 2 0 0 1 198 22 V 116 A 2 2 0 0 1 196 118 H 182 V 132 H 168 V 118 H 72 V 132 H 58 V 118 H 44 A 2 2 0 0 1 42 116 V 22 A 2 2 0 0 1 44 20 Z",
      throughPaths: [],
      detailPaths: [
        "M 52 28 H 188 V 52 H 52 Z",
        "M 52 57 H 188 V 81 H 52 Z",
        "M 52 86 H 188 V 110 H 52 Z",
        "M 104 28 H 136 V 34 H 104 Z",
        "M 104 57 H 136 V 63 H 104 Z",
        "M 104 86 H 136 V 92 H 104 Z",
      ],
      guidePaths: ["M 30 20 H 210", "M 30 132 H 210", "M 120 12 V 138"],
      surfaceFeatures: [
        // Recessed shadow reveal around the 3 drawer fronts inside the cabinet carcass
        {
          d: "M 50 26 H 190 V 112 H 50 Z",
          fill: "var(--cnc-mat-pocket)",
        },
        // 3 drawer fronts with smooth melamine/MDF perimeter edges
        {
          d: "M 52 28 H 188 V 52 H 52 Z M 52 57 H 188 V 81 H 52 Z M 52 86 H 188 V 110 H 52 Z",
          fill: "url(#cnc-grad-wood)",
          stroke: "var(--cnc-mat-mdf-edge)",
          strokeWidth: 1.2,
        },
        // Recessed CNC-milled finger pulls on each drawer
        {
          d: "M 104 28 H 136 V 35 H 104 Z M 104 57 H 136 V 64 H 104 Z M 104 86 H 136 V 93 H 104 Z",
          fill: "var(--cnc-mat-pocket)",
          stroke: "var(--cnc-mat-mdf-edge)",
          strokeWidth: 0.9,
        },
      ],
      textureLines: [
        "M 56 39 Q 120 34 184 41",
        "M 56 46 Q 118 50 184 44",
        "M 56 69 Q 122 64 184 72",
        "M 56 76 Q 116 79 184 74",
        "M 56 99 Q 118 94 184 102",
      ],
      highlightLines: [
        // Smooth continuous MDF/melamine carcass edge band
        {
          d: "M 44 21.2 H 196 M 44 116.8 H 196",
          stroke: "var(--cnc-mat-mdf-edge)",
          strokeWidth: 1.75,
        },
      ],
    },
    // 2. Panel decorativo calado — architectural fretwork panel with 10 routed capsule cutouts
    {
      id: "example2",
      finish: "wood-mdf",
      primaryPath:
        "M 42 18 H 198 A 2 2 0 0 1 200 20 V 130 A 2 2 0 0 1 198 132 H 42 A 2 2 0 0 1 40 130 V 20 A 2 2 0 0 1 42 18 Z",
      throughPaths: [
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
      detailPaths: [
        "M 58 34 A 7 7 0 0 1 72 34 V 64 A 7 7 0 0 1 58 64 Z",
        "M 86 34 A 7 7 0 0 1 100 34 V 64 A 7 7 0 0 1 86 64 Z",
        "M 114 34 A 7 7 0 0 1 128 34 V 64 A 7 7 0 0 1 114 64 Z",
        "M 142 34 A 7 7 0 0 1 156 34 V 64 A 7 7 0 0 1 142 64 Z",
        "M 170 34 A 7 7 0 0 1 184 34 V 64 A 7 7 0 0 1 170 64 Z",
        "M 58 86 A 7 7 0 0 1 72 86 V 116 A 7 7 0 0 1 58 116 Z",
        "M 86 86 A 7 7 0 0 1 100 86 V 116 A 7 7 0 0 1 86 116 Z",
        "M 114 86 A 7 7 0 0 1 128 86 V 116 A 7 7 0 0 1 114 116 Z",
        "M 142 86 A 7 7 0 0 1 156 86 V 116 A 7 7 0 0 1 142 116 Z",
        "M 170 86 A 7 7 0 0 1 184 86 V 116 A 7 7 0 0 1 170 116 Z",
      ],
      guidePaths: ["M 28 75 H 212", "M 120 10 V 140"],
      textureLines: [
        "M 42 25 Q 118 20 198 26",
        "M 42 50 Q 124 45 198 52",
        "M 42 75 Q 116 80 198 74",
        "M 42 102 Q 122 96 198 104",
        "M 42 125 Q 120 129 198 123",
      ],
      highlightLines: [
        // Smooth routed MDF perimeter edge band
        {
          d: "M 42 19.2 H 198 M 42 130.8 H 198",
          stroke: "var(--cnc-mat-mdf-edge)",
          strokeWidth: 1.6,
        },
      ],
    },
    // 3. Plantilla de ensamble — precision box-joint / router jig in birch plywood
    {
      id: "example3",
      finish: "wood-ply",
      primaryPath:
        "M 34 26 H 60 V 44 H 82 V 26 H 108 V 44 H 132 V 26 H 158 V 44 H 180 V 26 H 206 V 124 H 34 Z",
      throughPaths: [
        // Central router guide window
        "M 74 64 H 166 V 90 H 74 Z",
        // Left & right clamping slots
        "M 52 104 H 96 V 112 H 52 Z",
        "M 144 104 H 188 V 112 H 144 Z",
        // Bushing alignment holes
        "M 54 71 A 6 6 0 1 0 54 83 A 6 6 0 1 0 54 71 Z",
        "M 186 71 A 6 6 0 1 0 186 83 A 6 6 0 1 0 186 71 Z",
      ],
      detailPaths: [
        "M 74 64 H 166 V 90 H 74 Z",
        "M 52 104 H 96 V 112 H 52 Z",
        "M 144 104 H 188 V 112 H 144 Z",
        "M 54 71 A 6 6 0 1 0 54 83 A 6 6 0 1 0 54 71 Z",
        "M 186 71 A 6 6 0 1 0 186 83 A 6 6 0 1 0 186 71 Z",
      ],
      guidePaths: ["M 120 14 V 136", "M 24 77 H 216"],
      surfaceFeatures: [
        // Engraved calibration tick marks along the router copy window
        {
          d: "M 90 58 V 64 M 105 59 V 64 M 120 56 V 64 M 135 59 V 64 M 150 58 V 64",
          stroke: "var(--cnc-mat-wood-grain)",
          strokeWidth: 1.15,
        },
      ],
      textureLines: [
        "M 36 52 Q 118 47 204 54",
        "M 36 69 Q 124 74 204 67",
        "M 36 96 Q 116 91 204 98",
        "M 36 117 Q 122 121 204 115",
      ],
    },
  ],
  acrylic: [
    // 1. Letrero con letras — translucent cast acrylic backing plate with standoff mounts & raised letters
    {
      id: "example1",
      finish: "acrylic",
      primaryPath:
        "M 42 28 H 198 A 10 10 0 0 1 208 38 V 112 A 10 10 0 0 1 198 122 H 42 A 10 10 0 0 1 32 112 V 38 A 10 10 0 0 1 42 28 Z",
      throughPaths: [
        // 4 corner standoff holes
        "M 46 39 A 3.5 3.5 0 1 0 46 46 A 3.5 3.5 0 1 0 46 39 Z",
        "M 194 39 A 3.5 3.5 0 1 0 194 46 A 3.5 3.5 0 1 0 194 39 Z",
        "M 46 104 A 3.5 3.5 0 1 0 46 111 A 3.5 3.5 0 1 0 46 104 Z",
        "M 194 104 A 3.5 3.5 0 1 0 194 111 A 3.5 3.5 0 1 0 194 104 Z",
      ],
      detailPaths: [
        "M 46 39 A 3.5 3.5 0 1 0 46 46 A 3.5 3.5 0 1 0 46 39 Z",
        "M 194 39 A 3.5 3.5 0 1 0 194 46 A 3.5 3.5 0 1 0 194 39 Z",
        "M 46 104 A 3.5 3.5 0 1 0 46 111 A 3.5 3.5 0 1 0 46 104 Z",
        "M 194 104 A 3.5 3.5 0 1 0 194 111 A 3.5 3.5 0 1 0 194 104 Z",
        // Routed dimensional letters "A B C"
        "M 62 96 L 76 54 H 84 L 98 96 H 89 L 86 86 H 74 L 71 96 Z M 76 78 H 84 L 80 64 Z",
        "M 108 54 H 128 A 9 9 0 0 1 128 73 A 10 10 0 0 1 130 96 H 108 Z M 116 61 V 70 H 126 A 4.5 4.5 0 0 0 126 61 Z M 116 77 V 89 H 127 A 6 6 0 0 0 127 77 Z",
        "M 177 60 A 21 21 0 1 0 177 90 L 170.5 83.5 A 12 12 0 1 1 170.5 66.5 Z",
      ],
      guidePaths: ["M 44 54 H 196", "M 44 96 H 196", "M 120 18 V 132"],
      surfaceFeatures: [
        // Dimensional laser/CNC-routed letters "A B C" bonded to the acrylic plate
        {
          d: "M 62 96 L 76 54 H 84 L 98 96 H 89 L 86 86 H 74 L 71 96 Z M 76 78 H 84 L 80 64 Z M 108 54 H 128 A 9 9 0 0 1 128 73 A 10 10 0 0 1 130 96 H 108 Z M 116 61 V 70 H 126 A 4.5 4.5 0 0 0 126 61 Z M 116 77 V 89 H 127 A 6 6 0 0 0 127 77 Z M 177 60 A 21 21 0 1 0 177 90 L 170.5 83.5 A 12 12 0 1 1 170.5 66.5 Z",
          fill: "var(--cnc-mat-acrylic-layer)",
          fillRule: "evenodd",
          stroke: "var(--cnc-mat-acrylic-edge)",
          strokeWidth: 1.25,
        },
      ],
      textureLines: [
        // Diagonal specular sheen lines across the translucent acrylic
        "M 56 122 L 138 28",
        "M 72 122 L 154 28",
        "M 134 122 L 204 42",
      ],
    },
    // 2. Display o exhibidor — 3-tier interlocked translucent acrylic retail display stand with slot-fit tabs
    {
      id: "example2",
      finish: "acrylic",
      primaryPath: "M 46 22 H 194 L 206 126 H 34 Z",
      throughPaths: [
        // Top header handle / branding slot cutout
        "M 96 28 H 144 A 2.5 2.5 0 0 1 144 33 H 96 A 2.5 2.5 0 0 1 96 28 Z",
      ],
      detailPaths: [
        "M 96 28 H 144 A 2.5 2.5 0 0 1 144 33 H 96 A 2.5 2.5 0 0 1 96 28 Z",
        // Top shelf tier with side tab slots
        "M 56 40 H 184 V 54 H 56 Z",
        "M 66 45 H 84 V 49 H 66 Z",
        "M 156 45 H 174 V 49 H 156 Z",
        // Middle shelf tier with side tab slots
        "M 50 70 H 190 V 86 H 50 Z",
        "M 62 76 H 82 V 80 H 62 Z",
        "M 158 76 H 178 V 80 H 158 Z",
        // Lower shelf tier with side tab slots
        "M 44 100 H 196 V 116 H 44 Z",
        "M 58 106 H 78 V 110 H 58 Z",
        "M 162 106 H 182 V 110 H 162 Z",
      ],
      guidePaths: ["M 120 14 V 134", "M 28 78 H 212"],
      surfaceFeatures: [
        // 3 horizontal translucent acrylic shelves (overlapping acrylic doubles opacity)
        {
          d: "M 56 40 H 184 V 54 H 56 Z M 50 70 H 190 V 86 H 50 Z M 44 100 H 196 V 116 H 44 Z",
          fill: "var(--cnc-mat-acrylic-layer)",
          stroke: "var(--cnc-mat-acrylic-edge)",
          strokeWidth: 1.15,
        },
        // Interlocking slot-fit tenons (triple-edge brightness)
        {
          d: "M 66 45 H 84 V 49 H 66 Z M 156 45 H 174 V 49 H 156 Z M 62 76 H 82 V 80 H 62 Z M 158 76 H 178 V 80 H 158 Z M 58 106 H 78 V 110 H 58 Z M 162 106 H 182 V 110 H 162 Z",
          fill: "var(--cnc-mat-acrylic-sheen)",
          stroke: "var(--cnc-mat-acrylic-edge)",
          strokeWidth: 0.95,
        },
      ],
      textureLines: [
        "M 52 126 L 136 22",
        "M 68 126 L 152 22",
        "M 132 126 L 198 44",
      ],
    },
    // 3. Cubierta o pieza de Corian — matte white solid-surface vanity countertop with integrated basin & drain grooves
    {
      id: "example3",
      finish: "corian",
      primaryPath:
        "M 32 24 H 208 A 6 6 0 0 1 214 30 V 120 A 6 6 0 0 1 208 126 H 32 A 6 6 0 0 1 26 120 V 30 A 6 6 0 0 1 32 24 Z",
      throughPaths: [
        // Faucet hole (through-cut to bed)
        "M 146 30.5 A 4.5 4.5 0 1 0 146 39.5 A 4.5 4.5 0 1 0 146 30.5 Z",
        // Drain hole (through-cut to bed)
        "M 146 72 A 6 6 0 1 0 146 84 A 6 6 0 1 0 146 72 Z",
      ],
      detailPaths: [
        // Integrated oval/rounded sink cutout
        "M 110 46 H 182 A 12 12 0 0 1 194 58 V 98 A 12 12 0 0 1 182 110 H 110 A 12 12 0 0 1 98 98 V 58 A 12 12 0 0 1 110 46 Z",
        // Faucet hole
        "M 146 30.5 A 4.5 4.5 0 1 0 146 39.5 A 4.5 4.5 0 1 0 146 30.5 Z",
        // Drain hole
        "M 146 72 A 6 6 0 1 0 146 84 A 6 6 0 1 0 146 72 Z",
        // Milled drainboard grooves on left side
        "M 44 54 H 84 A 2 2 0 0 1 84 58 H 44 A 2 2 0 0 1 44 54 Z",
        "M 44 67 H 84 A 2 2 0 0 1 84 71 H 44 A 2 2 0 0 1 44 67 Z",
        "M 44 80 H 84 A 2 2 0 0 1 84 84 H 44 A 2 2 0 0 1 44 80 Z",
        "M 44 93 H 84 A 2 2 0 0 1 84 97 H 44 A 2 2 0 0 1 44 93 Z",
      ],
      guidePaths: ["M 146 16 V 134", "M 90 78 H 204"],
      surfaceFeatures: [
        // Recessed thermoformed/routed Corian sink basin (with drain hole punched out via evenodd)
        {
          d: "M 110 46 H 182 A 12 12 0 0 1 194 58 V 98 A 12 12 0 0 1 182 110 H 110 A 12 12 0 0 1 98 98 V 58 A 12 12 0 0 1 110 46 Z M 146 72 A 6 6 0 1 0 146 84 A 6 6 0 1 0 146 72 Z",
          fill: "url(#cnc-grad-corian-basin)",
          fillRule: "evenodd",
          stroke: "var(--cnc-mat-corian-edge)",
          strokeWidth: 1.2,
        },
        // 4 ball-end milled drainboard channels
        {
          d: "M 44 54 H 84 A 2 2 0 0 1 84 58 H 44 A 2 2 0 0 1 44 54 Z M 44 67 H 84 A 2 2 0 0 1 84 71 H 44 A 2 2 0 0 1 44 67 Z M 44 80 H 84 A 2 2 0 0 1 84 84 H 44 A 2 2 0 0 1 44 80 Z M 44 93 H 84 A 2 2 0 0 1 84 97 H 44 A 2 2 0 0 1 44 93 Z",
          fill: "var(--cnc-mat-corian-groove)",
        },
      ],
    },
  ],
  aluminum: [
    // 1. Placa con logo — chamfered brushed aluminum plate with corner countersinks and geometric emblem
    {
      id: "example1",
      finish: "aluminum",
      primaryPath:
        "M 48 24 H 192 L 206 38 V 112 L 192 126 H 48 L 34 112 V 38 Z",
      throughPaths: [
        // 4 corner countersunk mounting holes
        "M 52 36 A 4 4 0 1 0 52 44 A 4 4 0 1 0 52 36 Z",
        "M 188 36 A 4 4 0 1 0 188 44 A 4 4 0 1 0 188 36 Z",
        "M 52 106 A 4 4 0 1 0 52 114 A 4 4 0 1 0 52 106 Z",
        "M 188 106 A 4 4 0 1 0 188 114 A 4 4 0 1 0 188 106 Z",
      ],
      detailPaths: [
        "M 52 36 A 4 4 0 1 0 52 44 A 4 4 0 1 0 52 36 Z",
        "M 188 36 A 4 4 0 1 0 188 44 A 4 4 0 1 0 188 36 Z",
        "M 52 106 A 4 4 0 1 0 52 114 A 4 4 0 1 0 52 106 Z",
        "M 188 106 A 4 4 0 1 0 188 114 A 4 4 0 1 0 188 106 Z",
        // Central engraved geometric mark (isometric hex + inner diamond)
        "M 120 44 L 148 60 V 90 L 120 106 L 92 90 V 60 Z",
        "M 120 58 L 136 75 L 120 92 L 104 75 Z",
      ],
      guidePaths: ["M 24 75 H 216", "M 120 14 V 136"],
      surfaceFeatures: [
        // CNC-engraved geometric emblem pocket (evenodd ring between hex and diamond)
        {
          d: "M 120 44 L 148 60 V 90 L 120 106 L 92 90 V 60 Z M 120 58 L 136 75 L 120 92 L 104 75 Z",
          fill: "var(--cnc-mat-alu-engraved)",
          fillRule: "evenodd",
          stroke: "var(--cnc-mat-alu-edge)",
          strokeWidth: 1.15,
        },
      ],
      textureLines: [
        "M 36 42 H 204",
        "M 36 58 H 204",
        "M 36 75 H 204",
        "M 36 92 H 204",
        "M 36 108 H 204",
      ],
      highlightLines: [
        {
          d: "M 48 25.5 H 192 M 58 52 L 182 34",
          stroke: "var(--cnc-mat-alu-highlight)",
          strokeWidth: 1.4,
        },
      ],
    },
    // 2. Letra corpórea — precision-routed dimensional letter "A" in brushed aluminum
    {
      id: "example2",
      finish: "aluminum",
      primaryPath:
        "M 108 18 H 132 L 178 130 H 150 L 140 104 H 100 L 90 130 H 62 Z",
      throughPaths: [
        // Inner counter triangle
        "M 120 44 L 134 84 H 106 Z",
        // Rear threaded stud-mount bores
        "M 120 26 A 3 3 0 1 0 120 32 A 3 3 0 1 0 120 26 Z",
        "M 82 114 A 3 3 0 1 0 82 120 A 3 3 0 1 0 82 114 Z",
        "M 158 114 A 3 3 0 1 0 158 120 A 3 3 0 1 0 158 114 Z",
      ],
      detailPaths: [
        "M 120 44 L 134 84 H 106 Z",
        "M 120 26 A 3 3 0 1 0 120 32 A 3 3 0 1 0 120 26 Z",
        "M 82 114 A 3 3 0 1 0 82 120 A 3 3 0 1 0 82 114 Z",
        "M 158 114 A 3 3 0 1 0 158 120 A 3 3 0 1 0 158 114 Z",
      ],
      guidePaths: [
        "M 112 24 H 128 L 168 124 H 154 L 143 96 H 97 L 86 124 H 72 Z",
        "M 120 10 V 140",
      ],
      textureLines: [
        "M 60 36 H 180",
        "M 60 56 H 180",
        "M 60 76 H 180",
        "M 60 94 H 180",
        "M 60 112 H 180",
      ],
      highlightLines: [
        {
          d: "M 109 19.5 H 131 M 74 102 L 109 20",
          stroke: "var(--cnc-mat-alu-highlight)",
          strokeWidth: 1.5,
        },
      ],
    },
    // 3. Pieza técnica con perforaciones — machined aluminum flange bracket with central bearing bore & bolt circle
    {
      id: "example3",
      finish: "aluminum",
      primaryPath:
        "M 76 20 H 164 L 204 54 V 96 L 164 130 H 76 L 36 96 V 54 Z",
      throughPaths: [
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
      detailPaths: [
        "M 120 51 A 24 24 0 1 0 120 99 A 24 24 0 1 0 120 51 Z",
        "M 86 34 A 5 5 0 1 0 86 44 A 5 5 0 1 0 86 34 Z",
        "M 154 34 A 5 5 0 1 0 154 44 A 5 5 0 1 0 154 34 Z",
        "M 86 106 A 5 5 0 1 0 86 116 A 5 5 0 1 0 86 106 Z",
        "M 154 106 A 5 5 0 1 0 154 116 A 5 5 0 1 0 154 106 Z",
        "M 50 65 A 5 5 0 0 1 60 65 V 85 A 5 5 0 0 1 50 85 Z",
        "M 180 65 A 5 5 0 0 1 190 65 V 85 A 5 5 0 0 1 180 85 Z",
      ],
      guidePaths: [
        "M 120 12 V 138",
        "M 26 75 H 214",
        "M 120 35 A 40 40 0 1 0 120 115 A 40 40 0 1 0 120 35 Z",
      ],
      surfaceFeatures: [
        // Machined bearing counterbore shoulder ring around central bore
        {
          d: "M 120 45 A 30 30 0 1 0 120 105 A 30 30 0 1 0 120 45 Z M 120 51 A 24 24 0 1 0 120 99 A 24 24 0 1 0 120 51 Z",
          fill: "var(--cnc-mat-alu-engraved)",
          fillRule: "evenodd",
          stroke: "var(--cnc-mat-alu-edge)",
          strokeWidth: 0.95,
        },
      ],
      textureLines: [
        "M 38 40 H 202",
        "M 38 58 H 202",
        "M 38 75 H 202",
        "M 38 92 H 202",
        "M 38 110 H 202",
      ],
      highlightLines: [
        {
          d: "M 76 21.5 H 164 M 54 52 L 166 28",
          stroke: "var(--cnc-mat-alu-highlight)",
          strokeWidth: 1.4,
        },
      ],
    },
  ],
};

function resolveFinishStyle(finish: MaterialFinishKind): {
  fill: string;
  cantoFill: string;
  edgeStroke: string;
  textureStroke: string;
  textureStrokeWidth: number;
} {
  switch (finish) {
    case "wood-mdf":
      return {
        fill: "url(#cnc-grad-wood)",
        cantoFill: "var(--cnc-mat-mdf-edge)",
        edgeStroke: "var(--cnc-mat-mdf-edge)",
        textureStroke: "var(--cnc-mat-wood-grain)",
        textureStrokeWidth: 1.25,
      };
    case "wood-ply":
      return {
        fill: "url(#cnc-grad-wood)",
        cantoFill: "var(--cnc-mat-wood-lo)",
        edgeStroke: "var(--cnc-mat-wood-edge)",
        textureStroke: "var(--cnc-mat-wood-grain)",
        textureStrokeWidth: 1.25,
      };
    case "acrylic":
      return {
        fill: "var(--cnc-mat-acrylic-fill)",
        cantoFill: "var(--cnc-mat-acrylic-canto)",
        edgeStroke: "var(--cnc-mat-acrylic-edge)",
        textureStroke: "var(--cnc-mat-acrylic-sheen)",
        textureStrokeWidth: 1.5,
      };
    case "corian":
      return {
        fill: "url(#cnc-grad-corian)",
        cantoFill: "var(--cnc-mat-corian-basin)",
        edgeStroke: "var(--cnc-mat-corian-edge)",
        textureStroke: "transparent",
        textureStrokeWidth: 1,
      };
    case "aluminum":
      return {
        fill: "url(#cnc-grad-aluminum)",
        cantoFill: "var(--cnc-mat-alu-lo)",
        edgeStroke: "var(--cnc-mat-alu-edge)",
        textureStroke: "var(--cnc-mat-alu-brush)",
        textureStrokeWidth: 1.15,
      };
  }
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
      className="relative scroll-mt-[-3.5rem] px-5 py-14 md:scroll-mt-[-5rem] md:px-8 md:py-20 lg:scroll-mt-[-6rem] lg:py-24"
    >
      <RegistrationMarks edges="bottom" />

      {/* Shared SVG gradient definitions for all material cards (rendered once) */}
      <svg
        aria-hidden="true"
        width="0"
        height="0"
        className="pointer-events-none absolute overflow-hidden"
      >
        <defs>
          {/* 01 · Natural desaturated wood / plywood gradient */}
          <linearGradient
            id="cnc-grad-wood"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="var(--cnc-mat-wood-hi)" />
            <stop offset="52%" stopColor="var(--cnc-mat-wood-base)" />
            <stop offset="100%" stopColor="var(--cnc-mat-wood-lo)" />
          </linearGradient>

          {/* 02a · Translucent cast acrylic diagonal sheen */}
          <linearGradient
            id="cnc-grad-acrylic-sheen"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="rgb(255 255 255 / 0)" />
            <stop offset="38%" stopColor="rgb(255 255 255 / 0)" />
            <stop offset="48%" stopColor="var(--cnc-mat-acrylic-sheen)" />
            <stop offset="58%" stopColor="rgb(255 255 255 / 0)" />
            <stop offset="100%" stopColor="rgb(255 255 255 / 0)" />
          </linearGradient>

          {/* 02b · Matte white Corian surface & recessed basin */}
          <linearGradient
            id="cnc-grad-corian"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="var(--cnc-mat-corian-hi)" />
            <stop offset="100%" stopColor="var(--cnc-mat-corian-base)" />
          </linearGradient>

          <radialGradient
            id="cnc-grad-corian-basin"
            cx="50%"
            cy="45%"
            r="60%"
          >
            <stop offset="0%" stopColor="var(--cnc-mat-corian-basin)" />
            <stop offset="100%" stopColor="var(--cnc-mat-corian-base)" />
          </radialGradient>

          {/* 03 · Brushed aluminum multi-stop metallic gradient */}
          <linearGradient
            id="cnc-grad-aluminum"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="85%"
          >
            <stop offset="0%" stopColor="var(--cnc-mat-alu-lo)" />
            <stop offset="28%" stopColor="var(--cnc-mat-alu-mid)" />
            <stop offset="52%" stopColor="var(--cnc-mat-alu-hi)" />
            <stop offset="76%" stopColor="var(--cnc-mat-alu-mid)" />
            <stop offset="100%" stopColor="var(--cnc-mat-alu-lo)" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative mx-auto w-full max-w-[1200px]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2
            id="materials-title"
            className="max-w-[16ch] text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.02em] text-balance lg:max-w-[24ch]"
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
                  min: formatSpecMm(locale, range.minMm),
                  max: formatSpecMm(locale, range.maxMm),
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

            const compoundSolidPath = [
              currentExample.primaryPath,
              ...currentExample.throughPaths,
            ].join(" ");
            const clipId = `cnc-clip-${group}-${currentExample.id}`;
            const finishStyle = resolveFinishStyle(currentExample.finish);

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
                    {cncMaterialLabel(group, locale)}
                  </h3>
                </div>

                {/* CAD Bed Canvas with Blueprint → Cut (1.4s) → Finished Product (400ms) */}
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
                    <defs>
                      <clipPath id={clipId}>
                        <path d={compoundSolidPath} clipRule="evenodd" />
                      </clipPath>
                    </defs>

                    {/* 1. Blueprint guide lines (dims to 0.25 opacity when finished product fades in) */}
                    <g className="cnc-guide-layer">
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
                        className="text-cnc-muted/55"
                      />

                      {currentExample.detailPaths.map((d, idx) => (
                        <path
                          key={`base-detail-${idx}`}
                          d={d}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.15"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                          className="text-cnc-muted/45"
                        />
                      ))}
                    </g>

                    {/* 3. Finished Product Layer (fades in over 400ms --ease-out after 1400ms cut completes) */}
                    <g className="cnc-finished-layer">
                      {/* Soft offset volume shadow underneath the part (and inside through-cutouts) */}
                      <path
                        d={compoundSolidPath}
                        fillRule="evenodd"
                        transform="translate(0, 4.5)"
                        fill="var(--cnc-mat-shadow)"
                      />

                      {/* 3D material thickness lip / canto (smooth on MDF, darker edge on wood/alu/Corian) */}
                      <path
                        d={compoundSolidPath}
                        fillRule="evenodd"
                        transform="translate(0, 2)"
                        fill={finishStyle.cantoFill}
                      />

                      {/* Base material body with through-holes punched out via fill-rule="evenodd" */}
                      <path
                        d={compoundSolidPath}
                        fillRule="evenodd"
                        fill={finishStyle.fill}
                      />

                      {/* Diagonal specular sheen overlay for translucent acrylic */}
                      {currentExample.finish === "acrylic" ? (
                        <path
                          d={compoundSolidPath}
                          fillRule="evenodd"
                          fill="url(#cnc-grad-acrylic-sheen)"
                        />
                      ) : null}

                      {/* Surface features: drawer fronts, raised acrylic letters, Corian basin, or engraved pockets */}
                      {currentExample.surfaceFeatures?.map((feat, idx) => (
                        <path
                          key={`feat-${idx}`}
                          d={feat.d}
                          fill={feat.fill ?? "none"}
                          fillRule={feat.fillRule ?? "nonzero"}
                          stroke={feat.stroke ?? "none"}
                          strokeWidth={feat.strokeWidth ?? 1}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                        />
                      ))}

                      {/* Clipped wood grain, brushed aluminum lines, or acrylic diagonal reflections */}
                      {currentExample.textureLines &&
                      currentExample.textureLines.length > 0 ? (
                        <g
                          clipPath={`url(#${clipId})`}
                          fill="none"
                          stroke={finishStyle.textureStroke}
                          strokeWidth={finishStyle.textureStrokeWidth}
                          strokeLinecap="round"
                        >
                          {currentExample.textureLines.map((d, idx) => (
                            <path key={`tex-${idx}`} d={d} />
                          ))}
                        </g>
                      ) : null}

                      {/* Linear highlights or smooth MDF edge bands (clipped to solid part) */}
                      {currentExample.highlightLines?.map((hl, idx) => (
                        <path
                          key={`hl-${idx}`}
                          d={hl.d}
                          clipPath={`url(#${clipId})`}
                          fill="none"
                          stroke={hl.stroke}
                          strokeWidth={hl.strokeWidth ?? 1.25}
                          strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                        />
                      ))}

                      {/* Fine finished perimeter & cutout border (1px) */}
                      <path
                        d={compoundSolidPath}
                        fill="none"
                        stroke={finishStyle.edgeStroke}
                        strokeWidth="1.1"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </g>

                    {/* 2. Active CNC Cut Paths (animated via stroke-dashoffset 1 -> 0 in 1.4s, then settles) */}
                    <path
                      d={currentExample.primaryPath}
                      pathLength={1}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
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
                        strokeWidth="1.25"
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
