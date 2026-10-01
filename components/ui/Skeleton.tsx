import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-control bg-[color-mix(in_srgb,var(--ink)_10%,var(--paper))]", className)}
    />
  );
}
