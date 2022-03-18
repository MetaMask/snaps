export class ReentrancyGuard {
  private readonly decrementLock: Map<string, boolean>;

  constructor() {
    this.decrementLock = new Map<string, boolean>();
  }

  /**
   * Sets the lock status for an origin as a guard against
   * a function being called multiple times
   * @param origin
   * @param lockStatus
   */
  public setDecrementLock(origin: string, lockStatus: boolean) {
    this.decrementLock.set(origin, lockStatus);
  }

  /**
   * Get the lock status for an origin
   * @param origin
   * @returns boolean
   */
  public getDecrementLockStatus(origin: string): boolean {
    return this.decrementLock.get(origin) ?? false;
  }
}
