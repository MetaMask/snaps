"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Timer", {
    enumerable: true,
    get: function() {
        return Timer;
    }
});
const _utils = require("@metamask/utils");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class Timer {
    get status() {
        return this.state.value;
    }
    /**
   * Cancels the currently running timer and marks it finished.
   *
   * @throws {@link Error}. If it wasn't running or paused.
   */ cancel() {
        (0, _utils.assert)(this.status === 'paused' || this.status === 'running', new Error('Tried to cancel a not running Timer'));
        this.onFinish(false);
    }
    /**
   * Pauses a currently running timer, allowing it to resume later.
   *
   * @throws {@link Error}. If it wasn't running.
   */ pause() {
        (0, _utils.assert)(this.state.value === 'running', new Error('Tried to pause a not running Timer'));
        const { callback, start, timeout, remaining } = this.state;
        timeout !== undefined && clearTimeout(timeout);
        this.state = {
            value: 'paused',
            callback,
            remaining: remaining - (Date.now() - start)
        };
    }
    /**
   * Starts the timer.
   *
   * @param callback - The function that will be called after the timer finishes.
   * @throws {@link Error}. If it was already started.
   */ start(callback) {
        (0, _utils.assert)(this.state.value === 'stopped', new Error('Tried to start an already running Timer'));
        const { remaining } = this.state;
        this.state = {
            value: 'paused',
            remaining,
            callback
        };
        this.resume();
    }
    /**
   * Resumes a currently paused timer.
   *
   * @throws {@link Error}. If it wasn't paused.
   */ resume() {
        (0, _utils.assert)(this.state.value === 'paused', new Error('Tried to resume not paused Timer'));
        const { remaining, callback } = this.state;
        const start = Date.now();
        let timeout;
        // setTimeout returns immediately on +Infinity which we use
        if (remaining !== Number.POSITIVE_INFINITY) {
            timeout = setTimeout(()=>this.onFinish(true), remaining);
        }
        this.state = {
            value: 'running',
            callback,
            remaining,
            start,
            timeout
        };
    }
    onFinish(shouldCall) {
        (0, _utils.assert)(this.state.value === 'running' || this.state.value === 'paused');
        if (this.state.value === 'running' && this.state.timeout !== undefined) {
            clearTimeout(this.state.timeout);
        }
        const { callback } = this.state;
        this.state = {
            value: 'finished'
        };
        if (shouldCall) {
            callback();
        }
    }
    /**
   * If `ms` is smaller or equal to zero (including -Infinity), the callback is added to the event loop and executed async immediately
   * If `ms` is +Infinity the timer never finishes.
   *
   * @throws {@link TypeError}. If `ms` is NaN or negative.
   * @param ms - The number of milliseconds before the callback is called after started.
   */ constructor(ms){
        _define_property(this, "state", void 0);
        (0, _utils.assert)(!Number.isNaN(ms), new TypeError("Can't start a timer with NaN time"));
        (0, _utils.assert)(ms >= 0, new TypeError("Can't start a timer with negative time"));
        this.state = {
            value: 'stopped',
            remaining: ms
        };
    }
}

//# sourceMappingURL=Timer.js.map