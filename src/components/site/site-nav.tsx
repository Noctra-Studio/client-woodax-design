"use client";

import {
  cloneElement,
  isValidElement,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useIntro as useDesignIntro } from "@/components/design/intro-provider";
import { LogoToolpath } from "@/components/cnc/logo-toolpath";
import { useIntro as useCncIntro } from "@/components/cnc/intro-provider";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

if (typeof document !== "undefined") {
  document.documentElement.dataset.navModule = "1";
}

const easeOut = [0.22, 1, 0.36, 1] as const;
const morphTransition = { duration: 0.32, ease: easeOut };
const locales = ["es", "en"] as const;
const LOCALE_SCROLL_KEY = "woodax-locale-scroll";
const SCROLL_DOWN = 64;
const SCROLL_UP = 24;

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

type Variant = "design" | "cnc";

type SiteNavProps = {
  variant: Variant;
  links: SiteNavLink[];
  homeLabel: string;
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
  logo: ReactNode;
  logoCompact: ReactNode;
};

type Box = { open: number; shut: number };

export function SiteNav({
  variant,
  links,
  homeLabel,
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
  logo,
  logoCompact,
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const pathname = usePathname();
  const anchorIds = links
    .flatMap((link) => (link.type === "anchor" ? [link.id] : []))
    .join("\0");

  useEffect(() => {
    const elements = anchorIds
      .split("\0")
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.boundingClientRect.top);
          } else {
            visible.delete(entry.target.id);
          }
        }

        const ranked = [...visible.entries()].sort((a, b) => a[1] - b[1]);
        setActiveId(ranked[0]?.[0] ?? null);
      },
      { rootMargin: "-20% 0px -45% 0px", threshold: [0, 0.2, 0.5] },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [anchorIds]);

  const focusRing =
    variant === "design"
      ? "focus-visible:outline-woodax-charcoal"
      : "focus-visible:outline-cnc-white";

  const barProps = {
    variant,
    links,
    activeId,
    pathname,
    homeLabel,
    logoLabel: logoLabel ?? homeLabel,
    ctaLabel,
    focusRing,
    logo,
    logoCompact,
    languageLabel,
    introPlaying,
    reduce,
  };

  return (
    <nav
      aria-label={homeLabel}
      className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-6"
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

  useEffect(() => {
    document.documentElement.dataset.navMounted = "1";
    const unsubscribe = scrollY.on("change", (value) => {
      document.documentElement.dataset.navOn = String(value);
    });
    const onScroll = () => {
      document.documentElement.dataset.navWin = String(window.scrollY);
      document.documentElement.dataset.navGet = String(scrollY.get());
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      unsubscribe();
      window.removeEventListener("scroll", onScroll);
    };
  }, [scrollY]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    document.documentElement.dataset.navScroll = String(latest);
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
  const linkKey = links.map((link) => link.label).join("\0");

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
      />
      {reduce ? (
        <ReducedBars
          scrolled={scrolled}
          reduce={reduce}
          links={links}
          logoCompact={logoCompact}
          {...rest}
        />
      ) : (
        <motion.div
          initial={false}
          animate={{
            width: box ? (morph ? box.shut : box.open) : "100%",
            height: morph ? 56 : 72,
            ...(morph ? shutPad : openPad),
          }}
          transition={tween ? morphTransition : { duration: 0 }}
          data-variant={rest.variant}
          data-scrolled={morph ? "true" : "false"}
          className={cn(
            "site-nav-bar pointer-events-auto mx-auto flex items-center gap-2 overflow-hidden",
            rest.variant === "design"
              ? "text-woodax-charcoal"
              : "text-cnc-text",
          )}
          style={{ borderRadius: 9999 }}
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
}: {
  measureRef: RefObject<HTMLDivElement | null>;
  links: SiteNavLink[];
  logoCompact: ReactNode;
  variant: Variant;
}) {
  return (
    <div
      ref={measureRef}
      aria-hidden
      data-variant={variant}
      data-scrolled="false"
      className="site-nav-bar pointer-events-none invisible absolute top-0 left-0 flex w-max items-center gap-2 py-2 pr-2 pl-3"
      style={{ borderRadius: 9999 }}
    >
      <span className="inline-flex h-7 items-center">
        {cloneNode(logoCompact)}
      </span>
      <ul className="flex items-center">
        {links.map((link) => (
          <li
            key={itemKey(link)}
            className="inline-flex min-h-11 items-center px-3 text-[15px] font-normal whitespace-nowrap"
          >
            {link.label}
          </li>
        ))}
      </ul>
      <span className="size-10 shrink-0" />
    </div>
  );
}

function ReducedBars(props: BarContentProps & { scrolled: boolean }) {
  const { scrolled, ...bar } = props;
  return (
    <div className="relative h-[72px]">
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
            "site-nav-bar pointer-events-auto absolute top-0 flex items-center gap-2 overflow-hidden",
            scrolled
              ? "inset-x-0 mx-auto h-14 w-max py-2 pr-2 pl-3"
              : "inset-x-0 h-[72px] w-full py-4 pr-2 pl-5",
            bar.variant === "design" ? "text-woodax-charcoal" : "text-cnc-text",
          )}
          style={{ borderRadius: 9999 }}
        >
          <BarContent
            {...bar}
            compact={scrolled}
            labelsOn={!scrolled}
            tween={false}
            showIndicator={false}
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
  pathname: string;
  homeLabel: string;
  logoLabel: string;
  ctaLabel: string;
  focusRing: string;
  logo: ReactNode;
  logoCompact: ReactNode;
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
      />
      <div className="flex min-w-0 flex-1 items-center justify-center">
        <NavLinks
          links={props.links}
          activeId={props.activeId}
          pathname={props.pathname}
          variant={props.variant}
          reduce={props.reduce || !showIndicator}
          focusRing={props.focusRing}
          showIndicator={showIndicator}
        />
      </div>
      <div className="flex shrink-0 items-center">
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
  menuOpen,
  setMenuOpen,
  links,
  activeId,
  pathname,
  logoLabel,
  focusRing,
  logo,
  logoCompact,
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
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}) {
  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <div
        data-variant={variant}
        data-scrolled={scrolled ? "true" : "false"}
        className={cn(
          "site-nav-bar pointer-events-auto flex h-[52px] w-full items-center justify-between pr-1.5 pl-3 md:hidden",
          variant === "design" ? "text-woodax-charcoal" : "text-cnc-text",
        )}
        style={{ borderRadius: 9999 }}
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
        />
        <SheetTrigger asChild>
          <Button
            variant={
              variant === "design" ? "design-secondary" : "cnc-secondary"
            }
            className="size-11 shrink-0 px-0 focus-visible:outline-offset-[-2px]"
            aria-label={menuLabel}
          >
            <Menu aria-hidden strokeWidth={1.5} className="size-5" />
          </Button>
        </SheetTrigger>
      </div>
      <SheetContent
        side="right"
        aria-describedby={undefined}
        className="gap-8 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader>
          <SheetTitle>{menuLabel}</SheetTitle>
          <SheetClose asChild>
            <button
              type="button"
              aria-label={closeLabel}
              className={cn(
                "inline-flex size-11 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                focusRing,
                variant === "design" ? "rounded-full" : "rounded-[4px]",
              )}
            >
              <X aria-hidden strokeWidth={1.5} className="size-5" />
            </button>
          </SheetClose>
        </SheetHeader>
        <ul className="flex flex-col">
          {links.map((link) => (
            <li key={itemKey(link)}>
              <SiteNavItem
                link={link}
                active={isLinkActive(link, activeId, pathname)}
                variant={variant}
                focusRing={focusRing}
                menu
                onNavigate={() => setMenuOpen(false)}
              />
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-1">
          <a
            href={siblingHref}
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
              className={cn(
                "inline-flex min-h-11 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                focusRing,
              )}
            >
              {facebookLabel}
            </a>
          ) : null}
          <LocaleSlot variant={variant} label={languageLabel} size="menu" />
        </div>
      </SheetContent>
    </Sheet>
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
}) {
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
        className={cn(
          "relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]",
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
                {cloneNode(logo)}
              </span>
              <span ref={markRef} className="inline-flex">
                {cloneNode(logoCompact)}
              </span>
            </span>
            <motion.span
              className="relative block h-7 overflow-hidden"
              initial={false}
              animate={slotWidth ? { width: slotWidth } : { width: "auto" }}
              transition={tween ? morphTransition : { duration: 0 }}
            >
              <span
                className={cn(
                  "absolute top-1/2 left-0 -translate-y-1/2 transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  compact ? "opacity-0" : "opacity-100",
                )}
              >
                {cloneNode(logo)}
                {trace ? <LogoToolpath /> : null}
              </span>
              <span
                className={cn(
                  "absolute top-1/2 left-0 -translate-y-1/2 transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  compact ? "opacity-100" : "opacity-0",
                )}
              >
                {cloneNode(logoCompact)}
              </span>
            </motion.span>
          </>
        ) : (
          <span className="relative inline-flex h-7 items-center">
            {cloneNode(compact ? logoCompact : logo)}
            {trace ? <LogoToolpath /> : null}
          </span>
        )}
      </Link>
    </motion.span>
  );
}

