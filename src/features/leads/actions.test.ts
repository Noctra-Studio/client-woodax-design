import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialLeadState } from "@/features/leads/state";

const mocks = vi.hoisted(() => ({
  sendEmailMock: vi.fn(),
  checkBotIdMock: vi.fn(),
  headersMock: vi.fn(),
  stepOneLimitersMock: vi.fn(),
  duplicateRedisMock: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: mocks.sendEmailMock,
    };
  },
}));

vi.mock("botid/server", () => ({
  checkBotId: mocks.checkBotIdMock,
}));

vi.mock("next/headers", () => ({
  headers: mocks.headersMock,
}));

vi.mock("@/lib/env", () => ({
  serverEnv: {
    RESEND_API_KEY: "re_test_secret_key_for_hmac",
    CONTACT_FROM_EMAIL: "Woodax <noreply@woodax.design>",
    CONTACT_TO_EMAIL: "hello@woodax.design",
    CONTACT_TO_EMAIL_CNC: "cnc@woodax.design",
    KV_REST_API_URL: "https://example.upstash.io",
    KV_REST_API_TOKEN: "token",
  },
}));

vi.mock("@/features/leads/security/upstash", () => ({
  stepOneLimiters: mocks.stepOneLimitersMock,
  duplicateRedis: mocks.duplicateRedisMock,
}));

import { submitLead, submitLeadDetails } from "@/features/leads/actions";
import { signLeadToken } from "@/features/leads/security/token";

function makeCncStepOneFormData(overrides?: Record<string, string>): FormData {
  const formData = new FormData();
  const defaults: Record<string, string> = {
    site: "cnc",
    locale: "es",
    material: "wood",
    projectState: "file-ready",
    name: "Taller Robles",
    contact: "4421234567",
    message: "Necesito cortar 12 paneles de MDF de 18mm.",
    consent: "on",
    startedAt: String(Date.now() - 10_000),
    website: "",
    ...overrides,
  };

  for (const [key, value] of Object.entries(defaults)) {
    formData.set(key, value);
  }
  return formData;
}

describe("submitLead & submitLeadDetails server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkBotIdMock.mockResolvedValue({ isBot: false });
    mocks.headersMock.mockResolvedValue(
      new Headers({ "x-forwarded-for": "203.0.113.10" }),
    );
    mocks.stepOneLimitersMock.mockReturnValue(null);
    mocks.duplicateRedisMock.mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("retries once on Resend error, logs lead send_failed, releases duplicate lock, and returns sendFailed error", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    const delMock = vi.fn().mockResolvedValue(1);
    mocks.duplicateRedisMock.mockReturnValue({
      set: vi.fn().mockResolvedValue("OK"),
      del: delMock,
    });

    mocks.sendEmailMock.mockResolvedValue({
      data: null,
      error: {
        name: "application_error",
        message: "Resend service unavailable",
      },
    });

    const result = await submitLead(initialLeadState, makeCncStepOneFormData());

    expect(mocks.sendEmailMock).toHaveBeenCalledTimes(2);
    expect(delMock).toHaveBeenCalledTimes(1);
    expect(infoSpy).toHaveBeenCalledWith(
      "lead send_failed reason=application_error",
    );
    expect(result).toMatchObject({
      status: "error",
      delivered: false,
      fieldErrors: {
        form: "errors.sendFailed",
      },
    });
  });

  it("succeeds when the first Resend attempt fails and the retry succeeds", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    mocks.sendEmailMock
      .mockResolvedValueOnce({
        data: null,
        error: {
          name: "internal_server_error",
          message: "Temporary error",
        },
      })
      .mockResolvedValueOnce({
        data: { id: "email_123" },
        error: null,
      });

    const result = await submitLead(initialLeadState, makeCncStepOneFormData());

    expect(mocks.sendEmailMock).toHaveBeenCalledTimes(2);
    expect(infoSpy).toHaveBeenCalledWith("lead accepted reason=ok");
    expect(result.status).toBe("success");
    expect(result.delivered).toBe(true);
    expect(result.leadToken).toBeTruthy();
  });

  it("times out after 8s per attempt when Resend hangs for 20s and returns controlled error state", async () => {
    vi.useFakeTimers();
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    mocks.sendEmailMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () => resolve({ data: { id: "late" }, error: null }),
            20_000,
          );
        }),
    );

    const pendingResult = submitLead(
      initialLeadState,
      makeCncStepOneFormData(),
    );

    // Advance through initial 8s attempt + 8s retry
    await vi.advanceTimersByTimeAsync(16_500);

    const result = await pendingResult;

    expect(mocks.sendEmailMock).toHaveBeenCalledTimes(2);
    expect(infoSpy).toHaveBeenCalledWith("lead send_failed reason=timeout");
    expect(result).toMatchObject({
      status: "error",
      delivered: false,
      fieldErrors: {
        form: "errors.sendFailed",
      },
    });
  });

  it("fails open within 2s when Upstash rate limit, dedupe, and BotID do not respond", async () => {
    vi.useFakeTimers();
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    const neverResolves = () => new Promise<never>(() => {});

    mocks.checkBotIdMock.mockImplementation(neverResolves);
    mocks.stepOneLimitersMock.mockReturnValue({
      ip10m: { limit: neverResolves },
      ipDay: { limit: neverResolves },
      emailHour: { limit: neverResolves },
      emailDay: { limit: neverResolves },
      globalHour: { limit: neverResolves },
    });
    mocks.duplicateRedisMock.mockReturnValue({
      set: neverResolves,
      del: neverResolves,
    });
    mocks.sendEmailMock.mockResolvedValue({
      data: { id: "email_ok" },
      error: null,
    });

    const pendingResult = submitLead(
      initialLeadState,
      makeCncStepOneFormData(),
    );

    // BotID (2s) + RateLimit (2s) + Dedupe (2s) = ~6s total
    await vi.advanceTimersByTimeAsync(6_500);

    const result = await pendingResult;

    expect(result.status).toBe("success");
    expect(result.delivered).toBe(true);
    expect(infoSpy).toHaveBeenCalledWith("lead accepted reason=ok");
  });

  it("returns controlled error state from submitLeadDetails when Resend fails", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    mocks.sendEmailMock.mockRejectedValue(new Error("NetworkFailure"));

    const leadToken = signLeadToken(
      { site: "cnc", contact: "4421234567", name: "Taller Robles" },
      "re_test_secret_key_for_hmac",
    );

    const formData = new FormData();
    formData.set("site", "cnc");
    formData.set("locale", "es");
    formData.set("name", "Taller Robles");
    formData.set("contact", "4421234567");
    formData.set("material", "wood");
    formData.set("projectState", "file-ready");
    formData.set("quantity", "11-100");
    formData.set("startedAt", String(Date.now() - 15_000));
    formData.set("leadToken", leadToken);
    formData.set("website", "");

    const result = await submitLeadDetails(initialLeadState, formData);

    expect(mocks.sendEmailMock).toHaveBeenCalledTimes(2);
    expect(infoSpy).toHaveBeenCalledWith("lead send_failed reason=error");
    expect(result).toMatchObject({
      status: "error",
      fieldErrors: {
        form: "errors.sendFailed",
      },
    });
  });
});
