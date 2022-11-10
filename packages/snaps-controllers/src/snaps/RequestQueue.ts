export class RequestQueue {
  public readonly maxQueueSize: number;

  private readonly queueSizes: Map<string, number>;

  constructor(maxQueueSize: number) {
    this.maxQueueSize = maxQueueSize;
    this.queueSizes = new Map<string, number>();
  }

  /**
   * Increments the queue count for a particular origin.
   *
   * @param origin - A string identifying the origin.
   */
  public increment(origin: string) {
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
   */
  public decrement(origin: string) {
    const currentCount = this.queueSizes.get(origin) ?? 0;
    if (currentCount === 0) {
      throw new Error(
        `Cannot decrement, ${origin} does not have any outstanding requests.`,
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
  public get(origin: string): number {
    return this.queueSizes.get(origin) ?? 0;
  }
}
