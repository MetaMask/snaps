import { EventEmitter } from 'stream';
import crypto from 'crypto';
import { generateMockEndowments, isConstructor } from './mock';

describe('generateMockEndowments', () => {
  it('includes mock snap provider', async () => {
    const endowments = generateMockEndowments();
    expect(endowments.wallet).toBeInstanceOf(EventEmitter);
    expect(await endowments.wallet.request()).toBe(true);
  });

  it('returns mock class WebSocket', () => {
    const endowments = generateMockEndowments();
    const ws = new endowments.WebSocket();
    expect(ws.send()).toBe(true);
  });

  it('returns some endowments unmocked', () => {
    const endowments = generateMockEndowments();
    expect(endowments.Math).toBe(Math);
    expect(endowments.console).toBe(console);
    expect(endowments.crypto).toBe(crypto);
  });

  it('returns global function for functions', () => {
    const fetchMock = jest.fn().mockImplementationOnce(() => 'foo');
    Object.assign(globalThis, { ...globalThis, fetch: fetchMock });
    const endowments = generateMockEndowments();
    expect(endowments.fetch()).toBe('foo');
  });

  it('returns mock function for functions', () => {
    // Remove fetch from isomorphic-fetch if present
    Object.assign(globalThis, { ...globalThis, fetch: undefined });
    const endowments = generateMockEndowments();
    expect(endowments.fetch()).toBe(true);
  });
});

describe('isConstructor', () => {
  it('returns true for a value that is a class', () => {
    const Class = class {};

    expect(isConstructor(Class)).toBe(true);
  });

  it('returns false for a value that is not a class', () => {
    expect(isConstructor(null)).toBe(false);
  });
});
