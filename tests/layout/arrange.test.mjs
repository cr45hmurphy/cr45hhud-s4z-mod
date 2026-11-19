// Rows and Column arrangements, label modes and the Power-up name, drawn with the real code in headless Chrome.
// Needs playwright-core and a Chrome (set CHROME_PATH). Run: node --test tests/layout/
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const TYPES={'.html':'text/html','.mjs':'text/javascript','.css':'text/css'};
let chromium=null;try{({chromium}=await import('playwright-core'));}catch{}
const CHROME=[process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser','C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p=>p&&existsSync(p));
const M=(key,label,value,unit,sub=null,zone=null)=>({key,label,value,unit,sub,zone});
const BASE=[M('power','Power','312','W',null,'#f59b51'),M('heartrate','Heart rate','158','bpm'),M('cadence','Cadence','92','rpm'),M('speed','Speed','38.4','km/h'),M('distance','Distance','24.6','km'),M('time','Ride time','41:08','')];
const SUBS={power:'4.2 W/kg',heartrate:'avg 149',cadence:'avg 88',speed:'avg 36.1',distance:'15.2 to go',time:'6:05 PM'};
const PUP={key:'powerup',label:'Power-up',value:'Aero',unit:'',sub:null,zone:null,icon:'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Cpath d=%22M13 2 4.5 13.5H11L10 22l9-12h-6.5z%22/%3E%3C/svg%3E',state:'available'};
const items=({subs,pup})=>[...(pup?[PUP]:[]),...BASE.map(i=>({...i,sub:subs?SUBS[i.key]:null}))];

const cases=[];
for(const layout of ['stacked','inline','side'])for(const surface of ['plate','cards','open'])for(const hero of [false,true])for(const pup of [false,true])for(const subs of [false,true]){
 cases.push({name:`rows 3 / ${layout} / ${surface} / hero ${hero} / power-up ${pup} / second lines ${subs}`,arr:'rows',over:{hudArrange:'rows',hudPerRow:3,hudLayout:layout,hudSurface:surface,hudHero:hero,hudHeroSize:1.6},data:{subs,pup},width:900});
 cases.push({name:`column / ${layout} / ${surface} / hero ${hero} / power-up ${pup}`,arr:'column',over:{hudArrange:'column',hudLayout:layout,hudSurface:surface,hudHero:hero,hudHeroSize:1.6},data:{subs,pup},width:260});}
for(const labels of ['icon','none'])for(const layout of ['stacked','inline','side'])for(const hero of [false,true])
 cases.push({name:`row / labels ${labels} / ${layout} / hero ${hero}`,arr:'row',over:{hudLabels:labels,hudLayout:layout,hudSurface:'cards',hudHero:hero,hudHeroSize:1.6},data:{subs:true,pup:true},width:1180});
for(const layout of ['stacked','inline','side'])for(const hero of [false,true])
 cases.push({name:`row / Power-up name on / ${layout} / hero ${hero}`,arr:'row',pupName:true,over:{hudPupName:true,hudLayout:layout,hudSurface:'cards',hudHero:hero,hudHeroSize:1.6},data:{subs:true,pup:true},width:1180});

const approx=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,`${msg}: ${a.toFixed(1)} vs ${b.toFixed(1)} (tolerance ${tol})`);
function check(c,r){
 const cells=r.cells,normal=cells.filter(x=>!x.hero&&!x.pup),hero=cells.find(x=>x.hero),pup=cells.find(x=>x.pup);
 for(const x of cells)assert.ok(x.x+x.w<=r.rootW+1.5,'a cell runs past the window edge');
 if(c.over.hudHero){assert.ok(hero,'no large metric');if(pup)assert.notEqual(cells.indexOf(pup),cells.indexOf(hero),'Power-up took the large slot');}
 if(c.arr==='rows'||c.arr==='column'){
  for(const x of normal)approx(x.w,normal[0].w,2,'normal cells differ in width');
  if(hero&&c.arr==='rows')approx(hero.w,normal[0].w*c.over.hudHeroSize,Math.max(3,hero.w*.03),'large metric is not Large size units wide');
  // cells on the same row share one height
  const rows=new Map();for(const x of cells.filter(x=>!x.hero)){const k=Math.round(x.y);(rows.get(k)??rows.set(k,[]).get(k)).push(x);}
  for(const list of rows.values())for(const x of list)approx(x.h,list[0].h,1.5,'cells on one row differ in height');
  if(hero&&c.arr==='rows'){const rowTop=Math.min(...normal.map(x=>x.y)),rowBottom=Math.max(...normal.map(x=>x.y+x.h));approx(hero.h,rowBottom-rowTop,2,'the large box does not span every row');}
  if(c.arr==='column')for(const x of cells)approx(x.w,cells[0].w,2,'column cells differ in width');
  if(pup&&c.arr==='rows')assert.ok(pup.h>0&&pup.w>0,'Power-up has no size');
 }else{
  // When the row does not fit it wraps; the large box then spans every wrapped row, so it is left out of the height check.
  const hh=cells.filter(x=>!x.pup&&!(r.stacked&&x.hero)),same=cells.filter(x=>!(r.stacked&&x.hero));for(const x of same)if(!(r.stacked&&x.pup))approx(x.h,hh[0].h,1.5,'cells in the row differ in height');
  if(pup&&!c.pupName)approx(pup.w,pup.h,2,'the Power-up cell is not square');
  if(pup&&c.pupName)assert.ok(pup.w>=pup.h-2,'the Power-up cell with its name is narrower than the row is tall');
  if(!c.pupName){for(const x of normal)approx(x.w,normal[0].w,2.5,'normal cells differ in width');}
 }
}
test('Rows, Column, label modes and Power-up name',{skip:!chromium?'playwright-core is not installed':!CHROME?'no Chrome found (set CHROME_PATH)':false},async t=>{
 const server=http.createServer(async(req,res)=>{try{const p=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!p.startsWith(root))throw 0;const b=await readFile(p);res.writeHead(200,{'content-type':TYPES[path.extname(p)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1300,height:600}});
  await page.goto(`http://127.0.0.1:${server.address().port}/tests/layout/harness.html`);
  await page.waitForFunction('typeof window.renderHud==="function"');
  // Regression checks found by looking at screenshots.
  for(const surface of ['plate','cards'])await t.test(`active Power-up keeps its green ring on ${surface}`,async()=>{
   await page.evaluate(([i,o,w])=>window.renderHud(i,o,w),[[{...PUP,state:'active'},...BASE],{hudSurface:surface,hudLayout:'stacked'},1000]);
   const shadow=await page.evaluate(()=>getComputedStyle(document.querySelector('.m-iconcell')).boxShadow);
   assert.match(shadow,/82, 212, 157/,'the green ring is missing: '+shadow);});
  for(const layout of ['inline','side'])await t.test(`${layout}: six metrics fit one row in the default 920 px window`,async()=>{
   const r=await page.evaluate(([i,o,w])=>window.renderHud(i,o,w),[BASE,{hudLayout:layout,hudSurface:'cards'},920]);
   assert.equal(r.stacked,false,'the row wrapped');});
  for(const c of cases)await t.test(c.name,async()=>{const r=await page.evaluate(([i,o,w])=>window.renderHud(i,o,w),[items(c.data),c.over,c.width]);check(c,r);});
 }finally{await browser.close();server.close();}
});
