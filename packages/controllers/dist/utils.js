"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTimeout = exports.hasTimedOut = exports.delayWithTimer = exports.delay = exports.setDiff = void 0;
const Timer_1 = require("./snaps/Timer");
/**
 * Takes two objects and does a Set Difference of them.
 * Set Difference is generally defined as follows:
 * ```
 * 𝑥 ∈ A ∖ B ⟺ 𝑥 ∈ A ∧ 𝑥 ∉ B
 * ```
 * Meaning that the returned object contains all properties of A expect those that also
 * appear in B. Notice that properties that appear in B, but not in A, have no effect.
 *
 * @see [Set Difference]{@link https://proofwiki.org/wiki/Definition:Set_Difference}
 * @param objectA - The object on which the difference is being calculated.
 * @param objectB - The object whose properties will be removed from objectA.
 * @returns The objectA without properties from objectB.
 */
function setDiff(objectA, objectB) {
    return Object.entries(objectA).reduce((acc, [key, value]) => {
        if (!(key in objectB)) {
            acc[key] = value;
        }
        return acc;
    }, {});
}
exports.setDiff = setDiff;
/**
 * A Promise that delays it's return for a given amount of milliseconds.
 *
 * @param ms - Milliseconds to delay the execution for.
 * @param result - The result to return from the Promise after delay.
 * @returns A promise that is void if no result provided, result otherwise.
 * @template Result - The `result`.
 */
function delay(ms, result) {
    return delayWithTimer(new Timer_1.Timer(ms), result);
}
exports.delay = delay;
/**
 * A Promise that delays it's return by using a pausable Timer.
 *
 * @param timer - Timer used to control the delay.
 * @param result - The result to return from the Promise after delay.
 * @returns A promise that is void if no result provided, result otherwise.
 * @template Result - The `result`.
 */
function delayWithTimer(timer, result) {
    let rejectFunc;
    const promise = new Promise((resolve, reject) => {
        timer.start(() => {
            result === undefined ? resolve() : resolve(result);
        });
        rejectFunc = reject;
    });
    promise.cancel = () => {
        if (timer.status !== 'finished') {
            timer.cancel();
            rejectFunc(new Error('The delay has been canceled.'));
        }
    };
    return promise;
}
exports.delayWithTimer = delayWithTimer;
/*
 * We use a Symbol instead of rejecting the promise so that Errors thrown
 * by the main promise will propagate.
 */
exports.hasTimedOut = Symbol('Used to check if the requested promise has timeout (see withTimeout)');
/**
 * Executes the given Promise, if the Timer expires before the Promise settles, we return earlier.
 *
 * NOTE:** The given Promise is not cancelled or interrupted, and will continue to execute uninterrupted. We will just discard its result if it does not complete before the timeout.
 *
 * @param promise - The promise that you want to execute.
 * @param timerOrMs - The timer controlling the timeout or a ms value.
 * @returns The resolved `PromiseValue`, or the hasTimedOut symbol if
 * returning early.
 * @template PromiseValue- - The value of the Promise.
 */
async function withTimeout(promise, timerOrMs) {
    const timer = typeof timerOrMs === 'number' ? new Timer_1.Timer(timerOrMs) : timerOrMs;
    const delayPromise = delayWithTimer(timer, exports.hasTimedOut);
    try {
        return await Promise.race([promise, delayPromise]);
    }
    finally {
        delayPromise.cancel();
    }
}
exports.withTimeout = withTimeout;
//# sourceMappingURL=utils.js.map