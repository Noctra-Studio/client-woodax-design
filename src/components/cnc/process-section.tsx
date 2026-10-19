"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { RegistrationMarks } from "@/components/cnc/registration-marks";
import { cncFileFormatList, siteConfig } from "@/content/site-config";

const steps = [
  { key: "step1", outputKey: "step1Output" },
  { key: "step2", outputKey: "step2Output" },
  { key: "step3", outputKey: "step3Output" },
] as const;

export function ProcessSection() {
  const t = useTranslations("cnc.process");
  const locale = useLocale();
  const formats = cncFileFormatList(locale);
  const hours = siteConfig.cncOffer.quoteBusinessHours;
  const trailRef = useRef<HTMLDivElement>(null);
  const firstMarkRef = useRef<HTMLParagraphElement>(null);
  const lastMarkRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const root = trailRef.current;
    const first = firstMarkRef.current;
    const last = lastMarkRef.current;
    if (!root || !first || !last) return;

    const updateGeometry = () => {
      const start = centerIn(root, first);
      const end = centerIn(root, last);
      const gutter = Math.max(0, start.x - first.offsetWidth / 2 - 14);
      root.style.setProperty("--process-x1", `${start.x}px`);
      root.style.setProperty("--process-y1", `${start.y}px`);
      root.style.setProperty("--process-x3", `${end.x}px`);
      root.style.setProperty("--process-y3", `${end.y}px`);
      root.style.setProperty("--process-gutter", `${gutter}px`);
    };

    updateGeometry();
    const observer = new ResizeObserver(updateGeometry);
    observer.observe(root);
    observer.observe(first);
    observer.observe(last);
    window.addEventListener("resize", updateGeometry, { passive: true });

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      return () => {
        observer.disconnect();
        window.removeEventListener("resize", updateGeometry);
      };
    }

    let frame = 0;
    let drawn = false;

    const draw = () => {
      if (drawn) return;
      drawn = true;
      root.dataset.draw = "wait";
      frame = requestAnimationFrame(() => {
        updateGeometry();
        root.dataset.draw = "shown";
      });
      window.removeEventListener("scroll", onScroll);
    };

    const onScroll = () => {
      const rect = root.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.86 && rect.bottom > 0) draw();
    };

    root.dataset.draw = "wait";
    onScroll();
    if (!drawn) {
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", updateGeometry);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section
      id="proceso"
      aria-labelledby="cnc-process-title"
      className="relative scroll-mt-[-3.5rem] px-5 py-14 md:scroll-mt-[-5rem] md:px-8 md:py-20 lg:scroll-mt-[-6rem] lg:py-24"
    >
      <RegistrationMarks edges="bottom" />
      <div className="relative mx-auto w-full max-w-[1200px]">
        <h2
          id="cnc-process-title"
          className="max-w-[18ch] text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.02em] text-balance lg:max-w-[24ch]"
        >
          {t("title")}
        </h2>
        <div
          ref={trailRef}
          className="relative mt-10 md:mt-14"
          style={
            {
              "--process-x1": "0px",
              "--process-y1": "0px",
              "--process-x3": "0px",
              "--process-y3": "0px",
              "--process-gutter": "0px",
            } as CSSProperties
          }
        >
          <div
            aria-hidden="true"
            className="cnc-process-rail text-cnc-muted pointer-events-none absolute hidden h-px md:block"
          >
            <svg
              viewBox="0 0 100 1"
              preserveAspectRatio="none"
              className="cnc-track h-px w-full"
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
            <div className="cnc-track-head-rail">
              <span className="cnc-track-head bg-cnc-white ring-cnc-white/25 size-2 rounded-sm ring-4" />
            </div>
          </div>
          <div
            aria-hidden="true"
            className="cnc-process-rail-y text-cnc-muted pointer-events-none absolute w-px md:hidden"
          >
            <svg
              viewBox="0 0 1 100"
              preserveAspectRatio="none"
              className="cnc-track-y h-full w-px"
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
            <div className="cnc-track-head-rail-y">
              <span className="cnc-track-head-y bg-cnc-white ring-cnc-white/25 size-2 rounded-sm ring-4" />
            </div>
          </div>
          <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map(({ key, outputKey }, index) => {
              const raw =
                key === "step1"
                  ? t("step1", { formats })
                  : key === "step2"
                    ? t("step2", { hours })
                    : t(key);
              const [headPart = raw, bodyPart] = raw.split(" — ");
              const splitAt = headPart.indexOf(" ");
              const number =
                splitAt === -1 ? headPart : headPart.slice(0, splitAt);
              const label = splitAt === -1 ? "" : headPart.slice(splitAt + 1);
              const markRef =
                index === 0
                  ? firstMarkRef
                  : index === steps.length - 1
                    ? lastMarkRef
                    : undefined;

              return (
                <li
                  key={key}
                  className="cnc-step relative flex max-w-[62ch] flex-col pl-10 md:pl-0"
                  style={{ transitionDelay: `${index * 70}ms` }}
                >
                  <p
                    ref={markRef}
                    className="bg-cnc-bg text-cnc-text relative z-10 inline-block self-start pr-3 font-mono text-sm tracking-[0.08em] uppercase tabular-nums md:px-2 md:first:pl-0"
                  >
                    {number}
                  </p>
                  {label ? (
                    <h3 className="mt-3 text-[clamp(1.25rem,2vw,1.5rem)] font-medium text-balance">
                      {label}
                    </h3>
                  ) : null}
                  {bodyPart ? (
                    <p className="text-cnc-muted mt-2 max-w-[44ch] text-[clamp(1rem,1.05vw,1.0625rem)] leading-[1.55] font-medium text-pretty">
                      {bodyPart}
                    </p>
                  ) : null}
                  <p className="text-cnc-muted mt-4 font-mono text-sm tracking-[0.08em] uppercase tabular-nums">
                    {t(outputKey)}
                  </p>

                  {index === 0 && siteConfig.showFileFormats ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {siteConfig.cncFileFormats.map((fmt) => (
                        <span
                          key={fmt}
                          className="border-cnc-line bg-cnc-surface text-cnc-muted rounded-[var(--radius-control)] border px-2 py-0.5 font-mono text-xs tracking-[0.08em] uppercase"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

function centerIn(root: HTMLElement, element: HTMLElement) {
  let x = element.offsetLeft + element.offsetWidth / 2;
  let y = element.offsetTop + element.offsetHeight / 2;
  let parent = element.offsetParent as HTMLElement | null;

  while (parent && parent !== root) {
    x += parent.offsetLeft;
    y += parent.offsetTop;
    parent = parent.offsetParent as HTMLElement | null;
  }

  return { x, y };
}
