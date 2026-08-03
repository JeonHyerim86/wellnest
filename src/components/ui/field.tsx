import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

// .pen C/TextField — Box 높이 52 · padding [0,16] · 값 14/600 · 라벨 13/800
const FIELD_BASE =
  "w-full rounded-field border bg-white px-4 text-field text-ink-800 placeholder:text-ink-400 " +
  "transition-colors focus:outline-none focus:border-sage-500 " +
  "disabled:bg-cream-100 disabled:text-ink-400";

function fieldTone(hasError?: boolean) {
  return hasError
    ? "border-danger focus:ring-[#e9b8b3] focus:border-danger"
    : "border-cream-300";
}

export function FieldShell({
  label,
  hint,
  error,
  counter,
  children,
  htmlFor,
}: {
  label?: string;
  hint?: string;
  error?: string;
  counter?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-chip font-extrabold text-ink-800">
          {label}
        </label>
      )}
      {children}
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "text-caption",
            error ? "text-danger" : "text-ink-500",
          )}
        >
          {error ?? hint ?? ""}
        </p>
        {counter && (
          <span className="shrink-0 text-caption text-ink-400">{counter}</span>
        )}
      </div>
    </div>
  );
}

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  counter?: string;
};

export function TextField({
  label,
  hint,
  error,
  counter,
  className,
  id,
  ...props
}: TextFieldProps) {
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      counter={counter}
      htmlFor={id}
    >
      <input
        id={id}
        aria-invalid={Boolean(error)}
        className={cn(FIELD_BASE, fieldTone(Boolean(error)), "h-12", className)}
        {...props}
      />
    </FieldShell>
  );
}

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
  counter?: string;
};

export function TextArea({
  label,
  hint,
  error,
  counter,
  className,
  id,
  ...props
}: TextAreaProps) {
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      counter={counter}
      htmlFor={id}
    >
      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        className={cn(
          FIELD_BASE,
          fieldTone(Boolean(error)),
          "min-h-24 resize-none py-3",
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
}
