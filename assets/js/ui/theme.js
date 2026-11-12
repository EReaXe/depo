export const themeKey='depo-theme';
export const themeChoices=['system','light','dark'];
export function createThemeController({root=document.documentElement,media=matchMedia('(prefers-color-scheme: dark)'),meta=document.querySelector('meta[name="theme-color"]'),storage}={}){
  if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}
  let preference='system';
  function apply(){
    const resolved=preference==='system'?(media.matches?'dark':'light'):preference;
    root.dataset.theme=resolved;root.dataset.themePreference=preference;root.style.colorScheme=resolved;
    meta?.setAttribute('content',resolved==='dark'?'#1c1c1e':'#f2f2f7');
  }
  function restore(){
    let stored;try{stored=storage?.getItem(themeKey);}catch{}
    preference=themeChoices.includes(stored)?stored:'system';apply();
  }
  function setPreference(value){
    if(!themeChoices.includes(value))return false;
    preference=value;apply();
    try{if(!storage)return false;storage.setItem(themeKey,value);return true;}catch{return false;}
  }
  function deviceChanged(){if(preference==='system')apply();}
  if(media.addEventListener)media.addEventListener('change',deviceChanged);else media.addListener?.(deviceChanged);
  restore();
  return {getPreference:()=>preference,setPreference,restore};
}
