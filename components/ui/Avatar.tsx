import { DEFAULT_AVATAR_COLOR, initials, isAvatarColor, type AvatarColor } from "@/lib/avatar";
import { cn } from "@/lib/cn";
import { SparkIcon } from "./icons";

export type AvatarSize = 24 | 32 | 44 | 64;

const sizes: Record<AvatarSize, string> = {
  24: "size-6 text-[10px]",
  32: "size-8 text-xs",
  44: "size-11 text-base",
  64: "size-16 text-xl",
};

const iconSizes: Record<AvatarSize, number> = { 24: 12, 32: 16, 44: 22, 64: 32 };

const fills: Record<AvatarColor, string> = {
  yellow: "bg-yellow",
  pink: "bg-pink",
  mint: "bg-mint",
  lilac: "bg-lilac",
  "yellow-tint": "bg-yellow-tint",
  "pink-tint": "bg-pink-tint",
  "mint-tint": "bg-mint-tint",
  "lilac-tint": "bg-lilac-tint",
};

type AvatarProps = {
  name: string;
  color?: string | null;
  size?: AvatarSize;
  pip?: boolean;
  className?: string;
};

export function Avatar({ name, color, size = 32, pip = false, className }: AvatarProps) {
  const fill = pip ? fills.yellow : fills[isAvatarColor(color) ? color : DEFAULT_AVATAR_COLOR];

  return (
    <span
      role="img"
      aria-label={pip ? `${name} (AI)` : name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-ink font-heading leading-none text-on-accent select-none",
        sizes[size],
        fill,
        className,
      )}
    >
      {pip ? <SparkIcon size={iconSizes[size]} /> : <span aria-hidden="true">{initials(name)}</span>}
    </span>
  );
}
