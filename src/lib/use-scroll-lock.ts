import { useEffect, useLayoutEffect } from "react";

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

type SavedStyles = {
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  scrollBehavior: string;
};

let lockCount = 0;
let lockedScrollY: number | null = null;
let savedStyles: SavedStyles | null = null;

export function isScrollLocked() {
  return lockCount > 0;
}

/** Scroll position to restore. While locked, `window.scrollY` reads 0. */
export function readScrollY() {
  return lockedScrollY ?? window.scrollY;
}

function lockScroll() {
  if (lockCount === 0) {
    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    lockedScrollY = scrollY;
    savedStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      scrollBehavior: html.style.scrollBehavior,
    };
    html.style.scrollBehavior = "auto";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
  }
  lockCount += 1;
}

function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  const scrollY = lockedScrollY ?? 0;
  const saved = savedStyles;
  lockedScrollY = null;
  savedStyles = null;

  const body = document.body;
  const html = document.documentElement;
  body.style.position = saved?.position ?? "";
  body.style.top = saved?.top ?? "";
  body.style.left = saved?.left ?? "";
  body.style.right = saved?.right ?? "";
  body.style.width = saved?.width ?? "";
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, scrollY);
  document.documentElement.scrollTop = scrollY;
  html.style.scrollBehavior = saved?.scrollBehavior ?? "";
}

export function useScrollLock(active: boolean) {
  useIsoLayoutEffect(() => {
    if (!active) return;
    lockScroll();
    return unlockScroll;
  }, [active]);
}
