"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowUpRight, Menu, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { useLocale } from "next-intl";
import { useIntro as useDesignIntro } from "@/components/design/intro-provider";
import { LogoToolpath } from "@/components/cnc/logo-toolpath";
import { useIntro as useCncIntro } from "@/components/cnc/intro-provider";
import { LocaleSlot } from "@/components/site/locale-switch";
import { Button } from "@/components/ui/button";
import { analyticsLocale, track } from "@/lib/analytics";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { Pathname } from "@/i18n/routing";
import { isDesignFull } from "@/lib/seo";
import { cn } from "@/lib/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;
const morphTransition = { duration: 0.32, ease: easeOut };
const SCROLL_DOWN = 64;
const SCROLL_UP = 24;
const LOGO_FULL_PX = 44;
const LOGO_COMPACT_PX = 32;
const NAV_LOCK_EVENT = "woodax:nav-lock";
const NAV_LOCK_TIMEOUT_MS = 900;
const NAV_FADE_OUT_MS = 180;
const HOME_GROW_MS = 320;
const HOME_FADE_OUT_MS = 120;
const SHEET_CLOSE_MS = 200;
const SHEET_CLOSE_REDUCED_MS = 120;
const ACTIVE_LINE_RATIO = 0.35;
const BOTTOM_TOLERANCE_PX = 24;

const MANUAL_SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  " ",
  "Spacebar",
  "Home",
  "End",
]);

export function lockNavAnchor(id: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<string>(NAV_LOCK_EVENT, { detail: id }));
}

