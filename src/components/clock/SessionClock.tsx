"use client";
import { useEffect, useState } from "react";
import { SESSIONS, KILL_ZONES, getEATTime, isSessionActive, getActiveKillZone, minutesUntilNext, formatCountdown } from "@/lib/sessions";
import { useDashboard } from "@/lib/store";

export default function SessionClock() {
  const { soundEnabled } = useDashboard();
  const [time, setTime] = useState(getEATTime());
  const [prevKZ, setPrevKZ] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      const t = getEATTime();
      setTime(t);
      const kz = getActiveKillZone(t.hour, t.minute);
      if (kz?.name && kz.name !== prevKZ && soundEnabled) playBeep();
      setPrevKZ(kz?.name ?? null);
    }, 1000);
    return () => clearInterval(id);
  }, [prevKZ, soundEnabled]);

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
    } catch (_) {}
  }

  const activeKZ = getActiveKillZone(time.hour, time.minute);
  const activeSessions = SESSIONS.filter(s => isSessionActive(s, time.hour));
  const timeStr = time.date.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const dateStr = time.date.toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="panel space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-widest">East Africa Time (EAT)</p>
          <p className="text-4xl font-mono font-bold gold-text tracking-tight mt-1">{timeStr}</p>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{dateStr}</p>
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          {activeSessions.length === 0 && (
            <span className="session-badge" style={{ background: "rgba(107,122,153,0.15)", color: "var(--text-muted)" }}>No active session</span>
          )}
          {activeSessions.map(s => (
            <span key={s.name} className="session-badge" style={{ background: s.color + "20", color: s.color, border: "1px solid " + s.color + "40" }}>
              <span className="pulse-dot" style={{ background: s.color, color: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      </div>
      <div className="gold-divider" />
      {activeKZ
        ? <div className="killzone-bar">
            <p className="text-xs font-mono text-[var(--gold-primary)] uppercase tracking-widest">KZ Active: {activeKZ.name}</p>
            <p className="text-sm text-[var(--text-primary)] mt-0.5">{activeKZ.tip}</p>
          </div>
        : <p className="text-xs text-[var(--text-muted)] font-mono">No killzone active</p>
      }
      <div className="gold-divider" />
      <div className="grid grid-cols-2 gap-2">
        {SESSIONS.map(s => {
          const active = isSessionActive(s, time.hour);
          const minsUntil = active ? null : minutesUntilNext(s, time.hour, time.minute);
          return (
            <div key={s.name} className="rounded-lg px-3 py-2.5 flex flex-col gap-1"
              style={{ background: active ? s.color + "12" : "var(--bg-card)", border: "1px solid " + (active ? s.color + "40" : "var(--bg-border)") }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold" style={{ color: s.color }}>{s.name}</span>
                {active
                  ? <span className="text-[10px] font-mono" style={{ color: s.color }}>LIVE</span>
                  : <span className="text-[10px] font-mono text-[var(--text-muted)]">in {formatCountdown(minsUntil!)}</span>
                }
              </div>
              <p className="text-[10px] text-[var(--text-muted)] leading-tight">{s.description}</p>
              <p className="text-[10px] font-mono text-[var(--text-muted)]">
                {String(s.openHour).padStart(2, "0")}:00 - {s.closeHour === 24 ? "00:00" : String(s.closeHour).padStart(2, "0") + ":00"} EAT
              </p>
            </div>
          );
        })}
      </div>
      <div>
        <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-2">Killzone Windows (EAT)</p>
        <div className="space-y-1">
          {KILL_ZONES.map(kz => {
            const isActive = getActiveKillZone(time.hour, time.minute)?.name === kz.name;
            return (
              <div key={kz.name} className="flex items-center justify-between rounded px-2.5 py-1.5 text-xs"
                style={{ background: isActive ? "rgba(212,160,23,0.1)" : "var(--bg-card)", border: isActive ? "1px solid rgba(212,160,23,0.3)" : "1px solid transparent" }}>
                <span className="font-mono" style={{ color: isActive ? "var(--gold-primary)" : "var(--text-muted)" }}>{kz.name}</span>
                <span className="font-mono text-[var(--text-muted)]">
                  {String(kz.openHour).padStart(2, "0")}:{String(kz.openMin).padStart(2, "0")} - {String(kz.closeHour).padStart(2, "0")}:{String(kz.closeMin).padStart(2, "0")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
