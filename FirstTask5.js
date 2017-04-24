const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');
const Console = require('./Console');

const TAG = 'FirstTask5';


// U ovom tasku robot krece kretanjem unapred (ZAMENITI orjentaciju u configu)
// Prvo kupi valjak koji najblizi bazi (x: -650, y: -967) a zatim ide na pocetnu
// raketu i kupi iz nje valjke.
class FirstTask5 extends Task {
    async onRun() {
        try {
            lunar.prepare();
            await Mep.Motion.go(new TunedPoint(-452, -367), {speed: 70, backward: false});
            lunar.collect();
            await Mep.Motion.go(new TunedPoint(-360, -650), {speed: 70, backward: false});
            await Mep.Motion.go(new TunedPoint(-360, -725), {speed: 70, backward: false});
            //await Mep.Motion.go(new TunedPoint(-360, -740), {speed: 70, backward: false});
            await this.common.collect();
            await Mep.Motion.go(new TunedPoint(-360, -600), {speed: 70, backward: true});
        } catch (e) {
            Mep.Log.error(TAG, e);
        }

        this.finish();
    }
}

module.exports = FirstTask5;
