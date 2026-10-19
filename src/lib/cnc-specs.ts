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

export function formatMmSize(
  locale: string,
  size: { widthMm: number; lengthMm: number } | undefined,
): string {
  if (!size || size.widthMm <= 0 || size.lengthMm <= 0) return "";
  return `${formatSpecMm(locale, size.widthMm)} × ${formatSpecMm(locale, size.lengthMm)} mm`;
}

export function formatThicknessMm(
  locale: string,
  range: { minMm: number; maxMm: number } | undefined,
): string {
  if (!range || range.maxMm <= 0) return "";
  return `${formatSpecMm(locale, range.minMm)}–${formatSpecMm(locale, range.maxMm)} mm`;
}
