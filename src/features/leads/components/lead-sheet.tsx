"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  motion,
  useDragControls,
  useReducedMotion,
  type PanInfo,
} from "motion/react";
import { cn } from "@/lib/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;
const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function LeadSheet({
  open,
  onClose,
  title,
  titleId,
  closeLabel,
  variant,
  active,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  closeLabel: string;
  variant: "design" | "cnc";
  active: boolean;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const reduceMotion = useReducedMotion();
  const inset = useKeyboardInset(open && active);
  const trapped = open && active;

  useScrollLock(trapped);
  useFocusTrap(trapped, panelRef, onClose);

  const isDesign = variant === "design";

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label={closeLabel}
          onClick={onClose}
          className="bg-woodax-charcoal/40 fixed inset-0 z-40 md:hidden"
        />
      ) : null}
      <motion.div
        ref={panelRef}
        role={trapped ? "dialog" : undefined}
        aria-modal={trapped ? true : undefined}
        aria-labelledby={trapped ? titleId : undefined}
        aria-hidden={!open && active ? true : undefined}
        inert={!open && active ? true : undefined}
        tabIndex={-1}
        data-open={open ? "true" : "false"}
        drag={active ? "y" : false}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.45 }}
        onDragEnd={(_event, info) => {
          if (shouldDismiss(info)) onClose();
        }}
        initial={false}
        animate={{ y: open ? 0 : "100%" }}
        transition={{ duration: reduceMotion ? 0 : 0.24, ease: easeOut }}
        className={cn(
          "lead-sheet z-50 flex max-h-[90dvh] flex-col outline-none",
          "max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:rounded-t-[var(--radius-card)]",
          "md:relative md:max-h-none md:rounded-[var(--radius-card)]",
          isDesign
            ? "bg-woodax-cream text-woodax-charcoal"
            : "border-cnc-line bg-cnc-surface text-cnc-text border",
        )}
        onFocusCapture={(event) => {
          if (!trapped) return;
          const target = event.target;
          if (!(target instanceof HTMLInputElement)) return;
          requestAnimationFrame(() => {
            target.scrollIntoView({ block: "center" });
          });
        }}
      >
        <div
          className="flex cursor-grab touch-none justify-center pt-3 pb-1 md:hidden"
          onPointerDown={(event) => dragControls.start(event)}
        >
          <span className="h-1 w-10 rounded-full bg-current opacity-30" />
        </div>
        <div className="flex items-start justify-between gap-4 px-5 pt-2 pb-1 md:hidden">
          <h2
            id={titleId}
            className="text-[1.75rem] leading-tight font-normal tracking-[-0.02em]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-[15px] underline underline-offset-4"
          >
            {closeLabel}
          </button>
        </div>
        <div
          className="overflow-y-auto overscroll-none px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-8 md:py-8 lg:px-10 lg:py-10"
          style={inset > 0 ? { paddingBottom: inset + 20 } : undefined}
        >
          {children}
        </div>
      </motion.div>
    </>
  );
}

function shouldDismiss(info: PanInfo) {
  return info.offset.y > 96 || info.velocity.y > 700;
}

function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const scrollY = window.scrollY;
    const { style } = document.body;
    const previous = {
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
      overflow: style.overflow,
    };
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    style.overflow = "hidden";

    return () => {
      style.position = previous.position;
      style.top = previous.top;
      style.left = previous.left;
      style.right = previous.right;
      style.width = previous.width;
      style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}

function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLDivElement | null>,
  onClose: () => void,
) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    container.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !container) return;

      const nodes = [
        ...container.querySelectorAll<HTMLElement>(focusableSelector),
      ].filter(
        (node) => !node.hasAttribute("disabled") && node.tabIndex !== -1,
      );
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [active, containerRef]);
}

function useKeyboardInset(active: boolean) {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (!active) return;
    const viewport = window.visualViewport;
    if (!viewport) return;

    function update() {
      if (!viewport) return;
      const next = window.innerHeight - viewport.height - viewport.offsetTop;
      setInset(Math.max(0, Math.round(next)));
    }

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      setInset(0);
    };
  }, [active]);

  return inset;
}
