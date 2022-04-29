import { EventEmitter } from 'stream';
import crypto from 'crypto';
import { generateMockEndowments, isConstructor } from './mock';

describe('mockUtils', () => {
  describe('generateMockEndowments', () => {
    it('includes mock snap provider', async () => {
      const endowments = generateMockEndowments();
      expect(endowments.wallet).toBeInstanceOf(EventEmitter);
      expect(await endowments.wallet.request()).toBe(true);
      expect(await endowments.wallet.registerRpcMessageHandler()).toBe(true);
    });

    it('returns mock class WebSocket', () => {
      const endowments = generateMockEndowments();
      const ws = new endowments.WebSocket();
      expect(ws.send()).toBe(true);
    });

    it('returns mock function for functions', () => {
      const endowments = generateMockEndowments();
      expect(endowments.btoa()).toBe(true);
    });

    it('returns some endowments unmocked', () => {
      const endowments = generateMockEndowments();
      expect(endowments.Math).toStrictEqual(Math);
      expect(endowments.console).toStrictEqual(console);
      expect(endowments.crypto).toStrictEqual(crypto);
    });
  });

  describe('isConstructor', () => {
    it('will return false for a value passed in that is not a class', () => {
      expect(isConstructor(null)).toBe(false);
    });
  });
});
