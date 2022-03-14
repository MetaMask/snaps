import { EventEmitter } from 'stream';
import { generateMockEndowments } from './mock';

describe('generateMockEndowments', () => {
  it('includes mock snap provider', async () => {
    const endowments = generateMockEndowments();
    expect(endowments.wallet).toBeInstanceOf(EventEmitter);
    expect(await endowments.wallet.request()).toBe(true);
    expect(await endowments.wallet.registerRpcMessageHandler()).toBe(true);
  });

  it('returns mock class for classes', () => {
    const endowments = generateMockEndowments();
    const d = new endowments.Date();
    expect(d.getTime()).toBe(true);
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
  });
});
