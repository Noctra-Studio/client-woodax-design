import { afterEach, describe, expect, it } from "vitest";
import {
  resetSafeStorageForTests,
  safeLocalGet,
  safeLocalRemove,
  safeLocalSet,
  safeMatchMedia,
  safeReadCookieString,
  safeSessionGet,
  safeSessionRemove,
  safeSessionSet,
  safeWriteCookieString,
} from "@/lib/safe-storage";

describe("safe-storage in restricted in-app browsers", () => {
  const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "window",
  );
  const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "document",
  );

  afterEach(() => {
    resetSafeStorageForTests();
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    } else {
      // @ts-expect-error test cleanup
      delete globalThis.window;
    }
    if (originalDocumentDescriptor) {
      Object.defineProperty(globalThis, "document", originalDocumentDescriptor);
    } else {
      // @ts-expect-error test cleanup
      delete globalThis.document;
    }
  });

  it("falls back to in-memory storage when window.sessionStorage and window.localStorage getters throw SecurityError", () => {
    const fakeWindow = {};
    Object.defineProperty(fakeWindow, "sessionStorage", {
      get() {
        throw new Error("SecurityError: Access is denied for this document");
      },
    });
    Object.defineProperty(fakeWindow, "localStorage", {
      get() {
        throw new Error("SecurityError: Access is denied for this document");
      },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: fakeWindow,
    });

    expect(() => safeSessionSet("woodax-lead:v1:cnc", '{"v":1}')).not.toThrow();
    expect(safeSessionGet("woodax-lead:v1:cnc")).toBe('{"v":1}');
    expect(() => safeSessionRemove("woodax-lead:v1:cnc")).not.toThrow();
    expect(safeSessionGet("woodax-lead:v1:cnc")).toBeNull();

    expect(() => safeLocalSet("woodax_consent", '{"v":1}')).not.toThrow();
    expect(safeLocalGet("woodax_consent")).toBe('{"v":1}');
    expect(() => safeLocalRemove("woodax_consent")).not.toThrow();
    expect(safeLocalGet("woodax_consent")).toBeNull();
  });

  it("falls back to in-memory cookies when document.cookie throws SecurityError", () => {
    const fakeDocument = {};
    Object.defineProperty(fakeDocument, "cookie", {
      get() {
        throw new Error("SecurityError: Cookie access blocked");
      },
      set() {
        throw new Error("SecurityError: Cookie access blocked");
      },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: fakeDocument,
    });

    expect(() =>
      safeWriteCookieString("woodax_consent=abc; Path=/; Max-Age=34560000"),
    ).not.toThrow();
    expect(safeReadCookieString()).toContain("woodax_consent=abc");

    expect(() =>
      safeWriteCookieString("woodax_consent=; Path=/; Max-Age=0"),
    ).not.toThrow();
    expect(safeReadCookieString()).toBe("");
  });

  it("handles missing or legacy window.matchMedia in WebViews without throwing", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        matchMedia() {
          throw new Error("matchMedia unsupported");
        },
      },
    });

    const media = safeMatchMedia("(max-width: 767px)");
    expect(media.matches).toBe(false);
    const unsubscribe = media.subscribe(() => {});
    expect(() => unsubscribe()).not.toThrow();
  });
});
