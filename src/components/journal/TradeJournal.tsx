"use client";
import { useState, useEffect } from "react";

interface Trade {
    id: string;
    date: string;
    session: string;
    direction: "LONG" | "SHORT";
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    lotSize: number;
    outcome: "WIN" | "LOSS" | "BE";
    closePrice: number;
    pnl: number;
    notes: string;
}

const SESSIONS = ["Sydney", "Tokyo", "London", "New York", "London/NY Overlap"];
const STORAGE_KEY = "gtd-trade-journal";

function loadTrades(): Trade[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
        return [];
    }
}

function saveTrades(trades: Trade[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
}

function calcPnL(direction: "LONG" | "SHORT", entry: number, close: number, lot: number): number {
    const points = direction === "LONG" ? close - entry : entry - close;
    return parseFloat((points * lot * 100).toFixed(2));
}

export default function TradeJournal() {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState<"ALL" | "WIN" | "LOSS" | "BE">("ALL");

    // Form state
    const [form, setForm] = useState({
        session: "London",
        direction: "LONG" as "LONG" | "SHORT",
        entryPrice: "",
        stopLoss: "",
        takeProfit: "",
        lotSize: "",
        outcome: "WIN" as "WIN" | "LOSS" | "BE",
        closePrice: "",
        notes: "",
    });

    useEffect(() => {
        setTrades(loadTrades());
    }, []);

    function updateForm(key: string, value: string) {
        setForm(f => ({ ...f, [key]: value }));
    }

    function submitTrade() {
        const entry = parseFloat(form.entryPrice);
        const close = parseFloat(form.closePrice);
        const lot = parseFloat(form.lotSize);
        if (!entry || !close || !lot) return;

        const pnl = calcPnL(form.direction, entry, close, lot);
        const trade: Trade = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString("en-KE", {
                day: "numeric", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit", hour12: false,
                timeZone: "Africa/Nairobi",
            }),
            session: form.session,
            direction: form.direction,
            entryPrice: entry,
            stopLoss: parseFloat(form.stopLoss) || 0,
            takeProfit: parseFloat(form.takeProfit) || 0,
            lotSize: lot,
            outcome: form.outcome,
            closePrice: close,
            pnl,
            notes: form.notes,
        };

        const updated = [trade, ...trades];
        setTrades(updated);
        saveTrades(updated);
        setShowForm(false);
        setForm({
            session: "London", direction: "LONG", entryPrice: "", stopLoss: "",
            takeProfit: "", lotSize: "", outcome: "WIN", closePrice: "", notes: "",
        });
    }

    function deleteTrade(id: string) {
        const updated = trades.filter(t => t.id !== id);
        setTrades(updated);
        saveTrades(updated);
    }

    // Stats
    const filtered = filter === "ALL" ? trades : trades.filter(t => t.outcome === filter);
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    const wins = trades.filter(t => t.outcome === "WIN").length;
    const losses = trades.filter(t => t.outcome === "LOSS").length;
    const winRate = trades.length > 0 ? ((wins / trades.length) * 100).toFixed(0) : "0";

    const outcomeColor = (o: string) =>
        o === "WIN" ? "var(--green-trade)" : o === "LOSS" ? "var(--red-trade)" : "var(--gold-primary)";

    const pnlColor = (p: number) =>
        p > 0 ? "var(--green-trade)" : p < 0 ? "var(--red-trade)" : "var(--gold-primary)";

    return (
        <div className="space-y-4">
            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "Total Trades", value: trades.length.toString() },
                    { label: "Win Rate", value: winRate + "%" },
                    {
                        label: "Total P&L", value: (totalPnL >= 0 ? "+" : "") + "$" + totalPnL.toFixed(2),
                        color: pnlColor(totalPnL)
                    },
                    { label: "W / L / BE", value: `${wins} / ${losses} / ${trades.filter(t => t.outcome === "BE").length}` },
                ].map(({ label, value, color }) => (
                    <div key={label} className="panel text-center">
                        <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">{label}</p>
                        <p className="font-mono font-bold text-lg mt-1" style={{ color: color || "var(--text-primary)" }}>
                            {value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Actions row */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {(["ALL", "WIN", "LOSS", "BE"] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className="px-3 py-1 rounded text-xs font-mono transition-all"
                            style={{
                                background: filter === f
                                    ? f === "WIN" ? "rgba(0,200,150,0.15)"
                                        : f === "LOSS" ? "rgba(255,77,109,0.15)"
                                            : f === "BE" ? "rgba(212,160,23,0.15)"
                                                : "var(--bg-panel)"
                                    : "var(--bg-card)",
                                color: filter === f
                                    ? f === "WIN" ? "var(--green-trade)"
                                        : f === "LOSS" ? "var(--red-trade)"
                                            : f === "BE" ? "var(--gold-primary)"
                                                : "var(--text-primary)"
                                    : "var(--text-muted)",
                                border: `1px solid ${filter === f ? "currentColor" : "var(--bg-border)"}`,
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all"
                    style={{
                        background: showForm ? "var(--bg-card)" : "var(--gold-primary)",
                        color: showForm ? "var(--text-muted)" : "var(--bg-deep)",
                        border: "1px solid var(--gold-dim)",
                    }}
                >
                    {showForm ? "Cancel" : "+ Log Trade"}
                </button>
            </div>

            {/* Log trade form */}
            {showForm && (
                <div className="panel space-y-4">
                    <h3 className="font-display text-sm tracking-widest uppercase text-[var(--gold-primary)]">
                        Log New Trade
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {/* Session */}
                        <div>
                            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest block mb-1">
                                Session
                            </label>
                            <select
                                className="trade-input"
                                value={form.session}
                                onChange={e => updateForm("session", e.target.value)}
                            >
                                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Direction */}
                        <div>
                            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest block mb-1">
                                Direction
                            </label>
                            <div className="flex gap-1 h-[37px]">
                                {(["LONG", "SHORT"] as const).map(d => (
                                    <button
                                        key={d}
                                        onClick={() => updateForm("direction", d)}
                                        className="flex-1 rounded text-xs font-mono font-bold transition-all"
                                        style={{
                                            background: form.direction === d
                                                ? d === "LONG" ? "rgba(0,200,150,0.15)" : "rgba(255,77,109,0.15)"
                                                : "var(--bg-deep)",
                                            color: form.direction === d
                                                ? d === "LONG" ? "var(--green-trade)" : "var(--red-trade)"
                                                : "var(--text-muted)",
                                            border: `1px solid ${form.direction === d
                                                ? d === "LONG" ? "rgba(0,200,150,0.4)" : "rgba(255,77,109,0.4)"
                                                : "var(--bg-border)"}`,
                                        }}
                                    >
                                        {d === "LONG" ? "▲ LONG" : "▼ SHORT"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Outcome */}
                        <div>
                            <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest block mb-1">
                                Outcome
                            </label>
                            <div className="flex gap-1 h-[37px]">
                                {(["WIN", "LOSS", "BE"] as const).map(o => (
                                    <button
                                        key={o}
                                        onClick={() => updateForm("outcome", o)}
                                        className="flex-1 rounded text-xs font-mono font-bold transition-all"
                                        style={{
                                            background: form.outcome === o ? `${outcomeColor(o)}18` : "var(--bg-deep)",
                                            color: form.outcome === o ? outcomeColor(o) : "var(--text-muted)",
                                            border: `1px solid ${form.outcome === o ? outcomeColor(o) + "50" : "var(--bg-border)"}`,
                                        }}
                                    >
                                        {o}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price inputs */}
                        {[
                            { key: "entryPrice", label: "Entry Price", placeholder: "4734" },
                            { key: "stopLoss", label: "Stop Loss", placeholder: "4728" },
                            { key: "takeProfit", label: "Take Profit", placeholder: "4750" },
                            { key: "closePrice", label: "Close Price", placeholder: "4748" },
                            { key: "lotSize", label: "Lot Size", placeholder: "0.01" },
                        ].map(({ key, label, placeholder }) => (
                            <div key={key}>
                                <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest block mb-1">
                                    {label}
                                </label>
                                <input
                                    type="number"
                                    className="trade-input"
                                    placeholder={placeholder}
                                    value={form[key as keyof typeof form]}
                                    onChange={e => updateForm(key, e.target.value)}
                                    step="0.01"
                                />
                            </div>
                        ))}
                    </div>

                    {/* P&L preview */}
                    {form.entryPrice && form.closePrice && form.lotSize && (
                        <div className="rounded-lg px-4 py-2 text-center"
                            style={{
                                background: "var(--bg-card)",
                                border: "1px solid var(--bg-border)",
                            }}
                        >
                            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                                Calculated P&L:{" "}
                            </span>
                            <span
                                className="font-mono font-bold text-sm"
                                style={{
                                    color: pnlColor(calcPnL(
                                        form.direction,
                                        parseFloat(form.entryPrice) || 0,
                                        parseFloat(form.closePrice) || 0,
                                        parseFloat(form.lotSize) || 0,
                                    ))
                                }}
                            >
                                {(calcPnL(
                                    form.direction,
                                    parseFloat(form.entryPrice) || 0,
                                    parseFloat(form.closePrice) || 0,
                                    parseFloat(form.lotSize) || 0,
                                ) >= 0 ? "+" : "")}
                                ${calcPnL(
                                    form.direction,
                                    parseFloat(form.entryPrice) || 0,
                                    parseFloat(form.closePrice) || 0,
                                    parseFloat(form.lotSize) || 0,
                                ).toFixed(2)}
                            </span>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest block mb-1">
                            Notes
                        </label>
                        <textarea
                            className="trade-input resize-none"
                            rows={2}
                            placeholder="What worked? What didn't? Emotions? Market context..."
                            value={form.notes}
                            onChange={e => updateForm("notes", e.target.value)}
                        />
                    </div>

                    <button
                        onClick={submitTrade}
                        className="w-full py-2 rounded-lg font-mono font-bold text-sm transition-all"
                        style={{
                            background: "var(--gold-primary)",
                            color: "var(--bg-deep)",
                        }}
                    >
                        Save Trade
                    </button>
                </div>
            )}

            {/* Trade list */}
            {filtered.length === 0 ? (
                <div className="panel text-center py-8">
                    <p className="text-[var(--text-muted)] font-mono text-sm">No trades logged yet.</p>
                    <p className="text-[var(--text-muted)] font-mono text-xs mt-1">
                        Click &quot;+ Log Trade&quot; to record your first trade.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(trade => (
                        <div
                            key={trade.id}
                            className="panel"
                            style={{
                                borderLeft: `3px solid ${outcomeColor(trade.outcome)}`,
                            }}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <span
                                            className="text-xs font-mono font-bold tracking-widest"
                                            style={{ color: trade.direction === "LONG" ? "var(--green-trade)" : "var(--red-trade)" }}
                                        >
                                            {trade.direction === "LONG" ? "▲" : "▼"} {trade.direction}
                                        </span>
                                        <span
                                            className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                                            style={{
                                                background: outcomeColor(trade.outcome) + "18",
                                                color: outcomeColor(trade.outcome),
                                                border: `1px solid ${outcomeColor(trade.outcome)}40`,
                                            }}
                                        >
                                            {trade.outcome}
                                        </span>
                                        <span className="text-[10px] font-mono text-[var(--text-muted)]">{trade.session}</span>
                                        <span className="text-[10px] font-mono text-[var(--text-muted)]">{trade.date}</span>
                                    </div>

                                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                        {[
                                            { label: "Entry", value: trade.entryPrice.toFixed(2) },
                                            { label: "Close", value: trade.closePrice.toFixed(2) },
                                            { label: "Lots", value: trade.lotSize.toFixed(2) },
                                            { label: "SL", value: trade.stopLoss > 0 ? trade.stopLoss.toFixed(2) : "—" },
                                            { label: "TP", value: trade.takeProfit > 0 ? trade.takeProfit.toFixed(2) : "—" },
                                        ].map(({ label, value }) => (
                                            <div key={label}>
                                                <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">{label}</p>
                                                <p className="text-xs font-mono text-[var(--text-primary)] font-bold">{value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {trade.notes && (
                                        <p className="text-[11px] font-mono text-[var(--text-muted)] mt-2 italic">
                                            &quot;{trade.notes}&quot;
                                        </p>
                                    )}
                                </div>

                                <div className="text-right flex flex-col items-end gap-2">
                                    <p
                                        className="font-mono font-bold text-lg"
                                        style={{ color: pnlColor(trade.pnl) }}
                                    >
                                        {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                                    </p>
                                    <button
                                        onClick={() => deleteTrade(trade.id)}
                                        className="text-[10px] font-mono text-[var(--text-muted)] hover:text-[var(--red-trade)] transition-colors"
                                    >
                                        delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-[10px] font-mono text-[var(--text-muted)] text-center">
                All trades saved locally · {trades.length} trade{trades.length !== 1 ? "s" : ""} recorded
            </p>
        </div>
    );
}