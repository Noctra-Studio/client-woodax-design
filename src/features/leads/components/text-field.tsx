"use client";

import type { InputHTMLAttributes } from "react";
import { FieldErrorMessage } from "@/features/leads/components/option-group";
import { cn } from "@/lib/utils";

type TextFieldProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  variant: "design" | "cnc";
  error?: string;
  errorId: string;
  errorPrefix?: string;
  autoComplete?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
};

export function TextField({
  id,
  name,
  label,
  value,
  onChange,
  variant,
  error,
  errorId,
  errorPrefix,
  autoComplete,
  inputMode = "text",
}: TextFieldProps) {
  const invalid = Boolean(error);
  const isDesign = variant === "design";

  if (!isDesign) {
    return (
      <div>
        <label
          htmlFor={id}
          className="text-cnc-muted mb-1.5 block font-mono text-xs tracking-[0.08em] uppercase"
        >
          {label}
        </label>
        <input
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          inputMode={inputMode}
          autoCapitalize={autoComplete === "name" ? "words" : "off"}
          spellCheck={false}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          className={cn(
            "text-cnc-text h-11 w-full rounded-none border-0 border-b bg-transparent px-0 py-2 text-[16px] font-normal",
            "outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
            // 1px border stays put; the extra pixel is an inset shadow so focus does not shift the line.
            "shadow-[inset_0_-1px_0_0_transparent]",
            "transition-[border-color,box-shadow] duration-150 ease-[var(--ease-out)] motion-reduce:transition-none",
            invalid
              ? "border-cnc-white focus:border-cnc-white focus-visible:border-cnc-white focus:shadow-[inset_0_-1px_0_0_var(--color-cnc-white)] focus-visible:shadow-[inset_0_-1px_0_0_var(--color-cnc-white)]"
              : "border-cnc-muted pointer-fine:hover:border-cnc-text focus:border-cnc-text focus-visible:border-cnc-text focus:shadow-[inset_0_-1px_0_0_var(--color-cnc-text)] focus-visible:shadow-[inset_0_-1px_0_0_var(--color-cnc-text)]",
          )}
        />
        {error ? (
          <FieldErrorMessage
            id={errorId}
            message={error}
            prefix={errorPrefix}
            variant={variant}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder=" "
          autoComplete={autoComplete}
          inputMode={inputMode}
          autoCapitalize={autoComplete === "name" ? "words" : "off"}
          spellCheck={false}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          className={cn(
            "peer h-14 w-full rounded-[var(--radius-control)] border px-4 pt-5 pb-1 text-[17px] font-medium outline-none",
            "duration-ui transition-[border-color] ease-out",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
            "border-woodax-line bg-woodax-paper text-woodax-charcoal focus-visible:outline-woodax-charcoal",
          )}
        />
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute top-1/2 left-4 origin-left -translate-y-1/2 text-[17px] font-medium",
            "duration-ui transition-all ease-out",
            "peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[12px]",
            "peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[12px]",
            "text-woodax-charcoal/70",
          )}
        >
          {label}
        </label>
      </div>
      {error ? (
        <FieldErrorMessage
          id={errorId}
          message={error}
          prefix={errorPrefix}
          variant={variant}
        />
      ) : null}
    </div>
  );
}
