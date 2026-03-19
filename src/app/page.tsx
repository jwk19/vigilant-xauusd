import SessionClock   from "@/components/clock/SessionClock";
import RiskCalculator from "@/components/calculator/RiskCalculator";
import NewsFeed        from "@/components/news/NewsFeed";
import BiasPanel       from "@/components/bias/BiasPanel";
import SoundToggle     from "@/components/SoundToggle";

export default function DashboardPage() {
  return (
    <div className="min-h-screen px-4 py-6 max-w-7xl mx-auto">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-[.3em] mb-1">XAU / USD</p>
          <h1 className="font-display text-2xl md:text-3xl gold-text tracking-widest uppercase">Gold Trader</h1>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">Personal trading companion · Nairobi, Kenya</p>
        </div>
        <SoundToggle />
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-1"><SessionClock /></div>
        <div className="xl:col-span-1"><RiskCalculator /></div>
        <div className="xl:col-span-1 flex flex-col gap-4">
          <BiasPanel />
          <NewsFeed />
        </div>
      </div>
      <footer className="mt-8 text-center">
        <p className="text-[10px] font-mono text-[var(--text-muted)]">Gold Trader Dashboard · Built for EAT · Data: Forex Factory</p>
      </footer>
    </div>
  );
}
