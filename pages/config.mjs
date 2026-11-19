export const catalog={power:['Power','W'],heartrate:['Heart rate','bpm'],cadence:['Cadence','rpm'],speed:['Speed','km/h'],distance:['Distance','km'],climbing:['Elevation','m'],time:['Ride time',''],grade:['Grade','%'],wkg:['Power / weight','W/kg'],powerup:['Power-up','']};
export function defaults(style){return {fields:style==='focus'?['power','heartrate','cadence','speed','distance']:style==='strip'?['power','heartrate','cadence','speed','distance','time']:['speed','distance','time','power','heartrate','cadence'],columns:style==='strip'?6:3,themeOverride:'',fontScale:1,solidBackground:false,backgroundColor:'#000000',backgroundAlpha:100,opacity:.75,scale:1,units:'metric',ftp:250,barThickness:12,showLeadIn:true,
 cornerStyle:'square',density:'standard',lineLayout:'ends',riderMarker:'bar',textOutline:'normal',
 // Text: the same settings drive every style (Standard heading, Compact inside the bar, Thin line beside/above).
 textLeft:'name',textMiddle:'none',textRight:'next',swapToNext:false,swapDistance:2,distanceDisplay:'km',textPosition:'above',
 // Segments: indicators are the colored marks on the bar. Next text is controlled by the Text slots.
 showIndicators:true,approachCue:true,segmentText:'type',nextColor:'segment',segmentPalette:'game',showLoops:true,
 showZone:true,showTime:false,
 // Metric HUD (strip window): look, arrangement and the optional docked progress bar.
 hudLayout:'stacked',hudSurface:'plate',hudCorners:'square',hudArrange:'row',hudLabels:'text',hudSecond:true,hudSubPower:true,hudSubWkg:true,hudSubHeartrate:false,hudSubCadence:false,hudSubSpeed:false,hudSubDistance:true,hudSubTime:true,hudPupName:false,hudZone:'stripe',hudGroup:'none',hudSplit:3,hudHero:false,hudHeroSize:1.6,hudPerRow:3,hudProgress:'off',hudProgressScale:1};}
const ENUMS={cornerStyle:['square','soft','rounded'],density:['standard','compact','line'],lineLayout:['bare','ends','above','raised'],riderMarker:['bar','notch','none'],textOutline:['off','light','normal','heavy'],
 textLeft:['name','next','lap','none'],textMiddle:['name','next','lap','none'],textRight:['name','next','lap','none'],distanceDisplay:['km','percent','both','none'],textPosition:['above','below','split'],
segmentText:['type','name'],nextColor:['segment','white'],segmentPalette:['game','lifted','safe'],
 hudLayout:['stacked','inline','side'],hudSurface:['plate','cards','open'],hudCorners:['square','soft','rounded'],hudArrange:['row','rows','column'],hudGroup:['none','gap','ends'],hudLabels:['text','icon','none'],hudZone:['stripe','number','off'],hudProgress:['off','above','below']};
