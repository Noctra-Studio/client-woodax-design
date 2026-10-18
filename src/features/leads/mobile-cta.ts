/** Scroll padding that clears the sticky bar, including a second WhatsApp button. */
export function mobileCtaClearanceClass(secondary: boolean) {
  return secondary ? "pb-40 md:pb-0" : "pb-28 md:pb-0";
}
