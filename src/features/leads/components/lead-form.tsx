"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type MouseEvent,
} from "react";
import { ArrowLeft, Check } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { submitLead } from "@/features/leads/actions";
import type { LeadCopy } from "@/features/leads/copy";
import {
  leadError,
  parseContact,
  referrerOriginPath,
} from "@/features/leads/schema";
import { initialLeadState } from "@/features/leads/state";
import {
  FieldErrorMessage,
  OptionGroup,
} from "@/features/leads/components/option-group";
import { PendingSpinner } from "@/features/leads/components/pending-spinner";
import { useLeadSheetNested } from "@/features/leads/components/lead-sheet";
import {
  LeadSuccess,
  useFocusOnError,
} from "@/features/leads/components/lead-success";
import { TextField } from "@/features/leads/components/text-field";
import {
  isPlainLinkClick,
  usePrivacyDialog,
} from "@/features/privacy/privacy-dialog-provider";
import { isLeadMaterial, track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;
const slide = {
  enter: (direction: number) => ({
    x: direction > 0 ? 16 : -16,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -16 : 16,
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
  step?: number;
  startedAt?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

function storageKey(variant: string) {
  return `woodax-lead:v1:${variant}`;
}

function leadTrackKey(site: string, startedAt: string) {
  return `${site}:${startedAt}`;
}

/**
 * Survives a remount, including StrictMode. Cleared when that same
 * submission is sent again so the next success can fire once.
 */
const trackedLeadKeys = new Set<string>();

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
  const [step, setStep] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const [fields, setFields] = useState<LeadFields | null>(null);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [dismissedOptionError, setDismissedOptionError] = useState("");
  const { openPrivacy } = usePrivacyDialog();
  const leadSheetNested = useLeadSheetNested();
  const shouldFocusStepRef = useRef<0 | 1 | null>(null);
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
  const currentStep = step ?? (stored?.step === 1 ? 1 : 0);
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
    optionErrorStamp && optionErrorStamp !== dismissedOptionError
      ? 0
      : currentStep;

  const serverErrors =
    state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const shownErrors = { ...clientErrors, ...serverErrors };

  useFocusOnError(state.status, state.fieldErrors, idPrefix);

  useEffect(() => {
    return () => {
      leadSheetNested?.setNestedDialogOpen(false);
    };
  }, [leadSheetNested]);

  function handlePrivacyLinkClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!isPlainLinkClick(event)) return;
    event.preventDefault();
    const nested = leadSheetNested;
    nested?.setNestedDialogOpen(true);
    openPrivacy(event.currentTarget, {
      onClose: nested
        ? () => {
            requestAnimationFrame(() => {
              nested.setNestedDialogOpen(false);
            });
          }
        : undefined,
    });
  }

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
        step: currentStep,
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
    currentStep,
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

  const successStartedAt =
    state.status === "success" ? (state.values?.startedAt ?? "") : "";
  const successKey = successStartedAt
    ? leadTrackKey(copy.variant, successStartedAt)
    : null;
  const trackedLeadRef = useRef<string | null>(
    successKey && trackedLeadKeys.has(successKey) ? successKey : null,
  );

  useEffect(() => {
    if (state.status !== "success" || state.delivered !== true) return;

    const startedAtValue = state.values?.startedAt ?? "";
    if (!startedAtValue) return;

    const key = leadTrackKey(copy.variant, startedAtValue);
    if (trackedLeadRef.current === key || trackedLeadKeys.has(key)) {
      trackedLeadRef.current = key;
      return;
    }

    const flagged = state.flagged ? ({ flagged: true } as const) : {};

    if (copy.variant === "cnc") {
      const submittedMaterial = state.values?.material;
      if (!isLeadMaterial(submittedMaterial)) return;
      trackedLeadRef.current = key;
      trackedLeadKeys.add(key);
      track("generate_lead", {
        site: "cnc",
        locale: copy.locale,
        material: submittedMaterial,
        ...flagged,
      });
      return;
    }

    trackedLeadRef.current = key;
    trackedLeadKeys.add(key);
    track("generate_lead", { site: "design", locale: copy.locale, ...flagged });
  }, [
    state.status,
    state.delivered,
    state.flagged,
    state.values,
    copy.variant,
    copy.locale,
  ]);

  function beginLeadSubmit(formData: FormData) {
    const key = leadTrackKey(
      copy.variant,
      String(formData.get("startedAt") ?? ""),
    );
    trackedLeadKeys.delete(key);
    trackedLeadRef.current = null;
    formData.set("page", window.location.pathname.slice(0, 200));
    const referrer = referrerOriginPath(document.referrer);
    if (referrer) formData.set("referrer", referrer);
    else formData.delete("referrer");
    formAction(formData);
  }

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
    shouldFocusStepRef.current = 1;
    setDirection(1);
    setStep(1);
  }

  function goBackStep() {
    shouldFocusStepRef.current = 0;
    setDirection(-1);
    setStep(0);
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    if (visibleStep === 0) {
      event.preventDefault();
      continueStep();
      return;
    }

    const nextErrors: Record<string, string> = {};
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 80) {
      nextErrors.name = leadError.name;
    }
    if (!parseContact(contact)) {
      nextErrors.contact = leadError.contact;
    }
    if (isDesign && city.trim().length > 0) {
      const trimmedCity = city.trim();
      if (trimmedCity.length < 2 || trimmedCity.length > 60) {
        nextErrors.city = leadError.city;
      }
    }
    if (!consent) {
      nextErrors.consent = leadError.consent;
    }

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
      setClientErrors(nextErrors);
      const first = Object.keys(nextErrors)[0];
      if (first) {
        document.getElementById(`${idPrefix}-${first}`)?.focus();
      }
    }
  }

  const handleStepMount = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || shouldFocusStepRef.current === null) return;
      const targetStep = shouldFocusStepRef.current;
      shouldFocusStepRef.current = null;

      requestAnimationFrame(() => {
        if (targetStep === 1) {
          document.getElementById(`${idPrefix}-name`)?.focus();
          return;
        }
        const checkedRadio = node.querySelector<HTMLInputElement>(
          'input[type="radio"]:checked',
        );
        if (checkedRadio) {
          checkedRadio.focus();
          return;
        }
        document
          .getElementById(
            `${idPrefix}-${isDesign ? "projectType" : "material"}`,
          )
          ?.focus();
      });
    },
    [idPrefix, isDesign],
  );

  if (state.status === "success") {
    return <LeadSuccess copy={copy} values={state.values ?? {}} />;
  }

  return (
    <form
      action={beginLeadSubmit}
      className="relative flex flex-col gap-6"
      noValidate
      aria-busy={pending}
      onSubmit={handleFormSubmit}
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
      <input type="hidden" name="page" value="" />
      <input type="hidden" name="referrer" value="" />
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

      {!isDesign && copy.stepIndicator ? (
        <div className="flex flex-col gap-2">
          <p className="text-cnc-muted font-mono text-xs tracking-[0.08em] uppercase tabular-nums">
            {visibleStep === 0
              ? copy.stepIndicator.step1
              : copy.stepIndicator.step2}
          </p>
          <div
            aria-hidden="true"
            className="bg-cnc-line h-px w-full overflow-hidden"
          >
            <div
              className="bg-cnc-white h-full w-full origin-left transition-transform duration-[240ms] ease-[var(--ease-out)] motion-reduce:transition-none"
              style={{
                transform: visibleStep === 0 ? "scaleX(0.5)" : "scaleX(1)",
              }}
            />
          </div>
        </div>
      ) : null}

      {shownErrors.form ? (
        <FieldErrorMessage
          id={`${idPrefix}-form-error`}
          tabIndex={-1}
          message={messageFor(copy, shownErrors.form) ?? copy.errorGeneric}
          prefix={copy.errorPrefix}
          variant={copy.variant}
          className="mt-0"
        />
      ) : null}

      <motion.div
        layout
        transition={{
          layout: { duration: reduceMotion ? 0 : 0.22, ease: easeOut },
        }}
        className="-m-1 overflow-hidden p-1"
      >
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={visibleStep}
            ref={handleStepMount}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: easeOut }}
            className="flex flex-col gap-6"
          >
            {visibleStep === 0 ? (
              <>
                <OptionGroup
                  name={`${idPrefix}-choice-ui`}
                  fieldId={`${idPrefix}-${isDesign ? "projectType" : "material"}`}
                  legend={
                    isDesign
                      ? copy.step1Question
                      : (copy.step1Label ?? copy.step1Question)
                  }
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
                  layout={isDesign ? "stack" : "tiles"}
                  error={messageFor(
                    copy,
                    shownErrors[isDesign ? "projectType" : "material"],
                  )}
                  errorId={`${idPrefix}-${isDesign ? "projectType" : "material"}-error`}
                  errorPrefix={copy.errorPrefix}
                />
                {copy.step1bQuestion && copy.stateOptions ? (
                  <OptionGroup
                    name={`${idPrefix}-state-ui`}
                    fieldId={`${idPrefix}-projectState`}
                    legend={copy.step1bLabel ?? copy.step1bQuestion}
                    options={copy.stateOptions}
                    value={projectState}
                    onChange={(value) => {
                      patch({ projectState: value });
                      clearError("projectState");
                    }}
                    variant={copy.variant}
                    layout="pills"
                    error={messageFor(copy, shownErrors.projectState)}
                    errorId={`${idPrefix}-projectState-error`}
                    errorPrefix={copy.errorPrefix}
                  />
                ) : null}
                <Button
                  type="button"
                  variant={buttonVariant}
                  arrow={!isDesign}
                  onClick={continueStep}
                  className={cn(!isDesign && "w-full sm:w-auto sm:self-end")}
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
                  errorPrefix={copy.errorPrefix}
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
                  errorPrefix={copy.errorPrefix}
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
                    errorPrefix={copy.errorPrefix}
                  />
                ) : null}
                <div>
                  <div className="flex items-start gap-1">
                    <label
                      htmlFor={`${idPrefix}-consent`}
                      className="relative flex size-11 shrink-0 cursor-pointer items-center justify-center"
                    >
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
                        className={cn(
                          isDesign
                            ? "size-5 accent-current"
                            : "peer border-cnc-muted pointer-fine:hover:border-cnc-text checked:border-cnc-white checked:bg-cnc-white focus-visible:outline-cnc-white size-5 appearance-none rounded-[3px] border bg-transparent transition-colors duration-[var(--duration-ui)] ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                        )}
                      />
                      {!isDesign ? (
                        <Check
                          aria-hidden="true"
                          strokeWidth={2}
                          className="text-cnc-bg pointer-events-none absolute size-3.5 opacity-0 transition-opacity duration-[var(--duration-press)] peer-checked:opacity-100"
                        />
                      ) : null}
                    </label>
                    <p
                      className={cn(
                        "pt-2.5 text-[15px] leading-relaxed",
                        !isDesign && "text-cnc-muted",
                      )}
                    >
                      <label
                        htmlFor={`${idPrefix}-consent`}
                        className="cursor-pointer"
                      >
                        {copy.consentBefore}
                      </label>{" "}
                      <Link
                        href="/privacy"
                        onClick={handlePrivacyLinkClick}
                        className={cn(
                          "underline decoration-current/40 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                          !isDesign
                            ? "text-cnc-text focus-visible:outline-cnc-white"
                            : "focus-visible:outline-woodax-charcoal",
                        )}
                      >
                        {copy.consentLink}
                      </Link>
                    </p>
                  </div>
                  {shownErrors.consent ? (
                    <FieldErrorMessage
                      id={`${idPrefix}-consent-error`}
                      message={
                        messageFor(copy, shownErrors.consent) ??
                        copy.errorGeneric
                      }
                      prefix={copy.errorPrefix}
                      variant={copy.variant}
                      className="mt-1"
                    />
                  ) : null}
                </div>
                {isDesign ? (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant={secondaryVariant}
                      onClick={goBackStep}
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
                ) : (
                  <div className="flex items-center justify-between gap-4 pt-2">
                    <button
                      type="button"
                      onClick={goBackStep}
                      disabled={pending}
                      className="text-cnc-muted pointer-fine:hover:text-cnc-text focus-visible:outline-cnc-white group inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[4px] px-1 text-[15px] font-medium transition-colors duration-[var(--duration-press)] ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
                    >
                      <ArrowLeft
                        aria-hidden="true"
                        strokeWidth={1.5}
                        className="size-4 transition-transform duration-[var(--duration-press)] ease-out motion-reduce:transition-none pointer-fine:group-hover:-translate-x-1"
                      />
                      <span>{copy.back}</span>
                    </button>
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
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </form>
  );
}
