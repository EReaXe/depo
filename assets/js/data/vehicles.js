// Curated starting catalogue; unlisted models can be entered without blocking older vehicles.
const catalogue = {
  'Alfa Romeo|alfa-romeo':['145','146','147','156','159','Giulia','Giulietta','GT','Junior','MiTo','Stelvio','Tonale'],
  'Audi|audi':['A1','A3','A4','A5','A6','A7','A8','Q2','Q3','Q4 e-tron','Q5','Q7','Q8','TT','e-tron'],
  'BMW|bmw':['1 Serisi','2 Serisi','3 Serisi','4 Serisi','5 Serisi','6 Serisi','7 Serisi','8 Serisi','X1','X2','X3','X4','X5','X6','X7','i3','i4','i5','i7','iX','Z4'],
  'BYD|byd':['ATTO 3','DOLPHIN','HAN','SEAL','SEAL U','TANG'],
  'Chery|chery':['Alia','Kimo','Tiggo','Tiggo 7','Tiggo 8','Omoda 5'],
  'Chevrolet|chevrolet':['Aveo','Captiva','Cruze','Epica','Kalos','Lacetti','Spark','Trax'],
  'Citroën|citroen':['AX','Berlingo','BX','C1','C2','C3','C3 Aircross','C4','C4 Cactus','C4 X','C5','C5 Aircross','C-Elysée','Jumper','Jumpy','Saxo','Xsara'],
  'Cupra|cupra':['Ateca','Born','Formentor','Leon','Tavascan','Terramar'],
  'Dacia|dacia':['Duster','Jogger','Lodgy','Logan','Sandero','Spring'],
  'DS Automobiles|ds':['DS 3','DS 4','DS 5','DS 7','DS 9'],
  'Fiat|fiat':['124 Spider','500','500L','500X','Albea','Brava','Bravo','Doblo','Ducato','Egea','Fiorino','Grande Punto','Linea','Marea','Palio','Panda','Punto','Scudo','Siena','Stilo','Tempra','Tipo','Uno'],
  'Ford|ford':['B-Max','C-Max','Courier','EcoSport','Escort','Fiesta','Focus','Fusion','Galaxy','Ka','Kuga','Mondeo','Mustang','Puma','Ranger','S-Max','Sierra','Taunus','Tourneo Connect','Transit'],
  'Honda|honda':['Accord','City','Civic','CR-V','CR-Z','HR-V','Jazz','Prelude','S2000'],
  'Hyundai|hyundai':['Accent','Accent Blue','Bayon','Elantra','Getz','i10','i20','i30','IONIQ','IONIQ 5','IONIQ 6','ix35','Kona','Matrix','Santa Fe','Sonata','Tucson'],
  'Jeep|jeep':['Avenger','Cherokee','Compass','Grand Cherokee','Renegade','Wrangler'],
  'Kia|kia':['Carens','Ceed','Cerato','EV3','EV6','EV9','Niro','Picanto','Rio','Sorento','Soul','Sportage','Stonic'],
  'Land Rover|land-rover':['Defender','Discovery','Discovery Sport','Freelander','Range Rover','Range Rover Evoque','Range Rover Sport','Range Rover Velar'],
  'Lexus|lexus':['CT','ES','GS','IS','LBX','LC','LS','NX','RX','UX'],
  'Mazda|mazda':['2','3','5','6','323','626','CX-3','CX-5','CX-30','CX-60','MX-5','RX-8'],
  'Mercedes-Benz|mercedes-benz':['A Serisi','B Serisi','C Serisi','CLA','CLK','CLS','E Serisi','EQA','EQB','EQC','EQE','EQS','G Serisi','GLA','GLB','GLC','GLE','GLK','GLS','S Serisi','SL','SLK','Sprinter','Vito'],
  'MG|mg':['MG3','MG4','MG5','EHS','HS','ZS','Cyberster'],
  'MINI|mini':['Cooper','Clubman','Countryman','Aceman'],
  'Mitsubishi|mitsubishi':['ASX','Attrage','Carisma','Colt','Eclipse Cross','L200','Lancer','Outlander','Pajero','Space Star'],
  'Nissan|nissan':['Almera','Juke','Leaf','Micra','Navara','Note','Primera','Pulsar','Qashqai','Sunny','Terrano','X-Trail'],
  'Opel|opel':['Adam','Agila','Antara','Astra','Combo','Corsa','Crossland','Frontera','Grandland','Insignia','Kadett','Meriva','Mokka','Omega','Signum','Tigra','Vectra','Vivaro','Zafira'],
  'Peugeot|peugeot':['106','107','108','205','206','207','208','301','306','307','308','405','406','407','408','508','2008','3008','5008','Bipper','Boxer','Partner','RCZ','Rifter'],
  'Porsche|porsche':['718','911','Boxster','Cayenne','Cayman','Macan','Panamera','Taycan'],
  'Renault|renault':['9','11','12','19','21','Arkana','Austral','Captur','Clio','Espace','Fluence','Kadjar','Kangoo','Koleos','Laguna','Latitude','Megane','Modus','Rafale','Scenic','Symbol','Taliant','Talisman','Toros','Trafic','Twingo','Zoe'],
  'SEAT|seat':['Alhambra','Altea','Arona','Ateca','Cordoba','Exeo','Ibiza','Leon','Tarraco','Toledo'],
  'Škoda|skoda':['Citigo','Enyaq','Fabia','Felicia','Kamiq','Karoq','Kodiaq','Octavia','Rapid','Roomster','Scala','Superb','Yeti'],
  'Subaru|subaru':['BRZ','Forester','Impreza','Legacy','Levorg','Outback','Solterra','XV'],
  'Suzuki|suzuki':['Alto','Baleno','Grand Vitara','Ignis','Jimny','S-Cross','Splash','Swift','SX4','Vitara'],
  'Tesla|tesla':['Model 3','Model S','Model X','Model Y'],
  'Togg|togg':['T10X','T10F'],
  'Toyota|toyota':['Auris','Avensis','Aygo','Camry','C-HR','Corolla','Corolla Cross','Hilux','Land Cruiser','Prius','Proace City','RAV4','Urban Cruiser','Verso','Yaris','Yaris Cross'],
  'Volkswagen|volkswagen':['Amarok','Arteon','Beetle','Bora','Caddy','Caravelle','CC','Crafter','Golf','ID.3','ID.4','ID.5','ID.7','Jetta','Lupo','Passat','Phaeton','Polo','Scirocco','Sharan','Taigo','T-Cross','Tiguan','Touareg','Touran','Transporter','T-Roc','up!'],
  'Volvo|volvo':['C30','C40','C70','EX30','EX90','S40','S60','S80','S90','V40','V50','V60','V70','V90','XC40','XC60','XC70','XC90'],
  'Tofaş|tofas':['Doğan','Kartal','Murat 124','Murat 131','Serçe','Şahin']
};
export const brands=Object.entries(catalogue).map(([key,models])=>{const [name,slug]=key.split('|');return {name,slug,models};}).sort((a,b)=>a.name.localeCompare(b.name,'tr'));
export const fuels=['Benzin','Dizel','Benzin + LPG','LPG','Hibrit (Benzin)','Hibrit (Dizel)','Şarj edilebilir hibrit','Elektrik'];
export const colors=[['Beyaz','#f8f8f5'],['Siyah','#242725'],['Gri','#858b8d'],['Gümüş','#c4cbd0'],['Kırmızı','#ba3434'],['Mavi','#3567a2'],['Lacivert','#27364e'],['Yeşil','#40664e'],['Bej','#d0be9e'],['Kahverengi','#805d45'],['Turuncu','#d77a30'],['Sarı','#e8c54c'],['Mor','#79578c'],['Diğer',null]];
export const transmissions=['Manuel','Otomatik','Yarı otomatik'];
export function vehicleDetails(v){
  const fields=['brand','model','year','fuel','currentKm','plate','color','transmission'];
  if(!fields.some(k=>v[k]!==undefined))return {};
  if(!brands.some(b=>b.name===v.brand)||typeof v.model!=='string'||!v.model.trim()||v.model.length>60)throw Error('Araç markası veya modeli geçersiz.');
  if(!Number.isInteger(v.year)||v.year<1900||v.year>new Date().getFullYear()+1)throw Error('Üretim yılı geçersiz.');
  if(!fuels.includes(v.fuel)||!Number.isFinite(v.currentKm)||v.currentKm<0||v.currentKm>99999999)throw Error('Yakıt türü veya kilometre geçersiz.');
  if(typeof v.plate!=='string'||v.plate.length>20||!colors.some(c=>c[0]===v.color)||!['',...transmissions].includes(v.transmission))throw Error('Araç detayları geçersiz.');
  return Object.fromEntries(fields.map(k=>[k,v[k]]));
}
