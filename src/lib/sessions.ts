// ── sessions.ts ───────────────────────────────────────────────────────────────
// All openHour / closeHour values are stored in UTC.
// Use the helper functions below to convert to any target timezone for display.

export type SessionName = "Sydney" | "Tokyo" | "London" | "New York";

export interface Session {
  name: SessionName;
  /** UTC hour the session opens */
  openHour: number;
  /** UTC hour the session closes (use 24 to mean 00:00 next day) */
  closeHour: number;
  color: string;
  description: string;
}

// ── Corrected session times in UTC ──────────────────────────────────────────
// Sydney:   22:00 – 07:00 UTC  (was wrong at 21:00–06:00 when expressed as EAT–3)
// Tokyo:    00:00 – 09:00 UTC
// London:   07:00 – 16:00 UTC
// New York: 12:00 – 21:00 UTC
export const SESSIONS: Session[] = [
  { name: "Sydney",   openHour: 22, closeHour: 31, color: "#34d399", description: "Low volume, thin liquidity" },
  { name: "Tokyo",    openHour: 0,  closeHour: 9,  color: "#a78bfa", description: "Mild XAU movement, JPY pairs active" },
  { name: "London",   openHour: 7,  closeHour: 16, color: "#3b82f6", description: "High volatility begins — prime XAU session" },
  { name: "New York", openHour: 12, closeHour: 21, color: "#f59e0b", description: "Peak volume, major moves happen here" },
];
// Note: Sydney closeHour 31 = 07:00 next UTC day (24+7). We handle wrap-around below.

export interface KillZone {
  name: string;
  /** UTC hour */
  openHour: number;
  openMin: number;
  /** UTC hour */
  closeHour: number;
  closeMin: number;
  type: "london" | "ny" | "asian";
  tip: string;
}

// ── Kill zones stored in UTC ──────────────────────────────────────────────────
export const KILL_ZONES: KillZone[] = [
  { name: "Asian Killzone",      openHour: 23, openMin: 0, closeHour: 2,  closeMin: 0, type: "asian",  tip: "Range formation — liquidity grabs above/below Asian highs" },
  { name: "London Open Killzone",openHour: 7,  openMin: 0, closeHour: 9,  closeMin: 0, type: "london", tip: "Watch for manipulation — fake moves before true direction" },
  { name: "NY Open Killzone",    openHour: 12, openMin: 0, closeHour: 14, closeMin: 0, type: "ny",     tip: "Strongest trend continuation or reversal setups" },
  { name: "London/NY Overlap",   openHour: 12, openMin: 0, closeHour: 16, closeMin: 0, type: "london", tip: "Highest liquidity window of the day — premium entries" },
];

// ── Time helpers ─────────────────────────────────────────────────────────────

/** Returns the current time decomposed in the given IANA timezone. */
export function getTimeInZone(tz: string) {
  const now = new Date();
  // Build a date that looks like "local" but actually represents the target zone
  const zoneStr = now.toLocaleString("en-US", { timeZone: tz });
  const zoned = new Date(zoneStr);
  return {
    hour: zoned.getHours(),
    minute: zoned.getMinutes(),
    second: zoned.getSeconds(),
    date: zoned,
    utcOffset: getOffsetMinutes(tz, now),
  };
}

/** Returns UTC offset in minutes for a given IANA timezone at a specific moment. */
function getOffsetMinutes(tz: string, at: Date): number {
  const utcStr = at.toLocaleString("en-US", { timeZone: "UTC" });
  const zoneStr = at.toLocaleString("en-US", { timeZone: tz });
  return (new Date(zoneStr).getTime() - new Date(utcStr).getTime()) / 60000;
}

// ── Session conversion ────────────────────────────────────────────────────────

interface LocalSessionTime {
  openHour: number;    // local
  openMin: number;
  closeHour: number;   // local (may be ≥24 for next-day wrap display)
  closeMin: number;
  opensNextDay: boolean;
  closesNextDay: boolean;
}

/**
 * Converts a UTC-based session into local open/close hours for a given timezone.
 * Handles overnight wrap-around (e.g. Sydney 22:00→07:00 UTC).
 */
