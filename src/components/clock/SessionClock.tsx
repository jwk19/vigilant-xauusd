"use client";
import { useEffect, useMemo, useState } from "react";
import {
  SESSIONS, KILL_ZONES,
  getTimeInZone, sessionInZone, isSessionActiveLocal,
  getActiveKillZone, getKillZoneLocalTime,
  minutesUntilNextLocal, formatCountdown,
} from "@/lib/sessions";
import {
  TIMEZONE_OPTIONS, detectUserTimezone,
  resolveTimezoneOption, groupedTimezones,
} from "@/lib/timezones";
import { useDashboard } from "@/lib/store";

export default function SessionClock() {
  const { soundEnabled, selectedTimezone, setSelectedTimezone } = useDashboard();

  // Auto-detect once on mount (client only)
  const [detectedTZ, setDetectedTZ]   = useState<string>("Africa/Nairobi");
  const [mounted, setMounted]         = useState(false);
  const [time, setTime]               = useState(() => getTimeInZone("Africa/Nairobi"));
  const [prevKZ, setPrevKZ]           = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Resolve the active timezone: stored choice or auto-detected
  const activeTZ = selectedTimezone || detectedTZ;
  const tzOption = useMemo(() => resolveTimezoneOption(activeTZ), [activeTZ]);
  const isAutoDetected = !selectedTimezone;
  // Must be declared before any early return (hooks rule)
  const grouped = useMemo(() => groupedTimezones(), []);

  useEffect(() => {
    const detected = detectUserTimezone();
    setDetectedTZ(detected);
    setTime(getTimeInZone(detected));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => {
      const t = getTimeInZone(activeTZ);
      setTime(t);
      const kz = getActiveKillZone(activeTZ);
      if (kz?.name && kz.name !== prevKZ && soundEnabled) playBeep();
      setPrevKZ(kz?.name ?? null);
    }, 1000);
    return () => clearInterval(id);
  }, [mounted, activeTZ, prevKZ, soundEnabled]);

  if (!mounted) return null;

  function playBeep() {
    try {
      const ctx = new AudioContext();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.setValueAtTime(528, ctx.currentTime);
      o.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      o.start();
      o.stop(ctx.currentTime + 0.6);
    } catch (_) { }
  }

  const activeKZ     = getActiveKillZone(activeTZ);
  const timeStr      = time.date.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    timeZone: activeTZ,
  });
  const dateStr = time.date.toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    timeZone: activeTZ,
  });

  // Localised sessions
  const localSessions = SESSIONS.map(s => ({
    ...s,
    local: sessionInZone(s, activeTZ),
  }));
  const activeSessions = localSessions.filter(s => isSessionActiveLocal(s.local, time.hour));

  // Timezone abbr (short form for labels)
  const tzAbbr = tzOption.label.match(/\(([^)]+)\)/)?.[1]?.split(",")[0] ?? "Local";

  return (
    <div className="panel space-y-4">

      {/* ── Header: clock + active session badges ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-widest truncate">
            {tzOption.label}
            {isAutoDetected && (
              <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full bg-[rgba(212,160,23,0.15)] text-[var(--gold-primary)] font-mono tracking-wider">
                📍 auto
              </span>
            )}
          </p>
          <p className="text-4xl font-mono font-bold gold-text tracking-tight mt-1 tabular-nums">{timeStr}</p>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{dateStr}</p>
        </div>
        <div className="flex flex-col gap-1.5 items-end shrink-0">
          {activeSessions.length === 0 && (
            <span className="session-badge" style={{ background: "rgba(107,122,153,0.15)", color: "var(--text-muted)" }}>
              No active session
            </span>
          )}
          {activeSessions.map(s => (
            <span key={s.name} className="session-badge"
              style={{ background: s.color + "20", color: s.color, border: "1px solid " + s.color + "40" }}>
              <span className="pulse-dot" style={{ background: s.color, color: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      </div>

      {/* ── Timezone selector ── */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(o => !o)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all"
          style={{
            background: "var(--bg-card)",
            border: `1px solid ${dropdownOpen ? "var(--gold-dim)" : "var(--bg-border)"}`,
            color: "var(--text-primary)",
          }}
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
        >
          <span className="flex items-center gap-2">
            <span style={{ color: "var(--text-muted)" }}>🌐</span>
            <span className="truncate">{tzOption.label}</span>
          </span>
          <span style={{ color: "var(--text-muted)", marginLeft: "4px" }}>{dropdownOpen ? "▲" : "▼"}</span>
        </button>

        {dropdownOpen && (
          <div
            className="absolute z-50 left-0 right-0 mt-1 overflow-y-auto rounded-xl shadow-2xl"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--bg-border)",
              maxHeight: "280px",
            }}
          >
            {/* Auto-detect option */}
            <button
              className="w-full text-left px-3 py-2 text-xs font-mono transition-colors"
              style={{
                background: isAutoDetected ? "rgba(212,160,23,0.12)" : "transparent",
                color: isAutoDetected ? "var(--gold-primary)" : "var(--text-muted)",
                borderBottom: "1px solid var(--bg-border)",
              }}
              onClick={() => { setSelectedTimezone(""); setDropdownOpen(false); }}
            >
              📍 Auto-detect ({resolveTimezoneOption(detectedTZ).label})
            </button>

            {/* Grouped options */}
            {Object.entries(grouped).map(([region, options]) => (
              <div key={region}>
                <p className="px-3 pt-2 pb-0.5 text-[9px] font-mono uppercase tracking-[0.2em]"
                  style={{ color: "var(--gold-dim)" }}>
                  {region}
                </p>
                {options.map(opt => {
                  const isSelected = opt.iana === activeTZ;
                  return (
                    <button
                      key={opt.iana}
                      className="w-full text-left px-3 py-1.5 text-xs font-mono transition-colors"
                      style={{
                        background: isSelected ? "rgba(212,160,23,0.1)" : "transparent",
                        color: isSelected ? "var(--gold-primary)" : "var(--text-primary)",
                      }}
                      onClick={() => { setSelectedTimezone(opt.iana); setDropdownOpen(false); }}
                    >
                      {isSelected ? "✓ " : "  "}{opt.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="gold-divider" />

      {/* ── Kill zone status ── */}
      {activeKZ ? (
        <div className="killzone-bar">
          <p className="text-xs font-mono text-[var(--gold-primary)] uppercase tracking-widest">
            ⚡ {activeKZ.name} Active
          </p>
          <p className="text-sm text-[var(--text-primary)] mt-0.5">{activeKZ.tip}</p>
        </div>
      ) : (
        <p className="text-xs text-[var(--text-muted)] font-mono">No killzone active</p>
      )}

      <div className="gold-divider" />

      {/* ── Session grid ── */}
      <div className="grid grid-cols-2 gap-2">
        {localSessions.map(s => {
          const active   = isSessionActiveLocal(s.local, time.hour);
          const minsUntil = active ? null : minutesUntilNextLocal(s.local, time.hour, time.minute);
          const openStr  = `${String(s.local.openHour).padStart(2, "0")}:00`;
          const closeH   = s.local.closeHour % 24;
          const closeStr = `${String(closeH).padStart(2, "0")}:00`;

          return (
            <div key={s.name}
              className="rounded-lg px-3 py-2.5 flex flex-col gap-1"
              style={{
                background: active ? s.color + "12" : "var(--bg-card)",
                border: "1px solid " + (active ? s.color + "40" : "var(--bg-border)"),
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold" style={{ color: s.color }}>
                  {s.name}
                </span>
                {active ? (
                  <span className="text-[10px] font-mono" style={{ color: s.color }}>LIVE</span>
                ) : (
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    in {formatCountdown(minsUntil!)}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[var(--text-muted)] leading-tight">{s.description}</p>
              <p className="text-[10px] font-mono text-[var(--text-muted)]">
                {openStr} – {closeStr} {tzAbbr}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Kill zones list ── */}
      <div>
        <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-2">
          Killzone Windows ({tzAbbr})
        </p>
        <div className="space-y-1">
          {KILL_ZONES.map(kz => {
            const isActive = activeKZ?.name === kz.name;
            const local    = getKillZoneLocalTime(kz, activeTZ);
            const fmt2     = (h: number, m: number) =>
              `${String(h % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
            return (
              <div key={kz.name}
                className="flex items-center justify-between rounded px-2.5 py-1.5 text-xs"
                style={{
                  background: isActive ? "rgba(212,160,23,0.1)" : "var(--bg-card)",
                  border: isActive ? "1px solid rgba(212,160,23,0.3)" : "1px solid transparent",
                }}
              >
                <span className="font-mono" style={{ color: isActive ? "var(--gold-primary)" : "var(--text-muted)" }}>
                  {kz.name}
                </span>
                <span className="font-mono text-[var(--text-muted)]">
                  {fmt2(local.openH, local.openM)} – {fmt2(local.closeH, local.closeM)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}