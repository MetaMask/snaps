import {
  DEFAULT_ENDOWMENTS
} from "./chunk-BGSO2GQC.mjs";

// src/mock.ts
import crypto from "crypto";
import EventEmitter from "events";
var NETWORK_APIS = ["fetch", "Request", "Headers", "Response"];
var ALL_APIS = [
  ...DEFAULT_ENDOWMENTS,
  ...NETWORK_APIS,
  "WebAssembly"
];
function getMockSnapGlobal() {
  return { request: async () => true };
}
function getMockEthereumProvider() {
  const mockProvider = new EventEmitter();
  mockProvider.request = async () => true;
  return mockProvider;
}
var isConstructor = (value) => Boolean(typeof value?.prototype?.constructor?.name === "string");
var mockFunction = () => true;
var MockClass = class {
};
var handler = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  construct(Target, args) {
    return new Proxy(new Target(...args), handler);
  },
  get(_target, _prop) {
    return mockFunction;
  }
};
var generateMockClass = (value) => {
  return new Proxy(value, handler);
};
var mockWindow = {
  crypto,
  SubtleCrypto: MockClass
};
var generateMockEndowment = (key) => {
  const globalValue = globalThis[key];
  if (globalValue && DEFAULT_ENDOWMENTS.includes(key)) {
    return globalValue;
  }
  const globalOrMocked = globalValue ?? mockWindow[key];
  const type = typeof globalOrMocked;
  const isFunction = type === "function";
  if (isFunction && isConstructor(globalOrMocked)) {
    return generateMockClass(globalOrMocked);
  } else if (isFunction || !globalOrMocked) {
    return mockFunction;
  }
  return globalOrMocked;
};
var generateMockEndowments = () => {
  return ALL_APIS.reduce(
    (acc, cur) => ({ ...acc, [cur]: generateMockEndowment(cur) }),
    { snap: getMockSnapGlobal(), ethereum: getMockEthereumProvider() }
  );
};

export {
  ALL_APIS,
  isConstructor,
  generateMockEndowments
};
//# sourceMappingURL=chunk-63OXILAY.mjs.map