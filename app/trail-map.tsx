'use client';
import {useEffect,useRef,useState} from 'react';
import type * as Leaflet from 'leaflet';
import {Plus,Minus,Scan,Route,MapPin} from 'lucide-react';
import type {Course,Visit} from './trail-types';
export function TrailMap({courses,selected,onSelect,title,color,visits,reset}:{courses:Course[];selected:Course|null;onSelect:(c:Course)=>void;title:string;color:string;visits:Record<string,Visit>;reset:()=>void}){
 const node=useRef<HTMLDivElement>(null),map=useRef<Leaflet.Map|null>(null),lib=useRef<typeof Leaflet|null>(null),layer=useRef<Leaflet.FeatureGroup|null>(null),bounds=useRef<Leaflet.LatLngBounds|null>(null);
 const [ready,setReady]=useState(false),[error,setError]=useState('');
 const selectRef=useRef(onSelect);selectRef.current=onSelect;
 useEffect(()=>{let disposed=false;let observer:ResizeObserver|undefined;import('leaflet').then(L=>{if(disposed||!node.current)return;lib.current=L;const m=L.map(node.current,{zoomControl:false,minZoom:5,maxZoom:18});map.current=m;
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).on('tileerror',()=>setError('배경지도 연결이 원활하지 않습니다. 코스 정보는 계속 확인할 수 있습니다.')).addTo(m);layer.current=L.featureGroup().addTo(m);
 observer=new ResizeObserver(()=>{m.invalidateSize();if(bounds.current)m.fitBounds(bounds.current,{padding:[42,42],maxZoom:14,animate:false})});observer.observe(node.current);setReady(true);
 }).catch(()=>setError('지도를 불러오지 못했습니다. 새로고침해 주세요.'));return()=>{disposed=true;observer?.disconnect();map.current?.remove();map.current=null}},[]);
 useEffect(()=>{const L=lib.current,m=map.current,g=layer.current;if(!ready||!L||!m||!g)return;g.clearLayers();
 for(const c of courses){const active=c.id===selected?.id,done=Boolean(visits[c.id]);const line=L.polyline(c.tracks as Leaflet.LatLngTuple[][],{color:active?'#e45c30':done?'#29805a':color,weight:active?6:3,opacity:selected&&!active?0.3:0.85}).addTo(g);line.on('click',()=>selectRef.current(c));const p=c.tracks[0]?.[0] as Leaflet.LatLngTuple|undefined;
 if(p)L.marker(p,{icon:L.divIcon({className:'course-marker',html:`<span class="${active?'active':done?'visited':''}">${c.number}</span>`,iconSize:[30,30],iconAnchor:[15,15]}),title:`${c.name}${done?' · 다녀온 코스':''}`,keyboard:true}).on('click',()=>selectRef.current(c)).addTo(g);
 if(active){line.bringToFront();const first=c.tracks[0]?.[0],last=c.tracks.at(-1)?.at(-1);for(const [p,label,kind] of [[first,'시점','start'],[last,'종점','end']] as const){if(p)L.marker(p as Leaflet.LatLngTuple,{icon:L.divIcon({className:'endpoint-marker',html:`<b class="${kind}">${label}</b>`,iconSize:[40,25],iconAnchor:[20,25]}),title:label}).addTo(g)}}}
 const points=(selected?selected.tracks.flat():courses.flatMap(c=>c.tracks.flat())) as Leaflet.LatLngTuple[];if(points.length){bounds.current=L.latLngBounds(points);m.fitBounds(bounds.current,{padding:[42,42],maxZoom:selected?14:10,animate:false})}else bounds.current=null;
 },[ready,courses,selected,color,visits]);
 return <section className="map-area" aria-label={`${title} 지도`}><div ref={node} className="map-canvas"/>{!ready&&!error&&<div className="map-loading">지도를 불러오는 중…</div>}<div className="map-heading"><Route size={19}/><span>{selected?.name||title}</span><small>{selected?`${selected.distance} km`:`${courses.length}개 코스`}</small></div><div className="map-controls"><button aria-label="지도 확대" disabled={!ready} onClick={()=>map.current?.zoomIn()}><Plus/></button><button aria-label="지도 축소" disabled={!ready} onClick={()=>map.current?.zoomOut()}><Minus/></button><button aria-label="선택한 길의 전체 노선 보기" title="전체 노선 보기" onClick={reset}><Scan size={21}/></button></div>{error&&<div className="map-error" role="status">{error}</div>}{courses.length===0&&<div className="map-empty">조건에 맞는 코스가 없습니다.</div>}{!selected&&courses.length>0&&<div className="map-hint"><MapPin size={16}/>코스 번호를 선택해 보세요.</div>}<div className="legend"><span/>전체 노선 <span className="done"/>다녀온 길 <span className="chosen"/>선택 코스</div></section>
}
