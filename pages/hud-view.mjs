// Metric HUD (Quiet Strip window): one set of metric pieces, drawn in a chosen layout, surface and arrangement.
// Layout (inside each cell): stacked (label above the number), inline (label, number and unit on one line),
// side (big number with the label and unit beside it). Surface (what is drawn): plate (one slab with hairline
// dividers), cards (a box per metric), open (nothing drawn, outlined text). Any layout works with any surface.
// Arrangements: One row, Rows (N per row), Column. Options that combine with them: two groups with a gap or
// split to the window edges (One row only), and a large first metric (any arrangement).
export const ICONS={power:'bolt',draft:'air',heartrate:'favorite',cadence:'autorenew',speed:'speed',distance:'route',climbing:'landscape',time:'timer',grade:'trending_up',wkg:'monitor_weight',powerup:'rocket_launch'};
export const SHORT={power:'Power',draft:'Draft',heartrate:'HR',cadence:'Cadence',speed:'Speed',distance:'Distance',climbing:'Climbed',time:'Time',grade:'Grade',wkg:'W/kg',powerup:'Power-up'};
// Power-up, as Sauce's own PowerUp grid field reads it: gameState.availablePowerUp is the one you are holding,
// gameState.activePowerUp (with activePowerUpEnd, epoch ms) the one in use. Needs Sauce's Game Connection.
const PUP={LIGHTNESS:'Feather',DRAFTBOOST:'Draft',UNDRAFTABLE:'Undraftable',AERO:'Aero',NINJA:'Ghost',STEAMROLLER:'Steamroller',ANVIL:'Anvil',COFFEE_STOP:'Coffee Stop',BOOST:'Boost',BONUS_XP:'XP++',BONUS_XP_LIGHT:'XP'};
const pupName=t=>PUP[t]||String(t).toLowerCase().replace(/_/g,' ').replace(/^./,c=>c.toUpperCase());
// null = no game connection (show a dash); otherwise {state:'active'|'available'|'none',name,icon,secs}.
export function powerUpInfo(data,now=Date.now()){const gs=data?.gameState;if(!gs||!gs.gameConnection)return null;
 const type=gs.activePowerUp||gs.availablePowerUp;if(!type)return {state:'none',name:'None',icon:null,secs:null};
 const active=!!gs.activePowerUp,secs=active&&Number.isFinite(gs.activePowerUpEnd)?Math.max(0,Math.round((gs.activePowerUpEnd-now)/1000)):null;
 return {state:active?'active':'available',name:pupName(type),icon:`/pages/images/powerups/${type}.svg`,secs,end:active&&Number.isFinite(gs.activePowerUpEnd)?gs.activePowerUpEnd:null};}

function duration(s){if(!Number.isFinite(s)||s<0)return null;s=Math.floor(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),r=s%60;
 return h?`${h}:${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`:`${m}:${String(r).padStart(2,'0')}`;}
const avg=v=>Number.isFinite(v)&&v>0?v:null;

