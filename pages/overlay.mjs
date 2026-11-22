import {createProgressView} from './progress-view.mjs';
import {fitMetrics} from './responsive.mjs';
import {applyWindowSettings} from './window-framework.mjs';
import * as common from '/pages/src/common.mjs';
import {catalog,initStore,normalize,sectionsFor} from './config.mjs';
import {zoneFor,fresh,accumulate} from './model.mjs';
import {drawHud,secondLine,fitHud,powerUpInfo} from './hud-view.mjs';
const ZONE_COLORS=['#9caeba','#60a5fa','#52d49d','#f5cc58','#f59b51','#ef7186','#bc93f4'];
const $=s=>document.querySelector(s),style=document.body.dataset.style,sections=sectionsFor(style);
let cfg=initStore(common.settingsStore,style),latest=null,received=0,closed=false,previous=null,totals=Array(7).fill(0),identity;
common.initInteractionListeners();
const progressView=sections.progress?createProgressView(common,$('#progress'),()=>{if(!closed)render();}):null;
function onSettings(){const next=normalize(common.settingsStore.get(),style);if(next.ftp!==cfg.ftp){totals.fill(0);previous=null;}cfg=next;render();}
common.settingsStore.addEventListener('set',onSettings);
common.settingsStore.addEventListener('changed',onSettings);
function duration(s){if(!Number.isFinite(s))return '\u2014';s=Math.floor(s);return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
function accept(d){if(closed)return;const now=performance.now();const id=d?.athleteId;const t=d?.state?.worldTime;if(identity!==id||(latest?.state?.time>d?.state?.time)){totals.fill(0);previous=null;identity=id;}if(fresh(d,now,now)&&Number.isFinite(t)){const current={id,time:t,power:d.state.power};accumulate(totals,previous,current,cfg.ftp);previous=current;}else previous=null;latest=d;received=now;render();}
function metric(k,valid){if(k==='powerup'){const p=valid?powerUpInfo(latest):null;return [p?p.name:'—',''];}let v=valid?latest.state[k]:null,u=catalog[k][1];if(k==='wkg')v=valid&&latest.athlete?.weight>0?latest.state.power/latest.athlete.weight:null;if(k==='speed'&&cfg.units==='imperial'){v=Number.isFinite(v)?v*.621371:v;u='mph';}if(k==='distance'){v=Number.isFinite(v)?v/(cfg.units==='imperial'?1609.344:1000):v;u=cfg.units==='imperial'?'mi':'km';}if(k==='climbing'&&cfg.units==='imperial'){v=Number.isFinite(v)?v*3.28084:v;u='ft';}if(k==='grade')v=Number.isFinite(v)?v*100:v;return [k==='time'?duration(v):Number.isFinite(v)?v.toFixed(['speed','distance','grade','wkg'].includes(k)?1:0):'\u2014',u];}
function render(){const valid=fresh(latest,received,performance.now());applyWindowSettings(common,cfg);document.body.style.setProperty('--columns',cfg.columns);$('#display').hidden=!sections.metrics;if(style==='strip'){const z=valid?zoneFor(latest.state.power,latest.athlete?.ftp>0?latest.athlete.ftp:cfg.ftp):null;
 drawHud($('#display'),cfg.fields.map(k=>{const [v,u]=metric(k,valid);return {key:k,label:catalog[k][0],text:k==='powerup',icon:k==='powerup'&&valid?powerUpInfo(latest)?.icon:null,state:k==='powerup'&&valid?powerUpInfo(latest)?.state:null,end:k==='powerup'&&valid?powerUpInfo(latest)?.end:null,value:v,unit:u,sub:valid?secondLine(k,latest,cfg):null,zone:(k==='power'||k==='wkg')&&z!==null?ZONE_COLORS[z]:null};}),cfg);
 document.body.dataset.hudprogress=cfg.hudProgress;}
else $('#display').replaceChildren(...cfg.fields.map(k=>{const div=document.createElement('div');div.className='metric';const label=document.createElement('span');label.className='label';label.textContent=catalog[k][0];const value=document.createElement('span');value.className='value';const [v,u]=metric(k,valid);value.textContent=v;const unit=document.createElement('span');unit.className='unit';unit.textContent=u;div.append(label,value,unit);return div;}));
const z=valid?zoneFor(latest.state.power,cfg.ftp):null;$('#zone').hidden=!sections.zones;$('#zone').replaceChildren();const title=document.createElement('div');title.className='zone-title';title.textContent=`${z===null?'Zone unavailable':`Z${z+1} \u00b7 ${['Recovery','Endurance','Tempo','Threshold','VO\u2082 max','Anaerobic','Neuromuscular'][z]}`}  /  FTP ${cfg.ftp} W`;$('#zone').append(title);const segments=document.createElement('div');segments.className='segments';ZONE_COLORS.forEach((c,i)=>{const s=document.createElement('div');s.className='segment'+(z===i?' active':'');s.style.background=c;s.title=`Z${i+1}`;segments.append(s);});if(cfg.showZone||style==='zones')$('#zone').append(segments);if(cfg.showTime){const t=document.createElement('div');t.className='times';totals.forEach((s,i)=>{const span=document.createElement('span');span.textContent=`Z${i+1} ${duration(s)}`;t.append(span);});$('#zone').append(t);}
$('#progress').hidden=!sections.progress||(style==='strip'&&cfg.hudProgress==='off');if(progressView&&!$('#progress').hidden)progressView.draw(latest,cfg,valid);if(style!=='strip')requestAnimationFrame(()=>{if(!closed)fitMetrics($('#content'),$('#display'),cfg.fontScale);});}

const sizeObserver=new ResizeObserver(()=>{if(style==='strip')fitHud($('#display'));else fitMetrics($('#content'),$('#display'),cfg.fontScale);});sizeObserver.observe($('#content'));
const timer=setInterval(render,1000);
let subscription;
window.addEventListener('pagehide',()=>{closed=true;clearInterval(timer);sizeObserver.disconnect();progressView?.close();common.settingsStore.removeEventListener('set',onSettings);common.settingsStore.removeEventListener('changed',onSettings);if(subscription)Promise.resolve(subscription).then(()=>common.unsubscribe('athlete/watching',accept)).catch(()=>{});},{once:true});
render();
subscription=common.subscribe('athlete/watching',accept);
subscription.catch(error=>{console.error('Rider subscription failed',error);});

// Populate newly opened windows immediately while the subscription starts.
common.rpc.getAthleteData('watching').then(data=>{if(!closed&&!latest&&data)accept(data);}).catch(error=>console.warn('Initial rider snapshot unavailable',error));
