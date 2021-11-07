/**
 * @param timestamp - A Unix millisecond timestamp.
 * @returns The number of milliseconds elapsed since the specified timestamp.
 */
export function timeSince(timestamp: number): number {
  return Date.now() - timestamp;
}
