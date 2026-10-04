"use client";

import {
  useActionState,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { submitLead } from "@/features/leads/actions";
import type { LeadCopy } from "@/features/leads/copy";
import { leadError } from "@/features/leads/schema";
import { initialLeadState } from "@/features/leads/state";
import { OptionGroup } from "@/features/leads/components/option-group";
import { PendingSpinner } from "@/features/leads/components/pending-spinner";
import {
  LeadSuccess,
  useFocusOnError,
} from "@/features/leads/components/lead-success";
import { TextField } from "@/features/leads/components/text-field";

const easeOut = [0.22, 1, 0.36, 1] as const;
const slide = {
  enter: (direction: number) => ({
    x: direction > 0 ? 28 : -28,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -28 : 28,
    opacity: 0,
  }),
};

type StoredDraft = {
  v: number;
  projectType?: string;
  material?: string;
  projectState?: string;
  name?: string;
  contact?: string;
  city?: string;
  consent?: boolean;
  startedAt?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

function storageKey(variant: string) {
  return `woodax-lead:v1:${variant}`;
}

type ClientLeadSnapshot = {
  ready: boolean;
  draft: StoredDraft | null;
  search: string;
  startedAt: string;
};

const serverLeadSnapshot: ClientLeadSnapshot = {
  ready: false,
  draft: null,
  search: "",
  startedAt: "",
};

const leadSnapshotCache = new Map<
  string,
  { raw: string | null; search: string; value: ClientLeadSnapshot }
>();

function subscribeLeadSnapshot() {
  return () => {};
}

function readLeadSnapshot(variant: string): ClientLeadSnapshot {
  const search = window.location.search;
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(storageKey(variant));
  } catch {
    raw = null;
  }

  const cached = leadSnapshotCache.get(variant);
  if (cached && cached.raw === raw && cached.search === search) {
    return cached.value;
  }

  const draft = raw ? readDraftFromRaw(raw) : null;
  const startedAt = draft?.startedAt
    ? String(draft.startedAt)
    : cached?.value.startedAt && cached.value.startedAt !== ""
      ? cached.value.startedAt
      : String(Date.now());
  const value = { ready: true, draft, search, startedAt };
  leadSnapshotCache.set(variant, { raw, search, value });
  return value;
}

function readDraftFromRaw(raw: string): StoredDraft | null {
  try {
    const parsed = JSON.parse(raw) as StoredDraft;
    return parsed?.v === 1 ? parsed : null;
  } catch {
    return null;
  }
}

function useLeadSnapshot(variant: string) {
  return useSyncExternalStore(
    subscribeLeadSnapshot,
    () => readLeadSnapshot(variant),
    () => serverLeadSnapshot,
  );
}

type LeadFields = {
  projectType: string;
  material: string;
  projectState: string;
  name: string;
  contact: string;
  city: string;
  consent: boolean;
};

function messageFor(
  copy: LeadCopy,
  key: string | undefined,
): string | undefined {
  if (!key) return undefined;
  return copy.errors[key] ?? copy.errorGeneric;
}

export function LeadForm({ copy }: { copy: LeadCopy }) {
  const [state, formAction, pending] = useActionState(
    submitLead,
    initialLeadState,
  );
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [fields, setFields] = useState<LeadFields | null>(null);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [dismissedOptionError, setDismissedOptionError] = useState("");
  const snapshot = useLeadSnapshot(copy.variant);
  const reduceMotion = useReducedMotion();
  const idPrefix = copy.variant;
  const isDesign = copy.variant === "design";
  const buttonVariant = isDesign ? "design-primary" : "cnc-primary";
  const secondaryVariant = isDesign ? "design-secondary" : "cnc-secondary";
  const stored = snapshot.draft;
  const projectType = fields?.projectType ?? stored?.projectType ?? "";
  const material = fields?.material ?? stored?.material ?? "";
  const projectState = fields?.projectState ?? stored?.projectState ?? "";
  const name = fields?.name ?? stored?.name ?? "";
  const contact = fields?.contact ?? stored?.contact ?? "";
  const city = fields?.city ?? stored?.city ?? "";
  const consent = fields?.consent ?? Boolean(stored?.consent);
  const startedAt = snapshot.startedAt;
  const params = new URLSearchParams(snapshot.search);
  const utmSource = params.get("utm_source") ?? stored?.utmSource ?? "";
  const utmMedium = params.get("utm_medium") ?? stored?.utmMedium ?? "";
  const utmCampaign = params.get("utm_campaign") ?? stored?.utmCampaign ?? "";
  const optionErrorStamp =
    state.status === "error" &&
    (state.fieldErrors?.projectType ||
      state.fieldErrors?.material ||
      state.fieldErrors?.projectState)
      ? JSON.stringify(state.fieldErrors)
      : "";
  const visibleStep =
    optionErrorStamp && optionErrorStamp !== dismissedOptionError ? 0 : step;

  const serverErrors =
    state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const shownErrors = { ...clientErrors, ...serverErrors };

  useFocusOnError(state.status, state.fieldErrors, idPrefix);

  useEffect(() => {
    if (!snapshot.ready || state.status === "success") return;
    try {
      const draft: StoredDraft = {
        v: 1,
        projectType,
        material,
        projectState,
        name,
        contact,
        city,
        consent,
        startedAt: Number(startedAt) || Date.now(),
        utmSource,
        utmMedium,
        utmCampaign,
      };
      sessionStorage.setItem(storageKey(copy.variant), JSON.stringify(draft));
    } catch {
      // Private browsing and full storage both throw.
    }
  }, [
    snapshot.ready,
    state.status,
    copy.variant,
    projectType,
    material,
    projectState,
    name,
    contact,
    city,
    consent,
    startedAt,
    utmSource,
    utmMedium,
    utmCampaign,
  ]);

  useEffect(() => {
    if (state.status !== "success") return;
    try {
      sessionStorage.removeItem(storageKey(copy.variant));
      leadSnapshotCache.delete(copy.variant);
    } catch {
      // Ignore storage failures.
    }
  }, [state.status, copy.variant]);

  function patch(partial: Partial<LeadFields>) {
    setFields((current) => ({
      projectType: current?.projectType ?? stored?.projectType ?? "",
      material: current?.material ?? stored?.material ?? "",
      projectState: current?.projectState ?? stored?.projectState ?? "",
      name: current?.name ?? stored?.name ?? "",
      contact: current?.contact ?? stored?.contact ?? "",
      city: current?.city ?? stored?.city ?? "",
      consent: current?.consent ?? Boolean(stored?.consent),
      ...partial,
    }));
  }

  function clearError(key: string) {
    setClientErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function continueStep() {
    const nextErrors: Record<string, string> = {};
    if (isDesign && !projectType)
      nextErrors.projectType = leadError.projectType;
    if (!isDesign && !material) nextErrors.material = leadError.material;
    if (!isDesign && !projectState) {
      nextErrors.projectState = leadError.projectState;
    }
    setClientErrors(nextErrors);
    const first = Object.keys(nextErrors)[0];
    if (first) {
      document.getElementById(`${idPrefix}-${first}`)?.focus();
      return;
    }
    setDismissedOptionError(optionErrorStamp);
    setDirection(1);
    setStep(1);
  }

  if (state.status === "success") {
    return <LeadSuccess copy={copy} values={state.values ?? {}} />;
  }

  return (
    <form
      action={formAction}
      className="relative flex flex-col gap-6"
      noValidate
      aria-busy={pending}
      onSubmit={(event) => {
        if (visibleStep === 0) event.preventDefault();
      }}
    >
      <input type="hidden" name="site" value={copy.variant} />
      <input type="hidden" name="locale" value={copy.locale} />
      <input type="hidden" name="startedAt" value={startedAt} />
      <input type="hidden" name="utm_source" value={utmSource} />
      <input type="hidden" name="utm_medium" value={utmMedium} />
      <input type="hidden" name="utm_campaign" value={utmCampaign} />
      <input type="hidden" name="projectType" value={projectType} />
      <input type="hidden" name="material" value={material} />
      <input type="hidden" name="projectState" value={projectState} />
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor={`${idPrefix}-website`}>Website</label>
        <input
          id={`${idPrefix}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      {shownErrors.form ? (
        <p
          id={`${idPrefix}-form-error`}
          tabIndex={-1}
          role="alert"
          className="text-[14px] leading-snug outline-none"
        >
          {messageFor(copy, shownErrors.form)}
        </p>
      ) : null}

      <motion.div
        layout
        transition={{
          layout: { duration: reduceMotion ? 0 : 0.24, ease: easeOut },
        }}
        className="overflow-hidden"
      >
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={visibleStep}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: easeOut }}
            className="flex flex-col gap-6"
          >
            {visibleStep === 0 ? (
              <>
                <OptionGroup
                  name={`${idPrefix}-choice-ui`}
                  fieldId={`${idPrefix}-${isDesign ? "projectType" : "material"}`}
                  legend={copy.step1Question}
                  options={copy.options}
                  value={isDesign ? projectType : material}
                  onChange={(value) => {
                    if (isDesign) {
                      patch({ projectType: value });
                      clearError("projectType");
                    } else {
                      patch({ material: value });
                      clearError("material");
                    }
                  }}
                  variant={copy.variant}
                  error={messageFor(
                    copy,
                    shownErrors[isDesign ? "projectType" : "material"],
                  )}
                  errorId={`${idPrefix}-${isDesign ? "projectType" : "material"}-error`}
                />
                {copy.step1bQuestion && copy.stateOptions ? (
                  <OptionGroup
                    name={`${idPrefix}-state-ui`}
                    fieldId={`${idPrefix}-projectState`}
                    legend={copy.step1bQuestion}
                    options={copy.stateOptions}
                    value={projectState}
                    onChange={(value) => {
                      patch({ projectState: value });
                      clearError("projectState");
                    }}
                    variant={copy.variant}
                    error={messageFor(copy, shownErrors.projectState)}
                    errorId={`${idPrefix}-projectState-error`}
                  />
                ) : null}
                <Button
                  type="button"
                  variant={buttonVariant}
                  onClick={continueStep}
                >
                  {copy.next}
                </Button>
              </>
            ) : (
              <>
                <TextField
                  id={`${idPrefix}-name`}
                  name="name"
                  label={copy.nameLabel}
                  value={name}
                  onChange={(value) => {
                    patch({ name: value });
                    clearError("name");
                  }}
                  variant={copy.variant}
                  autoComplete="name"
                  error={messageFor(copy, shownErrors.name)}
                  errorId={`${idPrefix}-name-error`}
                />
                <TextField
                  id={`${idPrefix}-contact`}
                  name="contact"
                  label={copy.contactLabel}
                  value={contact}
                  onChange={(value) => {
                    patch({ contact: value });
                    clearError("contact");
                  }}
                  variant={copy.variant}
                  autoComplete="on"
                  inputMode="text"
                  error={messageFor(copy, shownErrors.contact)}
                  errorId={`${idPrefix}-contact-error`}
                />
                {copy.cityLabel ? (
                  <TextField
                    id={`${idPrefix}-city`}
                    name="city"
                    label={copy.cityLabel}
                    value={city}
                    onChange={(value) => {
                      patch({ city: value });
                      clearError("city");
                    }}
                    variant={copy.variant}
                    autoComplete="address-level2"
                    error={messageFor(copy, shownErrors.city)}
                    errorId={`${idPrefix}-city-error`}
                  />
                ) : null}
                <div>
                  <div className="flex items-start gap-1">
                    <span className="flex size-11 shrink-0 items-center justify-center">
                      <input
                        id={`${idPrefix}-consent`}
                        name="consent"
                        type="checkbox"
                        checked={consent}
                        onChange={(event) => {
                          patch({ consent: event.target.checked });
                          clearError("consent");
                        }}
                        aria-invalid={shownErrors.consent ? true : undefined}
                        aria-describedby={
                          shownErrors.consent
                            ? `${idPrefix}-consent-error`
                            : undefined
                        }
                        className="size-5 accent-current"
                      />
                    </span>
                    <p className="pt-2.5 text-[15px] leading-relaxed">
                      <label htmlFor={`${idPrefix}-consent`}>
                        {copy.consentBefore}
                      </label>{" "}
                      <Link
                        href="/privacy"
                        className="underline decoration-current/40 underline-offset-4"
                      >
                        {copy.consentLink}
                      </Link>
                    </p>
                  </div>
                  {shownErrors.consent ? (
                    <p
                      id={`${idPrefix}-consent-error`}
                      className="mt-1 text-[14px] leading-snug"
                    >
                      {messageFor(copy, shownErrors.consent)}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant={secondaryVariant}
                    onClick={() => {
                      setDirection(-1);
                      setStep(0);
                    }}
                    disabled={pending}
                  >
                    {copy.back}
                  </Button>
                  <Button
                    type="submit"
                    variant={buttonVariant}
                    disabled={pending}
                    className="min-w-40"
                  >
                    {pending ? (
                      <>
                        <span className="sr-only">{copy.submit}</span>
                        <PendingSpinner />
                      </>
                    ) : (
                      copy.submit
                    )}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </form>
  );
}
