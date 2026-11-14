// Turkey-market factory references. Coverage is deliberately explicit, not a
// claim that a model name validates every year, engine or aftermarket conversion.
export const specSources={
  clio2024:{name:'Renault · Clio teknik broşürü (24.12.2024)',url:'https://www.renault.com.tr/hybrid-araclar/yeni-clio/teknik-bilgiler.html',archived:true},
  clio2025:{name:'Renault · Clio teknik broşürü (11.08.2025)',url:'https://www.renault.com.tr/hybrid-araclar/yeni-clio/teknik-bilgiler.html',archived:true},
  tiggo7:{name:'Chery · Tiggo 7 Türkiye kataloğu (2026)',url:'https://chery.com.tr/wp-content/uploads/2026/06/T7-Katalog.pdf'},
  tiggo8:{name:'Chery · Tiggo 8 Türkiye kataloğu',url:'https://chery.com.tr/wp-content/uploads/2025/12/chery-tiggo-8-katalog.pdf'}
};
const clio=(year,transmission,engine,tankLitres,combined,source)=>({brand:'Renault',model:'Clio',year,fuel:'Benzin',transmission,body:'Hatchback',engine,tankLitres,combined,cycle:'WLTP',source});
const tiggo=(model,tankLitres,combined,source)=>({brand:'Chery',model,year:2026,fuel:'Benzin',transmission:'Otomatik',body:'SUV',engine:'1,6 Turbo · 1.598 cm³ · 145 HP',tankLitres,combined,cycle:'WLTP',source});
export const vehicleSpecs=[
  clio(2024,'Manuel','1,0 L · 999 cm³',42,[5.8,5.8],'clio2024'), // SCe 65
  clio(2024,'Manuel','1,0 L · 999 cm³',42,[5.4,5.4],'clio2024'), // TCe 90
  clio(2024,'Otomatik','1,0 L · 999 cm³',42,[6,6.3],'clio2024'),
  // LPG conversions cannot be identified from the existing fuel selection;
  // factory dual-fuel figures are therefore intentionally not inferred.
  {brand:'Renault',model:'Clio',year:2024,fuel:'Hibrit (Benzin)',transmission:'Otomatik',body:'Hatchback',engine:'1,6 E-Tech · 1.598 cm³ · 145 HP (sistem)',tankLitres:39,combined:[4.8,4.8],cycle:'WLTP',source:'clio2024'},
  clio(2025,'Manuel','1,0 TCe · 999 cm³ · 90 HP',42,[5.4,5.4],'clio2025'),
  clio(2025,'Otomatik','1,0 TCe · 999 cm³ · 90 HP',42,[6,6.3],'clio2025'),
  tiggo('Tiggo 7',51,[7,7],'tiggo7'), // 4x2
  tiggo('Tiggo 7',57,[7.9,7.9],'tiggo7'), // 4x4: no drivetrain input, do not choose
  tiggo('Tiggo 8',57,[7.8,7.8],'tiggo8')
];
const key=s=>typeof s==='string'?s.trim().toLocaleLowerCase('tr').normalize('NFC'):'';
const fields=['body','engine','tankLitres','urban','extraUrban','combined','cycle'];
export function resolveVehicleSpecs(vehicle,catalogue=vehicleSpecs){
  const matches=catalogue.filter(r=>key(r.brand)===key(vehicle.brand)&&key(r.model)===key(vehicle.model)&&r.year===vehicle.year&&r.fuel===vehicle.fuel&&(!vehicle.transmission||r.transmission===vehicle.transmission));
  const values={};
  for(const field of fields){
    const value=matches[0]?.[field];
    values[field]=value!==undefined&&value!==null&&matches.every(r=>JSON.stringify(r[field])===JSON.stringify(value))?value:null;
  }
  return {matched:matches.length>0,values,sources:[...new Set(matches.map(r=>r.source))].map(id=>specSources[id]).filter(Boolean)};
}
