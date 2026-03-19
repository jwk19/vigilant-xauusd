export type SessionName = "Sydney" | "Tokyo" | "London" | "New York";

export interface Session {
  name: SessionName;
  openHour: number;
  closeHour: number;
  color: string;
  description: string;
}

export const SESSIONS: Session[] = [
  { name:"Sydney",   openHour:0,  closeHour:9,  color:"#34d399", description:"Low volume, thin liquidity" },
  { name:"Tokyo",    openHour:2,  closeHour:11, color:"#a78bfa", description:"Mild XAU movement, JPY pairs active" },
  { name:"London",   openHour:10, closeHour:19, color:"#3b82f6", description:"High volatility begins — prime XAU session" },
  { name:"New York", openHour:15, closeHour:24, color:"#f59e0b", description:"Peak volume, major moves happen here" },
];

export interface KillZone {
  name: string;
  openHour: number; openMin: number;
  closeHour: number; closeMin: number;
  type: "london"|"ny"|"asian";
  tip: string;
}

export const KILL_ZONES: KillZone[] = [
  { name:"Asian Killzone",    openHour:2,  openMin:0, closeHour:5,  closeMin:0, type:"asian",  tip:"Range formation — liquidity grabs above/below Asian highs" },
  { name:"London Open Killzone", openHour:10, openMin:0, closeHour:12, closeMin:0, type:"london", tip:"Watch for manipulation — fake moves before true direction" },
  { name:"NY Open Killzone",  openHour:15, openMin:0, closeHour:17, closeMin:0, type:"ny",     tip:"Strongest trend continuation or reversal setups" },
  { name:"London/NY Overlap", openHour:15, openMin:0, closeHour:19, closeMin:0, type:"london", tip:"Highest liquidity window of the day — premium entries" },
];

export function getEATTime() {
  const now = new Date();
  const eat = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Nairobi" }));
  return { hour: eat.getHours(), minute: eat.getMinutes(), second: eat.getSeconds(), date: eat };
}

export function isSessionActive(s: Session, hour: number): boolean {
  return s.closeHour === 24 ? hour >= s.openHour : hour >= s.openHour && hour < s.closeHour;
}

export function getActiveKillZone(hour: number, minute: number): KillZone | null {
  const t = hour * 60 + minute;
  return KILL_ZONES.find(kz => t >= kz.openHour*60+kz.openMin && t < kz.closeHour*60+kz.closeMin) ?? null;
}

export function minutesUntilNext(s: Session, hour: number, minute: number): number {
  const cur = hour*60+minute, open = s.openHour*60;
  return open > cur ? open - cur : 1440 - cur + open;
}

export function formatCountdown(m: number): string {
  const h = Math.floor(m/60), mn = m%60;
  return h===0 ? \`\${mn}m\` : \`\${h}h \${mn}m\`;
}

export const KES_RATE_FALLBACK = 129.5;
