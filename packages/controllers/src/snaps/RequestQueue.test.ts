import { RequestQueue } from './RequestQueue';

describe('RequestQueue', () => {
  describe('constructor', () => {
    it('creates a request queue based on a length argument', () => {
      const queue = new RequestQueue(5);
      expect(queue.maxQueue).toBe(5);
      expect(queue instanceof RequestQueue).toBe(true);
    });
  });

  describe('increment', () => {
    it('increments the lock count of a specified origin', () => {
      const origin = 'npm:filsnap';
      const queue = new RequestQueue(5);
      queue.increment(origin);
      expect(queue.get(origin)).toBe(1);
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