// Second lines (0.4.0): a master switch plus one switch per metric (hudSub<Key>). Ride time shows the clock time
// (time of day), not an ETA. Distance keeps "to go". Power-up always reports its own state (it is not a text line).
export const SUB_KEYS=['power','draft','wkg','heartrate','cadence','speed','distance','time'];
export const subOn=(k,cfg)=>!!cfg.hudSecond&&!!cfg['hudSub'+k[0].toUpperCase()+k.slice(1)];
export function clockTime(now=new Date(),imperial=false){return now.toLocaleTimeString([],{hour:'numeric',minute:'2-digit',hour12:imperial?true:undefined});}
// The small second line under a metric. Null when there is nothing useful to show.
export function secondLine(k,data,cfg,now=new Date()){
 const s=data?.state||{},st=data?.stats||{},imperial=cfg.units==='imperial',w=data?.athlete?.weight;
 if(k==='powerup'){const p=powerUpInfo(data);return p?.state==='active'?(p.secs!=null?`Active \u00b7 ${p.secs}s`:'Active'):p?.state==='available'?'Ready':null;}
 if(!subOn(k,cfg))return null;
 if(k==='power')return w>0&&Number.isFinite(s.power)?`${(s.power/w).toFixed(1)} W/kg`:null;
 if(k==='wkg')return Number.isFinite(s.power)?`${Math.round(s.power)} W`:null;
 if(k==='draft'){const a=st.draft?.avg;return Number.isFinite(a)&&a>=0?`avg ${Math.round(a)} W`:null;}
 if(k==='heartrate'){const a=avg(st.hr?.avg);return a?`avg ${Math.round(a)}`:null;}
 if(k==='cadence'){const a=avg(st.cadence?.avg);return a?`avg ${Math.round(a)}`:null;}
 if(k==='speed'){const a=avg(st.speed?.avg);return a?`avg ${(imperial?a*.621371:a).toFixed(1)}`:null;}
 if(k==='time')return clockTime(now,imperial);
 // "To go": Sauce reports the remaining distance (m) for the route or event, when known.
 if(k==='distance'&&data?.remainingMetric==='distance'&&Number.isFinite(data.remaining)&&data.remaining>0)
  return `${(data.remaining/(imperial?1609.344:1000)).toFixed(1)} to go`;
 return null;}

// Sauce's PowerUpField starts a circular countdown from the first observed remaining time.
// Keep that start across redraws; a negative animation delay restores the elapsed portion.
export function powerUpCountdown(previous,icon,end,now=Date.now()){
 if(!icon||!Number.isFinite(end)||end<=now)return null;
 const start=previous?.icon===icon&&previous.end===end?previous.start:now;
 return {icon,end,start,duration:end-start,elapsed:Math.max(0,now-start)};
}
const powerUpTimers=new WeakMap();

const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;};

