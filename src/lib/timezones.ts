// ── Timezone utilities ────────────────────────────────────────────────────────
// Uses native Intl API — zero latency, no keys, no rate limits, works offline.

export interface TimezoneOption {
  iana: string;       // IANA key  e.g. "Africa/Nairobi"
  label: string;      // Human label e.g. "Nairobi (EAT, UTC+3)"
  region: string;     // Grouping e.g. "Africa"
}

/** Curated list of ~30 major trading timezones worldwide. */
export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  // Africa
  { iana: "Africa/Nairobi",       label: "Nairobi (EAT, UTC+3)",       region: "Africa" },
  { iana: "Africa/Lagos",         label: "Lagos (WAT, UTC+1)",          region: "Africa" },
  { iana: "Africa/Johannesburg",  label: "Johannesburg (SAST, UTC+2)",  region: "Africa" },
  { iana: "Africa/Cairo",         label: "Cairo (EET, UTC+2)",          region: "Africa" },
  { iana: "Africa/Casablanca",    label: "Casablanca (WET, UTC+0/+1)",  region: "Africa" },

  // Europe
  { iana: "Europe/London",        label: "London (GMT/BST, UTC+0/+1)",  region: "Europe" },
  { iana: "Europe/Paris",         label: "Paris / Frankfurt (CET)",     region: "Europe" },
  { iana: "Europe/Zurich",        label: "Zurich (CET, UTC+1/+2)",      region: "Europe" },
  { iana: "Europe/Moscow",        label: "Moscow (MSK, UTC+3)",         region: "Europe" },
  { iana: "Europe/Istanbul",      label: "Istanbul (TRT, UTC+3)",       region: "Europe" },

  // Americas
  { iana: "America/New_York",     label: "New York (ET, UTC-5/-4)",     region: "Americas" },
  { iana: "America/Chicago",      label: "Chicago (CT, UTC-6/-5)",      region: "Americas" },
  { iana: "America/Denver",       label: "Denver (MT, UTC-7/-6)",       region: "Americas" },
  { iana: "America/Los_Angeles",  label: "Los Angeles (PT, UTC-8/-7)",  region: "Americas" },
  { iana: "America/Toronto",      label: "Toronto (ET, UTC-5/-4)",      region: "Americas" },
  { iana: "America/Sao_Paulo",    label: "São Paulo (BRT, UTC-3)",      region: "Americas" },
  { iana: "America/Mexico_City",  label: "Mexico City (CST, UTC-6)",    region: "Americas" },

  // Asia
  { iana: "Asia/Dubai",           label: "Dubai (GST, UTC+4)",          region: "Asia" },
  { iana: "Asia/Riyadh",          label: "Riyadh (AST, UTC+3)",         region: "Asia" },
  { iana: "Asia/Kolkata",         label: "Mumbai / Delhi (IST, UTC+5:30)", region: "Asia" },
  { iana: "Asia/Singapore",       label: "Singapore (SGT, UTC+8)",      region: "Asia" },
  { iana: "Asia/Shanghai",        label: "Shanghai / Beijing (CST, UTC+8)", region: "Asia" },
  { iana: "Asia/Tokyo",           label: "Tokyo (JST, UTC+9)",          region: "Asia" },
  { iana: "Asia/Seoul",           label: "Seoul (KST, UTC+9)",          region: "Asia" },
  { iana: "Asia/Hong_Kong",       label: "Hong Kong (HKT, UTC+8)",      region: "Asia" },

  // Pacific
  { iana: "Australia/Sydney",     label: "Sydney (AEDT, UTC+10/+11)",   region: "Pacific" },
  { iana: "Australia/Melbourne",  label: "Melbourne (AEDT, UTC+10/+11)",region: "Pacific" },
  { iana: "Pacific/Auckland",     label: "Auckland (NZDT, UTC+12/+13)", region: "Pacific" },

  // UTC
  { iana: "UTC",                  label: "UTC (GMT+0)",                  region: "UTC" },
];

/**
 * Detects the user's IANA timezone from the browser's Intl API.
 * Falls back to "Africa/Nairobi" if detection fails.
 */
export function detectUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Nairobi";
  } catch {
    return "Africa/Nairobi";
  }
}

/**
 * Returns a TimezoneOption for the given IANA key.
 * If not in the curated list, synthesises one with the detected offset.
 */
export function resolveTimezoneOption(iana: string): TimezoneOption {
  const found = TIMEZONE_OPTIONS.find(o => o.iana === iana);
  if (found) return found;

  // Fallback: build a label using the offset
  try {
    const offset = getUTCOffsetLabel(iana);
    const city = iana.split("/").pop()?.replace(/_/g, " ") ?? iana;
    return { iana, label: `${city} (${offset})`, region: "Other" };
  } catch {
    return { iana, label: iana, region: "Other" };
  }
}

/** Returns a UTC offset string like "UTC+3" or "UTC-5" for a given IANA timezone. */
export function getUTCOffsetLabel(iana: string): string {
  try {
    const now = new Date();
    // Use Intl to get hour/minute parts in the target zone vs UTC
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: iana,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    const tzName = parts.find(p => p.type === "timeZoneName")?.value ?? "";
    // tzName is like "GMT+3" or "GMT-5:30" — rewrite as UTC
    return tzName.replace("GMT", "UTC");
  } catch {
    return "UTC";
  }
}

/** Returns a grouped map of timezone options keyed by region. */
export function groupedTimezones(): Record<string, TimezoneOption[]> {
  return TIMEZONE_OPTIONS.reduce<Record<string, TimezoneOption[]>>((acc, tz) => {
    (acc[tz.region] ??= []).push(tz);
    return acc;
  }, {});
}
