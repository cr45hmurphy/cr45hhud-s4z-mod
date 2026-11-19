import {segmentKind} from './segment-types.mjs';
const finite=Number.isFinite;
const clamp=x=>Math.min(1,Math.max(0,x));
// Coordinate system: Sauce routeDistance/routeEnd, not total ride distance.
export function routeProgress(data,route){
 const s=data?.state;
 if(!s||!route||String(s.routeId)!==String(route.id)||!finite(s.routeDistance)||!finite(s.routeEnd)||s.routeEnd<=0)return null;
 const repeat=Number(s.laps)>0;
 const prelude=repeat?route.meta?.weldDistance:route.meta?.leadinDistance;
 const total=s.routeEnd,position=s.routeDistance;
 const leadin=finite(prelude)&&prelude>=0?Math.min(prelude,total):null;
 const markers=[];
 if(leadin!==null)for(const seg of route.segments||[]){
  if(seg.weldOnly||repeat&&seg.leadinOnly||!finite(seg.offset)||!finite(seg.distance)||seg.distance<0)continue;
  const start=leadin+seg.offset,end=start+seg.distance;
  if(end<0||start>total)continue;
  markers.push({id:String(seg.id),name:seg.name||`Segment ${seg.id}`,kind:segmentKind(seg),start:Math.max(0,start),end:Math.min(total,end),startFraction:clamp(start/total),endFraction:clamp(end/total)});
 }
 return {name:route.name||'Route',position,total,fraction:clamp(position/total),remaining:Math.max(0,total-position),leadin,leadinFraction:leadin===null?null:leadin/total,inLeadin:leadin!==null&&position<leadin,lap:repeat?Number(s.laps)+1:1,markers};
}
