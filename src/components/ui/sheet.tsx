"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetContent({
  className,
  children,
  side = "right",
  forceMount,
  phase = "closed",
  intent = phase,
  motionReady = false,
  onOverlayDismiss,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
  forceMount?: true;
  phase?: "open" | "closed";
  intent?: "open" | "closed";
  motionReady?: boolean;
  onOverlayDismiss?: () => void;
}) {
  const motionState = motionReady ? "on" : "off";
  return (
    <SheetPortal forceMount={forceMount}>
      {/* Plain overlay: Dialog.Overlay mounts RemoveScroll, whose
          overflow:hidden clips the exit transform on iOS. */}
      <div
        data-slot="sheet-overlay"
        data-phase={phase}
        data-intent={intent}
        data-motion={motionState}
        aria-hidden
        className="nav-sheet-overlay fixed inset-0 z-50"
        onClick={onOverlayDismiss}
      />
      <SheetPrimitive.Content
        forceMount={forceMount}
        data-slot="sheet-content"
        data-side={side}
        data-phase={phase}
        data-intent={intent}
        data-motion={motionState}
        className={cn(
          "nav-sheet-panel fixed z-50 flex w-[min(22rem,100%)] flex-col overscroll-none outline-none",
          side === "right" && "right-0 border-l",
          side === "left" && "left-0 border-r",
          className,
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex items-center justify-between gap-3", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-base font-medium", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
};
