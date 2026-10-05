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

const INTRO_KEY = "woodax-cnc-intro";
let introPlaying = false;
const INTRO_ATTR = "data-cnc-intro";

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
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    query.removeEventListener("change", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function introAlreadySeen() {
  if (introPlaying) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return true;
  }
  try {
    return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return true;
  }
}

function useIntroSeen() {
  return useSyncExternalStore(subscribe, introAlreadySeen, () => true);
}

function clearIntroAttribute() {
  document.documentElement.removeAttribute(INTRO_ATTR);
}

export function IntroProvider({ children }: { children: ReactNode }) {
  const seen = useIntroSeen();
  const [dismissed, setDismissed] = useState(false);
  const status: IntroStatus = seen || dismissed ? "done" : "play";

  const skip = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // Ignore storage failures; the intro still stops.
    }
    clearIntroAttribute();
    setDismissed(true);
  }, []);

  useEffect(() => {
    if (status !== "play") {
      clearIntroAttribute();
      return;
    }

    introPlaying = true;
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // Private browsing can reject storage.
    }

    const id = window.setTimeout(() => {
      clearIntroAttribute();
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
