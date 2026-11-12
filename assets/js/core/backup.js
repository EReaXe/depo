export const maxBackupBytes=5_000_000;
export const maxTransferUrlBytes=1600;
const encoder=new TextEncoder();
const decoder=new TextDecoder('utf-8',{fatal:true});
export function makeBackup(state,validate,now=new Date()){
  return {format:'depo-backup',version:1,exportedAt:now.toISOString(),...validate(state)};
}
export function parseBackup(text,validate){
  if(typeof text!=='string'||encoder.encode(text).length>maxBackupBytes)throw Error('Yedek dosyası çok büyük. En fazla 5 MB yükleyebilirsiniz.');
  let payload;try{payload=JSON.parse(text.replace(/^\uFEFF/,''));}catch{throw Error('Dosya geçerli bir JSON yedeği değil.');}
  if(!payload||typeof payload!=='object')throw Error('Yedek biçimi geçersiz.');
  if(payload.format!==undefined&&payload.format!=='depo-backup')throw Error('Bu dosya bir Depo yedeği değil.');
  if(payload.version!==undefined&&payload.version!==1)throw Error('Bu yedek sürümü desteklenmiyor. Uygulamayı güncelleyip tekrar deneyin.');
  if(payload.exportedAt!==undefined&&(typeof payload.exportedAt!=='string'||!Number.isFinite(Date.parse(payload.exportedAt))))throw Error('Yedeğin oluşturulma tarihi geçersiz.');
  return {state:validate(payload),exportedAt:payload.exportedAt||null};
}
function base64(bytes){let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');}
function unbase64(value){try{if(!/^[A-Za-z0-9_-]+$/.test(value))throw Error();const text=atob(value.replaceAll('-','+').replaceAll('_','/'));return Uint8Array.from(text,c=>c.charCodeAt(0));}catch{throw Error('Aktarım bağlantısı bozuk.');}}
async function digest(bytes){return base64(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)));}
async function readLimited(stream,limit){
  const reader=stream.getReader(),chunks=[];let length=0;
  try{for(;;){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>limit){await reader.cancel();throw Error('Aktarım verisi çok büyük. JSON dosyasıyla yükleyin.');}chunks.push(value);}}
  finally{reader.releaseLock();}
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return bytes;
}
export async function makeTransferUrl(backup,baseUrl,{compress=true}={}){
  if(!globalThis.crypto?.subtle)throw Error('Aktarım için uygulamayı HTTPS adresinden açın.');
  const json=encoder.encode(JSON.stringify(backup));if(json.length>maxBackupBytes)throw Error('Yedek dosyası çok büyük.');
  let bytes=json,mode='j';
  if(compress&&typeof CompressionStream!=='undefined'){
    bytes=await readLimited(new Blob([json]).stream().pipeThrough(new CompressionStream('gzip')),maxBackupBytes);mode='g';
  }
  if(bytes.length>maxTransferUrlBytes)throw Error('Bu yedek tek QR koda sığmıyor. Yedek indir seçeneğiyle JSON dosyasını diğer cihaza aktarın.');
  const url=new URL('./',baseUrl);url.search='';url.hash=`depo-transfer=1.${mode}.${await digest(bytes)}.${base64(bytes)}`;
  if(encoder.encode(url.href).length>maxTransferUrlBytes)throw Error('Bu yedek tek QR koda sığmıyor. Yedek indir seçeneğiyle JSON dosyasını diğer cihaza aktarın.');
  return url.href;
}
export async function readTransfer(fragment,validate){
  if(!globalThis.crypto?.subtle)throw Error('Aktarımı açmak için uygulamayı HTTPS adresinden açın.');
  if(typeof fragment!=='string'||fragment.length>2000)throw Error('Aktarım bağlantısı çok uzun veya geçersiz. JSON dosyasıyla yükleyin.');
  const match=fragment.match(/^#depo-transfer=1\.([gj])\.([A-Za-z0-9_-]{43})\.([A-Za-z0-9_-]+)$/);
  if(!match)throw Error('Aktarım bağlantısı geçersiz veya bu sürümde desteklenmiyor.');
  let bytes=unbase64(match[3]);if(await digest(bytes)!==match[2])throw Error('Aktarım verisi eksik veya bozulmuş. Yeni bir bağlantı oluşturun.');
  if(match[1]==='g'){
    if(typeof DecompressionStream==='undefined')throw Error('Bu tarayıcı sıkıştırılmış aktarımı açamıyor. JSON dosyasıyla yükleyin.');
    try{bytes=await readLimited(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')),maxBackupBytes);}catch{throw Error('Aktarım verisi açılamadı veya çok büyük. JSON dosyasıyla yükleyin.');}
  }
  let text;try{text=decoder.decode(bytes);}catch{throw Error('Aktarım içeriği okunamadı. Yeni bir bağlantı oluşturun.');}
  return parseBackup(text,validate);
}
