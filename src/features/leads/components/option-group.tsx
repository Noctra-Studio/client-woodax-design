"use client";

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

export type LeadOption = {
  value: string;
  label: string;
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
  error?: string;
  errorId: string;
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
  error,
  errorId,
}: OptionGroupProps) {
  const isDesign = variant === "design";

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend
        className={cn(
          "mb-3 text-[17px] leading-snug font-normal",
          legendClassName,
        )}
      >
        {legend}
      </legend>
      <div className="grid gap-2">
        {options.map((option, index) => {
          const selected = value === option.value;
          const inputId = index === 0 ? fieldId : `${fieldId}-${option.value}`;

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
                    : "border-cnc-white"
                  : isDesign
                    ? "border-woodax-line"
                    : "border-cnc-muted",
              )}
            >
              <input
                id={inputId}
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
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
      {error ? (
        <p id={errorId} className="mt-2 text-[14px] leading-snug">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