// Older saved values mapped onto the current settings. Returns only the keys that change.
const COMPACT_TEXT={name:['name','none',false],nameNext:['name','next',false],nextName:['next','name',false],next:['next','none',false],none:['none','none',false],swap:['name','none',true]};
export function migrate(raw){const out={};if(!raw)return out;
 if(raw.lineLayout==='tick')out.lineLayout='ends';
 if(raw.lineLayout==='noloop'){out.lineLayout='ends';out.showLoops=false;}
 if(raw.textLeft===undefined&&COMPACT_TEXT[raw.compactText]){const [l,r,s]=COMPACT_TEXT[raw.compactText];out.textLeft=l;out.textRight=r;out.swapToNext=s;}
 // Before 0.1.18 one "segment display" setting covered both the marks and the Next text. Runs once:
 // only while showIndicators has never been saved.
 if(raw.showIndicators===undefined&&(raw.segmentDisplay!==undefined||raw.showSegments===false)){
  let sd=raw.segmentDisplay;if(sd===undefined&&raw.showSegments===false)sd='off';
  if(sd==='next')sd='both';if(sd==='below'||sd==='inside')sd='indicators';
  out.showIndicators=!(sd==='off'||sd==='nextOnly');
  if(sd==='off'||sd==='indicators')for(const [k,dflt] of [['textLeft','name'],['textRight','next']]){if((out[k]??raw[k]??dflt)==='next')out[k]='none';}
 }
 // 0.3.4: the single Second line checkbox became three (averages are now off by default), and a box opacity of 0
 // became the Boxes checkbox. Both run once, while the new keys have never been saved.
 if(raw.hudSecond===false&&raw.hudAvg===undefined)for(const k of ['hudAvg','hudWkg','hudToGo'])if(raw[k]===undefined)out[k]=false;
 if(raw.opacity===0&&raw.hudBoxes===undefined){out.hudBoxes=false;out.opacity=.75;}
 // 0.3.7: Two groups, Split to the window edges and First metric large used to be arrangements. They are now options
 // that combine with One row, Rows or Column. Runs once, while the new keys have never been saved.
 if(['groups','ends','hero'].includes(raw.hudArrange)&&raw.hudGroup===undefined&&raw.hudHero===undefined){
  out.hudArrange='row';if(raw.hudArrange==='hero')out.hudHero=true;else out.hudGroup=raw.hudArrange==='groups'?'gap':'ends';}
 // 0.4.0: Style (Cells, Open, Tiles, Rail) and Boxes became Layout and Surface. Tiles are now Inline + Cards, equal width.
 // The corner choice was shared with the docked progress bar; the HUD now has its own, starting from the same value.
 // Each runs once, while the new keys have never been saved.
 if(raw.hudLayout===undefined&&raw.hudSurface===undefined&&raw.hudLook!==undefined){
  const L={cells:['stacked','cards'],open:['side','open'],tiles:['inline','cards'],rail:['inline','plate']}[raw.hudLook]||['stacked','plate'];
  out.hudLayout=L[0];out.hudSurface=raw.hudBoxes===false?'open':L[1];}
 if(raw.hudCorners===undefined&&raw.cornerStyle!==undefined)out.hudCorners=raw.cornerStyle;
 // Second lines: the three checkboxes (W/kg, Averages, To go) became a master switch plus one per metric.
 if(raw.hudSubPower===undefined&&(raw.hudWkg!==undefined||raw.hudAvg!==undefined||raw.hudToGo!==undefined)){
  const wkg=raw.hudWkg!==false,avg=raw.hudAvg===true,togo=raw.hudToGo!==false;
  Object.assign(out,{hudSecond:true,hudSubPower:wkg,hudSubWkg:wkg,hudSubHeartrate:avg,hudSubCadence:avg,hudSubSpeed:avg,hudSubDistance:togo,hudSubTime:togo});}
 return out;}
export function normalize(raw,style){const d=defaults(style),c={...d,...raw,...migrate(raw)};c.fields=Array.isArray(c.fields)?[...new Set(c.fields.filter(k=>Object.hasOwn(catalog,k)))]:d.fields;
 for(const [k,min,max] of [['barThickness',2,40],['fontScale',.5,2],['backgroundAlpha',0,100],['columns',1,9],['swapDistance',.2,10],['opacity',0,1],['scale',.7,1.7],['ftp',1,1000],['hudSplit',1,8],['hudPerRow',1,9],['hudProgressScale',.5,2],['hudHeroSize',1,3]])c[k]=Number.isFinite(+c[k])?Math.min(max,Math.max(min,+c[k])):d[k];
 c.columns=Math.round(c.columns);c.hudSplit=Math.round(c.hudSplit);c.hudPerRow=Math.round(c.hudPerRow);
 for(const [k,allowed] of Object.entries(ENUMS))if(!allowed.includes(c[k]))c[k]=d[k];
 c.units=c.units==='imperial'?'imperial':'metric';
 for(const k of ['showLeadIn','showZone','showTime','solidBackground','swapToNext','showLoops','showIndicators','approachCue','hudSecond','hudSubPower','hudSubWkg','hudSubHeartrate','hudSubCadence','hudSubSpeed','hudSubDistance','hudSubTime','hudPupName','hudHero'])c[k]=typeof c[k]==='boolean'?c[k]:d[k];
 return c;}
export function initStore(store,style){const d=defaults(style);if(store.get('fontScale')===undefined&&Number.isFinite(store.get('scale')))store.set('fontScale',store.get('scale'));
 // Rewrite old saved values in the store itself so the settings form shows the current choice.
 for(const [k,v] of Object.entries(migrate(store.get()||{})))store.set(k,v);
 store.setDefault(d);for(const [k,v] of Object.entries(d))if(store.get(k)===undefined)store.set(k,v);return normalize(store.get(),style);}

export function sectionsFor(style){return {metrics:!['zones','progress'].includes(style),zones:style==='zones',progress:['progress','strip'].includes(style)};}
