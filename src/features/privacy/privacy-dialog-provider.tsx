"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { PrivacyDialog } from "@/features/privacy/privacy-dialog";

type OpenOptions = {
  onClose?: () => void;
};

type PrivacyDialogApi = {
  openPrivacy: (trigger: HTMLAnchorElement, options?: OpenOptions) => void;
};

const PrivacyDialogContext = createContext<PrivacyDialogApi | null>(null);

const openers = new Set<PrivacyDialogApi["openPrivacy"]>();
const closers = new Set<() => void>();

export function closePrivacyDialog() {
  for (const close of closers) close();
}

const privacyDialogApi: PrivacyDialogApi = {
  openPrivacy: (trigger, options) => {
    for (const open of openers) open(trigger, options);
  },
};

export function isPlainLinkClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export function isPrivacyRoute(pathname: string) {
  return pathname === "/privacy";
}

export function PrivacyDialogProvider({
  variant,
  children,
}: {
  variant: "design" | "cnc";
  children: ReactNode;
}) {
  return (
    <PrivacyDialogContext.Provider value={privacyDialogApi}>
      {children}
      <PrivacyDialogHost variant={variant} />
    </PrivacyDialogContext.Provider>
  );
}

function PrivacyDialogHost({ variant }: { variant: "design" | "cnc" }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLAnchorElement | null>(null);
  const onCloseRef = useRef<(() => void) | undefined>(undefined);

  const openPrivacy = useCallback(
    (trigger: HTMLAnchorElement, options?: OpenOptions) => {
      triggerRef.current = trigger;
      onCloseRef.current = options?.onClose;
      setOpen(true);
    },
    [],
  );

  const closePrivacy = useCallback(() => {
    setOpen(false);
    const onClose = onCloseRef.current;
    onCloseRef.current = undefined;
    onClose?.();
  }, []);

  useLayoutEffect(() => {
    openers.add(openPrivacy);
    closers.add(closePrivacy);
    return () => {
      openers.delete(openPrivacy);
      closers.delete(closePrivacy);
    };
  }, [closePrivacy, openPrivacy]);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      const onClose = onCloseRef.current;
      onCloseRef.current = undefined;
      onClose?.();
    }
  }, []);

  return (
    <PrivacyDialog
      open={open}
      onOpenChange={handleOpenChange}
      variant={variant}
      closeLabel={t("close")}
      triggerRef={triggerRef}
    />
  );
}

export function usePrivacyDialog() {
  const context = useContext(PrivacyDialogContext);
  if (!context) {
    throw new Error(
      "usePrivacyDialog must be used within PrivacyDialogProvider",
    );
  }
  return context;
}
