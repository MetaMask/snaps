import EventEmitter from 'events';
import crypto from 'crypto';
import { DEFAULT_ENDOWMENTS } from '@metamask/snap-utils';

const NETWORK_APIS = ['fetch', 'WebSocket'];

export const ALL_APIS: string[] = [...DEFAULT_ENDOWMENTS, ...NETWORK_APIS];

type MockSnapProvider = EventEmitter & {
  request: () => Promise<any>;
};

/**
 * Get a mock snap provider, that always returns `true` for requests.
 *
 * @returns A mocked snap provider.
 */
function getMockSnapProvider(): MockSnapProvider {
  const mockProvider = new EventEmitter() as Partial<MockSnapProvider>;
  mockProvider.request = async () => true;
  return mockProvider as MockSnapProvider;
}

/**
 * Check if a value is a constructor.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a constructor, or `false` otherwise.
 */
export const isConstructor = (value: any) =>
  Boolean(typeof value?.prototype?.constructor?.name === 'string');

/**
 * A function that always returns `true`.
 *
 * @returns `true`.
 */
const mockFunction = () => true;
class MockClass {}

const handler = {
  construct(Target: any, args: any[]): any {
    return new Proxy(new Target(...args), handler);
  },
  get(_target: any, _prop: any) {
    return mockFunction;
  },
};

/**
 * Generate a mock class for a given value. The value is wrapped in a Proxy, and
 * all methods are replaced with a mock function.
 *
 * @param value - The value to mock.
 * @returns A mock class.
 */
const generateMockClass = (value: any) => {
  return new Proxy(value, handler);
};

// Things not currently auto-mocked because of NodeJS, by adding them here we have types for them and can use that to generate mocks if needed
const mockWindow = {
  WebSocket: MockClass,
  crypto,
  SubtleCrypto: MockClass,
};

/**
 * Generate a mock endowment for a certain class or function on the `globalThis`
 * object.
 *
 * @param key - The key to generate the mock endowment for.
 * @returns A mocked class or function. If the key is part of the default
 * endowments, the original value is returned.
 */
const generateMockEndowment = (key: string) => {
  const globalValue = (globalThis as any)[key];

  // Default exposed APIs don't need to be mocked
  if (globalValue && DEFAULT_ENDOWMENTS.includes(key)) {
    return globalValue;
  }

  // Fall back to mockWindow for certain APIs not exposed in global in Node.JS
  const globalOrMocked = globalValue ?? (mockWindow as any)[key];

  const type = typeof globalOrMocked;
  const isFunction = type === 'function';
  if (isFunction && isConstructor(globalOrMocked)) {
    return generateMockClass(globalOrMocked);
  } else if (isFunction || !globalOrMocked) {
    // Fall back to function mock for now
    return mockFunction;
  }
  return globalOrMocked;
};

/**
 * Generate mock endowments for all the APIs as defined in {@link ALL_APIS}.
 *
 * @returns A map of endowments.
 */
export const generateMockEndowments = () => {
  return ALL_APIS.reduce<Record<string, any>>(
    (acc, cur) => ({ ...acc, [cur]: generateMockEndowment(cur) }),
    { wallet: getMockSnapProvider() },
  );
};
