import { z } from "zod";

// Must match the database constraints in docs/03_data_model.md.
export const LIMITS = {
  displayName: 30,
  groupName: 40,
  answer: 500,
  message: 1000,
} as const;

export const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const INVITE_CODE_LENGTH = 6;

const INVITE_CODE_PATTERN = new RegExp(`^[${INVITE_CODE_ALPHABET}]{${INVITE_CODE_LENGTH}}$`);

function requiredText(max: number, emptyMessage: string) {
  return z
    .string()
    .trim()
    .min(1, emptyMessage)
    .max(max, `Keep it to ${max} characters or fewer.`);
}

export const displayNameSchema = requiredText(LIMITS.displayName, "Add a name your friends will recognize.");

export const groupNameSchema = requiredText(LIMITS.groupName, "Give your group a name.");

export const answerBodySchema = requiredText(LIMITS.answer, "Write an answer before locking it in.");

export const messageBodySchema = requiredText(LIMITS.message, "Type a message first.");

export const inviteCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(INVITE_CODE_PATTERN, "That code didn't work. Check it and try again.");

export type ValidationResult<T> = { ok: true; data: T } | { ok: false; error: string };

export function validate<T>(schema: z.ZodType<T>, input: unknown): ValidationResult<T> {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, error: result.error.issues[0]?.message ?? "That doesn't look right. Check it and try again." };
}
