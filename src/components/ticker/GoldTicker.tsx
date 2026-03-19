"use client";
import { useEffect, useState } from "react";

interface GoldPrice {
    price: number | null;
    change: number | null;
    changePct: number | null;
    timestamp: number;
    source: string;
}

export default function GoldTicker() {
    const [data, setData] = useState<GoldPrice | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<string>("");

    async function fetchPrice() {
        try {
            const res = await fetch("/api/gold-price");
            const json: GoldPrice = await res.json();
            setData(json);
            setLastUpdate(
                new Date().toLocaleTimeString("en-KE", {
                    hour: "2-digit", minute: "2-digit", second: "2-digit",
                    hour12: false, timeZone: "Africa/Nairobi",
                })
            );
        } catch {
            // keep previous data on error
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPrice();
        const id = setInterval(fetchPrice, 60000); // refresh every 60s
        return () => clearInterval(id);
    }, []);

    const isUp = data?.change != null ? data.change >= 0 : null;
    const color = isUp === null
        ? "var(--text-muted)"
        : isUp ? "var(--green-trade)" : "var(--red-trade)";
    const arrow = isUp === null ? "" : isUp ? "▲" : "▼";

    return (
        <div
            className="flex items-center justify-between px-4 py-2.5 rounded-xl mb-6"
            style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--bg-border)",
            }}
        >
            {/* Left: label */}
            <div className="flex items-center gap-3">
                <div
                    className="w-2 h-2 rounded-full"
                    style={{
                        background: loading ? "var(--text-muted)" : "var(--green-trade)",
                        boxShadow: loading ? "none" : "0 0 6px var(--green-trade)",
                        animation: loading ? "none" : "pulse-ring 1.5s ease-out infinite",
                    }}
                />
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                    XAU / USD · Spot
                </span>
            </div>

            {/* Center: price */}
            {loading ? (
                <div className="h-6 w-32 rounded bg-[var(--bg-card)] animate-pulse" />
            ) : data?.price ? (
                <div className="flex items-baseline gap-3">
                    <span
                        className="text-xl font-mono font-bold"
                        style={{ color: "var(--gold-primary)", textShadow: "0 0 20px rgba(212,160,23,0.3)" }}
                    >
                        ${data.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {data.change != null && (
                        <span className="text-xs font-mono font-bold" style={{ color }}>
                            {arrow} {data.change >= 0 ? "+" : ""}
                            {data.change.toFixed(2)}
                            {data.changePct != null && (
                                <span className="ml-1 opacity-75">
                                    ({data.changePct >= 0 ? "+" : ""}{data.changePct.toFixed(2)}%)
                                </span>
                            )}
                        </span>
                    )}
                </div>
            ) : (
                <span className="text-xs font-mono text-[var(--text-muted)]">Price unavailable</span>
            )}

            {/* Right: last update */}
            <div className="text-right">
                <p className="text-[10px] font-mono text-[var(--text-muted)]">
                    Updated {lastUpdate || "—"}
                </p>
                <p className="text-[9px] font-mono text-[var(--text-muted)] opacity-60">
                    Refreshes every 60s
                </p>
            </div>
        </div>
    );
}