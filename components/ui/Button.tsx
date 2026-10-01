import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 py-2 font-body text-base font-bold transition-[transform,box-shadow,background-color] duration-100 disabled:cursor-not-allowed disabled:opacity-60";

const raised =
  "border-2 border-ink shadow-hard enabled:hover:translate-x-0.5 enabled:hover:translate-y-0.5 enabled:hover:shadow-hard-sm enabled:active:translate-x-1 enabled:active:translate-y-1 enabled:active:shadow-none";

const variants: Record<ButtonVariant, string> = {
  primary: cn(raised, "bg-yellow text-on-accent"),
  secondary: cn(raised, "bg-card text-ink"),
  danger: cn(raised, "bg-danger text-white"),
  ghost: "border-2 border-transparent bg-transparent text-ink enabled:hover:bg-ink/10",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], className)}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
