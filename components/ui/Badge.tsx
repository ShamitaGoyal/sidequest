import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant = "neutral" | "ai" | "admin" | "success" | "accent" | "danger";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-card text-ink",
  ai: "bg-yellow text-on-accent",
  admin: "bg-lilac text-on-accent",
  success: "bg-mint text-on-accent",
  accent: "bg-pink text-on-accent",
  danger: "bg-danger text-white",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant };

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-2 border-ink px-2 py-0.5 text-xs leading-none font-bold whitespace-nowrap",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function AiTag({ className }: { className?: string }) {
  return (
    <Badge variant="ai" className={className} title="Pip is an AI">
      AI
    </Badge>
  );
}

export function AdminTag({ className }: { className?: string }) {
  return (
    <Badge variant="admin" className={className}>
      Admin
    </Badge>
  );
}
