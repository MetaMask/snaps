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
export class RequestQueue {
    /**
   * Increments the queue count for a particular origin.
   *
   * @param origin - A string identifying the origin.
   */ increment(origin) {
        const currentCount = this.queueSizes.get(origin) ?? 0;
        if (currentCount >= this.maxQueueSize) {
            throw new Error('Maximum number of requests reached. Try again later.');
        }
        this.queueSizes.set(origin, currentCount + 1);
    }
    /**
   * Decrements the queue count for a particular origin.
   *
   * @param origin - A string identifying the origin.
   */ decrement(origin) {
        const currentCount = this.queueSizes.get(origin) ?? 0;
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
   */ get(origin) {
        return this.queueSizes.get(origin) ?? 0;
    }
    constructor(maxQueueSize){
        _define_property(this, "maxQueueSize", void 0);
        _define_property(this, "queueSizes", void 0);
        this.maxQueueSize = maxQueueSize;
        this.queueSizes = new Map();
    }
}

//# sourceMappingURL=RequestQueue.js.map