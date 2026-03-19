import { NextResponse } from "next/server";

export const revalidate = 60; // cache for 60 seconds

export async function GET() {
    try {
        // gold-api.com — free, no key required
        const res = await fetch("https://gold-api.com/price/XAU", {
            headers: { "Accept": "application/json" },
            next: { revalidate: 60 },
        });

        if (!res.ok) throw new Error("gold-api failed");

        const data = await res.json();

        // gold-api.com returns: { price, timestamp, currency }
        return NextResponse.json({
            price: data.price ?? data.ask ?? null,
            change: data.ch ?? null,
            changePct: data.chp ?? null,
            timestamp: data.timestamp ?? Date.now(),
            source: "gold-api.com",
        });
    } catch {
        // Fallback: try frankfurter for XAU/USD approximation
        try {
            const res2 = await fetch(
                "https://api.frankfurter.app/latest?from=XAU&to=USD",
                { next: { revalidate: 60 } }
            );
            if (!res2.ok) throw new Error("frankfurter failed");
            const data2 = await res2.json();
            return NextResponse.json({
                price: data2.rates?.USD ?? null,
                change: null,
                changePct: null,
                timestamp: Date.now(),
                source: "frankfurter",
            });
        } catch {
            return NextResponse.json(
                { price: null, change: null, changePct: null, timestamp: Date.now(), source: "error" },
                { status: 503 }
            );
        }
    }
}