// items: [{key,label,value,unit,sub,zone}] in display order. zone is a CSS color or null.
export function drawHud(root,items,cfg){
 root.className='hud';
 const active=items.find(it=>it.key==='powerup'&&it.state==='active');
 const countdown=powerUpCountdown(powerUpTimers.get(root),active?.icon,active?.end);
 if(countdown)powerUpTimers.set(root,countdown);else powerUpTimers.delete(root);
 root.style.setProperty('--card-gap',`${cfg.hudCardGap}px`);
 root.style.setProperty('--cell-width',`${cfg.hudCellWidth}px`);
 root.dataset.sized=cfg.hudCellWidth>0?'true':'false';
 // A second line only takes room when at least one metric has something to show.
 const anySub=items.some(i=>i.key!=='powerup'&&i.sub);
 const hero=!!cfg.hudHero&&items.length>1,grouped=cfg.hudArrange==='row'&&cfg.hudGroup!=='none'&&items.length>1;
 // data-arrange keeps one internal name per combination: row, groups, ends, rows, column.
 root.dataset.arrange=grouped?(cfg.hudGroup==='ends'?'ends':'groups'):cfg.hudArrange;root.dataset.hero=hero?'on':'off';
 root.style.setProperty('--hero-size',String(cfg.hudHeroSize));
 root.dataset.surface=cfg.hudSurface;root.dataset.layout=cfg.hudLayout;root.dataset.labels=cfg.hudLabels;root.dataset.zone=cfg.hudZone;
 root.style.setProperty('--per-row',String(cfg.hudPerRow));
 const piece=it=>{
  // Power-up: the icon fills the cell. No title, no "Ready"; the name (and seconds left) is optional.
  if(it.key==='powerup'){const m=el('div',`m m-powerup m-iconcell${cfg.hudPupName&&it.icon?' has-name':''}${it.state?` pup-${it.state}`:''}`);
   if(it.icon){const dial=el('span','m-pupdial'),i=el('img','m-icon');i.src=it.icon;i.alt=it.value;i.title=it.value;
    if(countdown){dial.classList.add('counting');dial.style.setProperty('--pup-duration',`${countdown.duration}ms`);dial.style.setProperty('--pup-delay',`${-countdown.elapsed}ms`);}
    dial.append(i);m.append(dial);
   }else m.append(el('ms','m-icon m-icon-empty','bolt'));
   if(cfg.hudPupName&&it.icon){m.append(el('span','m-pupname',it.state==='active'&&it.sub?`${it.value} ${it.sub.replace('Active · ','')}`:it.value));}
   return m;}
  const m=el('div',`m m-${it.key}${it.text?' m-text':''}${it.state?` pup-${it.state}`:''}`);
  if(it.zone&&cfg.hudZone!=='off')m.style.setProperty('--zc',it.zone);
  if(cfg.hudLabels!=='none'){const l=el('span','m-label');if(cfg.hudLabels==='icon'){const i=el('ms',null,ICONS[it.key]||'circle');i.title=it.label;l.append(i);}else l.textContent=cfg.hudArrange==='column'||cfg.hudLayout!=='stacked'?SHORT[it.key]||it.label:it.label;m.append(l);}
  const value=el('span','value');if(it.icon){const i=el('img','m-icon');i.src=it.icon;i.alt='';value.append(i);}value.append(document.createTextNode(it.value));m.append(value,el('span','unit',it.unit||''));
  if(anySub&&cfg.hudArrange!=='column')m.append(el('span','m-sub',it.sub||' '));
  if(it.zone&&cfg.hudZone==='stripe'){m.append(el('i','m-stripe'));m.classList.add('zoned');if(anySub&&it.sub)m.classList.add('has-sub');}
  return m;};
 // The large metric is the first real metric: a Power-up icon never takes that slot.
 const group=(list,first)=>{const hi=hero&&first?list.findIndex(it=>it.key!=='powerup'):-1,g=el('div','hud-group');g.append(...list.map((it,i)=>{const p=piece(it);if(i===hi){p.classList.add('hero');g.classList.add('has-hero');}return p;}));
  // In Rows the large box owns the first column; put it first so a Power-up before it does not take that column.
  if(hi>0&&cfg.hudArrange==='rows')g.prepend(g.children[hi]);return g;};
 const n=items.length,split=Math.min(Math.max(1,cfg.hudSplit),Math.max(1,n-1));
 const groups=!n?[]:grouped?[group(items.slice(0,split),true),group(items.slice(split),false)]:[group(items,true)];
 // Rows: the large box takes the first column and spans every row; the others fill N columns beside it.
 if(cfg.hudArrange==='rows')for(const g of groups)if(g.classList.contains('has-hero')){const rest=g.children.length-1,per=Math.min(cfg.hudPerRow,Math.max(1,rest));g.style.gridTemplateColumns=`minmax(0,${cfg.hudHeroSize}fr) repeat(${per},minmax(0,1fr))`;g.style.setProperty('--hero-rows',String(Math.max(1,Math.ceil(rest/per))));}
 // A preferred width sizes each metric independently of the text size. Plate width follows its cells.
 for(const g of groups){
  if(cfg.hudCellWidth>0&&cfg.hudArrange==='rows'){
   const units=g.classList.contains('has-hero')?cfg.hudHeroSize+Math.min(cfg.hudPerRow,Math.max(1,g.children.length-1)):cfg.hudPerRow;
   g.style.maxWidth=`${units*cfg.hudCellWidth+(Math.ceil(units)-1)*(cfg.hudSurface==='plate'?0:cfg.hudCardGap)}px`;
  }
 }
 root.replaceChildren(...groups);
 fitHud(root);
}

