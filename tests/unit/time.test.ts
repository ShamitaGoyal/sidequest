import { describe, expect, it } from "vitest";
import {
  formatDuration,
  formatLocalTime,
  formatRevealCountdown,
  isValidTimeZone,
  localDateInZone,
} from "@/lib/time";

const LA = "America/Los_Angeles";
const minutes = (n: number) => n * 60_000;
const hours = (n: number) => n * 3_600_000;

describe("T-UNIT-01 (start) local date", () => {
  it("uses the group's timezone, not UTC", () => {
    const instant = new Date("2026-06-02T05:30:00Z");
    expect(localDateInZone(instant, "UTC")).toBe("2026-06-02");
    expect(localDateInZone(instant, LA)).toBe("2026-06-01");
    expect(localDateInZone(instant, "Asia/Tokyo")).toBe("2026-06-02");
  });

  it("rolls over at local midnight", () => {
    expect(localDateInZone(new Date("2026-06-02T06:59:59Z"), LA)).toBe("2026-06-01");
    expect(localDateInZone(new Date("2026-06-02T07:00:00Z"), LA)).toBe("2026-06-02");
  });
});

describe("T-UNIT-01 (start) local time", () => {
  it("formats in lowercase 12-hour time", () => {
    expect(formatLocalTime(new Date("2026-06-02T03:00:00Z"), LA)).toBe("8:00 pm");
    expect(formatLocalTime(new Date("2026-06-01T16:00:00Z"), LA)).toBe("9:00 am");
  });

  it("shows 8:00 pm on both sides of the spring DST change", () => {
    // DST starts in Los Angeles on 2026-03-08.
    expect(formatLocalTime(new Date("2026-03-08T04:00:00Z"), LA)).toBe("8:00 pm");
    expect(formatLocalTime(new Date("2026-03-09T03:00:00Z"), LA)).toBe("8:00 pm");
    expect(localDateInZone(new Date("2026-03-09T03:00:00Z"), LA)).toBe("2026-03-08");
  });

  it("shows 9:00 am on both sides of the fall DST change", () => {
    // DST ends in Los Angeles on 2026-11-01.
    expect(formatLocalTime(new Date("2026-10-31T16:00:00Z"), LA)).toBe("9:00 am");
    expect(formatLocalTime(new Date("2026-11-01T17:00:00Z"), LA)).toBe("9:00 am");
  });
});

describe("T-UNIT-01 (start) durations and countdown", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration(hours(5) + minutes(12))).toBe("5h 12m");
    expect(formatDuration(hours(11))).toBe("11h 0m");
  });

  it("drops hours under one hour", () => {
    expect(formatDuration(minutes(12))).toBe("12m");
  });

  it("says under a minute for short or negative durations", () => {
    expect(formatDuration(59_000)).toBe("under a minute");
    expect(formatDuration(-5_000)).toBe("under a minute");
  });

  it("builds the countdown text from the design system", () => {
    const revealAt = new Date("2026-06-02T03:00:00Z");
    const now = new Date(revealAt.getTime() - hours(5) - minutes(12));
    expect(formatRevealCountdown(now, revealAt, LA)).toBe("Reveals 8:00 pm, in 5h 12m");
  });

  it("switches to past tense at the reveal moment", () => {
    const revealAt = new Date("2026-06-02T03:00:00Z");
    expect(formatRevealCountdown(new Date(revealAt.getTime() - 1000), revealAt, LA)).toBe(
      "Reveals 8:00 pm, in under a minute",
    );
    expect(formatRevealCountdown(revealAt, revealAt, LA)).toBe("Revealed at 8:00 pm");
  });
});

describe("T-UNIT-01 (start) timezone validation", () => {
  it("accepts IANA names and rejects junk", () => {
    expect(isValidTimeZone(LA)).toBe(true);
    expect(isValidTimeZone("Not/A_Zone")).toBe(false);
  });
});
