# Gold Trader Dashboard

A personal XAU/USD trading companion built for Kenyan traders (EAT timezone).

## Features
- **Session Clock** — Live EAT clock with active session detection and killzone alerts
- **Risk Calculator** — Lot size, R:R, and P&L calculator with USD/KES toggle
- **News Feed** — Gold-relevant economic events filtered from Forex Factory, timed in EAT
- **Daily Bias** — HTF bias panel with session notes, persisted via localStorage
- **Sound Alerts** — Audio notification when a killzone window opens

## Stack
- Next.js 15 (App Router) · TypeScript · Tailwind CSS · Zustand · Vercel

## Getting Started
```bash
npm install
npm run dev
```

## Sessions (EAT / UTC+3)
| Session  | Open  | Close |
|----------|-------|-------|
| Sydney   | 00:00 | 09:00 |
| Tokyo    | 02:00 | 11:00 |
| London   | 10:00 | 19:00 |
| New York | 15:00 | 00:00 |
