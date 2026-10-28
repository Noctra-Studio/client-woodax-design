"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "@/i18n/navigation";
import {
  safeMatchMedia,
  safeSessionGet,
  safeSessionSet,
} from "@/lib/safe-storage";

const INTRO_KEY = "woodax-design-intro";
let introPlaying = false;

export type IntroStatus = "play" | "done";

type IntroContextValue = {
  status: IntroStatus;
  skip: () => void;
};

const IntroContext = createContext<IntroContextValue>({
  status: "done",
  skip: () => {},
});

function subscribe(onStoreChange: () => void) {
  const unsubscribeMedia = safeMatchMedia(
    "(prefers-reduced-motion: reduce)",
  ).subscribe(onStoreChange);
  try {
    window.addEventListener("storage", onStoreChange);
  } catch {
    // Ignore storage event error in restricted WebViews.
  }
  return () => {
    unsubscribeMedia();
    try {
      window.removeEventListener("storage", onStoreChange);
    } catch {
      // Ignore cleanup error in restricted WebViews.
    }
  };
}

function introAlreadySeen() {
  if (introPlaying) return false;
  if (safeMatchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  return safeSessionGet(INTRO_KEY) === "1";
}

function useIntroSeen() {
  return useSyncExternalStore(subscribe, introAlreadySeen, () => true);
}

export function IntroProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const seen = useIntroSeen();
  const [dismissed, setDismissed] = useState(false);
  const status: IntroStatus =
    !onHome || seen || dismissed ? "done" : "play";

  const skip = useCallback(() => {
    safeSessionSet(INTRO_KEY, "1");
    setDismissed(true);
  }, []);

  useEffect(() => {
    if (status !== "play") return;
    introPlaying = true;
    safeSessionSet(INTRO_KEY, "1");

    const id = window.setTimeout(() => {
      setDismissed(true);
    }, 1800);

    window.addEventListener("click", skip);
    return () => {
      introPlaying = false;
      window.clearTimeout(id);
      window.removeEventListener("click", skip);
    };
  }, [skip, status]);

  const value = useMemo(() => ({ status, skip }), [status, skip]);

  return (
    <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
  );
}

export function useIntro() {
  return useContext(IntroContext);
}
