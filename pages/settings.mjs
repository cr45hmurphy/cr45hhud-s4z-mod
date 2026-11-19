import * as common from '/pages/src/common.mjs';
import {catalog,initStore,normalize} from './config.mjs';
const style=document.body.dataset.style,store=common.settingsStore;
initStore(store,style);
common.initInteractionListeners();
function fields(){const cfg=normalize(store.get(),style);const order=[...cfg.fields,...Object.keys(catalog).filter(k=>!cfg.fields.includes(k))];document.querySelector('#fields').replaceChildren(...order.map(k=>{const row=document.createElement('div');row.className='field';const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=cfg.fields.includes(k);check.onchange=()=>{const current=normalize(store.get(),style);store.set('fields',check.checked?[...current.fields,k]:current.fields.filter(x=>x!==k));};label.append(check,document.createTextNode(catalog[k][0]));row.append(label);for(const [text,delta] of [['\u2191',-1],['\u2193',1]]){const b=document.createElement('button');b.type='button';b.textContent=text;b.setAttribute('aria-label',`Move ${catalog[k][0]} ${delta<0?'up':'down'}`);const i=cfg.fields.indexOf(k);b.disabled=i<0||i+delta<0||i+delta>=cfg.fields.length;b.onclick=()=>{const values=[...cfg.fields];[values[i],values[i+delta]]=[values[i+delta],values[i]];store.set('fields',values);};row.append(b);}return row;}));}
// Hide settings that do not apply to the current choices. data-show-when="key:a|b other:c || key:d":
// groups separated by "||" are alternatives; within a group every key:value condition must hold.
function showWhen(){const cfg=normalize(store.get(),style);for(const n of document.querySelectorAll('[data-unit-label]'))n.textContent=cfg.units==='imperial'?'mi':'km';for(const n of document.querySelectorAll('[data-show-when]')){
 n.hidden=!n.dataset.showWhen.split('||').some(group=>group.trim().split(/\s+/).every(cond=>{const [k,vals]=cond.split(':');return vals.split('|').includes(String(cfg[k]));}));}}
const update=()=>{fields();showWhen();};
store.addEventListener('set',update);store.addEventListener('changed',update);
await common.initSettingsForm('form#options')();update();
// Selects and checkboxes also update visibility immediately, before the store event arrives.
document.querySelector('form#options').addEventListener('input',()=>setTimeout(showWhen));
