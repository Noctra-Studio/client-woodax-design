"use client";

import { initBotId } from "botid/client/core";

function setupBotId() {
  if (typeof window === "undefined" || typeof window.fetch !== "function") {
    return;
  }

  const originalFetch = window.fetch.bind(window);
  let reachedNetworkFetch = false;

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    reachedNetworkFetch = true;
    return originalFetch(input, init);
  }) as typeof window.fetch;

  try {
    initBotId({
      protect: [
        { path: "/", method: "POST" },
        { path: "/*", method: "POST" },
      ],
    });
  } catch {
    window.fetch = originalFetch;
    return;
  }

  const botIdFetch = window.fetch.bind(window);

  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    reachedNetworkFetch = false;
    try {
      return await botIdFetch(input, init);
    } catch (error) {
      if (!reachedNetworkFetch) {
        return await originalFetch(input, init);
      }
      throw error;
    }
  }) as typeof window.fetch;
}

setupBotId();
