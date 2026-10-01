export const AVATAR_COLORS = [
  "yellow",
  "pink",
  "mint",
  "lilac",
  "yellow-tint",
  "pink-tint",
  "mint-tint",
  "lilac-tint",
] as const;

export type AvatarColor = (typeof AVATAR_COLORS)[number];

export const DEFAULT_AVATAR_COLOR: AvatarColor = "lilac";

export function isAvatarColor(value: unknown): value is AvatarColor {
  return typeof value === "string" && (AVATAR_COLORS as readonly string[]).includes(value);
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = Array.from(words[0])[0] ?? "";
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? "") : "";
  return (first + last).toUpperCase();
}
