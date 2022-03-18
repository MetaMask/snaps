import { ReentrancyGuard } from './ReentrancyGuard';
export class RequestQueue {
  public readonly maxQueue: number;

  private readonly locks: Map<string, number>;

  private readonly decrementGuard: ReentrancyGuard;

  constructor(maxQueue: number) {
    this.maxQueue = maxQueue;
    this.locks = new Map<string, number>();
    this.decrementGuard = new ReentrancyGuard();
  }

  /**
   * Increments the queue count for a particular origin
   *
   * @param origin
   */
  public increment(origin: string) {
    const currentCount = this.locks.get(origin) ?? 0;
    if (currentCount > this.maxQueue) {
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
    if (this.decrementGuard.getDecrementLockStatus(origin)) {
      throw new Error(
        `In the process of already decrementing the queue for ${origin}, try again later.`,
      );
    }
    this.decrementGuard.setDecrementLock(origin, true);
    const currentCount = this.locks.get(origin) ?? 0;
    if (currentCount === 0) {
      throw new Error(
        `Cannot decrement, ${origin} does not have any outstanding requests.`,
      );
    }
    this.locks.set(origin, currentCount - 1);
    this.decrementGuard.setDecrementLock(origin, false);
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
