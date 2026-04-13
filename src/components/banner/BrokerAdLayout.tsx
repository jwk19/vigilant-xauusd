import React from 'react';

const AdContent = ({ variant = "vertical" }: { variant?: "vertical" | "horizontal" }) => (
  <a 
    href="https://one.justmarkets.link/a/tu94la0bb8" 
    target="_blank" 
    rel="noopener noreferrer"
    className={`group flex ${variant === 'vertical' ? 'flex-col justify-center text-center h-full' : 'flex-col md:flex-row items-center text-center md:text-left w-full justify-between'} gap-3 md:gap-4 p-4 md:p-5 bg-gradient-to-b from-[#10141f] to-[#0a0e1a] border border-[#1e2740] rounded-xl hover:border-[#0cd89a] transition-all duration-300 shadow-xl`}
  >
    <div className={`flex items-center ${variant === 'vertical' ? 'flex-col gap-4' : 'gap-3 shrink-0'}`}>
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0385ff] to-[#0cd89a] flex items-center justify-center shadow-lg font-bold text-white italic text-xs shrink-0 group-hover:scale-105 transition-transform">
        JM
      </div>
      <div className={`font-bold tracking-tight ${variant === 'vertical' ? 'text-2xl' : 'text-xl'}`}>
        <span className="text-[#0385ff]">Just</span>
        <span className="text-[#0cd89a]">Markets</span>
      </div>
    </div>
    
    <p className={`text-sm text-[#8c9bab] leading-relaxed group-hover:text-[#e8dfc0] transition-colors ${variant === 'horizontal' ? 'flex-1 hidden md:block' : ''}`}>
      <strong className="text-[#0cd89a] font-medium mb-1 block">Friends who became traders!</strong>
      Keep this tool alive by joining JustMarkets as your preferred broker. The creator earns a commission when you sign up.
    </p>

    {/* Mobile text for horizontal */}
    {variant === 'horizontal' && (
      <p className="text-xs text-[#8c9bab] block md:hidden mb-1">
        Keep this tool alive by joining JustMarkets ❤️
      </p>
    )}

    <div className={`inline-flex items-center text-sm font-mono font-bold uppercase tracking-wider text-[#0cd89a] group-hover:text-white transition-colors ${variant === 'vertical' ? 'mt-4' : 'shrink-0'}`}>
      Sign Up
      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </div>
  </a>
);

export default function BrokerAdLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen h-[100dvh] overflow-hidden bg-[var(--bg-deep)]">
      {/* Mobile Top Banner */}
      <div className="block lg:hidden w-full p-3 pb-0 z-10 shrink-0 bg-[var(--bg-deep)]">
        <AdContent variant="horizontal" />
      </div>

      <div className="flex flex-1 w-full mx-auto max-w-[2000px] overflow-hidden">
        {/* Left Desktop Banner */}
        <div className="hidden lg:block w-[200px] xl:w-[260px] shrink-0 p-4 h-full">
          <AdContent variant="vertical" />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 w-full relative z-0 overflow-y-auto">
          {children}
        </main>

        {/* Right Desktop Banner */}
        <div className="hidden lg:block w-[200px] xl:w-[260px] shrink-0 p-4 h-full">
          <AdContent variant="vertical" />
        </div>
      </div>

      {/* Bottom Banner (All Devices) */}
      <div className="w-full shrink-0 p-3 lg:p-4 bg-[var(--bg-panel)] border-t border-[#1e2740] relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto">
          <AdContent variant="horizontal" />
        </div>
      </div>
    </div>
  );
}
