export const thresholds=[0,.55,.75,.9,1.05,1.2,1.5];
export function zoneFor(power,ftp){if(!Number.isFinite(power)||power<0||!Number.isFinite(ftp)||ftp<=0)return null;let z=0;for(let i=1;i<thresholds.length;i++)if(power/ftp>=thresholds[i])z=i;return z;}
export function fresh(data,received,now){return !!data?.state&&Number.isFinite(data.age)&&data.age>=0&&data.age+Math.max(0,now-received)<=5000;}
export function goalProgress(distance,goalKm){return Number.isFinite(distance)&&distance>=0&&Number.isFinite(goalKm)&&goalKm>0?Math.max(0,Math.min(1,distance/(goalKm*1000))):null;}
export function accumulate(totals,previous,current,ftp){if(!previous||previous.id!==current.id)return;const dt=current.time-previous.time;const z=zoneFor(previous.power,ftp);if(z!==null&&dt>0&&dt<=5000)totals[z]+=dt/1000;}
