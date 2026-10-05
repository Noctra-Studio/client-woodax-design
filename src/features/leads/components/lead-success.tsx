"use client";

import { useActionState, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { submitLeadDetails } from "@/features/leads/actions";
import type { LeadCopy } from "@/features/leads/copy";
import { initialLeadState } from "@/features/leads/state";
import {
  DrawnCheck,
  OptionGroup,
} from "@/features/leads/components/option-group";
import { PendingSpinner } from "@/features/leads/components/pending-spinner";
import { cn } from "@/lib/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;

export function LeadSuccess({
  copy,
  values,
}: {
  copy: LeadCopy;
  values: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(
    submitLeadDetails,
    initialLeadState,
  );
  const [stage, setStage] = useState("");
  const [timeline, setTimeline] = useState("");
  const [quantity, setQuantity] = useState("");
  const reduceMotion = useReducedMotion();
  const sent = state.status === "success";
  useFocusOnError(state.status, state.fieldErrors, copy.variant);
  const detailsError =
    state.fieldErrors?.details ?? state.fieldErrors?.quantity;
  const formError = state.fieldErrors?.form;
  const isDesign = copy.variant === "design";
  const buttonVariant = isDesign ? "design-primary" : "cnc-primary";

  return (
    <motion.div
      initial={reduceMotion ? false : { y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.24, ease: easeOut }}
      className="flex flex-col gap-6"
    >
      <div className="flex items-start gap-3">
        <DrawnCheck className="mt-1 size-8" />
        <div>
          <h3
            className={cn(
              "text-[clamp(1.25rem,2vw,1.5rem)]",
              isDesign
                ? "font-serif font-bold tracking-[-0.01em]"
                : "font-medium tracking-[-0.02em]",
            )}
          >
            {copy.successTitle}
          </h3>
          <p className="mt-2 max-w-[62ch] text-[17px] leading-relaxed font-medium">
            {copy.successBody}
          </p>
        </div>
      </div>

      {sent ? null : (
        <form action={formAction} className="flex flex-col gap-6" noValidate>
          <input type="hidden" name="site" value={copy.variant} />
          <input type="hidden" name="locale" value={copy.locale} />
          <input type="hidden" name="name" value={values.name ?? ""} />
          <input type="hidden" name="contact" value={values.contact ?? ""} />
          <input
            type="hidden"
            name="startedAt"
            value={values.startedAt ?? ""}
          />
          <input
            type="hidden"
            name="projectType"
            value={values.projectType ?? ""}
          />
          <input type="hidden" name="material" value={values.material ?? ""} />
          <Honeypot idPrefix={`${copy.variant}-details`} />

          {copy.stageQuestion && copy.stageOptions ? (
            <OptionGroup
              name={`${copy.variant}-stage-ui`}
              fieldId={`${copy.variant}-stage`}
              legend={copy.stageQuestion}
              options={copy.stageOptions}
              value={stage}
              onChange={setStage}
              variant={copy.variant}
              errorId={`${copy.variant}-stage-error`}
            />
          ) : null}
          {stage ? <input type="hidden" name="stage" value={stage} /> : null}

          {copy.timelineQuestion && copy.timelineOptions ? (
            <OptionGroup
              name={`${copy.variant}-timeline-ui`}
              fieldId={`${copy.variant}-timeline`}
              legend={copy.timelineQuestion}
              options={copy.timelineOptions}
              value={timeline}
              onChange={setTimeline}
              variant={copy.variant}
              errorId={`${copy.variant}-timeline-error`}
            />
          ) : null}
          {timeline ? (
            <input type="hidden" name="timeline" value={timeline} />
          ) : null}

          {copy.quantityOptions ? (
            <OptionGroup
              name={`${copy.variant}-quantity-ui`}
              fieldId={`${copy.variant}-quantity`}
              legend={copy.successBody}
              legendClassName="sr-only"
              options={copy.quantityOptions}
              value={quantity}
              onChange={setQuantity}
              variant={copy.variant}
              error={
                detailsError
                  ? (copy.errors[detailsError] ?? copy.errorGeneric)
                  : undefined
              }
              errorId={`${copy.variant}-quantity-error`}
            />
          ) : null}
          {quantity ? (
            <input type="hidden" name="quantity" value={quantity} />
          ) : null}

          {copy.variant === "design" && detailsError ? (
            <p
              id={`${copy.variant}-details`}
              tabIndex={-1}
              role="alert"
              className="text-[14px] leading-snug outline-none"
            >
              {copy.errors[detailsError] ?? copy.errorGeneric}
            </p>
          ) : null}
          {formError ? (
            <p
              id={`${copy.variant}-form-error`}
              tabIndex={-1}
              role="alert"
              className="text-[14px] leading-snug outline-none"
            >
              {copy.errors[formError] ?? copy.errorGeneric}
            </p>
          ) : null}

          <Button
            type="submit"
            variant={buttonVariant}
            disabled={pending}
            className="min-w-40"
          >
            {pending ? (
              <>
                <span className="sr-only">{copy.detailsSubmit}</span>
                <PendingSpinner />
              </>
            ) : (
              copy.detailsSubmit
            )}
          </Button>
        </form>
      )}

      {copy.whatsappHref ? (
        <Button
          href={copy.whatsappHref}
          variant={buttonVariant}
          arrow
          target="_blank"
          rel="noopener noreferrer"
          className={cn("w-full sm:w-auto")}
        >
          {copy.whatsapp}
        </Button>
      ) : null}
    </motion.div>
  );
}

function Honeypot({ idPrefix }: { idPrefix: string }) {
  return (
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
  );
}

export function useFocusOnError(
  status: string,
  fieldErrors: Record<string, string> | undefined,
  idPrefix: string,
) {
  const signature = fieldErrors ? Object.keys(fieldErrors).join("|") : "";

  useEffect(() => {
    if (status !== "error" || !signature) return;
    const first = signature.split("|")[0];
    if (!first) return;
    const id =
      first === "form" ? `${idPrefix}-form-error` : `${idPrefix}-${first}`;
    document.getElementById(id)?.focus();
  }, [status, signature, idPrefix]);
}
