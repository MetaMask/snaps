import {
  timeout,
  interval,
  date,
  textEncoder,
  textDecoder,
  crypto,
  math,
  consoleEndowment,
  network,
  buildCommonEndowments,
} from './endowments';

describe('endowments barrel', () => {
  it.each([
    { name: 'timeout', module: timeout, expectedName: 'setTimeout' },
    { name: 'interval', module: interval, expectedName: 'setInterval' },
    { name: 'date', module: date, expectedName: 'Date' },
    { name: 'textEncoder', module: textEncoder, expectedName: 'TextEncoder' },
    { name: 'textDecoder', module: textDecoder, expectedName: 'TextDecoder' },
    { name: 'crypto', module: crypto, expectedName: 'crypto' },
    { name: 'math', module: math, expectedName: 'Math' },
    {
      name: 'consoleEndowment',
      module: consoleEndowment,
      expectedName: 'console',
    },
    { name: 'network', module: network, expectedName: 'fetch' },
  ])('exports $name with names and factory', ({ module, expectedName }) => {
    expect(module).toHaveProperty('names');
    expect(module).toHaveProperty('factory');
    expect(module.names).toContain(expectedName);
    expect(typeof module.factory).toBe('function');
  });

  it('exports buildCommonEndowments', () => {
    expect(typeof buildCommonEndowments).toBe('function');
    const factories = buildCommonEndowments();
    expect(Array.isArray(factories)).toBe(true);
    expect(factories.length).toBeGreaterThan(0);
    factories.forEach((factory) => {
      expect(factory).toHaveProperty('names');
      expect(factory).toHaveProperty('factory');
    });
  });
});
