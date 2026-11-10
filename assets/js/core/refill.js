export const liquidFuels=['Benzin','Dizel','LPG'];
export function fuelChoices(vehicle){
  if(vehicle.fuel==='Elektrik')return [];
  if(vehicle.fuel==='Benzin + LPG')return ['LPG','Benzin'];
  if(vehicle.fuel==='Dizel'||vehicle.fuel==='Hibrit (Dizel)')return ['Dizel'];
  if(vehicle.fuel==='LPG')return ['LPG'];
  if(['Benzin','Hibrit (Benzin)','Şarj edilebilir hibrit'].includes(vehicle.fuel))return ['Benzin'];
  return liquidFuels;
}
export function parseDecimal(value){
  const text=String(value).trim();
  if(!/^\d+(?:[.,]\d+)?$/.test(text))return NaN;
  return Number(text.replace(',','.'));
}
export function recordDetails(record){
  if(record.fuel===undefined&&record.unitPrice===undefined)return {};
  if(!liquidFuels.includes(record.fuel)||!Number.isFinite(record.unitPrice)||record.unitPrice<=0||record.unitPrice>10000)throw Error('Yakıt türü veya litre fiyatı geçersiz.');
  if(Math.abs(record.litres-record.amount/record.unitPrice)>.0001)throw Error('Tutar, litre ve litre fiyatı tutarsız.');
  return {fuel:record.fuel,unitPrice:record.unitPrice};
}
export function latestUnitPrice(records,vehicleId,fuel){
  const last=records.filter(r=>r.vehicle===vehicleId&&r.fuel===fuel).sort((a,b)=>b.date.localeCompare(a.date)||b.km-a.km)[0];
  return last?{price:last.unitPrice||last.amount/last.litres,date:last.date}:null;
}
export function createQuickRecord({vehicle,records,values,id,date}){
  const amount=parseDecimal(values.amount),unitPrice=parseDecimal(values.unitPrice),km=parseDecimal(values.km);
  if(!fuelChoices(vehicle).includes(values.fuel))throw Error('Aracınıza uygun yakıt türünü seçin.');
  if(!Number.isFinite(amount)||amount<=0||amount>99999999)throw Error('Ödenen tutarı sıfırdan büyük girin.');
  if(!Number.isFinite(unitPrice)||unitPrice<=0||unitPrice>10000)throw Error('Litre fiyatını sıfırdan büyük girin.');
  if(!Number.isFinite(km)||km<0||km>99999999)throw Error('Geçerli bir kilometre girin.');
  const lastKm=records.filter(r=>r.vehicle===vehicle.id).reduce((max,r)=>Math.max(max,r.km),vehicle.currentKm??0);
  if(km<lastKm)throw Error(`Kilometre, son bilinen ${new Intl.NumberFormat('tr-TR').format(lastKm)} km değerinden küçük olamaz.`);
  if(records.some(r=>r.vehicle===vehicle.id&&r.km===km&&(!r.fuel||r.fuel===values.fuel)))throw Error('Bu kilometrede bu yakıt için zaten kayıt var.');
  const litres=amount/unitPrice;
  if(litres>10000)throw Error('Hesaplanan litre çok yüksek. Tutarı ve litre fiyatını kontrol edin.');
  return {id,vehicle:vehicle.id,date,km,amount,litres,full:values.full===true,fuel:values.fuel,unitPrice};
}
