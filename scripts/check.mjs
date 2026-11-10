import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

export const root=fileURLToPath(new URL('../',import.meta.url));
function read(file){return readFileSync(path.join(root,file),'utf8');}
function files(directory){return readdirSync(path.join(root,directory)).flatMap(name=>{const relative=path.join(directory,name);return statSync(path.join(root,relative)).isDirectory()?files(relative):[relative];});}
export function checkProject(){
  const errors=[];
  function link(reference,from){
    if(/^(https?:|data:|#)/.test(reference))return;
    if(reference.startsWith('/')){errors.push(`${from}: köke bağlı yol ${reference}`);return;}
    const resolved=path.resolve(root,path.dirname(from),reference.split(/[?#]/)[0]);
    if(!existsSync(resolved))errors.push(`${from}: dosya bulunamadı ${reference}`);
    for(const base of ['https://example.test/','https://example.test/depo-beta/']){
      const target=new URL(reference,new URL(from.replaceAll(path.sep,'/'),base));
      if(!target.href.startsWith(base))errors.push(`${from}: alt yol dışına çıkıyor ${reference}`);
    }
  }
  const html=read('index.html');
  for(const match of html.matchAll(/(?:src|href)="([^"\n]+)"/g))link(match[1],'index.html');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  if(new Set(ids).size!==ids.length)errors.push('Tekrarlanan HTML id değeri');
  const jsFiles=files('assets/js').filter(f=>f.endsWith('.js'));
  for(const file of [...jsFiles,'sw.js',...files('scripts').filter(f=>f.endsWith('.mjs'))]){
    try{execFileSync(process.execPath,['--check',path.join(root,file)],{stdio:'pipe'});}catch{errors.push(`${file}: JavaScript sözdizimi hatası`);}
    for(const match of read(file).matchAll(/from\s+['"]([^'"]+)['"]/g)){if(match[1].startsWith('.'))link(match[1],file);}
  }
  const manifest=JSON.parse(read('manifest.webmanifest'));
  for(const icon of manifest.icons)link(icon.src,'manifest.webmanifest');
  if(manifest.scope!=='./'||manifest.start_url!=='./')errors.push('PWA kapsamı ve başlangıcı göreli ./ olmalı');
  const assets=vm.runInNewContext(read('sw.js').split('self.addEventListener')[0]+';ASSETS');
  for(const asset of assets)link(asset,'sw.js');
  const runtime=[...files('assets').filter(f=>/\.(js|css|png|svg|json|geojson)$/.test(f)), 'index.html','manifest.webmanifest'];
  for(const file of runtime)if(!assets.includes('./'+file.replaceAll(path.sep,'/')))errors.push(`${file}: PWA önbellek listesinde yok`);
  if(!read('assets/js/app.js').includes("register('./sw.js')"))errors.push('Service worker kök yoldan kaydedilmeli');
  if(errors.length)throw Error(errors.join('\n'));
  return `${jsFiles.length} JS modülü, ${runtime.length} çalışma zamanı dosyası; import, ikon, HTML ve PWA yolları kök/alt yol için geçerli.`;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{console.log(checkProject());}catch(error){console.error(error.message);process.exitCode=1;}
}
