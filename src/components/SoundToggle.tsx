"use client";
import { useDashboard } from "@/lib/store";

export default function SoundToggle() {
  const { soundEnabled, toggleSound } = useDashboard();
  return (
    <button onClick={toggleSound}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs font-mono"
      style={{
        background: soundEnabled?"rgba(212,160,23,0.1)":"var(--bg-card)",
        border:`1px solid ${soundEnabled?"rgba(212,160,23,0.3)":"var(--bg-border)"}`,
        color: soundEnabled?"var(--gold-primary)":"var(--text-muted)",
      }}>
      {soundEnabled?"🔔":"🔕"} {soundEnabled?"Alerts ON":"Alerts OFF"}
    </button>
  );
}
