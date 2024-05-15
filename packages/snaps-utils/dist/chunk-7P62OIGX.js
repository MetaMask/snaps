"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _chunkN722KRZWjs = require('./chunk-N722KRZW.js');

// src/mock.ts
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _events = require('events'); var _events2 = _interopRequireDefault(_events);
var NETWORK_APIS = ["fetch", "Request", "Headers", "Response"];
var ALL_APIS = [
  ..._chunkN722KRZWjs.DEFAULT_ENDOWMENTS,
  ...NETWORK_APIS,
  "WebAssembly"
];
function getMockSnapGlobal() {
  return { request: async () => true };
}
function getMockEthereumProvider() {
  const mockProvider = new (0, _events2.default)();
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
  crypto: _crypto2.default,
  SubtleCrypto: MockClass
};
var generateMockEndowment = (key) => {
  const globalValue = globalThis[key];
  if (globalValue && _chunkN722KRZWjs.DEFAULT_ENDOWMENTS.includes(key)) {
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





exports.ALL_APIS = ALL_APIS; exports.isConstructor = isConstructor; exports.generateMockEndowments = generateMockEndowments;
//# sourceMappingURL=chunk-7P62OIGX.js.map