"use client";
import { useDashboard } from "@/lib/store";

export default function RiskCalculator() {
  const { currency,setCurrency,kesRate,setKesRate,equity,setEquity,riskPercent,setRiskPercent,
          entryPrice,setEntryPrice,stopLoss,setStopLoss,takeProfit,setTakeProfit } = useDashboard();
  const sym = currency==="KES"?"KES":"USD";
  const equityUSD = currency==="KES"?equity/kesRate:equity;
  const riskUSD = (equityUSD*riskPercent)/100;
  const slPoints = Math.abs(entryPrice-stopLoss);
  const tpPoints = Math.abs(takeProfit-entryPrice);
  const lotSize = slPoints>0?parseFloat((riskUSD/(slPoints*100)).toFixed(2)):0;
  const profit = lotSize*tpPoints*100;
  const rr = slPoints>0&&tpPoints>0?(tpPoints/slPoints).toFixed(2):"—";
  const direction = entryPrice>0&&stopLoss>0?(entryPrice>stopLoss?"LONG":"SHORT"):null;
  const disp=(usd:number)=>currency==="KES"
    ?`KES ${(usd*kesRate).toLocaleString("en-KE",{maximumFractionDigits:0})}`
    :`$${usd.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`;

  return (
    <div className="panel space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm tracking-widest uppercase text-[var(--gold-primary)]">Risk Calculator</h2>
        <div className="flex items-center gap-1 bg-[var(--bg-deep)] rounded-lg p-1">
          {(["USD","KES"] as const).map(c=>(
            <button key={c} onClick={()=>setCurrency(c)} className="px-3 py-1 rounded text-xs font-mono transition-all"
              style={{background:currency===c?"var(--gold-primary)":"transparent",color:currency===c?"var(--bg-deep)":"var(--text-muted)",fontWeight:currency===c?700:400}}>
              {c}
            </button>
          ))}
        </div>
      </div>
      {currency==="KES"&&(
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">USD/KES Rate</label>
          <input type="number" className="trade-input" value={kesRate} onChange={e=>setKesRate(parseFloat(e.target.value)||0)} step="0.5"/>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest block mb-1">Equity ({sym})</label>
          <input type="number" className="trade-input" value={equity||""} onChange={e=>setEquity(parseFloat(e.target.value)||0)} placeholder="500"/></div>
        <div><label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest block mb-1">Risk %</label>
          <input type="number" className="trade-input" value={riskPercent||""} onChange={e=>setRiskPercent(parseFloat(e.target.value)||0)} step="0.5" min="0.1" max="10"/></div>
        <div><label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest block mb-1">Entry Price</label>
          <input type="number" className="trade-input" value={entryPrice||""} onChange={e=>setEntryPrice(parseFloat(e.target.value)||0)} placeholder="4734" step="0.01"/></div>
        <div><label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest block mb-1">Stop Loss</label>
          <input type="number" className="trade-input" value={stopLoss||""} onChange={e=>setStopLoss(parseFloat(e.target.value)||0)} placeholder="4728" step="0.01"/></div>
        <div className="col-span-2"><label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest block mb-1">Take Profit</label>
          <input type="number" className="trade-input" value={takeProfit||""} onChange={e=>setTakeProfit(parseFloat(e.target.value)||0)} placeholder="4750" step="0.01"/></div>
      </div>
      <div className="gold-divider"/>
      {direction&&(
        <div className="text-center py-1 rounded font-mono text-sm font-bold tracking-widest"
          style={{background:direction==="LONG"?"rgba(0,200,150,0.1)":"rgba(255,77,109,0.1)",
            color:direction==="LONG"?"var(--green-trade)":"var(--red-trade)",
            border:`1px solid ${direction==="LONG"?"rgba(0,200,150,0.3)":"rgba(255,77,109,0.3)"}`}}>
          {direction}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {[
          {label:"$ Risk",value:disp(riskUSD)},
          {label:"Lot Size",value:lotSize>0?lotSize.toFixed(2):"—"},
          {label:"R:R Ratio",value:`1 : ${rr}`},
          {label:"SL Distance",value:slPoints>0?`${slPoints.toFixed(2)} pts`:"—"},
          {label:"Potential Profit",value:profit>0?disp(profit):"—"},
          {label:"TP Distance",value:tpPoints>0?`${tpPoints.toFixed(2)} pts`:"—"},
        ].map(({label,value})=>(
          <div key={label} className="rounded-lg px-3 py-2 bg-[var(--bg-card)] border border-[var(--bg-border)]">
            <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">{label}</p>
            <p className="font-mono font-bold text-sm text-[var(--text-primary)] mt-0.5">{value}</p>
          </div>
        ))}
      </div>
      {rr!=="—"&&parseFloat(rr)>0&&(
        <p className="text-xs font-mono text-center mt-1" style={{color:parseFloat(rr)>=2?"var(--green-trade)":parseFloat(rr)>=1?"var(--gold-primary)":"var(--red-trade)"}}>
          {parseFloat(rr)>=2?"✓ Strong R:R — quality setup":parseFloat(rr)>=1?"~ Acceptable R:R — proceed with caution":"✗ Poor R:R — consider skipping"}
        </p>
      )}
    </div>
  );
}
