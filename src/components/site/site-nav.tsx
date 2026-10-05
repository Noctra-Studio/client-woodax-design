"use client";

import {
  cloneElement,
  isValidElement,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import {
  LayoutGroup,
  motion,
  useAnimationControls,
  useReducedMotion,
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
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;
const locales = ["es", "en"] as const;

export type SiteNavLink = {
  id: string;
  label: string;
};

type SiteNavProps = {
  variant: "design" | "cnc";
  links: SiteNavLink[];
  homeLabel: string;
  ctaLabel: string;
  menuLabel: string;
  closeLabel: string;
  languageLabel: string;
  siblingHref: string;
  siblingLabel: string;
  instagramUrl?: string;
  instagramLabel: string;
  logo: ReactNode;
  logoCompact: ReactNode;
};

export function SiteNav({
  variant,
  links,
  homeLabel,
  ctaLabel,
  menuLabel,
  closeLabel,
  languageLabel,
  siblingHref,
  siblingLabel,
  instagramUrl,
  instagramLabel,
  logo,
  logoCompact,
}: SiteNavProps) {
  const reduce = useReducedMotion() === true;
  const designIntro = useDesignIntro();
  const cncIntro = useCncIntro();
  const introPlaying =
    variant === "design"
      ? designIntro.status === "play"
      : cncIntro.status === "play";
  const [scrolled, setScrolled] = useState(false);
  const [shut, setShut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const linkIds = links.map((link) => link.id).join("\0");

  useEffect(() => {
    function onScroll() {
      const next = window.scrollY > 80;
      setScrolled((current) => (current === next ? current : next));
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(
      () => setShut(scrolled),
      !scrolled || reduce ? 0 : 120,
    );
    return () => window.clearTimeout(id);
  }, [reduce, scrolled]);

  useEffect(() => {
    const elements = linkIds
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
  }, [linkIds]);

  const focusRing =
    variant === "design"
      ? "focus-visible:outline-woodax-charcoal"
      : "focus-visible:outline-cnc-white";

  return (
    <nav
      aria-label={homeLabel}
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-6 md:pt-[max(1rem,env(safe-area-inset-top))]"
    >
      <LayoutGroup>
        <motion.div
          layout={reduce ? false : true}
          initial={false}
          animate={{ opacity: 1 }}
          transition={
            reduce
              ? { duration: 0.12, ease: easeOut }
              : { layout: { duration: 0.28, ease: easeOut } }
          }
          key={reduce ? (scrolled ? "shut" : "open") : "desktop"}
          className={cn(
            "pointer-events-auto hidden items-center rounded-full border md:flex",
            variant === "design"
              ? "border-woodax-line bg-woodax-paper"
              : "border-cnc-line bg-cnc-surface",
            scrolled
              ? "h-[52px] w-max gap-1 py-1.5 pr-1.5 pl-3"
              : "h-16 w-full max-w-[1200px] gap-2 py-2 pr-2 pl-5",
          )}
        >
          <LogoSlot
            homeLabel={homeLabel}
            focusRing={focusRing}
            compact={scrolled}
            trace={introPlaying && variant === "cnc"}
            fade={variant === "design" && introPlaying}
            logo={logo}
            logoCompact={logoCompact}
            reduce={reduce}
          />
          <motion.div
            layout={reduce ? false : true}
            className={cn(
              "flex items-center",
              !scrolled && "flex-1 justify-center",
            )}
          >
            <NavLinks
              links={links}
              activeId={activeId}
              variant={variant}
              reduce={reduce}
              focusRing={focusRing}
            />
          </motion.div>
          <div
            className={cn(
              "grid transition-[grid-template-columns,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-[120ms]",
              scrolled
                ? "pointer-events-none grid-cols-[0fr] opacity-0"
                : "grid-cols-[1fr] opacity-100",
            )}
            inert={scrolled ? true : undefined}
            aria-hidden={scrolled}
          >
            <div className={cn("min-w-0", scrolled && "overflow-hidden")}>
              <LocaleSlot variant={variant} label={languageLabel} />
            </div>
          </div>
          <NavCta
            variant={variant}
            label={ctaLabel}
            collapsed={scrolled}
            shut={shut}
            reduce={reduce}
          />
        </motion.div>
      </LayoutGroup>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <div
          className={cn(
            "pointer-events-auto flex h-[52px] w-full items-center justify-between rounded-full border pr-1.5 pl-3 md:hidden",
            variant === "design"
              ? "border-woodax-line bg-woodax-paper"
              : "border-cnc-line bg-cnc-surface",
          )}
        >
          <LogoSlot
            homeLabel={homeLabel}
            focusRing={focusRing}
            compact
            trace={introPlaying && variant === "cnc"}
            fade={variant === "design" && introPlaying}
            logo={logo}
            logoCompact={logoCompact}
            reduce={reduce}
          />
          <SheetTrigger asChild>
            <Button
              variant={variant === "design" ? "design-secondary" : "cnc-secondary"}
              className="size-11 px-0"
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
            {links.map((link) => {
              const active = activeId === link.id;
              return (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    aria-current={active ? "location" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "inline-flex min-h-11 w-full items-center rounded-full px-3 text-[17px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                      focusRing,
                      active &&
                        (variant === "design" ? "bg-woodax-cream" : "bg-cnc-line"),
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
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
            <LocaleSlot variant={variant} label={languageLabel} />
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}

function LogoSlot({
  homeLabel,
  focusRing,
  compact,
  trace,
  fade,
  logo,
  logoCompact,
  reduce,
}: {
  homeLabel: string;
  focusRing: string;
  compact: boolean;
  trace: boolean;
  fade: boolean;
  logo: ReactNode;
  logoCompact: ReactNode;
  reduce: boolean;
}) {
  const logoControls = useAnimationControls();

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

  return (
    <motion.div layout={reduce ? false : true} className="relative shrink-0">
      <Link
        href="/"
        aria-label={homeLabel}
        className={cn(
          "relative inline-flex items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          focusRing,
        )}
      >
        <motion.span animate={logoControls} className="relative inline-flex">
          <span
            className={cn(
              "inline-flex transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-[120ms]",
              compact
                ? "pointer-events-none absolute opacity-0"
                : "opacity-100",
            )}
          >
            {cloneNode(logo)}
          </span>
          <span
            className={cn(
              "inline-flex transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-[120ms]",
              compact
                ? "opacity-100"
                : "pointer-events-none absolute opacity-0",
            )}
          >
            {cloneNode(logoCompact)}
          </span>
          {trace ? <LogoToolpath /> : null}
        </motion.span>
      </Link>
    </motion.div>
  );
}

function cloneNode(node: ReactNode) {
  return isValidElement(node) ? cloneElement(node) : node;
}

function NavLinks({
  links,
  activeId,
  variant,
  reduce,
  focusRing,
}: {
  links: SiteNavLink[];
  activeId: string | null;
  variant: "design" | "cnc";
  reduce: boolean;
  focusRing: string;
}) {
  return (
    <ul className="flex items-center">
      {links.map((link) => {
        const active = activeId === link.id;
        return (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              aria-current={active ? "location" : undefined}
              className={cn(
                "relative inline-flex min-h-11 items-center rounded-full px-3 text-[15px] font-normal whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                focusRing,
              )}
            >
              {active ? (
                <motion.span
                  layoutId="site-nav-indicator"
                  className={cn(
                    "absolute inset-0 rounded-full",
                    variant === "design" ? "bg-woodax-cream" : "bg-cnc-line",
                  )}
                  transition={{ duration: reduce ? 0 : 0.24, ease: easeOut }}
                />
              ) : null}
              <span className="relative">{link.label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function NavCta({
  variant,
  label,
  collapsed,
  shut,
  reduce,
}: {
  variant: "design" | "cnc";
  label: string;
  collapsed: boolean;
  shut: boolean;
  reduce: boolean;
}) {
  return (
    <motion.div layout={reduce ? false : true} className="relative shrink-0">
      <Button
        href="#contacto"
        variant={variant === "design" ? "design-primary" : "cnc-primary"}
        aria-label={label}
        className={cn(
          "relative",
          shut && "size-10 min-h-10 min-w-10 rounded-full px-0",
        )}
      >
        <span
          className={cn(
            "whitespace-nowrap transition-opacity duration-[120ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            collapsed ? "opacity-0" : "opacity-100",
            shut && "absolute",
          )}
          style={{ transitionDelay: collapsed ? "0ms" : "120ms" }}
          aria-hidden={collapsed}
        >
          {label}
        </span>
        <ArrowUpRight
          aria-hidden
          strokeWidth={1.5}
          className={cn(
            "size-4 shrink-0 transition-opacity duration-[120ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            shut ? "opacity-100" : "absolute opacity-0",
          )}
        />
        {shut ? (
          <span
            role="tooltip"
            className={cn(
              "pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-sm whitespace-nowrap opacity-0 transition-opacity duration-150 pointer-fine:group-hover:opacity-100 group-focus-visible:opacity-100",
              variant === "design"
                ? "bg-woodax-charcoal text-woodax-cream"
                : "bg-cnc-white text-cnc-bg",
            )}
          >
            {label}
          </span>
        ) : null}
      </Button>
    </motion.div>
  );
}

function LocaleSlot({
  variant,
  label,
}: {
  variant: "design" | "cnc";
  label: string;
}) {
  return (
    <Suspense fallback={<LocaleFallback variant={variant} />}>
      <LocaleSwitch variant={variant} label={label} />
    </Suspense>
  );
}

function LocaleFallback({ variant }: { variant: "design" | "cnc" }) {
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
  variant: "design" | "cnc";
  label: string;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = Object.fromEntries(searchParams.entries());
  const href =
    Object.keys(query).length > 0 ? { pathname, query } : pathname;
  const focusRing =
    variant === "design"
      ? "focus-visible:outline-woodax-charcoal"
      : "focus-visible:outline-cnc-white";

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex items-center p-1 text-[13px] font-medium",
        variant === "design"
          ? "text-woodax-charcoal tracking-[0.18em]"
          : "border-cnc-line rounded-[4px] border tracking-[0.08em]",
      )}
    >
      {locales.map((code) => {
        const codeLabel = code.toUpperCase();
        if (code === locale) {
          return (
            <span
              key={code}
              aria-current="true"
              lang={code}
              className={cn(
                "inline-flex min-h-11 min-w-11 items-center justify-center",
                variant === "cnc" && "bg-cnc-white text-cnc-bg rounded-[4px]",
              )}
            >
              {codeLabel}
            </span>
          );
        }

        return (
          <Link
            key={code}
            href={href}
            locale={code}
            lang={code}
            hrefLang={code}
            className={cn(
              "inline-flex min-h-11 min-w-11 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
              focusRing,
              variant === "design"
                ? "pointer-fine:hover:bg-woodax-cream rounded-full"
                : "pointer-fine:hover:bg-cnc-surface rounded-[4px]",
            )}
          >
            {codeLabel}
          </Link>
        );
      })}
    </div>
  );
}
