"use client";
import { useEffect, useState } from "react";

interface NewsEvent {
  title: string;
  country: string;
  date: string;
  time: string;
  impact: string;
  forecast: string;
  previous: string;
}

const KEYWORDS = ["interest rate","fed","fomc","cpi","inflation","ppi","non-farm","nfp","jobless","gdp","treasury","powell","employment","michigan","ism","pce"];

function isGoldRelevant(e: NewsEvent): boolean {
  const lower = e.title.toLowerCase();
  return (e.country === "USD" && e.impact === "High") || KEYWORDS.some(k => lower.includes(k));
}

function toEAT(date: string, time: string): string {
  try {
    if (!time || time === "Tentative" || time === "All Day") return time || "TBD";
    const dt = new Date(date + "T" + time);
    return dt.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Nairobi" });
  } catch { return time; }
}

function isUpcoming(e: NewsEvent): boolean {
  try {
    const dt = new Date(e.date + "T" + e.time);
    const d = (dt.getTime() - Date.now()) / 60000;
    return d > 0 && d <= 120;
  } catch { return false; }
}

const impactColor = (i: string) =>
  i === "High" ? "var(--red-trade)" : i === "Medium" ? "var(--gold-primary)" : "var(--text-muted)";

export default function NewsFeed() {
  const [events, setEvents] = useState<NewsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json")
      .then(r => r.json())
      .then((d: NewsEvent[]) => setEvents(d.filter(isGoldRelevant)))
      .catch(() => setError("Could not load news. Check connection."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="panel space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm tracking-widest uppercase text-[var(--gold-primary)]">Gold-Relevant News</h2>
        <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">This Week · EAT</span>
      </div>
      {loading && <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 rounded-lg bg-[var(--bg-card)] animate-pulse" />)}</div>}
      {error && <p className="text-xs font-mono text-[var(--red-trade)]">{error}</p>}
      {!loading && !error && events.length === 0 && <p className="text-xs font-mono text-[var(--text-muted)]">No high-impact gold events this week.</p>}
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {events.map((ev, i) => {
          const upcoming = isUpcoming(ev);
          return (
            <div key={i} className="rounded-lg px-3 py-2.5"
              style={{ background: upcoming ? "rgba(212,160,23,0.08)" : "var(--bg-card)", border: upcoming ? "1px solid rgba(212,160,23,0.3)" : "1px solid var(--bg-border)" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: impactColor(ev.impact) }} />
                    <span className="text-xs font-mono text-[var(--text-primary)] truncate">{ev.title}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-[10px] font-mono" style={{ color: impactColor(ev.impact) }}>{ev.impact}</span>
                    {ev.forecast && <span className="text-[10px] font-mono text-[var(--text-muted)]">F: {ev.forecast}</span>}
                    {ev.previous && <span className="text-[10px] font-mono text-[var(--text-muted)]">P: {ev.previous}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-mono font-bold" style={{ color: upcoming ? "var(--gold-primary)" : "var(--text-muted)" }}>{toEAT(ev.date, ev.time)}</p>
                  {upcoming && <p className="text-[10px] font-mono text-[var(--gold-primary)]">Soon</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] font-mono text-[var(--text-muted)]">Source: Forex Factory · Filtered for USD/Gold impact · Times in EAT</p>
    </div>
  );
}
