"use client";

import { useId, useState, type ChangeEvent, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { controlClass, describedBy, Field } from "./Field";

type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  id?: string;
  label: string;
  helperText?: string;
  error?: string;
  showCount?: boolean;
};

export function Textarea({
  id,
  label,
  helperText,
  error,
  showCount = false,
  maxLength,
  value,
  defaultValue,
  onChange,
  rows = 4,
  className,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const [uncontrolledCount, setUncontrolledCount] = useState(String(defaultValue ?? "").length);
  const count = value !== undefined ? String(value).length : uncontrolledCount;
  const hasCounter = showCount && maxLength !== undefined;

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setUncontrolledCount(event.target.value.length);
    onChange?.(event);
  }

  return (
    <Field
      id={textareaId}
      label={label}
      helperText={helperText}
      error={error}
      count={hasCounter ? count : undefined}
      maxLength={hasCounter ? maxLength : undefined}
    >
      <textarea
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(textareaId, helperText, error, hasCounter)}
        className={cn(controlClass, "resize-y", className)}
        {...props}
      />
    </Field>
  );
}
