import { createStore } from 'jotai';
import { describe, it, expect } from 'vitest';

import { historyAtom, persistedHistoryAtom } from './state';

describe('historyAtom', () => {
  describe('add', () => {
    it('adds a new entry to the history', () => {
      const store = createStore();

      expect(store.get(historyAtom)).toStrictEqual([]);

      const request = {
        id: '1',
        title: 'Test',
        request: JSON.stringify({ method: 'test' }),
        timestamp: Date.now(),
      };

      store.set(historyAtom, {
        type: 'add',
        payload: request,
      });

      expect(store.get(historyAtom)).toStrictEqual([request]);
    });

    it('adds entries to the start of the array', () => {
      const store = createStore();
      store.set(persistedHistoryAtom, [
        {
          id: '1',
          title: 'Test',
          request: JSON.stringify({ method: 'test' }),
          timestamp: Date.now(),
        },
      ]);

      const request = {
        id: '2',
        title: 'Test 2',
        request: JSON.stringify({ method: 'test' }),
        timestamp: Date.now(),
      };

      store.set(historyAtom, {
        type: 'add',
        payload: request,
      });

      expect(store.get(historyAtom)).toStrictEqual([
        request,
        expect.any(Object),
      ]);
    });
  });

  describe('remove', () => {
    it('removes an entry from the history', () => {
      const store = createStore();
      const request = {
        id: '1',
        title: 'Test',
        request: JSON.stringify({ method: 'test' }),
        timestamp: Date.now(),
      };

      store.set(persistedHistoryAtom, [request]);

      store.set(historyAtom, {
        type: 'remove',
        payload: request,
      });

      expect(store.get(historyAtom)).toStrictEqual([]);
    });
  });

  describe('update', () => {
    it('updates an entry in the history', () => {
      const store = createStore();
      const firstRequest = {
        id: '1',
        title: 'Test',
        request: JSON.stringify({ method: 'test' }),
        timestamp: Date.now(),
      };

      const secondRequst = {
        id: '2',
        title: 'Test 2',
        request: JSON.stringify({ method: 'test' }),
        timestamp: Date.now(),
      };

      store.set(persistedHistoryAtom, [firstRequest, secondRequst]);

      const updatedRequest = {
        ...secondRequst,
        title: 'Updated Test',
      };

      store.set(historyAtom, {
        type: 'update',
        payload: updatedRequest,
      });

      expect(store.get(historyAtom)).toStrictEqual([
        firstRequest,
        updatedRequest,
      ]);
    });
  });
});
