/** Primary hero CTA. The mobile bar stays hidden while this control is on screen. */
export const CNC_HERO_CTA_ID = "cnc-hero-cta";

/** Clears the one-row mobile bar: 12px + control + 12px, plus the home indicator. */
export function mobileCtaClearanceClass(secondary: boolean) {
  return secondary
    ? "pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0"
    : "pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-0";
}