export function sessionInZone(session: Session, tz: string): LocalSessionTime {
  const now = new Date();
  const offsetMin = getOffsetMinutes(tz, now);

  // Sydney: openHour=22, closeHour=31 — normalise to 0-23 UTC first
  const utcOpen  = session.openHour  % 24;
  const utcClose = session.closeHour % 24;

  const localOpen  = ((utcOpen  * 60 + offsetMin) / 60);
  const localClose = ((utcClose * 60 + offsetMin) / 60);

  const localOpenH  = Math.floor(((localOpen  % 24) + 24) % 24);
  const localCloseH = Math.floor(((localClose % 24) + 24) % 24);

  return {
    openHour:      localOpenH,
    openMin:       0,
    closeHour:     localCloseH,
    closeMin:      0,
    opensNextDay:  localOpen  < 0 || localOpen  >= 24,
    closesNextDay: localClose < 0 || localClose >= 24,
  };
}

/** Formats a local session time as "HH:MM – HH:MM TZ" */
export function formatSessionRange(localTime: LocalSessionTime, tzAbbr: string): string {
  const fmt = (h: number, m: number) =>
    `${String(h % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return `${fmt(localTime.openHour, localTime.openMin)} – ${fmt(localTime.closeHour, localTime.closeMin)} ${tzAbbr}`;
}

// ── Active-session detection (works in LOCAL hours) ─────────────────────────

/** Checks if a session is active given local hour + the session's local open/close. */
export function isSessionActiveLocal(local: LocalSessionTime, currentHour: number): boolean {
  const { openHour: o, closeHour: c } = local;
  if (o <= c) {
    // Normal: open < close, e.g. 10–19
    return currentHour >= o && currentHour < c;
  } else {
    // Overnight wrap: e.g. open=22, close=07 (Sydney in some zones)
    return currentHour >= o || currentHour < c;
  }
}

// ── Kill zone detection (in UTC, then convert) ────────────────────────────────

function kzInZone(kz: KillZone, offsetMin: number) {
  const toLocal = (h: number, m: number) => {
    const totalMin = h * 60 + m + offsetMin;
    const wrapped = ((totalMin % 1440) + 1440) % 1440;
    return { h: Math.floor(wrapped / 60), m: wrapped % 60 };
  };
  const open  = toLocal(kz.openHour, kz.openMin);
  const close = toLocal(kz.closeHour, kz.closeMin);
  return { openH: open.h, openM: open.m, closeH: close.h, closeM: close.m };
}

export function getActiveKillZone(tz: string): KillZone | null {
  const now = new Date();
  const offsetMin = getOffsetMinutes(tz, now);
  const zoneStr = now.toLocaleString("en-US", { timeZone: tz });
  const zoned = new Date(zoneStr);
  const curMin = zoned.getHours() * 60 + zoned.getMinutes();

  return KILL_ZONES.find(kz => {
    const { openH, openM, closeH, closeM } = kzInZone(kz, offsetMin);
    const start = openH * 60 + openM;
    const end   = closeH * 60 + closeM;
    if (start <= end) return curMin >= start && curMin < end;
    // Overnight wrap (e.g. Asian KZ 23:00–02:00)
    return curMin >= start || curMin < end;
  }) ?? null;
}

export function getKillZoneLocalTime(kz: KillZone, tz: string) {
  const now = new Date();
  const offsetMin = getOffsetMinutes(tz, now);
  return kzInZone(kz, offsetMin);
}

// ── Countdown helpers ────────────────────────────────────────────────────────

export function minutesUntilNextLocal(local: LocalSessionTime, currentHour: number, currentMin: number): number {
  const cur  = currentHour * 60 + currentMin;
  const open = local.openHour * 60 + local.openMin;
  return open > cur ? open - cur : 1440 - cur + open;
}

export function formatCountdown(m: number): string {
  const h  = Math.floor(m / 60);
  const mn = m % 60;
  return h === 0 ? `${mn}m` : `${h}h ${mn}m`;
}

export const KES_RATE_FALLBACK = 129.5;