"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Switch({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  variant: "design" | "cnc";
}) {
  const isDesign = variant === "design";

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-sm border border-transparent transition-colors duration-(--duration-ui) ease-out outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none",
        isDesign
          ? "bg-woodax-line focus-visible:outline-woodax-charcoal data-[state=checked]:bg-woodax-charcoal"
          : "bg-cnc-line focus-visible:outline-cnc-white data-[state=checked]:bg-cnc-white",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-5 rounded-sm transition-transform duration-(--duration-ui) ease-out data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1 motion-reduce:transition-none",
          isDesign
            ? "bg-woodax-cream"
            : "bg-cnc-muted data-[state=checked]:bg-cnc-bg",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
