export declare class RequestQueue {
    readonly maxQueueSize: number;
    private readonly queueSizes;
    constructor(maxQueueSize: number);
    /**
     * Increments the queue count for a particular origin.
     *
     * @param origin - A string identifying the origin.
     */
    increment(origin: string): void;
    /**
     * Decrements the queue count for a particular origin.
     *
     * @param origin - A string identifying the origin.
     */
    decrement(origin: string): void;
    /**
     * Gets the queue count for a particular origin.
     *
     * @param origin - A string identifying the origin.
     * @returns The queue count for the origin.
     */
    get(origin: string): number;
}
