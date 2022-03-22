export class RequestQueue {
  public readonly maxQueue: number;

  private readonly locks: Map<string, number>;

  constructor(maxQueue: number) {
    this.maxQueue = maxQueue;
    this.locks = new Map<string, number>();
  }

  /**
   * Increments the queue count for a particular origin
   *
   * @param origin
   */
  public increment(origin: string) {
    const currentCount = this.locks.get(origin) ?? 0;
    if (currentCount + 1 > this.maxQueue) {
      throw new Error('Maximum number of requests reached. Try again later.');
    }
    this.locks.set(origin, currentCount + 1);
  }

  /**
   * Decrements the queue count for a particular origin
   *
   * @param origin
   */
  public decrement(origin: string) {
    const currentCount = this.locks.get(origin) ?? 0;
    if (currentCount === 0) {
      throw new Error(
        `Cannot decrement, ${origin} does not have any outstanding requests.`,
      );
    }
    this.locks.set(origin, currentCount - 1);
  }

  /**
   * Gets the queue count for a particular origin
   *
   * @param origin
   */
  public get(origin: string): number {
    return this.locks.get(origin) ?? 0;
  }
}
