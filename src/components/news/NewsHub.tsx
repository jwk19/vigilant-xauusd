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
      .catch((err) => setError("Failed to load news hub. Try again later."))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl gold-text tracking-widest uppercase">
            Market News Hub
          </h2>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
            Aggregated analysis for XAU/USD traders
          </p>
        </div>
        <div className="flex gap-2">
          {["FXStreet", "DailyForex", "Investing.com"].map((s) => (
            <span key={s} className="text-[9px] font-mono px-2 py-0.5 rounded border border-[var(--bg-border)] bg-[var(--bg-card)] text-[var(--text-muted)]">
              {s}
            </span>
          ))}
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="panel h-64 animate-pulse opacity-50" />
          ))}
        </div>
      )}

      {error && (
        <div className="panel text-center py-12">
          <p className="text-[var(--red-trade)] font-mono text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="panel group flex flex-col h-full hover:border-[var(--gold-primary)] transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${item.sourceColor}20`, color: item.sourceColor, border: `1px solid ${item.sourceColor}40` }}
                >
                  {item.source}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  {formatDate(item.pubDate)}
                </span>
              </div>
              
              <h3 className="text-sm font-bold leading-tight line-clamp-2 mb-3 group-hover:text-[var(--gold-bright)] transition-colors">
                {item.title}
              </h3>
              
              <p className="text-xs text-[var(--text-muted)] line-clamp-3 mb-4 flex-grow">
                {item.summary}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--bg-border)]">
                <span className="text-[10px] font-mono text-[var(--gold-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                  Read Article →
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--bg-border)] group-hover:bg-[var(--gold-primary)] transition-colors" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
