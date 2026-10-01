import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-card border-2 border-ink bg-card p-4 text-ink shadow-hard sm:p-5", className)}
      {...props}
    />
  );
}