function decodeHash(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function readHashId(): string {
  if (typeof window === "undefined") return "";
  return decodeHash(window.location.hash.replace(/^#/, ""));
}

function computeActiveAnchorId(
  elements: readonly HTMLElement[],
): string | null {
  if (elements.length === 0) return null;

  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;

  if (
    scrollY > 0 &&
    viewportHeight + Math.ceil(scrollY) >= docHeight - BOTTOM_TOLERANCE_PX
  ) {
    return elements[elements.length - 1]!.id;
  }

  const thresholdY = viewportHeight * ACTIVE_LINE_RATIO;
  let current: string | null = null;

  for (let i = 0; i < elements.length; i++) {
    const rect = elements[i]!.getBoundingClientRect();
    if (rect.top <= thresholdY) {
      current = elements[i]!.id;
    } else {
      break;
    }
  }

  return current;
}

const openPad = {
  paddingTop: 16,
  paddingRight: 8,
  paddingBottom: 16,
  paddingLeft: 20,
};
const shutPad = {
  paddingTop: 8,
  paddingRight: 8,
  paddingBottom: 8,
  paddingLeft: 12,
};

export type SiteNavAnchor = {
  type: "anchor";
  id: string;
  label: string;
};

export type SiteNavRoute = {
  type: "route";
  href: Pathname;
  label: string;
};

export type SiteNavLink = SiteNavAnchor | SiteNavRoute;

function itemKey(link: SiteNavLink) {
  return link.type === "anchor" ? link.id : link.href;
}

function isPlainClick(event: {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

type HomeReveal = { grid: boolean; shown: boolean };

function useGridReveal(open: boolean, reduce: boolean): HomeReveal {
  const [phase, setPhase] = useState({
    open,
    reduce,
    grid: open,
    shown: open,
  });

  if (phase.reduce !== reduce || phase.open !== open) {
    if (reduce) {
      setPhase({ open, reduce, grid: open, shown: open });
    } else if (open) {
      setPhase({ open: true, reduce: false, grid: true, shown: false });
    } else {
      setPhase({
        open: false,
        reduce: false,
        grid: phase.grid,
        shown: false,
      });
    }
  }

  useEffect(() => {
    if (reduce || !open || !phase.grid || phase.shown) return;
    const id = window.setTimeout(() => {
      setPhase((current) =>
        current.open && current.grid && !current.shown
          ? { ...current, shown: true }
          : current,
      );
    }, HOME_GROW_MS);
    return () => window.clearTimeout(id);
  }, [open, phase.grid, phase.shown, reduce]);

  useEffect(() => {
    if (reduce || open || phase.shown || !phase.grid) return;
    const id = window.setTimeout(() => {
      setPhase((current) =>
        !current.open && !current.shown && current.grid
          ? { ...current, grid: false }
          : current,
      );
    }, HOME_FADE_OUT_MS);
    return () => window.clearTimeout(id);
  }, [open, phase.grid, phase.shown, reduce]);

  return { grid: phase.grid, shown: phase.shown };
}

type Variant = "design" | "cnc";

type SiteNavProps = {
  variant: Variant;
  links: SiteNavLink[];
  homeLabel: string;
  /** "Inicio" — design full site only. Collapses on the home route. */
  routeHomeLabel?: string;
  /** Sheet entry for Contacto. Desktop keeps it as the square CTA. */
  sheetContactLabel?: string;
  logoLabel?: string;
  ctaLabel: string;
  menuLabel: string;
  closeLabel: string;
  languageLabel: string;
  siblingHref: string;
  siblingLabel: string;
  instagramUrl?: string;
  instagramLabel: string;
  facebookUrl?: string;
  facebookLabel: string;
  facebookAria: string;
  logo: ReactNode;
  logoCompact: ReactNode;
  logoTraceSrc?: string;
};

type Box = { open: number; shut: number };

type PillState = {
  activeId: string | null;
  fadingId: string | null;
  fromNull: boolean;
  instant: boolean;
};

export function SiteNav({
  variant,
  links,
  homeLabel,
  routeHomeLabel,
  sheetContactLabel,
  logoLabel,
  ctaLabel,
  menuLabel,
  closeLabel,
  languageLabel,
  siblingHref,
  siblingLabel,
  instagramUrl,
  instagramLabel,
  facebookUrl,
  facebookLabel,
  facebookAria,
  logo,
  logoCompact,
  logoTraceSrc,
}: SiteNavProps) {
  const reduce = useReducedMotion() === true;
  const scrolled = useScrolled();
  const designIntro = useDesignIntro();
  const cncIntro = useCncIntro();
  const introPlaying =
    variant === "design"
      ? designIntro.status === "play"
      : cncIntro.status === "play";
  const [menuOpen, setMenuOpen] = useState(false);
  const [pill, setPill] = useState<PillState>({
    activeId: null,
    fadingId: null,
    fromNull: true,
    instant: false,
  });
  const pathname = usePathname();
  const homeReveal = useGridReveal(
    Boolean(routeHomeLabel) && pathname !== "/",
    reduce,
  );
  const anchorIds = links
    .flatMap((link) => (link.type === "anchor" ? [link.id] : []))
    .join("\0");

  const reduceRef = useRef(reduce);
  useLayoutEffect(() => {
    reduceRef.current = reduce;
  }, [reduce]);

  const fadeTimerRef = useRef<number | null>(null);
  const instantRafRef = useRef<number | null>(null);
  const lockRef = useRef<{
    targetId: string;
    timerId: number;
    startedAt: number;
  } | null>(null);

  const applyActiveId = useCallback(
    (
      nextId: string | null,
      options?: { instant?: boolean; fadeInFromNull?: boolean },
    ) => {
      const instant = options?.instant ?? false;
      const fadeInFromNull = options?.fadeInFromNull ?? true;

      if (fadeTimerRef.current !== null) {
        window.clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
      if (instantRafRef.current !== null) {
        window.cancelAnimationFrame(instantRafRef.current);
        instantRafRef.current = null;
      }

      setPill((curr) => {
        if (
          curr.activeId === nextId &&
          curr.fadingId === null &&
          curr.instant === instant
        ) {
          return curr;
        }

        const prevPillId = curr.activeId ?? curr.fadingId;

        if (nextId === null) {
          if (reduceRef.current || prevPillId === null) {
            return {
              activeId: null,
              fadingId: null,
              fromNull: true,
              instant: false,
            };
          }
          return {
            activeId: null,
            fadingId: prevPillId,
            fromNull: false,
            instant: false,
          };
        }

        return {
          activeId: nextId,
          fadingId: null,
          fromNull: prevPillId === null && fadeInFromNull && !instant,
          instant,
        };
      });

      if (nextId === null && !reduceRef.current) {
        fadeTimerRef.current = window.setTimeout(() => {
          fadeTimerRef.current = null;
          setPill((curr) =>
            curr.activeId === null && curr.fadingId !== null
              ? {
                  activeId: null,
                  fadingId: null,
                  fromNull: true,
                  instant: false,
                }
              : curr,
          );
        }, NAV_FADE_OUT_MS);
      } else if (instant && nextId !== null) {
        instantRafRef.current = window.requestAnimationFrame(() => {
          instantRafRef.current = null;
          setPill((curr) =>
            curr.instant ? { ...curr, instant: false, fromNull: false } : curr,
          );
        });
      }
    },
    [],
  );

  useLayoutEffect(() => {
    const ids = anchorIds.split("\0").filter(Boolean);
    if (ids.length === 0) return;

    const idSet = new Set(ids);
    const getElements = () =>
      ids
        .map((id) => document.getElementById(id))
        .filter((element): element is HTMLElement => element !== null);

    let rafId = 0;

    const clearLock = () => {
      if (!lockRef.current) return;
      window.clearTimeout(lockRef.current.timerId);
      lockRef.current = null;
    };

    const startLock = (targetId: string, instant = false) => {
      if (!idSet.has(targetId)) return;
      clearLock();
      const timerId = window.setTimeout(() => {
        lockRef.current = null;
      }, NAV_LOCK_TIMEOUT_MS);
      lockRef.current = {
        targetId,
        timerId,
        startedAt: performance.now(),
      };
      applyActiveId(targetId, { instant, fadeInFromNull: false });
    };

    const checkScroll = () => {
      rafId = 0;
      if (lockRef.current) return;
      const elements = getElements();
      if (elements.length === 0) return;
      const nextId = computeActiveAnchorId(elements);
      applyActiveId(nextId, { instant: false, fadeInFromNull: true });
    };

    const scheduleCheck = () => {
      if (lockRef.current || rafId !== 0) return;
      rafId = window.requestAnimationFrame(checkScroll);
    };

    const cancelLockOnManualInput = () => {
      if (lockRef.current) {
        if (performance.now() - lockRef.current.startedAt < 16) return;
        clearLock();
      }
      scheduleCheck();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!MANUAL_SCROLL_KEYS.has(event.key)) return;
      cancelLockOnManualInput();
    };

    const onScrollEnd = () => {
      if (!lockRef.current) return;
      if (performance.now() - lockRef.current.startedAt < 50) return;
      clearLock();
    };

    const onHashChange = () => {
      const hashId = readHashId();
      if (hashId && idSet.has(hashId)) {
        startLock(hashId, false);
      } else {
        clearLock();
        scheduleCheck();
      }
    };

    const onLockEvent = (event: Event) => {
      const targetId = (event as CustomEvent<string>).detail;
      if (typeof targetId === "string" && idSet.has(targetId)) {
        startLock(targetId, false);
      }
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      const targetId = decodeHash(href.slice(1));
      if (targetId && idSet.has(targetId)) {
        startLock(targetId, false);
      }
    };

    const initialHash = readHashId();
    if (initialHash && idSet.has(initialHash)) {
      startLock(initialHash, true);
    } else {
      const elements = getElements();
      const initialActive = computeActiveAnchorId(elements);
      if (initialActive !== null) {
        applyActiveId(initialActive, { instant: true, fadeInFromNull: false });
      }
    }

    window.addEventListener("scroll", scheduleCheck, { passive: true });
    window.addEventListener("resize", scheduleCheck, { passive: true });
    window.addEventListener("wheel", cancelLockOnManualInput, { passive: true });
    window.addEventListener("touchstart", cancelLockOnManualInput, {
      passive: true,
    });
    window.addEventListener("keydown", onKeyDown, { passive: true });
    window.addEventListener("scrollend", onScrollEnd, { passive: true });
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener(NAV_LOCK_EVENT, onLockEvent);
    document.addEventListener("click", onDocumentClick);

    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      clearLock();
      if (fadeTimerRef.current !== null) {
        window.clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
      if (instantRafRef.current !== null) {
        window.cancelAnimationFrame(instantRafRef.current);
        instantRafRef.current = null;
      }
      window.removeEventListener("scroll", scheduleCheck);
      window.removeEventListener("resize", scheduleCheck);
      window.removeEventListener("wheel", cancelLockOnManualInput);
      window.removeEventListener("touchstart", cancelLockOnManualInput);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scrollend", onScrollEnd);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener(NAV_LOCK_EVENT, onLockEvent);
      document.removeEventListener("click", onDocumentClick);
    };
  }, [anchorIds, applyActiveId]);

  const focusRing =
    variant === "design"
      ? "focus-visible:outline-woodax-charcoal"
      : "focus-visible:outline-cnc-white";

  const activeId = pill.activeId;
  const pillId = pill.activeId ?? pill.fadingId;
  const pillVisible = pill.activeId !== null;
  const pillAppearFade = pill.fromNull && !pill.instant;
  const pillInstant = pill.instant;

  const barProps = {
    variant,
    links,
    activeId,
    pillId,
    pillVisible,
    pillAppearFade,
    pillInstant,
    pathname,
    homeLabel,
    routeHomeLabel,
    homeGrid: homeReveal.grid,
    homeShown: homeReveal.shown,
    sheetContactLabel,
    logoLabel: logoLabel ?? homeLabel,
    ctaLabel,
    focusRing,
    logo,
    logoCompact,
    logoTraceSrc,
    languageLabel,
    introPlaying,
    reduce,
  };

  return (
    <nav
      aria-label={homeLabel}
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-[max(0.75rem,calc(env(safe-area-inset-top)+0.5rem))] md:px-6",
        menuOpen && "z-[60]",
      )}
    >
      <DesktopNav scrolled={scrolled} {...barProps} />
      <MobileNav
        scrolled={scrolled}
        menuLabel={menuLabel}
        closeLabel={closeLabel}
        siblingHref={siblingHref}
        siblingLabel={siblingLabel}
        instagramUrl={instagramUrl}
        instagramLabel={instagramLabel}
        facebookUrl={facebookUrl}
        facebookLabel={facebookLabel}
        facebookAria={facebookAria}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        {...barProps}
      />
    </nav>
  );
}

function useScrolled() {
  const { scrollY } = useScroll();
  const scrolledRef = useRef(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const next = scrolledRef.current
      ? latest >= SCROLL_UP
      : latest > SCROLL_DOWN;
    if (next === scrolledRef.current) return;
    scrolledRef.current = next;
    setScrolled(next);
  });

  return scrolled;
}

function useNavMorph(scrolled: boolean, reduce: boolean) {
  const [phase, setPhase] = useState({
    source: scrolled,
    reduce,
    morph: false,
    labelsOn: true,
    tween: false,
  });

  if (phase.reduce !== reduce || phase.source !== scrolled) {
    if (reduce) {
      setPhase({
        source: scrolled,
        reduce,
        morph: scrolled,
        labelsOn: !scrolled,
        tween: false,
      });
    } else if (scrolled) {
      setPhase({
        source: true,
        reduce: false,
        morph: phase.morph,
        labelsOn: false,
        tween: false,
      });
    } else {
      setPhase({
        source: false,
        reduce: false,
        morph: false,
        labelsOn: phase.morph ? false : true,
        tween: phase.morph,
      });
    }
  }

  useEffect(() => {
    if (reduce || !scrolled || phase.morph) return;
    const id = window.setTimeout(() => {
      setPhase((current) => {
        if (!current.source || current.reduce) return current;
        return { ...current, morph: true, tween: true, labelsOn: false };
      });
    }, 120);
    return () => window.clearTimeout(id);
  }, [phase.morph, reduce, scrolled]);

  useEffect(() => {
    if (reduce || scrolled || !phase.tween || phase.morph) return;
    const id = window.setTimeout(() => {
      setPhase((current) => {
        if (current.source || current.morph || !current.tween) return current;
        return { ...current, labelsOn: true, tween: false };
      });
    }, 320);
    return () => window.clearTimeout(id);
  }, [phase.morph, phase.tween, reduce, scrolled]);

  useEffect(() => {
    if (!phase.tween || !phase.morph) return;
    const id = window.setTimeout(() => {
      setPhase((current) =>
        current.tween && current.morph ? { ...current, tween: false } : current,
      );
    }, 320);
    return () => window.clearTimeout(id);
  }, [phase.morph, phase.tween]);

  return {
    morph: phase.morph,
    labelsOn: phase.labelsOn,
    tween: phase.tween,
  };
}

function DesktopNav({
  scrolled,
  reduce,
  links,
  logoCompact,
  routeHomeLabel,
  homeGrid,
  homeShown,
  ...rest
}: {
  scrolled: boolean;
  reduce: boolean;
  links: SiteNavLink[];
  logoCompact: ReactNode;
} & BarContentProps) {
  const { morph, labelsOn, tween } = useNavMorph(scrolled, reduce);
  const shellRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [contentTween, setContentTween] = useState(false);
  const shutRef = useRef<number | null>(null);
  const linkKey = `${links.map((link) => link.label).join("\0")}\0${routeHomeLabel ?? ""}\0${homeGrid ? "1" : "0"}`;

  useLayoutEffect(() => {
    const shell = shellRef.current;
    const measure = measureRef.current;
    if (!shell || !measure) return;

    const update = () => {
      const open = shell.clientWidth;
      const shut = measure.offsetWidth;
      if (open < 1 || shut < 1) return;
      setBox((current) =>
        current && current.open === open && current.shut === shut
          ? current
          : { open, shut },
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(shell);
    observer.observe(measure);
    return () => observer.disconnect();
  }, [linkKey, logoCompact]);

  useLayoutEffect(() => {
    if (!box) return;
    const previous = shutRef.current;
    shutRef.current = box.shut;
    if (previous !== null && previous !== box.shut && morph) {
      setContentTween(true);
    }
  }, [box, morph]);

  useEffect(() => {
    if (!contentTween) return;
    const id = window.setTimeout(() => setContentTween(false), HOME_GROW_MS);
    return () => window.clearTimeout(id);
  }, [contentTween]);

  return (
    <div
      ref={shellRef}
      className="pointer-events-none relative hidden w-full max-w-[1200px] md:block"
    >
      <MeasureRow
        measureRef={measureRef}
        links={links}
        logoCompact={logoCompact}
        variant={rest.variant}
        routeHomeLabel={homeGrid ? routeHomeLabel : undefined}
      />
      {reduce ? (
        <ReducedBars
          scrolled={scrolled}
          reduce={reduce}
          links={links}
          logoCompact={logoCompact}
          {...rest}
          routeHomeLabel={routeHomeLabel}
          homeGrid={homeGrid}
          homeShown={homeShown}
        />
      ) : (
        <motion.div
          initial={false}
          animate={{
            width: box ? (morph ? box.shut : box.open) : "100%",
            height: morph ? 56 : 80,
            ...(morph ? shutPad : openPad),
          }}
          transition={
            tween || contentTween ? morphTransition : { duration: 0 }
          }
          data-variant={rest.variant}
          data-scrolled={morph ? "true" : "false"}
          className={cn(
            "site-nav-bar pointer-events-auto mx-auto overflow-hidden",
            morph
              ? "flex items-center gap-2"
              : "grid w-full items-center md:grid-cols-[auto_minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
            rest.variant === "design"
              ? "text-woodax-charcoal"
              : "text-cnc-text",
          )}
          style={{ borderRadius: "var(--radius-lg)" }}
        >
          <BarContent
            {...rest}
            reduce={reduce}
            links={links}
            logoCompact={logoCompact}
            compact={morph}
            labelsOn={labelsOn}
            tween={tween}
            showIndicator
            routeHomeLabel={routeHomeLabel}
            homeGrid={homeGrid}
            homeShown={homeShown}
          />
        </motion.div>
      )}
    </div>
  );
}

function MeasureRow({
  measureRef,
  links,
  logoCompact,
  variant,
  routeHomeLabel,
}: {
  measureRef: RefObject<HTMLDivElement | null>;
  links: SiteNavLink[];
  logoCompact: ReactNode;
  variant: Variant;
  routeHomeLabel?: string;
}) {
  return (
    <div
      ref={measureRef}
      aria-hidden
      data-variant={variant}
      data-scrolled="false"
      className="site-nav-bar pointer-events-none invisible absolute top-0 left-0 flex w-max items-center gap-2 py-2 pr-2 pl-3"
      style={{ borderRadius: "var(--radius-lg)" }}
    >
      <span className="inline-flex h-8 items-center" aria-hidden>
        {cloneLogo(logoCompact, { measure: true })}
      </span>
      <ul className="flex items-center">
        {routeHomeLabel ? (
          <li
            className={cn(
              "mx-1 inline-flex min-h-11 items-center gap-2 px-3 text-[15px] whitespace-nowrap",
              variant === "design" ? "font-medium" : "font-normal",
            )}
          >
            <ArrowLeft aria-hidden strokeWidth={1.5} className="size-4" />
            {routeHomeLabel}
          </li>
        ) : null}
        {links.map((link) => (
          <li
            key={itemKey(link)}
            className={cn(
              "mx-1 inline-flex min-h-11 items-center px-3 text-[15px] whitespace-nowrap",
              variant === "design" ? "font-medium" : "font-normal",
            )}
          >
            {link.label}
          </li>
        ))}
      </ul>
      <span className="ml-2 size-11 shrink-0" />
    </div>
  );
}

function ReducedBars(props: BarContentProps & { scrolled: boolean }) {
  const { scrolled, ...bar } = props;
  return (
    <div className="relative h-20">
      <AnimatePresence initial={false}>
        <motion.div
          key={scrolled ? "shut" : "open"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, ease: easeOut }}
          data-variant={bar.variant}
          data-scrolled={scrolled ? "true" : "false"}
          className={cn(
            "site-nav-bar pointer-events-auto absolute top-0 overflow-hidden",
            scrolled
              ? "inset-x-0 mx-auto flex h-14 w-max items-center gap-2 py-2 pr-2 pl-3"
              : "inset-x-0 grid h-20 w-full items-center py-4 pr-2 pl-5 md:grid-cols-[auto_minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
            bar.variant === "design" ? "text-woodax-charcoal" : "text-cnc-text",
          )}
          style={{ borderRadius: "var(--radius-lg)" }}
        >
          <BarContent
            {...bar}
            compact={scrolled}
            labelsOn={!scrolled}
            tween={false}
            showIndicator={false}
            routeHomeLabel={bar.routeHomeLabel}
            homeGrid={bar.homeGrid}
            homeShown={bar.homeShown}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

type BarContentProps = {
  variant: Variant;
  links: SiteNavLink[];
  activeId: string | null;
  pillId: string | null;
  pillVisible: boolean;
  pillAppearFade: boolean;
  pillInstant: boolean;
  pathname: string;
  homeLabel: string;
  routeHomeLabel?: string;
  homeGrid: boolean;
  homeShown: boolean;
  sheetContactLabel?: string;
  logoLabel: string;
  ctaLabel: string;
  focusRing: string;
  logo: ReactNode;
  logoCompact: ReactNode;
  logoTraceSrc?: string;
  languageLabel: string;
  introPlaying: boolean;
  reduce: boolean;
};

function BarContent({
  compact,
  labelsOn,
  tween,
  showIndicator,
  ...props
}: BarContentProps & {
  compact: boolean;
  labelsOn: boolean;
  tween: boolean;
  showIndicator: boolean;
}) {
  return (
    <>
      <div className={cn(!compact && "justify-self-start")}>
        <LogoSlot
          homeLabel={props.logoLabel}
          focusRing={props.focusRing}
          compact={compact}
          crossfade
          tween={tween && !props.reduce}
          trace={props.introPlaying && props.variant === "cnc"}
          fade={props.variant === "design" && props.introPlaying}
          logo={props.logo}
          logoCompact={props.logoCompact}
          logoTraceSrc={props.logoTraceSrc}
        />
      </div>
      <div
        className={cn(
          "flex min-w-0 items-center justify-center",
          compact ? "flex-1" : "justify-self-center",
        )}
      >
        <NavLinks
          links={props.links}
          activeId={props.activeId}
          pillId={props.pillId}
          pillVisible={props.pillVisible}
          pillAppearFade={props.pillAppearFade}
          pillInstant={props.pillInstant}
          pathname={props.pathname}
          variant={props.variant}
          reduce={props.reduce || !showIndicator}
          focusRing={props.focusRing}
          showIndicator={showIndicator}
          routeHomeLabel={props.routeHomeLabel}
          homeGrid={props.homeGrid}
          homeShown={props.homeShown}
        />
      </div>
      <div
        className={cn(
          "flex shrink-0 items-center",
          !compact && "justify-self-end",
        )}
      >
        <div
          className={cn(
            "site-nav-collapse grid min-w-0",
            compact ? "grid-cols-[0fr]" : "grid-cols-[1fr]",
          )}
          inert={!labelsOn ? true : undefined}
          aria-hidden={!labelsOn}
        >
          <div className="min-w-0 overflow-hidden">
            <div
              data-show={labelsOn ? "true" : "false"}
              className={cn(
                "site-nav-label pr-2",
                labelsOn ? "opacity-100" : "opacity-0",
              )}
            >
              <LocaleSlot
                variant={props.variant}
                label={props.languageLabel}
                size="bar"
              />
            </div>
          </div>
        </div>
        <NavCta
          variant={props.variant}
          label={props.ctaLabel}
          compact={compact}
          labelsOn={labelsOn}
          pathname={props.pathname}
        />
      </div>
    </>
  );
}

function MobileNav({
  scrolled,
  variant,
  menuLabel,
  closeLabel,
  languageLabel,
  siblingHref,
  siblingLabel,
  instagramUrl,
  instagramLabel,
  facebookUrl,
  facebookLabel,
  facebookAria,
  menuOpen,
  setMenuOpen,
  links,
  activeId,
  pathname,
  routeHomeLabel,
  sheetContactLabel,
  reduce,
  logoLabel,
  focusRing,
  logo,
  logoCompact,
  logoTraceSrc,
  introPlaying,
}: BarContentProps & {
  scrolled: boolean;
  menuLabel: string;
  closeLabel: string;
  siblingHref: string;
  siblingLabel: string;
  instagramUrl?: string;
  instagramLabel: string;
  facebookUrl?: string;
  facebookLabel: string;
  facebookAria: string;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const pendingNav = useRef<number | null>(null);
  const activeLabel = links.find((link) =>
    isLinkActive(link, activeId, pathname),
  )?.label;
  const showSheetHome = Boolean(routeHomeLabel) && pathname !== "/";
  const sheetLinkClass = cn(
    "-mx-3 inline-flex min-h-11 w-[calc(100%+1.5rem)] items-center gap-2 rounded-sm px-3 text-[17px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    variant === "design" && "font-medium",
    focusRing,
  );

  useEffect(() => {
    return () => {
      if (pendingNav.current !== null) window.clearTimeout(pendingNav.current);
    };
  }, []);

  function closeThen(run: () => void) {
    setMenuOpen(false);
    if (pendingNav.current !== null) window.clearTimeout(pendingNav.current);
    pendingNav.current = window.setTimeout(() => {
      pendingNav.current = null;
      run();
    }, reduce ? SHEET_CLOSE_REDUCED_MS : SHEET_CLOSE_MS);
  }

  function activateLink(link: SiteNavLink) {
    closeThen(() => {
      if (link.type === "route") {
        router.push(link.href);
        return;
      }
      lockNavAnchor(link.id);
      document.getElementById(link.id)?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
      });
    });
  }

  function activateHref(href: string) {
    closeThen(() => {
      window.location.assign(href);
    });
  }

  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <div
        data-variant={variant}
        data-scrolled={scrolled ? "true" : "false"}
        className={cn(
          "site-nav-bar pointer-events-auto relative flex h-14 w-full items-center justify-between px-2 md:hidden",
          variant === "design" ? "text-woodax-charcoal" : "text-cnc-text",
        )}
        style={{ borderRadius: "var(--radius-lg)" }}
      >
        <LogoSlot
          homeLabel={logoLabel}
          focusRing={focusRing}
          compact
          crossfade={false}
          tween={false}
          trace={introPlaying && variant === "cnc"}
          fade={variant === "design" && introPlaying}
          logo={logo}
          logoCompact={logoCompact}
          logoTraceSrc={logoTraceSrc}
        />
        {activeLabel ? (
          <p
            className={cn(
              "pointer-events-none absolute inset-x-14 truncate text-center text-[13px] leading-none",
              variant === "design" ? "font-medium" : "font-normal",
            )}
          >
            {activeLabel}
          </p>
        ) : null}
        <SheetTrigger asChild>
          <Button
            variant={
              variant === "design" ? "design-secondary" : "cnc-secondary"
            }
            className="size-11 shrink-0 px-0 focus-visible:outline-offset-[-2px]"
            aria-label={menuOpen ? closeLabel : menuLabel}
            aria-expanded={menuOpen}
          >
            <MenuGlyph open={menuOpen} />
          </Button>
        </SheetTrigger>
      </div>
      <SheetContent
        side="right"
        aria-describedby={undefined}
        className="gap-8 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        style={{
          top: "calc(3.5rem + max(0.75rem, env(safe-area-inset-top) + 0.5rem))",
          height: "auto",
          bottom: 0,
        }}
      >
        <SheetHeader>
          <SheetTitle>{menuLabel}</SheetTitle>
        </SheetHeader>
        <ul className="flex flex-col">
          {showSheetHome && routeHomeLabel ? (
            <li>
              <Link
                href="/"
                onClick={(event) => {
                  if (!isPlainClick(event)) return;
                  event.preventDefault();
                  closeThen(() => router.push("/"));
                }}
                className={sheetLinkClass}
              >
                <ArrowLeft
                  aria-hidden
                  strokeWidth={1.5}
                  className="size-4 shrink-0"
                />
                {routeHomeLabel}
              </Link>
            </li>
          ) : null}
          {links.map((link) => (
            <li key={itemKey(link)}>
              <SiteNavItem
                link={link}
                active={isLinkActive(link, activeId, pathname)}
                variant={variant}
                focusRing={focusRing}
                menu
                onNavigate={() => activateLink(link)}
              />
            </li>
          ))}
          {sheetContactLabel ? (
            <li>
              <Link
                href="/contact"
                aria-current={pathname === "/contact" ? "page" : undefined}
                onClick={(event) => {
                  if (!isPlainClick(event)) return;
                  event.preventDefault();
                  closeThen(() => router.push("/contact"));
                }}
                className={cn(
                  sheetLinkClass,
                  pathname === "/contact" &&
                    (variant === "design" ? "bg-woodax-cream" : "bg-cnc-line"),
                )}
              >
                {sheetContactLabel}
              </Link>
            </li>
          ) : null}
        </ul>
        <div className="mt-auto flex flex-col gap-1">
          {routeHomeLabel ? (
            <hr className="border-woodax-line my-2 border-0 border-t" />
          ) : null}
          <a
            href={siblingHref}
            onClick={(event) => {
              if (!isPlainClick(event)) return;
              event.preventDefault();
              activateHref(siblingHref);
            }}
            className={cn(
              "inline-flex min-h-11 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
              focusRing,
            )}
          >
            {siblingLabel}
          </a>
          {instagramUrl ? (
            <a
              href={instagramUrl}
              onClick={(event) => {
                if (!isPlainClick(event)) return;
                event.preventDefault();
                activateHref(instagramUrl);
              }}
              className={cn(
                "inline-flex min-h-11 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                focusRing,
              )}
            >
              {instagramLabel}
            </a>
          ) : null}
          {facebookUrl ? (
            <a
              href={facebookUrl}
              aria-label={facebookAria}
              onClick={(event) => {
                if (!isPlainClick(event)) return;
                event.preventDefault();
                activateHref(facebookUrl);
              }}
              className={cn(
                "inline-flex min-h-11 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                focusRing,
              )}
            >
              {facebookLabel}
            </a>
          ) : null}
          <LocaleSlot
            variant={variant}
            label={languageLabel}
            size="menu"
            onChange={() => setMenuOpen(false)}
          />
        </div>
        <SheetClose className="sr-only">{closeLabel}</SheetClose>
      </SheetContent>
    </Sheet>
  );
}

function MenuGlyph({ open }: { open: boolean }) {
  const icon =
    "absolute inset-0 size-5 transition-[opacity,rotate] duration-150 ease-[var(--ease-out)] motion-reduce:transition-none";
  return (
    <span className="relative size-5">
      <Menu
        aria-hidden
        strokeWidth={1.5}
        className={cn(
          icon,
          open ? "rotate-90 opacity-0" : "rotate-0 opacity-100",
        )}
      />
      <X
        aria-hidden
        strokeWidth={1.5}
        className={cn(
          icon,
          open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0",
        )}
      />
    </span>
  );
}

function LogoSlot({
  homeLabel,
  focusRing,
  compact,
  crossfade,
  tween,
  trace,
  fade,
  logo,
  logoCompact,
  logoTraceSrc,
}: {
  homeLabel: string;
  focusRing: string;
  compact: boolean;
  crossfade: boolean;
  tween: boolean;
  trace: boolean;
  fade: boolean;
  logo: ReactNode;
  logoCompact: ReactNode;
  logoTraceSrc?: string;
}) {
  const pathname = usePathname();
  const reduce = useReducedMotion() === true;
  const fullRef = useRef<HTMLSpanElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const [widths, setWidths] = useState<{ full: number; mark: number } | null>(
    null,
  );
  const logoControls = useAnimationControls();

  useLayoutEffect(() => {
    if (!crossfade) return;
    const full = fullRef.current;
    const mark = markRef.current;
    if (!full || !mark) return;

    const measure = () => {
      const nextFull = full.offsetWidth;
      const nextMark = mark.offsetWidth;
      if (nextFull < 1 || nextMark < 1) return;
      setWidths((current) =>
        current && current.full === nextFull && current.mark === nextMark
          ? current
          : { full: nextFull, mark: nextMark },
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(full);
    observer.observe(mark);
    return () => observer.disconnect();
  }, [crossfade, logo, logoCompact]);

  useEffect(() => {
    if (!fade) {
      void logoControls.set({ opacity: 1 });
      return;
    }

    void logoControls.set({ opacity: 0 });
    void logoControls.start({
      opacity: 1,
      transition: { duration: 0.55, delay: 0.12, ease: easeOut },
    });
  }, [fade, logoControls]);

  const slotWidth = compact ? widths?.mark : widths?.full;

  return (
    <motion.span
      animate={logoControls}
      className="relative inline-flex shrink-0"
    >
      <Link
        href="/"
        aria-label={homeLabel}
        onClick={(event) => {
          if (!isPlainClick(event) || pathname !== "/") return;
          event.preventDefault();
          window.scrollTo({
            top: 0,
            behavior: reduce ? "auto" : "smooth",
          });
        }}
        className={cn(
          "relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]",
          focusRing,
        )}
      >
        {crossfade ? (
          <>
            <span
              aria-hidden
              className="pointer-events-none invisible absolute flex h-0 w-max"
            >
              <span ref={fullRef} className="inline-flex">
                {cloneLogo(logo, { measure: true })}
              </span>
              <span ref={markRef} className="inline-flex">
                {cloneLogo(logoCompact, { measure: true })}
              </span>
            </span>
            <motion.span
              className="relative block h-11 overflow-hidden"
              initial={false}
              animate={{
                width: slotWidth ?? "auto",
                height: compact ? LOGO_COMPACT_PX : LOGO_FULL_PX,
              }}
              transition={tween ? morphTransition : { duration: 0 }}
            >
              <span
                className={cn(
                  "absolute top-1/2 left-0 -translate-y-1/2 transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  compact ? "opacity-0" : "opacity-100",
                )}
              >
                {cloneLogo(logo, { visible: !compact })}
                {trace ? <LogoToolpath src={logoTraceSrc} /> : null}
              </span>
              <span
                className={cn(
                  "absolute top-1/2 left-0 -translate-y-1/2 transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  compact ? "opacity-100" : "opacity-0",
                )}
              >
                {cloneLogo(logoCompact, { visible: compact })}
              </span>
            </motion.span>
          </>
        ) : (
          <span className="relative inline-flex h-8 items-center">
            {cloneLogo(compact ? logoCompact : logo, { visible: true })}
            {trace ? <LogoToolpath src={logoTraceSrc} /> : null}
          </span>
        )}
      </Link>
    </motion.span>
  );
}

type LogoCloneOptions = {
  measure?: boolean;
  visible?: boolean;
};

type LogoImgProps = {
  loading?: "eager" | "lazy";
  "aria-hidden"?: boolean | "true" | "false";
};

function cloneLogo(node: ReactNode, options: LogoCloneOptions = {}) {
  if (!isValidElement<LogoImgProps>(node)) {
    return node;
  }

  if (options.measure) {
    return cloneElement(node, {
      loading: "lazy",
      "aria-hidden": true,
    });
  }

  if (options.visible) {
    return <DisplayedLogo mark={node} />;
  }

  return cloneElement(node, {
    loading: "lazy",
  });
}

function DisplayedLogo({ mark }: { mark: ReactElement<LogoImgProps> }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const sync = () => {
      let current: HTMLElement | null = node;
      while (current) {
        const style = getComputedStyle(current);
        if (style.display === "none" || style.visibility === "hidden") {
          setShown(false);
          return;
        }
        current = current.parentElement;
      }
      setShown(true);
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(document.documentElement);
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  return (
    <span ref={ref} className="contents">
      {cloneElement(mark, {
        loading: shown ? undefined : "lazy",
      })}
    </span>
  );
}

function isLinkActive(
  link: SiteNavLink,
  activeId: string | null,
  pathname: string,
) {
  if (link.type === "anchor") return activeId === link.id;
  return pathname === link.href;
}

function NavLinks({
  links,
  activeId,
  pillId,
  pillVisible,
  pillAppearFade,
  pillInstant,
  pathname,
  variant,
  reduce,
  focusRing,
  showIndicator,
  routeHomeLabel,
  homeGrid,
  homeShown,
}: {
  links: SiteNavLink[];
  activeId: string | null;
  pillId: string | null;
  pillVisible: boolean;
  pillAppearFade: boolean;
  pillInstant: boolean;
  pathname: string;
  variant: Variant;
  reduce: boolean;
  focusRing: string;
  showIndicator: boolean;
  routeHomeLabel?: string;
  homeGrid: boolean;
  homeShown: boolean;
}) {
  return (
    <ul className="flex items-center">
      {routeHomeLabel ? (
        <HomeNavItem
          label={routeHomeLabel}
          grid={homeGrid}
          shown={homeShown}
          focusRing={focusRing}
        />
      ) : null}
      {links.map((link) => {
        const active = isLinkActive(link, activeId, pathname);
        const hasPill =
          link.type === "anchor" ? pillId === link.id : active;
        const isPillVisible =
          link.type === "anchor" ? pillVisible : active;
        const appearFade = link.type === "anchor" ? pillAppearFade : false;
        const instant = link.type === "anchor" ? pillInstant : false;

        return (
          <li key={itemKey(link)} className="shrink-0">
            <SiteNavItem
              link={link}
              active={active}
              hasPill={hasPill}
              pillVisible={isPillVisible}
              pillAppearFade={appearFade}
              pillInstant={instant}
              variant={variant}
              focusRing={focusRing}
              showIndicator={showIndicator}
              reduce={reduce}
            />
          </li>
        );
      })}
    </ul>
  );
}

function HomeNavItem({
  label,
  grid,
  shown,
  focusRing,
}: {
  label: string;
  grid: boolean;
  shown: boolean;
  focusRing: string;
}) {
  return (
    <li
      className={cn(
        "site-nav-collapse grid shrink-0",
        grid ? "grid-cols-[1fr]" : "grid-cols-[0fr]",
      )}
      inert={!shown ? true : undefined}
      aria-hidden={!shown ? true : undefined}
    >
      <div className="min-w-0 overflow-hidden">
        <Link
          href="/"
          data-show={shown ? "true" : "false"}
          tabIndex={shown ? undefined : -1}
          className={cn(
            "site-nav-label relative mx-1 inline-flex min-h-11 items-center gap-2 rounded-sm px-3 text-[15px] font-medium whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]",
            focusRing,
            shown ? "opacity-100" : "opacity-0",
          )}
        >
          <ArrowLeft aria-hidden strokeWidth={1.5} className="size-4 shrink-0" />
          {label}
        </Link>
      </div>
    </li>
  );
}

function SiteNavItem({
  link,
  active,
  hasPill = active,
  pillVisible = active,
  pillAppearFade = false,
  pillInstant = false,
  variant,
  focusRing,
  showIndicator = false,
  reduce = false,
  menu = false,
  onNavigate,
}: {
  link: SiteNavLink;
  active: boolean;
  hasPill?: boolean;
  pillVisible?: boolean;
  pillAppearFade?: boolean;
  pillInstant?: boolean;
  variant: Variant;
  focusRing: string;
  showIndicator?: boolean;
  reduce?: boolean;
  menu?: boolean;
  onNavigate?: () => void;
}) {
  const current = link.type === "route" ? "page" : "location";
  const className = cn(
    "focus-visible:outline focus-visible:outline-2",
    focusRing,
    menu
      ? cn(
          "-mx-3 inline-flex min-h-11 w-[calc(100%+1.5rem)] items-center rounded-sm px-3 text-[17px] focus-visible:outline-offset-2",
          variant === "design" && "font-medium",
        )
      : cn(
          "relative mx-1 inline-flex min-h-11 items-center rounded-sm px-3 text-[15px] whitespace-nowrap focus-visible:outline-offset-[-2px]",
          variant === "design" ? "font-medium" : "font-normal",
        ),
    menu &&
      active &&
      (variant === "design" ? "bg-woodax-cream" : "bg-cnc-line"),
  );
  const content = (
    <>
      {!menu && hasPill ? (
        showIndicator && !reduce ? (
          <motion.span
            layoutId="site-nav-indicator"
            initial={pillAppearFade ? { opacity: 0 } : false}
            animate={{ opacity: pillVisible ? 1 : 0 }}
            style={{ borderRadius: "var(--radius-sm)" }}
            className={cn(
              "absolute inset-0 rounded-sm",
              variant === "design" ? "bg-woodax-cream" : "bg-cnc-line",
            )}
            transition={{
              layout: {
                duration: pillInstant ? 0 : 0.24,
                ease: easeOut,
              },
              opacity: {
                duration: pillInstant ? 0 : 0.18,
                ease: easeOut,
              },
            }}
          />
        ) : active ? (
          <span
            className={cn(
              "absolute inset-0 rounded-sm",
              variant === "design" ? "bg-woodax-cream" : "bg-cnc-line",
            )}
          />
        ) : null
      ) : null}
      <span className={menu ? undefined : "relative"}>{link.label}</span>
    </>
  );

  if (link.type === "route") {
    return (
      <Link
        href={link.href}
        aria-current={active ? current : undefined}
        onClick={(event) => {
          if (!menu) return;
          if (!isPlainClick(event)) return;
          event.preventDefault();
          onNavigate?.();
        }}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return (
    <a
      href={`#${link.id}`}
      aria-current={active ? current : undefined}
      onClick={(event) => {
        if (menu) {
          if (!isPlainClick(event)) return;
          event.preventDefault();
          onNavigate?.();
          return;
        }
        lockNavAnchor(link.id);
        onNavigate?.();
      }}
      className={className}
    >
      {content}
    </a>
  );
}

function NavCta({
  variant,
  label,
  compact,
  labelsOn,
  pathname,
}: {
  variant: Variant;
  label: string;
  compact: boolean;
  labelsOn: boolean;
  pathname: string;
}) {
  const full = isDesignFull();
  const href = variant === "design" && full ? "/contact" : "#contacto";
  const onContact = variant === "design" && full && pathname === "/contact";
  const locale = useLocale();

  return (
    <CtaTooltip label={label} enabled={compact} variant={variant}>
      <Button
        href={href}
        variant={variant === "design" ? "design-primary" : "cnc-primary"}
        aria-label={label}
        aria-current={onContact ? "page" : undefined}
        onClick={() => {
          track("cta_click", {
            site: variant,
            locale: analyticsLocale(locale),
            location: "nav",
          });
          if (href === "#contacto") {
            lockNavAnchor("contacto");
          }
        }}
        className={cn(
          "relative ml-2 h-11 min-h-11 min-w-11 shrink-0 gap-0 px-0 focus-visible:outline-offset-[-2px]",
          variant === "cnc" && "focus-visible:outline-cnc-bg",
        )}
      >
        <span
          className={cn(
            "site-nav-collapse grid",
            compact ? "grid-cols-[0fr]" : "grid-cols-[1fr]",
          )}
        >
          <span className="min-w-0 overflow-hidden">
            <span
              data-show={labelsOn ? "true" : "false"}
              aria-hidden={!labelsOn}
              className={cn(
                "site-nav-label block pr-1 pl-4 whitespace-nowrap",
                labelsOn ? "opacity-100" : "opacity-0",
              )}
            >
              {label}
            </span>
          </span>
        </span>
        <span className="inline-flex size-11 items-center justify-center">
          <ArrowUpRight
            aria-hidden
            strokeWidth={1.5}
            className="size-4 transition-[translate] duration-(--duration-press) ease-out motion-reduce:transition-none pointer-fine:group-hover:translate-[4px_-4px]"
          />
        </span>
      </Button>
    </CtaTooltip>
  );
}

const TOOLTIP_GUTTER_PX = 8;

function clampTooltipX(x: number, width: number) {
  const half = width / 2;
  const minX = TOOLTIP_GUTTER_PX + half;
  const maxX = window.innerWidth - TOOLTIP_GUTTER_PX - half;
  if (minX > maxX) return window.innerWidth / 2;
  return Math.min(Math.max(x, minX), maxX);
}

function CtaTooltip({
  label,
  enabled,
  variant,
  children,
}: {
  label: string;
  enabled: boolean;
  variant: Variant;
  children: ReactNode;
}) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);
  const [point, setPoint] = useState({ x: 0, y: 0 });

  const syncPoint = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const width = tooltipRef.current?.offsetWidth ?? 0;
    const next = {
      x: width > 0 ? clampTooltipX(x, width) : x,
      y: rect.bottom,
    };
    setPoint((prev) => (prev.x === next.x && prev.y === next.y ? prev : next));
  }, []);

  function show(fromPointer: boolean) {
    if (!enabled) return;
    if (
      fromPointer &&
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }
    const node = anchorRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setPoint({ x: rect.left + rect.width / 2, y: rect.bottom });
    setShown(true);
    syncPoint();
  }

  useLayoutEffect(() => {
    if (!shown || !enabled) return;
    syncPoint();
  }, [shown, enabled, label, syncPoint]);

  useEffect(() => {
    if (!shown || !enabled) return;
    window.addEventListener("scroll", syncPoint, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", syncPoint);
    return () => {
      window.removeEventListener("scroll", syncPoint, true);
      window.removeEventListener("resize", syncPoint);
    };
  }, [shown, enabled, syncPoint]);

  return (
    <span
      ref={anchorRef}
      className="inline-flex"
      onMouseEnter={() => show(true)}
      onMouseLeave={() => setShown(false)}
      onFocus={() => show(false)}
      onBlur={() => setShown(false)}
    >
      {children}
      {shown && enabled
        ? createPortal(
            <span
              ref={tooltipRef}
              role="tooltip"
              className={cn(
                "site-nav-tooltip pointer-events-none fixed z-50 rounded-sm px-3 py-1 text-sm whitespace-nowrap",
                variant === "design"
                  ? "bg-woodax-charcoal text-woodax-cream"
                  : "bg-cnc-white text-cnc-bg",
              )}
              style={{ left: point.x, top: point.y }}
            >
              {label}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
