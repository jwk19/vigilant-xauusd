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

/** Gold-pattern SVG used as a branded fallback when the RSS item has no image */
function GoldFallbackHeader({ sourceColor }: { sourceColor: string }) {
  return (
    <div
      className="w-full h-40 flex items-center justify-center overflow-hidden flex-shrink-0"
      style={{
        background: `linear-gradient(135deg, #0a0a0f 0%, #12100a 40%, #1a1400 100%)`,
        borderBottom: `1px solid var(--bg-border)`,
      }}
    >
      {/* Subtle grid pattern */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", opacity: 0.07 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d4a017" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Gold bar icon */}
      <div className="relative flex flex-col items-center gap-2">
        <svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="8" width="40" height="16" rx="3" fill={sourceColor} opacity="0.3" />
          <rect x="4" y="8" width="40" height="16" rx="3" stroke={sourceColor} strokeWidth="1.5" />
          <text x="24" y="20.5" textAnchor="middle" fill={sourceColor} fontSize="9" fontFamily="monospace" fontWeight="bold">
            XAU/USD
          </text>
        </svg>
        <span
          className="text-[9px] font-mono tracking-widest uppercase"
          style={{ color: sourceColor, opacity: 0.7 }}
        >
          Market Analysis
        </span>
      </div>
    </div>
  );
}

export default function NewsHub() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setNews(data);
      })
      .catch(() => setError("Failed to load news hub. Try again later."))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl gold-text tracking-widest uppercase">
            Market News Hub
          </h2>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
            Latest XAU/USD market analysis · last 48 hours
          </p>
        </div>
        <div className="flex gap-2">
          {["FXStreet", "DailyForex", "Investing.com"].map((s) => (
            <span
              key={s}
              className="text-[9px] font-mono px-2 py-0.5 rounded border border-[var(--bg-border)] bg-[var(--bg-card)] text-[var(--text-muted)]"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="panel overflow-hidden animate-pulse opacity-50">
              <div className="h-40 bg-[var(--bg-card)]" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-[var(--bg-border)] rounded w-1/3" />
                <div className="h-4 bg-[var(--bg-border)] rounded w-full" />
                <div className="h-4 bg-[var(--bg-border)] rounded w-4/5" />
                <div className="h-3 bg-[var(--bg-border)] rounded w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="panel text-center py-12">
          <p className="text-[var(--red-trade)] font-mono text-sm">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && news.length === 0 && (
        <div className="panel text-center py-12">
          <p className="text-[var(--text-muted)] font-mono text-sm">
            No articles published in the last 48 hours.
          </p>
        </div>
      )}

      {/* News grid */}
      {!loading && !error && news.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="panel group flex flex-col overflow-hidden hover:border-[var(--gold-primary)] transition-all duration-300 transform hover:-translate-y-1"
              style={{ padding: 0 }}
            >
              {/* Thumbnail area */}
              <div className="relative flex-shrink-0">
                {item.image ? (
                  <>
                    {/* RSS-sourced article image */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        // If image fails to load, hide it so the fallback shows
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                    {/* Hidden fallback revealed on img error */}
                    <div style={{ display: "none" }}>
                      <GoldFallbackHeader sourceColor={item.sourceColor} />
                    </div>
                    {/* Dark gradient overlay so badge stays legible on photos */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 50%, rgba(0,0,0,0.5) 100%)",
                      }}
                    />
                  </>
                ) : (
                  <GoldFallbackHeader sourceColor={item.sourceColor} />
                )}

                {/* Source badge — always on top of the image */}
                <span
                  className="absolute top-2 left-2 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: `${item.sourceColor}cc`,
                    color: "#fff",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {item.source}
                </span>

                {/* Time badge */}
                <span
                  className="absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.55)",
                    color: "var(--text-muted)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {formatDate(item.pubDate)}
                </span>
              </div>

              {/* Card body */}
              <div className="flex flex-col flex-grow p-4">
                <h3 className="text-sm font-bold leading-tight line-clamp-2 mb-2 group-hover:text-[var(--gold-bright)] transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-[var(--text-muted)] line-clamp-3 flex-grow">
                  {item.summary}
                </p>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--bg-border)]">
                  <span className="text-[10px] font-mono text-[var(--gold-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                    Read Article →
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--bg-border)] group-hover:bg-[var(--gold-primary)] transition-colors" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
