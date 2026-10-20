const LOCALE_SWITCH_MS = 1500;
const FIRST_PAINT_MS = 80;

let localeSwitchUntil = 0;
let bootedAt = 0;
let popped = false;

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    popped = true;
  });
}

export function markLocaleSwitch() {
  localeSwitchUntil = Date.now() + LOCALE_SWITCH_MS;
}

function isLocaleSwitchNavigation() {
  return Date.now() < localeSwitchUntil;
}

function consumeHistoryPop() {
  const value = popped;
  popped = false;
  return value;
}

export function armRouteTransition(): { animate: boolean; scroll: boolean } {
  const now = Date.now();
  if (bootedAt === 0) bootedAt = now;
  const firstPaint = now - bootedAt < FIRST_PAINT_MS;

  if (firstPaint || isLocaleSwitchNavigation()) {
    return { animate: false, scroll: false };
  }

  if (consumeHistoryPop()) {
    return { animate: true, scroll: false };
  }

  return { animate: true, scroll: true };
}
