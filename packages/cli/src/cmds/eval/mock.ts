import EventEmitter from 'events';
import crypto from 'crypto';
import { DEFAULT_ENDOWMENTS } from '@metamask/snap-controllers';

const NETWORK_APIS = ['fetch', 'WebSocket'];

export const ALL_APIS: string[] = [...DEFAULT_ENDOWMENTS, ...NETWORK_APIS];

type MockSnapProvider = EventEmitter & {
  registerRpcMessageHandler: () => any;
  request: () => Promise<any>;
};

function getMockSnapProvider(): MockSnapProvider {
  const mockProvider = new EventEmitter() as Partial<MockSnapProvider>;
  mockProvider.registerRpcMessageHandler = () => true;
  mockProvider.request = async () => true;
  return mockProvider as MockSnapProvider;
}

const isConstructor = (value: any) =>
  Boolean(typeof value?.prototype?.constructor?.name === 'string');

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

const generateMockClass = (value: any) => {
  return new Proxy(value, handler);
};

// Things not currently auto-mocked because of NodeJS, by adding them here we have types for them and can use that to generate mocks if needed
const mockWindow = {
  WebSocket: MockClass,
  crypto,
  SubtleCrypto: MockClass,
};

const generateMockEndowment = (key: string) => {
  const globalValue = (global as any)[key];

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

export const generateMockEndowments = () => {
  return ALL_APIS.reduce<Record<string, any>>(
    (acc, cur) => ({ ...acc, [cur]: generateMockEndowment(cur) }),
    { wallet: getMockSnapProvider() },
  );
};
