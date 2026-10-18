import type { CncSpecs, CncThicknessRange } from "@/content/site-config";

export function formatSpecMm(locale: string, value: number): string {
  return new Intl.NumberFormat(locale === "en" ? "en" : "es-MX", {
    maximumFractionDigits: 1,
    useGrouping: false,
  }).format(value);
}

export function thicknessRangeForGroup(
  specs: CncSpecs | undefined,
  group: string,
): CncThicknessRange | undefined {
  return specs?.maxThicknessByMaterial.find((item) => item.group === group);
}
