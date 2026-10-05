"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useAnimationControls } from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useIntro } from "@/components/design/intro-provider";
import { cn } from "@/lib/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;
const locales = ["es", "en"] as const;

export function SiteHeader({
  logo,
  skipLabel,
}: {
  logo: ReactNode;
  skipLabel: string;
}) {
  const [solid, setSolid] = useState(false);
  const { status, skip } = useIntro();
  const logoControls = useAnimationControls();

  useEffect(() => {
    function onScroll() {
      setSolid(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (status !== "play") {
      void logoControls.set({ opacity: 1 });
      return;
    }
    void logoControls.set({ opacity: 0 });
    void logoControls.start({
      opacity: 1,
      transition: { duration: 0.55, delay: 0.12, ease: easeOut },
    });
  }, [logoControls, status]);

  return (
    <header
      className={cn(
        "fixed top-[env(safe-area-inset-top)] right-[env(safe-area-inset-right)] left-[env(safe-area-inset-left)] z-30",
        "border-b transition-[background-color,border-color] duration-(--duration-ui) ease-out motion-reduce:transition-none",
        solid
          ? "border-woodax-sand bg-woodax-cream"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-5 md:px-8">
        <motion.div animate={logoControls} translate="no" className="min-w-0">
          {logo}
        </motion.div>
        <div className="flex items-center gap-2">
          {status === "play" ? (
            <button
              type="button"
              onClick={skip}
              className="text-woodax-charcoal focus-visible:outline-woodax-charcoal pointer-fine:hover:bg-woodax-sand bg-woodax-cream inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {skipLabel}
            </button>
          ) : null}
          <Suspense fallback={<LocaleFallback />}>
            <LocaleSwitch />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

function LocaleFallback() {
  return (
    <div
      aria-hidden="true"
      className="bg-woodax-cream/90 h-11 w-[5.5rem] rounded-full"
    />
  );
}

function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = Object.fromEntries(searchParams.entries());

  return (
    <nav
      aria-label="ES / EN"
      className="bg-woodax-cream/90 text-woodax-charcoal flex items-center rounded-full p-1 text-[13px] font-medium tracking-[0.18em]"
    >
      {locales.map((code) => {
        const label = code.toUpperCase();
        if (code === locale) {
          return (
            <span
              key={code}
              aria-current="true"
              lang={code}
              className="inline-flex min-h-11 min-w-11 items-center justify-center"
            >
              {label}
            </span>
          );
        }

        return (
          <Link
            key={code}
            href={
              Object.keys(query).length > 0 ? { pathname, query } : pathname
            }
            locale={code}
            lang={code}
            hrefLang={code}
            className="focus-visible:outline-woodax-charcoal pointer-fine:hover:bg-woodax-sand inline-flex min-h-11 min-w-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
