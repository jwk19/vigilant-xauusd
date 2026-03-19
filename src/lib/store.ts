"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Currency = "USD" | "KES";
type Bias = "bullish" | "bearish" | "neutral" | null;

interface DashboardState {
  currency: Currency;
  kesRate: number;
  equity: number;
  riskPercent: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  bias: Bias;
  biasNote: string;
  soundEnabled: boolean;
  setCurrency: (c: Currency) => void;
  setKesRate: (r: number) => void;
  setEquity: (e: number) => void;
  setRiskPercent: (r: number) => void;
  setEntryPrice: (p: number) => void;
  setStopLoss: (p: number) => void;
  setTakeProfit: (p: number) => void;
  setBias: (b: Bias) => void;
  setBiasNote: (n: string) => void;
  toggleSound: () => void;
}

export const useDashboard = create<DashboardState>()(
  persist(
    (set) => ({
      currency: "USD",
      kesRate: 129.5,
      equity: 500,
      riskPercent: 1,
      entryPrice: 0,
      stopLoss: 0,
      takeProfit: 0,
      bias: null,
      biasNote: "",
      soundEnabled: true,
      setCurrency: (c) => set({ currency: c }),
      setKesRate: (r) => set({ kesRate: r }),
      setEquity: (e) => set({ equity: e }),
      setRiskPercent: (r) => set({ riskPercent: r }),
      setEntryPrice: (p) => set({ entryPrice: p }),
      setStopLoss: (p) => set({ stopLoss: p }),
      setTakeProfit: (p) => set({ takeProfit: p }),
      setBias: (b) => set({ bias: b }),
      setBiasNote: (n) => set({ biasNote: n }),
      toggleSound: () => set(s => ({ soundEnabled: !s.soundEnabled })),
    }),
    { name: "gold-dashboard-store" }
  )
);
