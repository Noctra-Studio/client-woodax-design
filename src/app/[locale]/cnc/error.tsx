"use client";

import { RouteError } from "@/components/site/route-error";

export default function CncError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError error={error} reset={reset} site="cnc" />;
}
