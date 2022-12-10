"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestQueue = void 0;
class RequestQueue {
    constructor(maxQueueSize) {
        this.maxQueueSize = maxQueueSize;
        this.queueSizes = new Map();
    }
    /**
     * Increments the queue count for a particular origin.
     *
     * @param origin - A string identifying the origin.
     */
    increment(origin) {
        var _a;
        const currentCount = (_a = this.queueSizes.get(origin)) !== null && _a !== void 0 ? _a : 0;
        if (currentCount >= this.maxQueueSize) {
            throw new Error('Maximum number of requests reached. Try again later.');
        }
        this.queueSizes.set(origin, currentCount + 1);
    }
    /**
     * Decrements the queue count for a particular origin.
     *
     * @param origin - A string identifying the origin.
     */
    decrement(origin) {
        var _a;
        const currentCount = (_a = this.queueSizes.get(origin)) !== null && _a !== void 0 ? _a : 0;
        if (currentCount === 0) {
            throw new Error(`Cannot decrement, ${origin} does not have any outstanding requests.`);
        }
        this.queueSizes.set(origin, currentCount - 1);
    }
    /**
     * Gets the queue count for a particular origin.
     *
     * @param origin - A string identifying the origin.
     * @returns The queue count for the origin.
     */
    get(origin) {
        var _a;
        return (_a = this.queueSizes.get(origin)) !== null && _a !== void 0 ? _a : 0;
    }
}
exports.RequestQueue = RequestQueue;
//# sourceMappingURL=RequestQueue.js.map