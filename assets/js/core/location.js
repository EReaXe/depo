import {cities} from '../data/price-config.js';
import {cityKey} from './brand-quotes.js';
function inRing([x,y],ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [xi,yi]=ring[i],[xj,yj]=ring[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
function inPolygon(point,rings){return inRing(point,rings[0])&&!rings.slice(1).some(r=>inRing(point,r));}
export function cityAtLocation(geo,latitude,longitude){
  if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)return null;
  const point=[longitude,latitude];
  for(const feature of geo.features||[]){const geometry=feature.geometry;if(!geometry)continue;const polygons=geometry.type==='MultiPolygon'?geometry.coordinates:geometry.type==='Polygon'?[geometry.coordinates]:[];if(polygons.some(p=>inPolygon(point,p)))return cities.find(c=>cityKey(c)===cityKey(feature.properties.shapeName))||null;}
  return null;
}
export async function resolveCity(latitude,longitude){const response=await fetch('./assets/data/provinces.geojson');if(!response.ok)throw Error('İl sınırları yüklenemedi.');return cityAtLocation(await response.json(),latitude,longitude);}
