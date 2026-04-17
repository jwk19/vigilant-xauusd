"use client";
import { useEffect, useState } from "react";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  sourceColor: string;
  summary: string;
  image: string | null;
}

function isToday(dateStr: string): boolean {
  try {
    const item = new Date(dateStr);
    const now = new Date();
    return (
      item.getFullYear() === now.getFullYear() &&
      item.getMonth() === now.getMonth() &&
      item.getDate() === now.getDate()
    );
  } catch {
    return false;
  }
}

function formatAgo(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(mins / 60);
    if (mins < 60) return `${mins}m ago`;
    return `${hrs}h ago`;
  } catch {
    return "";
  }
}

export default function DashboardNews() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Track which image URLs have confirmed loaded (to avoid showing broken images)
  const [confirmed, setConfirmed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((data: NewsItem[]) => {
        if ((data as any).error) throw new Error();
        // Only today's articles that have an image URL
        const todayWithImage = data.filter(
          (item) => item.image && item.pubDate && isToday(item.pubDate)
        );
        setItems(todayWithImage.slice(0, 2));
      })
      .catch(() => setError("Could not load today's news."))
      .finally(() => setLoading(false));
  }, []);

  const handleImgLoad = (idx: number) =>
    setConfirmed((prev) => ({ ...prev, [idx]: true }));
  const handleImgError = (idx: number) =>
    setConfirmed((prev) => ({ ...prev, [idx]: false }));

  return (
    <div className="panel flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm tracking-widest uppercase text-[var(--gold-primary)]">
          Today's Market News
        </h2>
        <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
          Live · EAT
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden animate-pulse">
              <div className="h-36 bg-[var(--bg-border)]" />
              <div className="bg-[var(--bg-card)] p-3 space-y-2">
                <div className="h-3 bg-[var(--bg-border)] rounded w-1/4" />
                <div className="h-4 bg-[var(--bg-border)] rounded w-full" />
                <div className="h-3 bg-[var(--bg-border)] rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <p className="text-xs font-mono text-[var(--red-trade)]">{error}</p>
      )}

      {/* No qualifying articles */}
      {!loading && !error && items.length === 0 && (
        <p className="text-xs font-mono text-[var(--text-muted)]">
          No image-backed news published today yet. Check the News Hub tab for
          recent articles.
        </p>
      )}

      {/* Article cards */}
      {!loading && !error && items.length > 0 && (
        <div className="flex flex-col gap-3">
          {items.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl overflow-hidden block"
              style={{
                border: "1px solid var(--bg-border)",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor =
                  "var(--gold-dim)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor =
                  "var(--bg-border)")
              }
            >
              {/* Thumbnail */}
              <div className="relative w-full overflow-hidden" style={{ height: "144px" }}>
                {/* Hidden preload image — once loaded/errored we know if it's real */}
                <img
                  src={item.image!}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{
                    display: confirmed[idx] === false ? "none" : "block",
                    transition: "transform 0.4s ease",
                  }}
                  onLoad={() => handleImgLoad(idx)}
                  onError={() => handleImgError(idx)}
                />

                {/* Shown only if image fails to load */}
                {confirmed[idx] === false && (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg,#0a0a0f,#1a1400)",
                    }}
                  >
                    <span
                      className="text-[10px] font-mono"
                      style={{ color: item.sourceColor, opacity: 0.6 }}
                    >
                      Image unavailable
                    </span>
                  </div>
                )}

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 45%, rgba(0,0,0,0.65) 100%)",
                  }}
                />

                {/* Source badge */}
                <span
                  className="absolute top-2 left-2 text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{
                    background: `${item.sourceColor}cc`,
                    color: "#fff",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {item.source}
                </span>

                {/* Time badge */}
                <span
                  className="absolute top-2 right-2 text-[9px] font-mono px-1.5 py-0.5 rounded"
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    color: "var(--text-muted)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {formatAgo(item.pubDate)}
                </span>

                {/* Title overlaid on bottom of image */}
                <p
                  className="absolute bottom-0 left-0 right-0 px-3 py-2 text-xs font-bold leading-snug text-white line-clamp-2 group-hover:text-[var(--gold-bright)] transition-colors"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
                >
                  {item.title}
                </p>
              </div>

              {/* Summary strip */}
              <div
                className="px-3 py-2"
                style={{ background: "var(--bg-card)" }}
              >
                <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}

      <p className="text-[10px] font-mono text-[var(--text-muted)]">
        Source: FXStreet · DailyForex · Investing.com · Today only
      </p>
    </div>
  );
}
