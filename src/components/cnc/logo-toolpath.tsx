"use client";

import { useEffect, useState } from "react";

type LogoPaths = {
  viewBox: string;
  paths: string[];
};

export function LogoToolpath() {
  const [logo, setLogo] = useState<LogoPaths | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/brand/cnc-logo.svg", { signal: controller.signal })
      .then((response) => (response.ok ? response.text() : null))
      .then((svg) => {
        if (!svg) return;
        const parsed = parseLogoPaths(svg);
        if (parsed.paths.length > 0) setLogo(parsed);
      })
      .catch(() => {
        // Missing logo or aborted fetch: the real SVG image remains.
      });

    return () => controller.abort();
  }, []);

  if (!logo) return null;

  return (
    <svg
      aria-hidden="true"
      viewBox={logo.viewBox}
      className="text-cnc-text pointer-events-none absolute inset-0 h-full w-full"
    >
      {logo.paths.map((d) => (
        <path key={d} d={d} pathLength={1} className="cnc-logo-stroke" />
      ))}
    </svg>
  );
}

function parseLogoPaths(svg: string): LogoPaths {
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  const viewBox = doc.documentElement.getAttribute("viewBox") ?? "0 0 160 40";
  const paths = [...doc.querySelectorAll("path")]
    .map((path) => path.getAttribute("d"))
    .filter((d): d is string => Boolean(d));

  return { viewBox, paths };
}
