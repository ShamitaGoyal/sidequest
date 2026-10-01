import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { AlertIcon } from "./icons";

export const controlClass =
  "w-full rounded-control border-2 border-ink bg-card px-3 py-2.5 font-body text-base text-ink placeholder:text-soft disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger";

export function fieldIds(id: string) {
  return { helper: `${id}-helper`, error: `${id}-error`, counter: `${id}-counter` };
}

type FieldProps = {
  id: string;
  label: string;
  helperText?: string;
  error?: string;
  count?: number;
  maxLength?: number;
  className?: string;
  children: ReactNode;
};

export function Field({ id, label, helperText, error, count, maxLength, className, children }: FieldProps) {
  const ids = fieldIds(id);
  const showCounter = maxLength !== undefined && count !== undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-bold text-ink">
        {label}
      </label>
      {children}
      <div className="flex items-start justify-between gap-3 text-sm">
        <div className="flex flex-col gap-1">
          {helperText && (
            <p id={ids.helper} className="text-soft">
              {helperText}
            </p>
          )}
          <p id={ids.error} aria-live="polite" className="text-danger empty:hidden">
            {error && (
              <span className="inline-flex items-center gap-1.5 font-medium">
                <AlertIcon size={16} />
                {error}
              </span>
            )}
          </p>
        </div>
        {showCounter && (
          <p
            id={ids.counter}
            className={cn("ml-auto shrink-0 tabular-nums", count > maxLength ? "text-danger" : "text-soft")}
          >
            {count}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

export function describedBy(id: string, helperText?: string, error?: string, hasCounter?: boolean) {
  const ids = fieldIds(id);
  return [helperText && ids.helper, error && ids.error, hasCounter && ids.counter].filter(Boolean).join(" ") || undefined;
}
