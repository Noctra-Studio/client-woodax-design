const memorySession = new Map<string, string>();
const memoryLocal = new Map<string, string>();
const memoryCookies = new Map<string, string>();

export function safeSessionGet(key: string): string | null {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      const value = window.sessionStorage.getItem(key);
      if (value !== null) {
        memorySession.set(key, value);
        return value;
      }
    }
  } catch {
    // Fall back to in-memory storage when WebView or privacy mode blocks sessionStorage.
  }
  return memorySession.get(key) ?? null;
}

export function safeSessionSet(key: string, value: string): void {
  memorySession.set(key, value);
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem(key, value);
    }
  } catch {
    // In-memory fallback already updated.
  }
}

export function safeSessionRemove(key: string): void {
  memorySession.delete(key);
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // In-memory fallback already updated.
  }
}

export function safeLocalGet(key: string): string | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const value = window.localStorage.getItem(key);
      if (value !== null) {
        memoryLocal.set(key, value);
        return value;
      }
    }
  } catch {
    // Fall back to in-memory storage when WebView or privacy mode blocks localStorage.
  }
  return memoryLocal.get(key) ?? null;
}

export function safeLocalSet(key: string, value: string): void {
  memoryLocal.set(key, value);
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // In-memory fallback already updated.
  }
}

export function safeLocalRemove(key: string): void {
  memoryLocal.delete(key);
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // In-memory fallback already updated.
  }
}

export function safeReadCookieString(): string {
  try {
    if (typeof document !== "undefined" && typeof document.cookie === "string") {
      const raw = document.cookie;
      if (raw) return raw;
    }
  } catch {
    // Cookie access blocked in strict WebView.
  }
  if (memoryCookies.size === 0) return "";
  return Array.from(memoryCookies.entries())
    .map(([name, val]) => `${name}=${val}`)
    .join("; ");
}

export function safeWriteCookieString(cookie: string): void {
  const firstSegment = cookie.split(";")[0] ?? "";
  const eqIndex = firstSegment.indexOf("=");
  if (eqIndex > 0) {
    const name = firstSegment.slice(0, eqIndex).trim();
    const val = firstSegment.slice(eqIndex + 1).trim();
    const isDeleting = /;\s*Max-Age=0\b/i.test(cookie);
    if (isDeleting) {
      memoryCookies.delete(name);
    } else {
      memoryCookies.set(name, val);
    }
  }

  try {
    if (typeof document !== "undefined") {
      document.cookie = cookie;
    }
  } catch {
    // In-memory cookie map already updated.
  }
}

export type SafeMediaQueryList = {
  matches: boolean;
  subscribe: (listener: () => void) => () => void;
};

export function safeMatchMedia(query: string): SafeMediaQueryList {
  try {
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      const mql = window.matchMedia(query);
      return {
        get matches() {
          try {
            return Boolean(mql.matches);
          } catch {
            return false;
          }
        },
        subscribe(listener: () => void) {
          try {
            if (typeof mql.addEventListener === "function") {
              mql.addEventListener("change", listener);
              return () => {
                try {
                  mql.removeEventListener("change", listener);
                } catch {
                  // Ignore cleanup error in WebView
                }
              };
            }
            if (typeof mql.addListener === "function") {
              mql.addListener(listener);
              return () => {
                try {
                  mql.removeListener(listener);
                } catch {
                  // Ignore cleanup error in WebView
                }
              };
            }
          } catch {
            // Ignore subscription error in WebView
          }
          return () => {};
        },
      };
    }
  } catch {
    // matchMedia unavailable or threw
  }

  return {
    matches: false,
    subscribe: () => () => {},
  };
}

export function resetSafeStorageForTests(): void {
  memorySession.clear();
  memoryLocal.clear();
  memoryCookies.clear();
}
