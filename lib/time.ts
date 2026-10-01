// Display helpers for group-local time. The database computes post_at and reveal_at;
// these only format and compare instants for the UI.

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** The calendar date (YYYY-MM-DD) of `instant` in `timeZone`. */
export function localDateInZone(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Clock time like "8:00 pm" for `instant` in `timeZone`. */
export function formatLocalTime(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(instant)
    .replace(/\s/g, " ")
    .replace("AM", "am")
    .replace("PM", "pm");
}

/** Duration like "5h 12m", "12m", or "under a minute". Negative input counts as zero. */
export function formatDuration(ms: number): string {
  const safe = Math.max(0, ms);
  if (safe < MINUTE_MS) return "under a minute";
  const hours = Math.floor(safe / HOUR_MS);
  const minutes = Math.floor((safe % HOUR_MS) / MINUTE_MS);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

/** Countdown text like "Reveals 8:00 pm, in 5h 12m". */
export function formatRevealCountdown(now: Date, revealAt: Date, timeZone: string): string {
  const time = formatLocalTime(revealAt, timeZone);
  const remaining = revealAt.getTime() - now.getTime();
  if (remaining <= 0) return `Revealed at ${time}`;
  return `Reveals ${time}, in ${formatDuration(remaining)}`;
}
