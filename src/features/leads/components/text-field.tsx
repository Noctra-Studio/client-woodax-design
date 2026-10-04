"use client";

import type { InputHTMLAttributes } from "react";
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
  autoComplete,
  inputMode = "text",
}: TextFieldProps) {
  const invalid = Boolean(error);
  const isDesign = variant === "design";

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
            "peer h-14 w-full rounded-[var(--radius-control)] border px-4 pt-5 pb-1 text-[17px] font-normal outline-none",
            "duration-ui transition-[border-color] ease-out",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
            isDesign
              ? "border-woodax-sand bg-woodax-sand text-woodax-charcoal focus-visible:outline-woodax-charcoal"
              : "border-cnc-line bg-cnc-bg text-cnc-text focus-visible:outline-cnc-white",
          )}
        />
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute top-1/2 left-4 origin-left -translate-y-1/2 text-[17px] font-normal",
            "duration-ui transition-all ease-out",
            "peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[12px]",
            "peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[12px]",
            isDesign ? "text-woodax-charcoal/70" : "text-cnc-muted",
          )}
        >
          {label}
        </label>
      </div>
      {error ? (
        <p id={errorId} className="mt-2 text-[14px] leading-snug">
          {error}
        </p>
      ) : null}
    </div>
  );
}
