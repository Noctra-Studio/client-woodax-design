"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { animate } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LogoToolpath } from "@/components/cnc/logo-toolpath";
import { useIntro } from "@/components/cnc/intro-provider";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const locales = ["es", "en"] as const;
const easeOut = [0.22, 1, 0.36, 1] as const;

export function SiteHeader({
  logo,
  skipLabel,
}: {
  logo: ReactNode;
  skipLabel: string;
}) {
  const [solid, setSolid] = useState(false);
  const { status, skip } = useIntro();

  useEffect(() => {
    function onScroll() {
      setSolid(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "bg-cnc-bg fixed top-[env(safe-area-inset-top)] right-[env(safe-area-inset-right)] left-[env(safe-area-inset-left)] z-30",
        "border-b transition-[border-color] duration-(--duration-ui) ease-out motion-reduce:transition-none",
        solid ? "border-cnc-line" : "border-transparent",
      )}
    >
      <div className="mx-auto flex min-h-16 w-full max-w-[1200px] flex-wrap items-center justify-between gap-3 px-5 py-2 md:px-8">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
          <div translate="no" className="relative min-w-0">
            {logo}
            {status === "play" ? <LogoToolpath /> : null}
          </div>
          {status === "play" ? <CoordinateReadout /> : null}
        </div>
        <div className="flex items-center gap-2">
          {status === "play" ? (
            <button
              type="button"
              onClick={skip}
              className="border-cnc-muted text-cnc-text focus-visible:outline-cnc-white pointer-fine:hover:border-cnc-text pointer-fine:hover:bg-cnc-surface inline-flex min-h-11 items-center rounded-[4px] border bg-cnc-bg px-4 text-sm font-medium select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
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

function CoordinateReadout() {
  const t = useTranslations("cnc.hero");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const controls = animate(0, 1, {
      duration: 0.9,
      ease: easeOut,
      onUpdate: (value) => setProgress(value),
    });
    return () => controls.stop();
  }, []);

  const value = progress.toFixed(3);

  return (
    <p
      aria-hidden="true"
      className="text-cnc-muted basis-full font-mono text-sm tracking-[0.08em] uppercase tabular-nums sm:basis-auto"
    >
      {t("axisX")} {value}
      <span className="px-2">{t("axisY")}</span>
      {value}
    </p>
  );
}

function LocaleFallback() {
  return (
    <div
      aria-hidden="true"
      className="border-cnc-muted h-11 w-[5.75rem] rounded-[4px] border"
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
      className="border-cnc-muted flex items-center rounded-[4px] border p-1 text-sm font-medium tracking-[0.08em]"
    >
      {locales.map((code) => {
        const label = code.toUpperCase();
        if (code === locale) {
          return (
            <span
              key={code}
              aria-current="true"
              lang={code}
              className="bg-cnc-white text-cnc-bg inline-flex min-h-11 min-w-11 items-center justify-center rounded-[4px]"
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
            className="text-cnc-text focus-visible:outline-cnc-white pointer-fine:hover:bg-cnc-surface inline-flex min-h-11 min-w-11 items-center justify-center rounded-[4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
