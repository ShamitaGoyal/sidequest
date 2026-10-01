"use client";

import { useId, useState, type ChangeEvent, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { controlClass, describedBy, Field } from "./Field";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id?: string;
  label: string;
  helperText?: string;
  error?: string;
  showCount?: boolean;
};

export function Input({
  id,
  label,
  helperText,
  error,
  showCount = false,
  maxLength,
  value,
  defaultValue,
  onChange,
  className,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [uncontrolledCount, setUncontrolledCount] = useState(String(defaultValue ?? "").length);
  const count = value !== undefined ? String(value).length : uncontrolledCount;
  const hasCounter = showCount && maxLength !== undefined;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setUncontrolledCount(event.target.value.length);
    onChange?.(event);
  }

  return (
    <Field
      id={inputId}
      label={label}
      helperText={helperText}
      error={error}
      count={hasCounter ? count : undefined}
      maxLength={hasCounter ? maxLength : undefined}
    >
      <input
        id={inputId}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, helperText, error, hasCounter)}
        className={cn(controlClass, "min-h-11", className)}
        {...props}
      />
    </Field>
  );
}
