// Settings migration and second-line tests (no browser needed). Run: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import {migrate,normalize,defaults} from '../pages/config.mjs';
import {secondLine,subOn,clockTime,powerUpInfo,powerUpCountdown} from '../pages/hud-view.mjs';

test('old looks become a layout and a surface',()=>{
 const m=l=>migrate({hudLook:l});
 assert.deepEqual([m('cells').hudLayout,m('cells').hudSurface],['stacked','cards']);
 assert.deepEqual([m('open').hudLayout,m('open').hudSurface],['side','open']);
 assert.deepEqual([m('rail').hudLayout,m('rail').hudSurface],['inline','plate']);
 assert.deepEqual([m('tiles').hudLayout,m('tiles').hudSurface],['inline','cards']);
});
test('Boxes off becomes the Open surface and keeps the layout',()=>{
 const r=migrate({hudLook:'rail',hudBoxes:false});assert.deepEqual([r.hudLayout,r.hudSurface],['inline','open']);
});
test('migration runs once',()=>{assert.equal(migrate({hudLook:'cells',hudLayout:'side',hudSurface:'plate'}).hudLayout,undefined);});
test('new installs get Stacked + Plate',()=>{const c=normalize({}, 'strip');assert.equal(c.hudLayout,'stacked');assert.equal(c.hudSurface,'plate');});
test('the HUD keeps the old corner choice, the bar keeps its own',()=>{
 const c=normalize({cornerStyle:'rounded',hudLook:'cells'},'strip');assert.equal(c.hudCorners,'rounded');assert.equal(c.cornerStyle,'rounded');
});
test('old second-line checkboxes become per-metric switches',()=>{
 const m=migrate({hudWkg:true,hudAvg:true,hudToGo:false});
 assert.equal(m.hudSubPower,true);assert.equal(m.hudSubSpeed,true);assert.equal(m.hudSubHeartrate,true);assert.equal(m.hudSubDistance,false);assert.equal(m.hudSubTime,false);
 const d=normalize({}, 'strip');assert.equal(d.hudSubHeartrate,false);assert.equal(d.hudSubTime,true);
});
const data={state:{power:300},athlete:{weight:75},stats:{hr:{avg:150}},remainingMetric:'distance',remaining:15200};
test('second lines: master switch and per-metric switches',()=>{
 const cfg=normalize({hudSubHeartrate:true},'strip');
 assert.equal(secondLine('power',data,cfg),'4.0 W/kg');
 assert.equal(secondLine('heartrate',data,cfg),'avg 150');
 assert.equal(secondLine('cadence',data,cfg),null);
 assert.equal(secondLine('distance',data,cfg),'15.2 to go');
 const off={...cfg,hudSecond:false};
 for(const k of ['power','heartrate','distance','time'])assert.equal(secondLine(k,data,off),null,k);
 assert.ok(!subOn('power',off));
});
test('Ride time shows the clock time, not time to go',()=>{
 const cfg=normalize({}, 'strip'),now=new Date(2026,10,17,18,5);
 const v=secondLine('time',{...data,remainingMetric:'time',remaining:900},cfg,now);
 assert.equal(v,clockTime(now));assert.ok(!/to go/.test(v));
});

test('power-up countdown uses Sauce deadline and survives redraws',()=>{
 const data={gameState:{gameConnection:true,activePowerUp:'AERO',availablePowerUp:'DRAFTBOOST',activePowerUpEnd:31000}};
 const p=powerUpInfo(data,1000);
 assert.equal(p.state,'active');assert.equal(p.name,'Aero');assert.equal(p.secs,30);assert.equal(p.end,31000);
 const first=powerUpCountdown(null,p.icon,p.end,1000);
 const next=powerUpCountdown(first,p.icon,p.end,11000);
 assert.equal(next.duration,30000);assert.equal(next.elapsed,10000);assert.equal(next.start,1000);
 assert.equal(powerUpCountdown(next,p.icon,p.end,31000),null);
 assert.equal(powerUpCountdown(next,p.icon,undefined,12000),null);
 assert.equal(powerUpCountdown(next,null,null,12000),null);
 const reused=powerUpCountdown(next,p.icon,51000,21000);
 assert.equal(reused.start,21000);assert.equal(reused.duration,30000);assert.equal(reused.elapsed,0);
 const other=powerUpCountdown(next,'draft.svg',31000,11000);
 assert.equal(other.start,11000);
});
test('held power-ups and missing game connection have no active countdown',()=>{
 const p=powerUpInfo({gameState:{gameConnection:true,availablePowerUp:'AERO'}},1000);
 assert.equal(p.state,'available');assert.equal(p.end,null);assert.equal(p.secs,null);
 assert.equal(powerUpInfo({gameState:{gameConnection:false,activePowerUp:'AERO',activePowerUpEnd:31000}},1000),null);
});
