import EventEmitter from 'events';
import { DEFAULT_EXPOSED_APIS } from '@metamask/snap-controllers';

const NETWORK_APIS = ['fetch', 'WebSocket'];

export const ALL_APIS: string[] = [...DEFAULT_EXPOSED_APIS, ...NETWORK_APIS];

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
  Boolean(value.prototype) && Boolean(value.prototype.constructor.name);

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

// Things not currently auto-mocked because of NodeJS
// There are others that are just auto-mocked as functions because they don't exist on NodeJS global, but perhaps shouldn't be?
const mockWindow = {
  WebSocket: generateMockClass(MockClass),
};

const generateMockEndowment = (key: string) => {
  const globalValue = (global as any)[key];
  if (!globalValue && key in mockWindow) {
    return (mockWindow as any)[key];
  }
  const type = typeof globalValue;
  const isFunction = type === 'function';
  if (isFunction && isConstructor(globalValue)) {
    return generateMockClass(globalValue);
  } else if (isFunction || !globalValue) {
    // Fall back to function mock for now
    return mockFunction;
  }
  return globalValue;
};

export const generateMockEndowments = () => {
  return ALL_APIS.reduce<Record<string, any>>(
    (acc, cur) => ({ ...acc, [cur]: generateMockEndowment(cur) }),
    { wallet: getMockSnapProvider() },
  );
};
