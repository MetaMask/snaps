"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/snaps/RequestQueue.ts
var RequestQueue = class {
  constructor(maxQueueSize) {
    this.maxQueueSize = maxQueueSize;
    this.queueSizes = /* @__PURE__ */ new Map();
  }
  /**
   * Increments the queue count for a particular origin.
   *
   * @param origin - A string identifying the origin.
   */
  increment(origin) {
    const currentCount = this.queueSizes.get(origin) ?? 0;
    if (currentCount >= this.maxQueueSize) {
      throw new Error("Maximum number of requests reached. Try again later.");
    }
    this.queueSizes.set(origin, currentCount + 1);
  }
  /**
   * Decrements the queue count for a particular origin.
   *
   * @param origin - A string identifying the origin.
   */
  decrement(origin) {
    const currentCount = this.queueSizes.get(origin) ?? 0;
    if (currentCount === 0) {
      throw new Error(
        `Cannot decrement, ${origin} does not have any outstanding requests.`
      );
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
    return this.queueSizes.get(origin) ?? 0;
  }
};



exports.RequestQueue = RequestQueue;
//# sourceMappingURL=chunk-AP7CJ6DA.js.map