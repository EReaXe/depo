const brand=(id,name,group,extension='png',aliases=[])=>({id,name,group,logo:`./assets/brands/fuel/${id}.${extension}`,aliases});
export const fuelBrands=[
  brand('po','Petrol Ofisi','main','svg',['PO']),
  brand('opet','Opet','main','svg'),
  brand('shell','Shell','main','svg'),
  brand('totalenergies','TotalEnergies','main'),
  brand('aytemiz','Aytemiz','main'),
  brand('lukoil','Lukoil','main','svg'),
  brand('alpet','Alpet','main'),
  brand('go','GO','other'),
  brand('kadoil-k','Kadoil','other','png',['KADOİL K','Kadoil']),
  brand('sunpet','Sunpet','other'),
  brand('moil','M Oil','other','svg',['MOİL','M Oil'])
];
const key=s=>String(s).toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('ı','i').replace(/[^a-z0-9]/g,'');
export function fuelBrand(value){return fuelBrands.find(b=>[b.id,b.name,...b.aliases].some(alias=>key(alias)===key(value)))||null;}
export function groupBrandStations(stations){
  const groups={main:[],other:[]};
  for(const station of stations){const brand=fuelBrand(station.brandId||station.brand);if(brand)groups[brand.group].push({...station,brandId:brand.id,brand:brand.name,logo:brand.logo});}
  return groups;
}
