import {mkdir,cp,copyFile} from 'node:fs/promises';
const source=new URL('../',import.meta.url),target=new URL('../_site/',import.meta.url);
await mkdir(target,{recursive:true});
for(const file of ['index.html','manifest.webmanifest','sw.js','.nojekyll'])await copyFile(new URL(file,source),new URL(file,target));
await cp(new URL('assets/',source),new URL('assets/',target),{recursive:true});
console.log('Statik yayın dosyaları _site altında hazırlandı.');
