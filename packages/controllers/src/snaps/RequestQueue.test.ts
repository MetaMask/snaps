import { RequestQueue } from './RequestQueue';

describe('RequestQueue', () => {
  describe('constructor', () => {
    it('creates a request queue based on a length argument', () => {
      const queue = new RequestQueue(5);
      expect(queue.maxQueueSize).toBe(5);
    });
  });

  describe('increment', () => {
    it('increments the lock count of a specified origin', () => {
      const origin = 'npm:filsnap';
      const queue = new RequestQueue(5);
      queue.increment(origin);
      expect(queue.get(origin)).toBe(1);
    });

    it('can handle an overflow case', () => {
      const origin = 'npm:filsnap';
      const queue = new RequestQueue(5);
      queue.increment(origin);
      queue.increment(origin);
      queue.increment(origin);
      queue.increment(origin);
      queue.increment(origin);
      expect(() => queue.increment(origin)).toThrow(
        'Maximum number of requests reached. Try again later.',
      );
    });
  });

  describe('decrement', () => {
    it('decrements the lock count of a specified origin', () => {
      const origin = 'npm:filsnap';
      const queue = new RequestQueue(5);
      queue.increment(origin);
      queue.increment(origin);
      queue.increment(origin);
      queue.decrement(origin);
      expect(queue.get(origin)).toBe(2);
    });
  });

  describe('get', () => {
    it('gets the current queue count of the specified origin', () => {
      const origin = 'npm:filsnap';
      const queue = new RequestQueue(5);
      queue.increment(origin);
      queue.decrement(origin);
      queue.increment(origin);
      queue.increment(origin);
      expect(queue.get(origin)).toBe(2);
    });
  });
});
