const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const starter = Mep.getDriver('StarterDriver');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');

const TAG = 'SecondTask';

class SecondTask extends Task {
    async onRun() {
  
        await Mep.Motion.go(new TunedPoint(0, -200), { speed: 70, backward: true });
        await Mep.Motion.go(new TunedPoint(0, 50), { speed: 70, backward: true });

	// Push modules
	try { await lunar.openLimiter(); } catch (e) {}
        await Delay(500);
        try { await lunar.collect(); } catch (e) {}
        await Delay(3000);
        await Delay(500);

        // Push last module (forward - backward)
        await Mep.Motion.straight(60, { speed: 30 });
        await Delay(500);
        await Mep.Motion.straight(-60, { speed: 30 });
        await Delay(1000);
        try { await lunar.prepare(); } catch (e) {}
        lunar.stopTrack();
        await Mep.Motion.straight(100);


        this.finish();
    }
}
module.exports = SecondTask;
