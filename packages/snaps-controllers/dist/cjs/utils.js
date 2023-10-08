"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    setDiff: function() {
        return setDiff;
    },
    delay: function() {
        return delay;
    },
    delayWithTimer: function() {
        return delayWithTimer;
    },
    hasTimedOut: function() {
        return hasTimedOut;
    },
    withTimeout: function() {
        return withTimeout;
    }
});
const _Timer = require("./snaps/Timer");
function setDiff(objectA, objectB) {
    return Object.entries(objectA).reduce((acc, [key, value])=>{
        if (!(key in objectB)) {
            acc[key] = value;
        }
        return acc;
    }, {});
}
function delay(ms, result) {
    return delayWithTimer(new _Timer.Timer(ms), result);
}
function delayWithTimer(timer, result) {
    let rejectFunc;
    const promise = new Promise((resolve, reject)=>{
        timer.start(()=>{
            result === undefined ? resolve() : resolve(result);
        });
        rejectFunc = reject;
    });
    promise.cancel = ()=>{
        if (timer.status !== 'finished') {
            timer.cancel();
            rejectFunc(new Error('The delay has been canceled.'));
        }
    };
    return promise;
}
const hasTimedOut = Symbol('Used to check if the requested promise has timeout (see withTimeout)');
async function withTimeout(promise, timerOrMs) {
    const timer = typeof timerOrMs === 'number' ? new _Timer.Timer(timerOrMs) : timerOrMs;
    const delayPromise = delayWithTimer(timer, hasTimedOut);
    try {
        return await Promise.race([
            promise,
            delayPromise
        ]);
    } finally{
        delayPromise.cancel();
    }
}

//# sourceMappingURL=utils.js.map