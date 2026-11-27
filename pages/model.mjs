export const thresholds=[0,.55,.75,.9,1.05,1.2,1.5];
export function zoneFor(power,ftp){if(!Number.isFinite(power)||power<0||!Number.isFinite(ftp)||ftp<=0)return null;let z=0;for(let i=1;i<thresholds.length;i++)if(power/ftp>=thresholds[i])z=i;return z;}
export function fresh(data,received,now){return !!data?.state&&Number.isFinite(data.age)&&data.age>=0&&data.age+Math.max(0,now-received)<=5000;}
export function goalProgress(distance,goalKm){return Number.isFinite(distance)&&distance>=0&&Number.isFinite(goalKm)&&goalKm>0?Math.max(0,Math.min(1,distance/(goalKm*1000))):null;}
export function accumulate(totals,previous,current,ftp){if(!previous||previous.id!==current.id)return;const dt=current.time-previous.time;const z=zoneFor(previous.power,ftp);if(z!==null&&dt>0&&dt<=5000)totals[z]+=dt/1000;}

export class PowerHistory {
    samples = [];

    reset() {
        this.samples.length = 0;
    }

    add(time, power) {
        if (!Number.isFinite(time) || !Number.isFinite(power) || power < 0) {
            this.reset();
            return;
        }
        const last = this.samples.at(-1);
        if (last && (time < last.time || time - last.time > 5000)) this.reset();
        if (this.samples.at(-1)?.time === time) {
            this.samples.at(-1).power = power;
            return;
        }
        this.samples.push({time, power});
        while (this.samples[0].time <= time - 10000) this.samples.shift();
    }

    average(seconds, currentPower) {
        if (!Number.isFinite(currentPower) || currentPower < 0 || !seconds || !this.samples.length) {
            return currentPower;
        }
        const cutoff = this.samples.at(-1).time - seconds * 1000;
        const recent = this.samples.filter(sample => sample.time > cutoff);
        return recent.reduce((total, sample) => total + sample.power, 0) / recent.length;
    }
}