function cloneNode(node: ReactNode) {
  return isValidElement(node) ? cloneElement(node) : node;
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
  pathname,
  variant,
  reduce,
  focusRing,
  showIndicator,
}: {
  links: SiteNavLink[];
  activeId: string | null;
  pathname: string;
  variant: Variant;
  reduce: boolean;
  focusRing: string;
  showIndicator: boolean;
}) {
  return (
    <ul className="flex items-center">
      {links.map((link) => (
        <li key={itemKey(link)} className="shrink-0">
          <SiteNavItem
            link={link}
            active={isLinkActive(link, activeId, pathname)}
            variant={variant}
            focusRing={focusRing}
            showIndicator={showIndicator}
            reduce={reduce}
          />
        </li>
      ))}
    </ul>
  );
}

function SiteNavItem({
  link,
  active,
  variant,
  focusRing,
  showIndicator = false,
  reduce = false,
  menu = false,
  onNavigate,
}: {
  link: SiteNavLink;
  active: boolean;
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
      ? "inline-flex min-h-11 w-full items-center rounded-full px-3 text-[17px] focus-visible:outline-offset-2"
      : "relative inline-flex min-h-11 items-center rounded-full px-3 text-[15px] font-normal whitespace-nowrap focus-visible:outline-offset-[-2px]",
    menu &&
      active &&
      (variant === "design" ? "bg-woodax-cream" : "bg-cnc-line"),
  );
  const content = (
    <>
      {!menu && active ? (
        showIndicator ? (
          <motion.span
            layoutId="site-nav-indicator"
            className={cn(
              "absolute inset-0 rounded-full",
              variant === "design" ? "bg-woodax-cream" : "bg-cnc-line",
            )}
            transition={{ duration: reduce ? 0 : 0.24, ease: easeOut }}
          />
        ) : (
          <span
            className={cn(
              "absolute inset-0 rounded-full",
              variant === "design" ? "bg-woodax-cream" : "bg-cnc-line",
            )}
          />
        )
      ) : null}
      <span className={menu ? undefined : "relative"}>{link.label}</span>
    </>
  );

  if (link.type === "route") {
    return (
      <Link
        href={link.href}
        aria-current={active ? current : undefined}
        onClick={onNavigate}
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
      onClick={onNavigate}
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
  const href = variant === "design" ? "/contact" : "#contacto";
  const onContact = variant === "design" && pathname === "/contact";

  return (
    <CtaTooltip label={label} enabled={compact} variant={variant}>
      <Button
        href={href}
        variant={variant === "design" ? "design-primary" : "cnc-primary"}
        aria-label={label}
        aria-current={onContact ? "page" : undefined}
        className={cn(
          "relative h-11 min-h-11 shrink-0 gap-0 rounded-full px-0 focus-visible:outline-offset-[-2px]",
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
  const [shown, setShown] = useState(false);
  const [point, setPoint] = useState({ x: 0, y: 0 });

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
    setPoint({ x: rect.left + rect.width / 2, y: rect.top });
    setShown(true);
  }

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
              role="tooltip"
              className={cn(
                "site-nav-tooltip pointer-events-none fixed z-50 rounded-full px-3 py-1 text-sm whitespace-nowrap",
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

function LocaleSlot({
  variant,
  label,
  size,
}: {
  variant: Variant;
  label: string;
  size: "bar" | "menu";
}) {
  return (
    <Suspense fallback={<LocaleFallback variant={variant} size={size} />}>
      <LocaleSwitch variant={variant} label={label} size={size} />
    </Suspense>
  );
}

function LocaleFallback({
  variant,
}: {
  variant: Variant;
  size: "bar" | "menu";
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "h-11 w-[5.5rem]",
        variant === "design" ? "rounded-full" : "rounded-[4px]",
      )}
    />
  );
}

function LocaleSwitch({
  variant,
  label,
}: {
  variant: Variant;
  label: string;
  size: "bar" | "menu";
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusRing =
    variant === "design"
      ? "focus-visible:outline-woodax-charcoal"
      : "focus-visible:outline-cnc-white";
  const hit = "min-h-11 min-w-11";

  useLayoutEffect(() => {
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(LOCALE_SCROLL_KEY);
      sessionStorage.removeItem(LOCALE_SCROLL_KEY);
    } catch {
      return;
    }
    if (!raw) return;

    let saved: { y?: number; hash?: string };
    try {
      saved = JSON.parse(raw) as { y?: number; hash?: string };
    } catch {
      return;
    }

    const hash = saved.hash ?? "";
    if (hash && window.location.hash !== hash) {
      const next = `${window.location.pathname}${window.location.search}${hash}`;
      window.history.replaceState(null, "", next);
    }
    if (typeof saved.y === "number") window.scrollTo(0, saved.y);
  }, [locale]);

  function selectLocale(code: (typeof locales)[number]) {
    if (code === locale) return;
    try {
      sessionStorage.setItem(
        LOCALE_SCROLL_KEY,
        JSON.stringify({
          y: window.scrollY,
          hash: window.location.hash,
        }),
      );
    } catch {
      // Private browsing can reject storage; the locale still changes.
    }
    const query = Object.fromEntries(searchParams.entries());
    const href = Object.keys(query).length > 0 ? { pathname, query } : pathname;
    router.replace(href, { locale: code, scroll: false });
  }

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-center p-0.5 text-[13px]",
        variant === "design"
          ? "text-woodax-charcoal rounded-full"
          : "border-cnc-line rounded-[4px] border tracking-[0.08em]",
      )}
    >
      {locales.map((code) => {
        const codeLabel = code.toUpperCase();
        const active = code === locale;
        const shape = variant === "design" ? "rounded-full" : "rounded-[4px]";
        if (active) {
          return (
            <span
              key={code}
              aria-current="true"
              lang={code}
              className={cn(
                "inline-flex items-center justify-center px-2 font-medium",
                hit,
                shape,
                variant === "design"
                  ? "bg-woodax-cream text-woodax-charcoal"
                  : "bg-cnc-white text-cnc-bg",
              )}
            >
              {codeLabel}
            </span>
          );
        }

        return (
          <button
            key={code}
            type="button"
            lang={code}
            onClick={() => selectLocale(code)}
            className={cn(
              "inline-flex items-center justify-center px-2 font-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
              hit,
              shape,
              focusRing,
              variant === "design"
                ? "text-woodax-charcoal/75 pointer-fine:hover:bg-woodax-cream"
                : "text-cnc-muted pointer-fine:hover:bg-cnc-surface",
            )}
          >
            {codeLabel}
          </button>
        );
      })}
    </div>
  );
}
