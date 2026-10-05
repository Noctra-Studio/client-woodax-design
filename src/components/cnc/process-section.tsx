"use client";

import { useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { RegistrationMarks } from "@/components/cnc/registration-marks";

const steps = ["step1", "step2", "step3"] as const;

export function ProcessSection() {
  const t = useTranslations("cnc.process");
  const trailRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = trailRef.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let drawn = false;

    const draw = () => {
      if (drawn) return;
      drawn = true;
      element.dataset.draw = "wait";
      frame = requestAnimationFrame(() => {
        element.dataset.draw = "shown";
      });
      window.removeEventListener("scroll", onScroll);
    };

    const onScroll = () => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.86 && rect.bottom > 0) draw();
    };

    element.dataset.draw = "wait";
    onScroll();
    if (!drawn) {
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section
      id="proceso"
      aria-labelledby="cnc-process-title"
      className="relative scroll-mt-24 px-5 py-16 md:px-8 md:py-24 lg:py-32"
    >
      <RegistrationMarks />
      <div className="relative mx-auto w-full max-w-[1200px]">
        <h2
          id="cnc-process-title"
          className="max-w-[18ch] text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.02em] text-balance"
        >
          {t("title")}
        </h2>
        <div ref={trailRef} className="relative mt-12 md:mt-16">
          <div
            aria-hidden="true"
            className="cnc-track text-cnc-muted pointer-events-none absolute top-2.5 hidden h-px md:block"
            style={{ left: "2.25rem", right: "28%" }}
          >
            <svg
              viewBox="0 0 100 1"
              preserveAspectRatio="none"
              className="h-px w-full"
            >
              <line
                x1="0"
                y1="0.5"
                x2="100"
                y2="0.5"
                stroke="currentColor"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <div
            aria-hidden="true"
            className="cnc-track-y text-cnc-muted pointer-events-none absolute top-2 bottom-2 left-[0.7rem] w-px md:hidden"
          >
            <svg
              viewBox="0 0 1 100"
              preserveAspectRatio="none"
              className="h-full w-px"
            >
              <line
                x1="0.5"
                y1="0"
                x2="0.5"
                y2="100"
                stroke="currentColor"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((key, index) => {
              const text = t(key);
              const splitAt = text.indexOf(" ");
              const number = splitAt === -1 ? text : text.slice(0, splitAt);
              const label = splitAt === -1 ? "" : text.slice(splitAt + 1);
              return (
                <li
                  key={key}
                  className="cnc-step relative max-w-[62ch] pl-10 md:pl-0"
                  style={{ transitionDelay: `${index * 70}ms` }}
                >
                  <p className="bg-cnc-bg text-cnc-text relative z-10 inline-block pr-3 font-mono text-sm tracking-[0.08em] uppercase tabular-nums">
                    {number}
                  </p>
                  {label ? (
                    <h3 className="mt-3 text-[clamp(1.25rem,2vw,1.5rem)] font-medium text-balance">
                      {label}
                    </h3>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
        <p className="text-cnc-muted mt-10 max-w-[62ch] text-sm leading-relaxed">
          {t("formats")}
        </p>
      </div>
    </section>
  );
}