// Unit grid (0.4.0). Every normal cell is one unit wide on both sides of a split; the large first metric is Large
// size units wide. A group's share of the row is its unit count, so one unit is the same width everywhere.
// A Power-up icon cell is a square as tall as the row (its column is set from the measured row height), so the icon
// can not change the row. When the window is too narrow, groups stack and a long row splits into balanced rows
// (for example 6 metrics in a window that fits 4 become 3 + 3) instead of squeezing.
export const MIN_CELL=7.2,MIN_CELL_RAIL=9,MIN_CELL_OPEN=9; // Inline and Side put the label beside the number, so they need more room.
export const END_CELL=8.5; // Split to the window edges: one fixed unit, so the two ends match and nothing shifts as numbers change.
export function fitHud(root){
 const arr=root.dataset.arrange;if(!['row','groups','ends'].includes(arr))return;
 const groups=[...root.querySelectorAll(':scope > .hud-group')];if(!groups.length)return;
 const em=parseFloat(getComputedStyle(root).fontSize)||16,w=root.clientWidth;if(!w)return;
 const look=root.dataset.layout,size=parseFloat(root.style.getPropertyValue('--hero-size'))||1;
 const preferred=parseFloat(root.style.getPropertyValue('--cell-width'))||0;
 const min=preferred||({inline:MIN_CELL_RAIL,side:MIN_CELL_OPEN}[look]||MIN_CELL)*em,gap=1.5*em,ggap=parseFloat(getComputedStyle(groups[0]).columnGap)||0;
 const isPup=c=>c.classList.contains('m-iconcell')&&!c.classList.contains('has-name');
 const info=groups.map(g=>{const cells=[...g.children],hero=cells.some(c=>c.classList.contains('hero')),pup=cells.filter(isPup).length;
  return {g,cells,hero,pup,n:cells.filter(c=>!c.classList.contains('hero')&&!isPup(c)).length};});
 const apply=(side,band)=>{root.classList.toggle('stacked',!side);
  for(const o of info){const {g,cells}=o;
   if(!side){const h=g.querySelector(':scope > .hero');if(h&&g.firstElementChild!==h)g.prepend(h);}
   if(side){g.style.maxWidth='';const unit=preferred||(arr==='ends'?Math.max(min,END_CELL*em):0);
    g.style.gridTemplateColumns=cells.map(c=>c.classList.contains('hero')?(unit?`${unit*size}px`:`minmax(0,${size}fr)`):isPup(c)?`${band}px`:(unit?`${unit}px`:'minmax(0,1fr)')).join(' ');
    g.style.flex=arr==='ends'||preferred?'none':`${o.n+(o.hero?size:0)} 1 ${o.pup*band+Math.max(0,cells.length-1)*ggap}px`;
    g.style.setProperty('--cols',String(cells.length));g.style.setProperty('--hero-rows','1');
   }else{const n=cells.length-(o.hero?1:0),per=Math.max(1,Math.floor((w-(o.hero?size*min+ggap:0)+ggap)/(min+ggap))),cols=Math.max(1,Math.ceil(n/Math.ceil(n/per)));
    g.style.maxWidth=preferred?`${(cols+(o.hero?size:0))*preferred+(cols+(o.hero?1:0)-1)*ggap}px`:'';
    g.style.flex='';g.style.setProperty('--cols',String(cols));
    g.style.gridTemplateColumns=(o.hero?`minmax(0,${size}fr) `:'')+`repeat(${cols},minmax(0,1fr))`;
    g.style.setProperty('--hero-rows',String(Math.max(1,Math.ceil(n/cols))));}}};
 // First lay the row out with the Power-up column closed, to measure the cell height it has to match.
 let band=0;
 if(info.some(o=>o.pup)){apply(true,0);band=Math.max(...info.flatMap(o=>o.cells.map(c=>c.getBoundingClientRect().height)));}
 const need=info.reduce((a,o)=>a+(o.n+(o.hero?size:0))*min+o.pup*band+Math.max(0,o.cells.length-1)*ggap,0)+(groups.length-1)*gap;
 apply(need<=w,band);
}
