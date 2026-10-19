"use client";

import type { KeyboardEvent } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function DrawnCheck({ className }: { className?: string }) {
  return (
    <span
      className={cn("grid size-5 shrink-0 place-items-center", className)}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-full">
        <path
          d="M5 12.5 10 17.5 19 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lead-check-draw"
        />
      </svg>
    </span>
  );
}

export function FieldErrorMessage({
  id,
  message,
  prefix = "Error:",
  variant,
  tabIndex,
  className,
}: {
  id: string;
  message: string;
  prefix?: string;
  variant: "design" | "cnc";
  tabIndex?: number;
  className?: string;
}) {
  return (
    <p
      id={id}
      role="alert"
      tabIndex={tabIndex}
      className={cn(
        "mt-2 flex items-start gap-2 text-[14px] leading-snug font-medium outline-none",
        variant === "cnc" ? "text-cnc-text" : "text-woodax-charcoal",
        className,
      )}
    >
      <CircleAlert
        aria-hidden="true"
        strokeWidth={1.5}
        className="mt-0.5 size-4 shrink-0"
      />
      <span>
        <span className="sr-only">{prefix} </span>
        {message}
      </span>
    </p>
  );
}

export type LeadOption = {
  value: string;
  label: string;
  meta?: string;
};

type OptionGroupProps = {
  name: string;
  fieldId: string;
  legend: string;
  legendClassName?: string;
  options: LeadOption[];
  value: string;
  onChange: (value: string) => void;
  variant: "design" | "cnc";
  layout?: "stack" | "tiles" | "pills";
  error?: string;
  errorId: string;
  errorPrefix?: string;
};

export function OptionGroup({
  name,
  fieldId,
  legend,
  legendClassName,
  options,
  value,
  onChange,
  variant,
  layout = "stack",
  error,
  errorId,
  errorPrefix,
}: OptionGroupProps) {
  const isDesign = variant === "design";
  const legendId = `${fieldId}-legend`;

  function getOptionInputId(index: number, optionValue: string) {
    return index === 0 ? fieldId : `${fieldId}-${optionValue}`;
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    currentIndex: number,
  ) {
    if (options.length === 0) return;

    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % options.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + options.length) % options.length;
    }

    if (nextIndex === null) return;
    event.preventDefault();
    const targetOption = options[nextIndex];
    if (!targetOption) return;
    onChange(targetOption.value);
    const nextInputId = getOptionInputId(nextIndex, targetOption.value);
    document.getElementById(nextInputId)?.focus();
  }

  return (
    <fieldset
      role="radiogroup"
      aria-labelledby={legendId}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
    >
      <legend
        id={legendId}
        className={cn(
          isDesign
            ? "mb-3 text-[17px] leading-snug font-medium"
            : "text-cnc-muted mb-3 block font-mono text-xs tracking-[0.08em] uppercase",
          legendClassName,
        )}
      >
        {legend}
      </legend>

      {!isDesign && layout === "tiles" ? (
        <div className="grid grid-cols-2 gap-2.5">
          {options.map((option, index) => {
            const selected = value === option.value;
            const inputId = getOptionInputId(index, option.value);
            const tabIndex = selected || (!value && index === 0) ? 0 : -1;

            return (
              <label
                key={option.value}
                data-selected={selected ? "true" : "false"}
                className={cn(
                  "duration-ui flex min-h-11 cursor-pointer flex-col justify-between gap-1.5 rounded-sm border p-3.5 text-left transition-[border-color,background-color] ease-out",
                  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cnc-white",
                  selected && "lead-card-settle",
                  selected
                    ? "border-cnc-white bg-cnc-surface text-cnc-text"
                    : "border-cnc-muted text-cnc-text pointer-fine:hover:border-cnc-text bg-transparent",
                )}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={selected}
                  tabIndex={tabIndex}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  onChange={() => onChange(option.value)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  className="sr-only"
                />
                <span className="flex items-start justify-between gap-2">
                  <span className="font-sans text-[15px] leading-snug font-medium">
                    {option.label}
                  </span>
                  {selected ? (
                    <DrawnCheck className="text-cnc-white size-4 shrink-0" />
                  ) : (
                    <span className="size-4 shrink-0" aria-hidden="true" />
                  )}
                </span>
                {option.meta ? (
                  <span className="text-cnc-muted font-mono text-xs tracking-[0.08em] tabular-nums">
                    {option.meta}
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      ) : !isDesign && layout === "pills" ? (
        <div className="flex flex-wrap gap-2.5">
          {options.map((option, index) => {
            const selected = value === option.value;
            const inputId = getOptionInputId(index, option.value);
            const tabIndex = selected || (!value && index === 0) ? 0 : -1;

            return (
              <label
                key={option.value}
                data-selected={selected ? "true" : "false"}
                className={cn(
                  "duration-ui inline-flex h-11 min-h-11 cursor-pointer items-center gap-2 rounded-sm border px-4 text-[15px] leading-none font-medium transition-[border-color,background-color] ease-out",
                  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cnc-white",
                  selected && "lead-card-settle",
                  selected
                    ? "border-cnc-white bg-cnc-surface text-cnc-text"
                    : "border-cnc-muted text-cnc-text pointer-fine:hover:border-cnc-text bg-transparent",
                )}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={selected}
                  tabIndex={tabIndex}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  onChange={() => onChange(option.value)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  className="sr-only"
                />
                <span>{option.label}</span>
                {selected ? (
                  <DrawnCheck className="text-cnc-white size-4" />
                ) : null}
              </label>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-2">
          {options.map((option, index) => {
            const selected = value === option.value;
            const inputId = getOptionInputId(index, option.value);
            const tabIndex = selected || (!value && index === 0) ? 0 : -1;

            return (
              <label
                key={option.value}
                data-selected={selected ? "true" : "false"}
                className={cn(
                  "duration-ui flex min-h-14 cursor-pointer items-center gap-3 border-[1.5px] px-4 py-3 text-[17px] leading-snug transition-[border-color,background-color] ease-out",
                  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2",
                  selected && "lead-card-settle",
                  isDesign
                    ? "bg-woodax-paper text-woodax-charcoal has-[:focus-visible]:outline-woodax-charcoal rounded-[var(--radius-control)]"
                    : "bg-cnc-bg text-cnc-text has-[:focus-visible]:outline-cnc-white rounded-[var(--radius-control)]",
                  selected
                    ? isDesign
                      ? "border-woodax-green"
                      : "border-cnc-white bg-cnc-surface"
                    : isDesign
                      ? "border-woodax-line"
                      : "border-cnc-muted pointer-fine:hover:border-cnc-text",
                )}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={selected}
                  tabIndex={tabIndex}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  onChange={() => onChange(option.value)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  className="sr-only"
                />
                <span className="flex-1">{option.label}</span>
                {selected ? (
                  <DrawnCheck />
                ) : (
                  <span className="size-5 shrink-0" aria-hidden />
                )}
              </label>
            );
          })}
        </div>
      )}
      {error ? (
        <FieldErrorMessage
          id={errorId}
          message={error}
          prefix={errorPrefix}
          variant={variant}
        />
      ) : null}
    </fieldset>
  );
}
