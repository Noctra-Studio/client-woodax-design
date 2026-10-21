"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { CookieBanner } from "@/components/consent/cookie-banner";
import { CookiePreferencesDialog } from "@/components/consent/cookie-preferences-dialog";
import {
  applyConsent,
  readConsent,
  saveConsent,
} from "@/lib/consent";
import { CONSENT_COOKIE, type ConsentChoice } from "@/lib/consent-config";

type CookieConsentApi = {
  openPreferences: (trigger?: HTMLElement | null) => void;
};

type CookieConsentChromeState = {
  variant: "design" | "cnc";
  bannerOpen: boolean;
  dialogOpen: boolean;
  draft: ConsentChoice;
  triggerRef: RefObject<HTMLElement | null>;
  setDialogOpen: (open: boolean) => void;
  setDraft: (choice: ConsentChoice) => void;
  onAccept: () => void;
  onReject: () => void;
  onSave: () => void;
  openPreferences: (trigger?: HTMLElement | null) => void;
};

const CookieConsentContext = createContext<CookieConsentApi | null>(null);
const CookieConsentChromeContext =
  createContext<CookieConsentChromeState | null>(null);

const defaultDraft: ConsentChoice = { analytics: true, marketing: false };

export function CookieConsentProvider({
  variant,
  children,
}: {
  variant: "design" | "cnc";
  children: ReactNode;
}) {
  const [bannerOpen, setBannerOpen] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<ConsentChoice>(defaultDraft);
  const triggerRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const stored = readConsent();
    if (stored) applyConsent(stored);
  }, []);

  useLayoutEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== CONSENT_COOKIE) return;
      const stored = readConsent();
      if (!stored) return;
      setBannerOpen(false);
      setDraft({ analytics: stored.analytics, marketing: stored.marketing });
      applyConsent(stored);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const openPreferences = useCallback((trigger?: HTMLElement | null) => {
    const stored = readConsent();
    setDraft(
      stored
        ? { analytics: stored.analytics, marketing: stored.marketing }
        : defaultDraft,
    );
    triggerRef.current = trigger ?? null;
    setDialogOpen(true);
  }, []);

  const commit = useCallback((choice: ConsentChoice) => {
    const stored = saveConsent(choice);
    setDraft({ analytics: stored.analytics, marketing: stored.marketing });
    setBannerOpen(false);
    setDialogOpen(false);
  }, []);

  const api = useMemo(() => ({ openPreferences }), [openPreferences]);
  const chrome = useMemo<CookieConsentChromeState>(
    () => ({
      variant,
      bannerOpen,
      dialogOpen,
      draft,
      triggerRef,
      setDialogOpen,
      setDraft,
      onAccept: () => commit({ analytics: true, marketing: false }),
      onReject: () => commit({ analytics: false, marketing: false }),
      onSave: () => commit(draft),
      openPreferences,
    }),
    [bannerOpen, commit, dialogOpen, draft, openPreferences, variant],
  );

  return (
    <CookieConsentContext.Provider value={api}>
      <CookieConsentChromeContext.Provider value={chrome}>
        {children}
      </CookieConsentChromeContext.Provider>
    </CookieConsentContext.Provider>
  );
}

export function CookieConsentChrome() {
  const chrome = useContext(CookieConsentChromeContext);
  if (!chrome) return null;

  return (
    <>
      {chrome.bannerOpen ? (
        <CookieBanner
          variant={chrome.variant}
          onAccept={chrome.onAccept}
          onReject={chrome.onReject}
          onPreferences={chrome.openPreferences}
        />
      ) : null}
      <CookiePreferencesDialog
        open={chrome.dialogOpen}
        onOpenChange={chrome.setDialogOpen}
        variant={chrome.variant}
        draft={chrome.draft}
        onDraft={chrome.setDraft}
        onSave={chrome.onSave}
        triggerRef={chrome.triggerRef}
      />
    </>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error(
      "useCookieConsent must be used within CookieConsentProvider",
    );
  }
  return context;
}
