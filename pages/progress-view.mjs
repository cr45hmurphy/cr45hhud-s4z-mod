import {routeProgress} from './route-progress.mjs';
import {kindLabel} from './segment-types.mjs';
export function createProgressView(common,element,onUpdate){
 let route=null,key=null,pending=false,retryAt=0,closed=false;
 function load(data){const id=data?.state?.routeId;if(String(id)!==key){key=String(id);route=null;pending=false;retryAt=0;}if(!id||route||pending||Date.now()<retryAt)return;
  const requestKey=key;pending=true;
  Promise.resolve(common.getRoute(id)).then(async result=>{
   if(closed||key!==requestKey)return;
   if(!result){retryAt=Date.now()+15000;return;}
   route=result;onUpdate();
   const info=new Map();const ids=[...new Set((result.segments||[]).map(s=>s.id))];
   // Metadata (name, loop flag) is optional; geometry is usable before it arrives.
   for(const id of ids){if(closed||key!==requestKey)return;try{const seg=await common.getSegment(id);if(seg)info.set(String(id),{name:seg.name,loop:seg.loop===true});}catch(error){console.debug('Segment metadata unavailable',error);}}
   if(!closed&&key===requestKey){route={...result,segments:(result.segments||[]).map(s=>({...s,...info.get(String(s.id))}))};onUpdate();}
  }).catch(error=>{if(key===requestKey)retryAt=Date.now()+15000;console.warn('Route metadata unavailable',error);}).finally(()=>{if(key===requestKey)pending=false;});
 }
 // Event lap count for the Lap label ("Lap 2/3"). Fetched once per event subgroup; outside events it stays null.
 let eventKey=null,eventLaps=null;
 function loadEvent(data){const id=data?.state?.eventSubgroupId;if(!id){eventKey=null;eventLaps=null;return;}if(String(id)===eventKey)return;
  eventKey=String(id);eventLaps=null;const get=common.rpc?.getEventSubgroup;if(typeof get!=='function')return;
  Promise.resolve(get(id)).then(sg=>{if(closed||eventKey!==String(id))return;const n=Number(sg?.laps);eventLaps=n>0?n:null;onUpdate();}).catch(error=>console.debug('Event subgroup unavailable',error));}
 const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 const clamp=x=>Math.min(1,Math.max(0,x));
 // Every style uses the same text model: a left slot, a right slot (each Route name, Next or nothing),
 // an optional swap of the route name for Next near a segment, and a distance readout at the far right.
 //  Standard: slots in the heading above the bar.  Compact: slots inside the bar.  Thin line: beside or above the line.
 // Bar cells (after O101's table bar): an optional prelude cell (lead-in or lap connector) followed by one
 // route cell for the CURRENT lap. Widths follow routeEnd distance; a multi-lap event total is not known.
 function draw(data,cfg,valid){load(data);loadEvent(data);const view=valid?routeProgress(data,route):null;element.replaceChildren();
  const style=cfg.density;element.classList.toggle('compact',style==='compact');element.classList.toggle('line',style==='line');
  const num=m=>cfg.units==='imperial'?(m/1609.344).toFixed(1):(m/1000).toFixed(1),unit=cfg.units==='imperial'?'mi':'km';
  const showInd=cfg.showIndicators;
  const showNext=cfg.textLeft==='next'||cfg.textMiddle==='next'||cfg.textRight==='next'||cfg.swapToNext;
  const markers=view?[...view.markers].filter(m=>cfg.showLoops||m.kind!=='loop').sort((a,b)=>a.start-b.start):[];
  // Next: the segment you are in (distance to its end) or the next one ahead. Sprints and climbs first,
  // because a loop often spans the whole lap and would otherwise hide them.
  const pick=list=>{const here=list.find(m=>view.position>=m.start&&view.position<m.end);if(here)return {m:here,here:true,dist:here.end-view.position};
   const next=list.find(m=>m.start>view.position);return next?{m:next,here:false,dist:next.start-view.position}:null;};
  const u=view&&showNext?pick(markers.filter(m=>m.kind!=='loop'))||pick(markers.filter(m=>m.kind==='loop')):null;
  const label=m=>cfg.segmentText==='name'?m.name:kindLabel[m.kind];
  // Approach cue: pulse in the last 500 m before a segment; solid tag while riding it.
  const APPROACH=500,cue=cfg.approachCue&&u?(u.here?' in-segment':u.dist<=APPROACH?' approach':''):'';
  const nextEl=()=>u?el('span',`route-next kind-${u.m.kind}${cue}`,u.here?`${label(u.m)} ${num(u.dist)} ${unit} left`:`Next · ${label(u.m)} ${num(u.dist)} ${unit}`):null;
  // Free ride with no route: say so instead of an empty bar labelled 'Route'.
  const routeName=view?.name||route?.name||(data?.state?.routeId?'Loading route…':'No route');
  const nameEl=()=>el('span','route-name',routeName);
  // Resolve the two slots, applying the swap: near a segment, a Route name slot shows Next instead.
  // Three slots (left, middle, right). After the swap, a label shown twice keeps only its first slot.
  let [left,mid,right]=[cfg.textLeft,cfg.textMiddle,cfg.textRight];
  if(cfg.swapToNext&&u&&(u.here||u.dist<=cfg.swapDistance*(cfg.units==='imperial'?1609.344:1000)))[left,mid,right]=[left,mid,right].map(k=>k==='name'?'next':k);
  {const seen=new Set();[left,mid,right]=[left,mid,right].map(k=>k==='none'||!seen.has(k)?(seen.add(k),k):'none');}
  const lapEl=()=>view?el('span','route-lap',`Lap ${view.lap}${eventLaps?`/${eventLaps}`:''}`):null;
  const slot=k=>k==='name'?nameEl():k==='next'?nextEl():k==='lap'?lapEl():null;
  const leftEl=slot(left),midEl=slot(mid),rightEl=slot(right);
  // Slot spans: with a middle label, left and right share the space evenly so the middle stays centered.
  const spans=()=>{const l=el('span','slot-left'),r=el('span','slot-right');if(leftEl)l.append(leftEl);if(rightEl)r.append(rightEl);if(!midEl)return [l,r];const m=el('span','slot-mid');m.append(midEl);return [l,m,r];};
  const readout=()=>{const mode=cfg.distanceDisplay;if(mode==='none')return null;if(!view)return el('span','route-remaining','—');const r=el('span','route-remaining');
   const pct=tag=>el(tag,'route-percent',view?`${Math.round(view.fraction*100)}%`:'—');
   const dist=()=>[el('b','',view?num(view.remaining):'—'),el('small','',style==='standard'?` ${unit} left`:` ${unit}`)];
   if(mode==='percent')r.append(pct('b'));else if(mode==='both')r.append(...dist(),el('small','route-sep',' · '),pct('small'));else r.append(...dist());return r;};
  const rem=readout();
  // A text row: left slot, right slot pushed right, distance at the far right.
  const textRow=cls=>{const t=el('div',cls+(midEl?' has-mid':''));t.append(...spans());if(rem)t.append(rem);return t;};
  // Text position (Standard, and Thin line with text on its own row):
  //  above = one text row above; below = the same row under it; split = left text + distance above, right text below.
  const place=bar=>{const pos=cfg.textPosition;
   if(pos==='below'){element.append(bar,textRow('route-heading below'));return;}
   if(pos==='split'){const top=el('div','route-heading');const l=el('span','slot-left');if(leftEl)l.append(leftEl);top.append(l);if(midEl)top.append(el('span','route-sep',' · '),midEl);if(rem)top.append(rem);
    const bottom=el('div','route-subline');if(rightEl)bottom.append(rightEl);element.append(top,bar,bottom);return;}
   element.append(textRow('route-heading'),bar);};
  if(style==='line'){drawLine(cfg,view,markers,showInd,leftEl,midEl,rightEl,rem,place,num,unit,u);return;}
  const row=el('div','route-cells');row.setAttribute('role','progressbar');row.setAttribute('aria-label','Route progress');row.setAttribute('aria-valuemin','0');row.setAttribute('aria-valuemax','100');if(view)row.setAttribute('aria-valuenow',String(Math.round(view.fraction*100)));
  const cell=(cls,weight,fill,text)=>{const c=el('div',`route-cell ${cls}`);c.style.flex=`${Math.max(weight,0.0001)} 1 0`;c.style.setProperty('--fill',`${clamp(fill)*100}%`);if(text&&style==='standard')c.append(el('span','cell-label',text));return c;};
  const split=!!(view&&cfg.showLeadIn&&view.leadin>0&&view.leadin<view.total);
  const origin=split?view.leadin:0,span=view?view.total-origin:1;
  if(!view){row.append(cell('route-main',1,0,''));}
  else{
   if(split){const wide=view.leadinFraction>=0.1;const pre=cell('route-prelude',view.leadin,view.position/view.leadin,wide?(view.lap>1?'Connector':'Lead-in'):'');pre.title=`${view.lap>1?'Lap connector':'Lead-in'}: ${num(view.leadin)} ${unit}`;row.append(pre);}
   // Only a lap number is worth a label inside the route cell; the route name lives in the text slots.
   const lapShown=[left,mid,right].includes('lap');
   const main=cell('route-main',span,(view.position-origin)/span,view.lap>1&&!lapShown?`Lap ${view.lap}`:'');
   if(showInd)for(const m of markers){const a=clamp((m.start-origin)/span),b=clamp((m.end-origin)/span);if(b<=a)continue;
    const band=el('div',`route-segment kind-${m.kind}${cfg.approachCue&&u&&u.m===m?' active':''}`);band.style.left=`${a*100}%`;band.style.width=`${(b-a)*100}%`;band.title=`${m.name}: ${num(m.start)} - ${num(m.end)} ${unit}`;main.append(band);}
   main.append(el('div','route-finish'));row.append(main);
   if(cfg.riderMarker!=='none'){const rider=el('div','route-rider');rider.style.left=`${clamp(view.fraction)*100}%`;row.append(rider);}}
  if(style==='compact'){
   // Slots sit inside the bar, starting after the lead-in cell, so a long name never narrows the bar.
   const labels=el('div','bar-labels'+(midEl?' has-mid':''));labels.append(...spans());
   if(split)labels.style.left=`calc((100% - 2px) * ${view.leadinFraction} + 2px + 0.5em)`;
   row.append(labels);element.append(row);if(rem)element.append(rem);return;}
  place(row);
 }
 // Thin line. Positions are whole-route fractions; the line has no cells.
 function drawLine(cfg,view,markers,showInd,leftEl,midEl,rightEl,rem,place,num,unit,u){
  const v=cfg.lineLayout,line=el('div','route-line');line.dataset.v=v;
  line.setAttribute('role','progressbar');line.setAttribute('aria-label','Route progress');line.setAttribute('aria-valuemin','0');line.setAttribute('aria-valuemax','100');
  line.append(el('div','line-track'));
  if(view){
   line.setAttribute('aria-valuenow',String(Math.round(view.fraction*100)));
   const fill=el('div','line-fill');fill.style.width=`${clamp(view.fraction)*100}%`;line.append(fill);
   if(cfg.showLeadIn&&view.leadinFraction>0){const lead=el('div','line-lead');lead.style.width=`${clamp(view.leadinFraction)*100}%`;line.append(lead);}
   if(showInd)for(const m of markers){const a=clamp(m.startFraction),b=clamp(m.endFraction);if(b<=a)continue;
    const s=el('div',`line-seg kind-${m.kind}${cfg.approachCue&&u&&u.m===m?' active':''}`);s.style.left=`${a*100}%`;s.style.width=`${(b-a)*100}%`;s.title=`${m.name}: ${num(m.start)} - ${num(m.end)} ${unit}`;line.append(s);}
   // Same Rider marker setting as the other styles: bar, notch (triangle above), or none.
   if(cfg.riderMarker!=='none'){const r=el('div','line-rider');r.style.left=`${clamp(view.fraction)*100}%`;line.append(r);}
  }
  line.append(el('div','line-finish'));
  if(v==='bare'){element.append(line);return;}
  if(v==='above'){place(line);return;}
  // Beside (ends) and raised: left slot, line, right slot, distance.
  const row=el('div','line-text beside');if(leftEl)row.append(leftEl);if(midEl)row.append(midEl);row.append(line);if(rightEl)row.append(rightEl);if(rem)row.append(rem);element.append(row);
 }
 return {draw,close(){closed=true;}};
}
