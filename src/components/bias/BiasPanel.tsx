"use client";
import { useDashboard } from "@/lib/store";

type Bias = "bullish"|"bearish"|"neutral"|null;
const OPTIONS=[
  {value:"bullish" as Bias,label:"Bullish",color:"var(--green-trade)",emoji:"▲"},
  {value:"neutral" as Bias,label:"Neutral",color:"var(--gold-primary)",emoji:"◆"},
  {value:"bearish" as Bias,label:"Bearish",color:"var(--red-trade)",emoji:"▼"},
];

export default function BiasPanel() {
  const { bias,setBias,biasNote,setBiasNote } = useDashboard();
  const active = OPTIONS.find(o=>o.value===bias);
  return (
    <div className="panel space-y-4">
      <h2 className="font-display text-sm tracking-widest uppercase text-[var(--gold-primary)]">Daily Bias</h2>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(opt=>{
          const on=bias===opt.value;
          return (
            <button key={opt.value!} onClick={()=>setBias(on?null:opt.value)}
              className="rounded-lg py-3 flex flex-col items-center gap-1 transition-all text-center"
              style={{background:on?`${opt.color}18`:"var(--bg-card)",border:`1px solid ${on?opt.color+"60":"var(--bg-border)"}`,color:on?opt.color:"var(--text-muted)"}}>
              <span className="text-lg">{opt.emoji}</span>
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold">{opt.label}</span>
            </button>
          );
        })}
      </div>
      {active&&(
        <div className="rounded-lg px-3 py-2 text-center" style={{background:`${active.color}10`,border:`1px solid ${active.color}30`}}>
          <p className="text-xs font-mono font-bold tracking-widest uppercase" style={{color:active.color}}>{active.emoji} HTF Bias: {active.label}</p>
          <p className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">
            {active.value==="bullish"?"Look for buys at demand — avoid shorts":active.value==="bearish"?"Look for sells at supply — avoid longs":"Range conditions — be selective"}
          </p>
        </div>
      )}
      <div>
        <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest block mb-1.5">Session Notes</label>
        <textarea className="trade-input resize-none" rows={3} value={biasNote}
          onChange={e=>setBiasNote(e.target.value)}
          placeholder="e.g. D1 bearish — selling from 4800 supply. Watch London open for short entries..."/>
      </div>
      <p className="text-[10px] font-mono text-[var(--text-muted)]">Bias persists across sessions via localStorage</p>
    </div>
  );
}
