// Layout regression test for the Metric HUD (0.4.0 unit grid).
// It draws the real HUD in headless Chrome and checks the rules the design depends on:
//   - every normal cell is the same width, on both sides of a split (the unit)
//   - the large first metric is Large size units wide, and only its number and unit are bigger
//   - every cell in a row is the same height (the even band)
//   - a Power-up icon cell is a square as tall as the row, and never takes the large slot
//   - nothing runs past the window edge
// It needs a browser, so it is skipped unless `playwright-core` is installed and a Chrome is found
// (set CHROME_PATH to point at one). Run: node --test tests/layout/
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const TYPES={'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.js':'text/javascript'};
let chromium=null;try{({chromium}=await import('playwright-core'));}catch{}
const CHROME=[process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser','C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p=>p&&existsSync(p));

const M=(key,label,value,unit,sub=null,zone=null)=>({key,label,value,unit,sub,zone});
const BASE=[M('power','Power','312','W',null,'#f59b51'),M('heartrate','Heart rate','158','bpm'),M('cadence','Cadence','92','rpm'),M('speed','Speed','38.4','km/h'),M('distance','Distance','24.6','km'),M('time','Ride time','41:08','')];
const SUBS={power:'4.2 W/kg',heartrate:'avg 149',cadence:'avg 88',speed:'avg 36.1',distance:'15.2 to go',time:'6:05 PM'};
const PUP={key:'powerup',label:'Power-up',value:'Aero',unit:'',sub:null,zone:null,icon:'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Cpath d=%22M13 2 4.5 13.5H11L10 22l9-12h-6.5z%22/%3E%3C/svg%3E',state:'available'};
const items=({subs=false,pup=false}={})=>[...(pup?[PUP]:[]),...BASE.map(i=>({...i,sub:subs?SUBS[i.key]:null}))];

const cases=[];
for(const layout of ['stacked','inline','side'])for(const surface of ['plate','cards','open'])for(const grouping of ['none','gap','ends'])for(const hero of [false,true])for(const subs of [false,true])for(const pup of [false,true])
 cases.push({name:`${layout} / ${surface} / ${grouping} / hero ${hero} / second lines ${subs} / power-up ${pup}`,over:{hudLayout:layout,hudSurface:surface,hudGroup:grouping,hudSplit:3,hudHero:hero,hudHeroSize:1.6},data:{subs,pup},width:1180});
// Narrow windows: the row splits and stacks. Cells must still share one unit and stay inside the window.
for(const layout of ['stacked','inline','side'])for(const surface of ['plate','open'])for(const hero of [false,true])
 cases.push({name:`narrow: ${layout} / ${surface} / hero ${hero}`,over:{hudLayout:layout,hudSurface:surface,hudGroup:'gap',hudSplit:3,hudHero:hero,hudHeroSize:1.6},data:{subs:true,pup:true},width:560,narrow:true});

const approx=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,`${msg}: ${a.toFixed(1)} vs ${b.toFixed(1)} (tolerance ${tol})`);
function check(c,r){
 const normal=r.cells.filter(x=>!x.hero&&!x.pup),hero=r.cells.find(x=>x.hero),pup=r.cells.find(x=>x.pup);
 // nothing runs past the window
 for(const x of r.cells)assert.ok(x.x+x.w<=r.rootW+1.5,`a cell runs past the window edge (${(x.x+x.w).toFixed(1)} > ${r.rootW})`);
 // one unit: every normal cell in the same group is the same width; across groups too when the row is side by side
 const byGroup=new Map();for(const x of normal){(byGroup.get(x.group)??byGroup.set(x.group,[]).get(x.group)).push(x);}
 for(const list of byGroup.values())for(const x of list)approx(x.w,list[0].w,1.5,'cells in one group differ in width');
 if(!r.stacked&&normal.length){for(const x of normal)approx(x.w,normal[0].w,c.over.hudGroup==='ends'?1.5:2.5,'a cell differs from the unit across the split');}
 // the large metric is Large size units wide, with a label the size of everyone else's
 if(c.over.hudHero){assert.ok(hero,'no large metric was drawn');
  if(!r.stacked&&normal.length)approx(hero.w,normal[0].w*c.over.hudHeroSize,Math.max(3,hero.w*.02),'large metric is not Large size units wide');
  const n0=normal.find(x=>x.labelPx);if(n0&&hero.labelPx)approx(hero.labelPx,n0.labelPx,.01,'the large metric scaled its label');
  if(n0)assert.ok(hero.valuePx>n0.valuePx*c.over.hudHeroSize*.95,'the large number did not scale');
  if(pup)assert.notEqual(r.cells.indexOf(pup),r.cells.indexOf(hero),'Power-up took the large slot');}
 else assert.ok(!hero,'a large metric was drawn with Large size off');
 // even band: in one row, every cell is the same height
 if(!r.stacked){for(const x of r.cells)approx(x.h,r.cells[0].h,1.5,'cells in the row differ in height');}
 // Power-up: a square as tall as the row
 if(pup&&!r.stacked)approx(pup.w,pup.h,2,'the Power-up cell is not square');
}

test('Metric HUD layout',{skip:!chromium?'playwright-core is not installed':!CHROME?'no Chrome found (set CHROME_PATH)':false},async t=>{
 const server=http.createServer(async(req,res)=>{try{const p=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!p.startsWith(root))throw 0;const b=await readFile(p);res.writeHead(200,{'content-type':TYPES[path.extname(p)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1300,height:400}});
  await page.goto(`http://127.0.0.1:${server.address().port}/tests/layout/harness.html`);
  await page.waitForFunction('typeof window.renderHud==="function"');
  for(const c of cases)await t.test(c.name,async()=>{const r=await page.evaluate(([i,o,w])=>window.renderHud(i,o,w),[items(c.data),c.over,c.width]);check(c,r);});
 }finally{await browser.close();server.close();}
});
