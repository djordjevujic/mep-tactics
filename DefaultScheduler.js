const Scheduler = Mep.require('strategy/Scheduler');
const Point = Mep.require('misc/Point');
const TunedPoint = Mep.require('strategy/TunedPoint');
const Delay = Mep.require('misc/Delay');
const lunar = Mep.getDriver('LunarCollector');

// Tasks
const InitTask = require('./InitTask');
const CollectBackRocketTask = require('./CollectBackRocketTask');
const CollectStartRocketTask = require('./CollectStartRocketTask');
const PushSideCartridgeTask = require('./PushSideCartridgeTask');
const PushMiddleCartridgeTask = require('./PushMiddleCartridgeTask');
const EjectStartCartridgeTask = require('./EjectStartCartridgeTask');

const TAG = 'DefaultScheduler';

class DefaultScheduler extends Scheduler {
    constructor() {
        super();

        this.tasks = [
            new InitTask(this, { weight: 10000, time: 10, location: new Point(0, 0) }),

            new CollectStartRocketTask(this, { weight: 1000, time: 10, location: new Point(0, 0) }),
            new PushMiddleCartridgeTask(this, { weight: 980, time: 10, location: new Point(0, 0) }),
            new CollectBackRocketTask(this, { weight: 960, time: 10, location: new Point(0, 0) }),
            new EjectStartCartridgeTask(this, { weight: 940, time: 10, location: new Point(0, 0) }),
        ];

        // Init task is always first
        this.runTask(this.tasks[0]);

        // Common
        this.common.push = this.push;
        this.common.collect = this.collect;
    }

    async push() {
        try { await lunar.limiterOpenSafe(); } catch (e) {}
        await Delay(500);
        try { await lunar.collect(); } catch (e) {}

        // Wait to empty
        await Delay(1500);
        for (let i = 0; i < 20; i++) {
            await Delay(300);
            if (lunar.isEmpty() === true) {
                break;
            }
            if (lunar.isLastOnly() === true) {
                lunar.limiterToggle();
            }
        }
        lunar.limiterPrepare();
        await Delay(600);
        lunar.limiterOpen();

        // Last module
        lunar.prepare().catch(() => {});
        lunar.trackStop();
        await Mep.Motion.straight(100);
    }


    async collect() {
        try {
            lunar.closeLimiter().catch((e) => { Mep.Log.error(TAG, 'Lunar.closeLimiter', e); });
            for (let i = 0; i < 2; i++) {
                try { await lunar.collect(); }
                catch (e) {
                            Mep.Log.error(TAG, 'Lunar.collect', e);
                            await Mep.Motion.straight(-30);
                            lunar.prepare().catch(() => { Mep.Log.error(TAG, 'Lunar.prepare', e); });
                            await Mep.Motion.straight(30);
                            try { await lunar.collect(); }
                            catch(e) {
                            Mep.log.error(TAGm, 'Lunar.collect', e); }
               }
                try { await Mep.Motion.straight(-30); } catch (e) { Mep.Log.error(TAG, 'Motion.straight', e); }
                await Delay(1700);
                lunar.prepare().catch((e) => { Mep.Log.error(TAG, 'Lunar.prepare', e); });
                try { await Mep.Motion.straight(30) } catch (e) { Mep.Log.error(TAG, 'Motion.straight', e); }
            }
            //TRECE KUPLJENJE
            try { await lunar.collect(); } catch (e) { Mep.Log.error(TAG, 'Lunar.collect', e); }
            try { await Mep.Motion.straight(-30); } catch (e) { Mep.Log.error(TAG, 'Motion.straight', e); }
            await Delay(1500);
            lunar.prepare().catch(() => { Mep.Log.error(TAG, 'Lunar.prepare', e); });
            try{ await Mep.Motion.straight(30); } catch (e) { Mep.Log.error(TAG, 'Motion.straight', e); }
            //CETVRTO KUPLJENJE
            try { await lunar.collect(); } catch (e) { Mep.Log.error(TAG, 'Lunar.collect', e); }
            await Delay(500);
            lunar.hold();
            try { await Mep.Motion.straight(-40); } catch (e) { Mep.Log.error(TAG, 'Motion.straight', e); }
            try { await lunar.stopTrack(); } catch (e) { Mep.Log.error(TAG, 'Lunar.stopTrack', e); }
        } catch (e) {
            Mep.Log.error(TAG, e);
        }
    }
}

module.exports = DefaultScheduler;
