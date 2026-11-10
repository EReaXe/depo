export function calculate(records) {
  // Full LPG and petrol tanks are independent; never treat one as filling the other.
  const mixedFuels=new Set(records.map(r=>r.fuel).filter(Boolean)).size>1;
  if(mixedFuels)return {consumption:null,cost:null,distance:0,spent:records.reduce((s,r)=>s+r.amount,0),litres:records.reduce((s,r)=>s+r.litres,0),mixedFuels:true};
  const sorted = [...records].sort((a,b)=>a.km-b.km);
  let anchor = null, pendingLitres = 0, pendingCost = 0, distance = 0, litres = 0, cost = 0;
  for (const r of sorted) {
    if (anchor === null) { if(r.full) anchor=r.km; continue; }
    pendingLitres += r.litres; pendingCost += r.amount;
    if(r.full) { distance += r.km-anchor; litres += pendingLitres; cost += pendingCost; anchor=r.km; pendingLitres=0; pendingCost=0; }
  }
  return {consumption:distance>0?litres/distance*100:null,cost:distance>0?cost/distance:null,distance,spent:records.reduce((s,r)=>s+r.amount,0),litres:records.reduce((s,r)=>s+r.litres,0)};
}
