import { cn } from "@/lib/cn";
import { SparkIcon } from "./icons";

export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, borderWidth: 2.5, borderRadius: size * 0.28 }}
      className={cn("inline-flex shrink-0 items-center justify-center border-ink bg-yellow text-on-accent", className)}
    >
      <SparkIcon size={Math.round(size * 0.55)} />
    </span>
  );
}

export function Logo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span className="font-heading text-ink" style={{ fontSize: size * 0.7 }}>
        sidequest
      </span>
    </span>
  );
}
