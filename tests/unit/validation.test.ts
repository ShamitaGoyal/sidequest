import { describe, expect, it } from "vitest";
import {
  answerBodySchema,
  displayNameSchema,
  groupNameSchema,
  INVITE_CODE_ALPHABET,
  inviteCodeSchema,
  LIMITS,
  messageBodySchema,
  validate,
} from "@/lib/validation";

const text = (length: number) => "a".repeat(length);

describe("T-UNIT-02 length-limited text schemas", () => {
  const cases = [
    { name: "display name", schema: displayNameSchema, max: LIMITS.displayName },
    { name: "group name", schema: groupNameSchema, max: LIMITS.groupName },
    { name: "answer", schema: answerBodySchema, max: LIMITS.answer },
    { name: "message", schema: messageBodySchema, max: LIMITS.message },
  ];

  it.each(cases)("$name accepts 1 character", ({ schema }) => {
    expect(schema.safeParse("a").success).toBe(true);
  });

  it.each(cases)("$name accepts exactly the max length", ({ schema, max }) => {
    expect(schema.safeParse(text(max)).success).toBe(true);
  });

  it.each(cases)("$name rejects one over the max length", ({ schema, max }) => {
    expect(schema.safeParse(text(max + 1)).success).toBe(false);
  });

  it.each(cases)("$name rejects empty and whitespace-only input", ({ schema }) => {
    expect(schema.safeParse("").success).toBe(false);
    expect(schema.safeParse("   \n ").success).toBe(false);
  });

  it.each(cases)("$name trims surrounding whitespace", ({ schema }) => {
    expect(schema.parse("  hi  ")).toBe("hi");
  });

  it("uses the spec limits", () => {
    expect(LIMITS).toEqual({ displayName: 30, groupName: 40, answer: 500, message: 1000 });
  });
});

describe("T-UNIT-02 invite code schema", () => {
  it("accepts 6 characters from the allowed alphabet", () => {
    expect(inviteCodeSchema.parse("K7MP2Q")).toBe("K7MP2Q");
  });

  it("uppercases and trims what people type", () => {
    expect(inviteCodeSchema.parse("  k7mp2q ")).toBe("K7MP2Q");
  });

  it("rejects the wrong length", () => {
    expect(inviteCodeSchema.safeParse("K7MP2").success).toBe(false);
    expect(inviteCodeSchema.safeParse("K7MP2QX").success).toBe(false);
  });

  it.each(["0", "O", "1", "I"])("rejects the look-alike character %s", (char) => {
    expect(INVITE_CODE_ALPHABET).not.toContain(char);
    expect(inviteCodeSchema.safeParse(`K7MP2${char}`).success).toBe(false);
  });

  it("rejects symbols and spaces inside the code", () => {
    expect(inviteCodeSchema.safeParse("K7M-2Q").success).toBe(false);
    expect(inviteCodeSchema.safeParse("K7M 2Q").success).toBe(false);
  });

  it("returns the friendly error message", () => {
    expect(validate(inviteCodeSchema, "nope")).toEqual({
      ok: false,
      error: "That code didn't work. Check it and try again.",
    });
  });
});

describe("T-UNIT-02 validate helper", () => {
  it("returns parsed data on success", () => {
    expect(validate(groupNameSchema, " College crew ")).toEqual({ ok: true, data: "College crew" });
  });

  it("returns the first issue message on failure", () => {
    expect(validate(groupNameSchema, "")).toEqual({ ok: false, error: "Give your group a name." });
  });

  it("rejects non-string input", () => {
    expect(validate(displayNameSchema, 42).ok).toBe(false);
  });
});
