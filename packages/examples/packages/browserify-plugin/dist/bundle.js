(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }
    g.snap = f();
  }
})(function () {
  var define, module, exports;
  return function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = "function" == typeof require && require;
            if (!f && c) return c(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw a.code = "MODULE_NOT_FOUND", a;
          }
          var p = n[i] = {
            exports: {}
          };
          e[i][0].call(p.exports, function (r) {
            var n = e[i][1][r];
            return o(n || r);
          }, p, p.exports, r, e, n, t);
        }
        return n[i].exports;
      }
      for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
      return o;
    }
    return r;
  }()({
    1: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      var errorCodes = {
        rpc: {
          invalidInput: -32e3,
          resourceNotFound: -32001,
          resourceUnavailable: -32002,
          transactionRejected: -32003,
          methodNotSupported: -32004,
          limitExceeded: -32005,
          parse: -32700,
          invalidRequest: -32600,
          methodNotFound: -32601,
          invalidParams: -32602,
          internal: -32603
        },
        provider: {
          userRejectedRequest: 4001,
          unauthorized: 4100,
          unsupportedMethod: 4200,
          disconnected: 4900,
          chainDisconnected: 4901
        }
      };
      var errorValues = {
        "-32700": {
          standard: "JSON RPC 2.0",
          message: "Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text."
        },
        "-32600": {
          standard: "JSON RPC 2.0",
          message: "The JSON sent is not a valid Request object."
        },
        "-32601": {
          standard: "JSON RPC 2.0",
          message: "The method does not exist / is not available."
        },
        "-32602": {
          standard: "JSON RPC 2.0",
          message: "Invalid method parameter(s)."
        },
        "-32603": {
          standard: "JSON RPC 2.0",
          message: "Internal JSON-RPC error."
        },
        "-32000": {
          standard: "EIP-1474",
          message: "Invalid input."
        },
        "-32001": {
          standard: "EIP-1474",
          message: "Resource not found."
        },
        "-32002": {
          standard: "EIP-1474",
          message: "Resource unavailable."
        },
        "-32003": {
          standard: "EIP-1474",
          message: "Transaction rejected."
        },
        "-32004": {
          standard: "EIP-1474",
          message: "Method not supported."
        },
        "-32005": {
          standard: "EIP-1474",
          message: "Request limit exceeded."
        },
        "4001": {
          standard: "EIP-1193",
          message: "User rejected the request."
        },
        "4100": {
          standard: "EIP-1193",
          message: "The requested account and/or method has not been authorized by the user."
        },
        "4200": {
          standard: "EIP-1193",
          message: "The requested method is not supported by this Ethereum provider."
        },
        "4900": {
          standard: "EIP-1193",
          message: "The provider is disconnected from all chains."
        },
        "4901": {
          standard: "EIP-1193",
          message: "The provider is disconnected from the specified chain."
        }
      };
      exports.errorCodes = errorCodes;
      exports.errorValues = errorValues;
    }, {}],
    2: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      function _nullishCoalesce(lhs, rhsFn) {
        if (lhs != null) {
          return lhs;
        } else {
          return rhsFn();
        }
      }
      var _chunkPV5NRPSSjs = require('./chunk-PV5NRPSS.js');
      var _chunkXOYARAPPjs = require('./chunk-XOYARAPP.js');
      var _chunkFBHPY3A4js = require('./chunk-FBHPY3A4.js');
      var rpcErrors = {
        parse: arg => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.parse, arg),
        invalidRequest: arg => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.invalidRequest, arg),
        invalidParams: arg => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.invalidParams, arg),
        methodNotFound: arg => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.methodNotFound, arg),
        internal: arg => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.internal, arg),
        server: opts => {
          if (!opts || typeof opts !== "object" || Array.isArray(opts)) {
            throw new Error("Ethereum RPC Server errors must provide single object argument.");
          }
          const {
            code
          } = opts;
          if (!Number.isInteger(code) || code > -32005 || code < -32099) {
            throw new Error('"code" must be an integer such that: -32099 <= code <= -32005');
          }
          return getJsonRpcError(code, opts);
        },
        invalidInput: arg => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.invalidInput, arg),
        resourceNotFound: arg => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.resourceNotFound, arg),
        resourceUnavailable: arg => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.resourceUnavailable, arg),
        transactionRejected: arg => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.transactionRejected, arg),
        methodNotSupported: arg => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.methodNotSupported, arg),
        limitExceeded: arg => getJsonRpcError(_chunkFBHPY3A4js.errorCodes.rpc.limitExceeded, arg)
      };
      var providerErrors = {
        userRejectedRequest: arg => {
          return getEthProviderError(_chunkFBHPY3A4js.errorCodes.provider.userRejectedRequest, arg);
        },
        unauthorized: arg => {
          return getEthProviderError(_chunkFBHPY3A4js.errorCodes.provider.unauthorized, arg);
        },
        unsupportedMethod: arg => {
          return getEthProviderError(_chunkFBHPY3A4js.errorCodes.provider.unsupportedMethod, arg);
        },
        disconnected: arg => {
          return getEthProviderError(_chunkFBHPY3A4js.errorCodes.provider.disconnected, arg);
        },
        chainDisconnected: arg => {
          return getEthProviderError(_chunkFBHPY3A4js.errorCodes.provider.chainDisconnected, arg);
        },
        custom: opts => {
          if (!opts || typeof opts !== "object" || Array.isArray(opts)) {
            throw new Error("Ethereum Provider custom errors must provide single object argument.");
          }
          const {
            code,
            message,
            data
          } = opts;
          if (!message || typeof message !== "string") {
            throw new Error('"message" must be a nonempty string');
          }
          return new (0, _chunkPV5NRPSSjs.EthereumProviderError)(code, message, data);
        }
      };
      function getJsonRpcError(code, arg) {
        const [message, data] = parseOpts(arg);
        return new (0, _chunkPV5NRPSSjs.JsonRpcError)(code, _nullishCoalesce(message, () => _chunkXOYARAPPjs.getMessageFromCode.call(void 0, code)), data);
      }
      function getEthProviderError(code, arg) {
        const [message, data] = parseOpts(arg);
        return new (0, _chunkPV5NRPSSjs.EthereumProviderError)(code, _nullishCoalesce(message, () => _chunkXOYARAPPjs.getMessageFromCode.call(void 0, code)), data);
      }
      function parseOpts(arg) {
        if (arg) {
          if (typeof arg === "string") {
            return [arg];
          } else if (typeof arg === "object" && !Array.isArray(arg)) {
            const {
              message,
              data
            } = arg;
            if (message && typeof message !== "string") {
              throw new Error("Must specify string message.");
            }
            return [_nullishCoalesce(message, () => void 0), data];
          }
        }
        return [];
      }
      exports.rpcErrors = rpcErrors;
      exports.providerErrors = providerErrors;
    }, {
      "./chunk-FBHPY3A4.js": 1,
      "./chunk-PV5NRPSS.js": 3,
      "./chunk-XOYARAPP.js": 4
    }],
    3: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }
      var _chunkXOYARAPPjs = require('./chunk-XOYARAPP.js');
      var _utils = require('@metamask/utils');
      var _fastsafestringify = require('fast-safe-stringify');
      var _fastsafestringify2 = _interopRequireDefault(_fastsafestringify);
      var JsonRpcError = class extends Error {
        constructor(code, message, data) {
          var __super = (...args) => {
            super(...args);
          };
          if (!Number.isInteger(code)) {
            throw new Error('"code" must be an integer.');
          }
          if (!message || typeof message !== "string") {
            throw new Error('"message" must be a non-empty string.');
          }
          if (_chunkXOYARAPPjs.dataHasCause.call(void 0, data)) {
            __super(message, {
              cause: data.cause
            });
            if (!_utils.hasProperty.call(void 0, this, "cause")) {
              Object.assign(this, {
                cause: data.cause
              });
            }
          } else {
            __super(message);
          }
          if (data !== void 0) {
            this.data = data;
          }
          this.code = code;
        }
        serialize() {
          const serialized = {
            code: this.code,
            message: this.message
          };
          if (this.data !== void 0) {
            serialized.data = this.data;
            if (_utils.isPlainObject.call(void 0, this.data)) {
              serialized.data.cause = _chunkXOYARAPPjs.serializeCause.call(void 0, this.data.cause);
            }
          }
          if (this.stack) {
            serialized.stack = this.stack;
          }
          return serialized;
        }
        toString() {
          return _fastsafestringify2.default.call(void 0, this.serialize(), stringifyReplacer, 2);
        }
      };
      var EthereumProviderError = class extends JsonRpcError {
        constructor(code, message, data) {
          if (!isValidEthProviderCode(code)) {
            throw new Error('"code" must be an integer such that: 1000 <= code <= 4999');
          }
          super(code, message, data);
        }
      };
      function isValidEthProviderCode(code) {
        return Number.isInteger(code) && code >= 1e3 && code <= 4999;
      }
      function stringifyReplacer(_, value) {
        if (value === "[Circular]") {
          return void 0;
        }
        return value;
      }
      exports.JsonRpcError = JsonRpcError;
      exports.EthereumProviderError = EthereumProviderError;
    }, {
      "./chunk-XOYARAPP.js": 4,
      "@metamask/utils": 24,
      "fast-safe-stringify": 46
    }],
    4: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      var _chunkFBHPY3A4js = require('./chunk-FBHPY3A4.js');
      var _utils = require('@metamask/utils');
      var FALLBACK_ERROR_CODE = _chunkFBHPY3A4js.errorCodes.rpc.internal;
      var FALLBACK_MESSAGE = "Unspecified error message. This is a bug, please report it.";
      var FALLBACK_ERROR = {
        code: FALLBACK_ERROR_CODE,
        message: getMessageFromCode(FALLBACK_ERROR_CODE)
      };
      var JSON_RPC_SERVER_ERROR_MESSAGE = "Unspecified server error.";
      function getMessageFromCode(code, fallbackMessage = FALLBACK_MESSAGE) {
        if (isValidCode(code)) {
          const codeString = code.toString();
          if (_utils.hasProperty.call(void 0, _chunkFBHPY3A4js.errorValues, codeString)) {
            return _chunkFBHPY3A4js.errorValues[codeString].message;
          }
          if (isJsonRpcServerError(code)) {
            return JSON_RPC_SERVER_ERROR_MESSAGE;
          }
        }
        return fallbackMessage;
      }
      function isValidCode(code) {
        return Number.isInteger(code);
      }
      function serializeError(error, {
        fallbackError = FALLBACK_ERROR,
        shouldIncludeStack = true
      } = {}) {
        if (!_utils.isJsonRpcError.call(void 0, fallbackError)) {
          throw new Error("Must provide fallback error with integer number code and string message.");
        }
        const serialized = buildError(error, fallbackError);
        if (!shouldIncludeStack) {
          delete serialized.stack;
        }
        return serialized;
      }
      function buildError(error, fallbackError) {
        if (error && typeof error === "object" && "serialize" in error && typeof error.serialize === "function") {
          return error.serialize();
        }
        if (_utils.isJsonRpcError.call(void 0, error)) {
          return error;
        }
        const cause = serializeCause(error);
        const fallbackWithCause = {
          ...fallbackError,
          data: {
            cause
          }
        };
        return fallbackWithCause;
      }
      function isJsonRpcServerError(code) {
        return code >= -32099 && code <= -32e3;
      }
      function serializeCause(error) {
        if (Array.isArray(error)) {
          return error.map(entry => {
            if (_utils.isValidJson.call(void 0, entry)) {
              return entry;
            } else if (_utils.isObject.call(void 0, entry)) {
              return serializeObject(entry);
            }
            return null;
          });
        } else if (_utils.isObject.call(void 0, error)) {
          return serializeObject(error);
        }
        if (_utils.isValidJson.call(void 0, error)) {
          return error;
        }
        return null;
      }
      function serializeObject(object) {
        return Object.getOwnPropertyNames(object).reduce((acc, key) => {
          const value = object[key];
          if (_utils.isValidJson.call(void 0, value)) {
            acc[key] = value;
          }
          return acc;
        }, {});
      }
      function dataHasCause(data) {
        return _utils.isObject.call(void 0, data) && _utils.hasProperty.call(void 0, data, "cause") && _utils.isObject.call(void 0, data.cause);
      }
      exports.JSON_RPC_SERVER_ERROR_MESSAGE = JSON_RPC_SERVER_ERROR_MESSAGE;
      exports.getMessageFromCode = getMessageFromCode;
      exports.isValidCode = isValidCode;
      exports.serializeError = serializeError;
      exports.serializeCause = serializeCause;
      exports.dataHasCause = dataHasCause;
    }, {
      "./chunk-FBHPY3A4.js": 1,
      "@metamask/utils": 24
    }],
    5: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      var _chunkHJCBU6QBjs = require('./chunk-HJCBU6QB.js');
      var _chunkPV5NRPSSjs = require('./chunk-PV5NRPSS.js');
      var _chunkXOYARAPPjs = require('./chunk-XOYARAPP.js');
      var _chunkFBHPY3A4js = require('./chunk-FBHPY3A4.js');
      exports.EthereumProviderError = _chunkPV5NRPSSjs.EthereumProviderError;
      exports.JsonRpcError = _chunkPV5NRPSSjs.JsonRpcError;
      exports.dataHasCause = _chunkXOYARAPPjs.dataHasCause;
      exports.errorCodes = _chunkFBHPY3A4js.errorCodes;
      exports.getMessageFromCode = _chunkXOYARAPPjs.getMessageFromCode;
      exports.providerErrors = _chunkHJCBU6QBjs.providerErrors;
      exports.rpcErrors = _chunkHJCBU6QBjs.rpcErrors;
      exports.serializeCause = _chunkXOYARAPPjs.serializeCause;
      exports.serializeError = _chunkXOYARAPPjs.serializeError;
    }, {
      "./chunk-FBHPY3A4.js": 1,
      "./chunk-HJCBU6QB.js": 2,
      "./chunk-PV5NRPSS.js": 3,
      "./chunk-XOYARAPP.js": 4
    }],
    6: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.StructError = void 0;
      class StructError extends TypeError {
        constructor(failure, failures) {
          let cached;
          const {
            message,
            explanation,
            ...rest
          } = failure;
          const {
            path
          } = failure;
          const cause = path.length === 0 ? message : `At path: ${path.join('.')} -- ${message}`;
          super(explanation ?? cause);
          if (explanation !== null && explanation !== undefined) {
            this.cause = cause;
          }
          Object.assign(this, rest);
          this.name = this.constructor.name;
          this.failures = () => {
            return cached ?? (cached = [failure, ...failures()]);
          };
        }
      }
      exports.StructError = StructError;
    }, {}],
    7: [function (require, module, exports) {
      "use strict";

      var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            }
          };
        }
        Object.defineProperty(o, k2, desc);
      } : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = this && this.__exportStar || function (m, exports) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
      };
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      __exportStar(require("./error.cjs"), exports);
      __exportStar(require("./struct.cjs"), exports);
      __exportStar(require("./structs/coercions.cjs"), exports);
      __exportStar(require("./structs/refinements.cjs"), exports);
      __exportStar(require("./structs/types.cjs"), exports);
      __exportStar(require("./structs/utilities.cjs"), exports);
    }, {
      "./error.cjs": 6,
      "./struct.cjs": 8,
      "./structs/coercions.cjs": 9,
      "./structs/refinements.cjs": 10,
      "./structs/types.cjs": 11,
      "./structs/utilities.cjs": 12
    }],
    8: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.validate = exports.is = exports.mask = exports.create = exports.assert = exports.Struct = void 0;
      const error_js_1 = require("./error.cjs");
      const utils_js_1 = require("./utils.cjs");
      class Struct {
        constructor(props) {
          const {
            type,
            schema,
            validator,
            refiner,
            coercer = value => value,
            entries = function* () {}
          } = props;
          this.type = type;
          this.schema = schema;
          this.entries = entries;
          this.coercer = coercer;
          if (validator) {
            this.validator = (value, context) => {
              const result = validator(value, context);
              return (0, utils_js_1.toFailures)(result, context, this, value);
            };
          } else {
            this.validator = () => [];
          }
          if (refiner) {
            this.refiner = (value, context) => {
              const result = refiner(value, context);
              return (0, utils_js_1.toFailures)(result, context, this, value);
            };
          } else {
            this.refiner = () => [];
          }
        }
        assert(value, message) {
          return assert(value, this, message);
        }
        create(value, message) {
          return create(value, this, message);
        }
        is(value) {
          return is(value, this);
        }
        mask(value, message) {
          return mask(value, this, message);
        }
        validate(value, options = {}) {
          return validate(value, this, options);
        }
      }
      exports.Struct = Struct;
      function assert(value, struct, message) {
        const result = validate(value, struct, {
          message
        });
        if (result[0]) {
          throw result[0];
        }
      }
      exports.assert = assert;
      function create(value, struct, message) {
        const result = validate(value, struct, {
          coerce: true,
          message
        });
        if (result[0]) {
          throw result[0];
        } else {
          return result[1];
        }
      }
      exports.create = create;
      function mask(value, struct, message) {
        const result = validate(value, struct, {
          coerce: true,
          mask: true,
          message
        });
        if (result[0]) {
          throw result[0];
        } else {
          return result[1];
        }
      }
      exports.mask = mask;
      function is(value, struct) {
        const result = validate(value, struct);
        return !result[0];
      }
      exports.is = is;
      function validate(value, struct, options = {}) {
        const tuples = (0, utils_js_1.run)(value, struct, options);
        const tuple = (0, utils_js_1.shiftIterator)(tuples);
        if (tuple[0]) {
          const error = new error_js_1.StructError(tuple[0], function* () {
            for (const innerTuple of tuples) {
              if (innerTuple[0]) {
                yield innerTuple[0];
              }
            }
          });
          return [error, undefined];
        }
        const validatedValue = tuple[1];
        return [undefined, validatedValue];
      }
      exports.validate = validate;
    }, {
      "./error.cjs": 6,
      "./utils.cjs": 13
    }],
    9: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.trimmed = exports.defaulted = exports.coerce = void 0;
      const struct_js_1 = require("../struct.cjs");
      const utils_js_1 = require("../utils.cjs");
      const types_js_1 = require("./types.cjs");
      function coerce(struct, condition, coercer) {
        return new struct_js_1.Struct({
          ...struct,
          coercer: (value, ctx) => {
            return (0, struct_js_1.is)(value, condition) ? struct.coercer(coercer(value, ctx), ctx) : struct.coercer(value, ctx);
          }
        });
      }
      exports.coerce = coerce;
      function defaulted(struct, fallback, options = {}) {
        return coerce(struct, (0, types_js_1.unknown)(), value => {
          const result = typeof fallback === 'function' ? fallback() : fallback;
          if (value === undefined) {
            return result;
          }
          if (!options.strict && (0, utils_js_1.isPlainObject)(value) && (0, utils_js_1.isPlainObject)(result)) {
            const ret = {
              ...value
            };
            let changed = false;
            for (const key in result) {
              if (ret[key] === undefined) {
                ret[key] = result[key];
                changed = true;
              }
            }
            if (changed) {
              return ret;
            }
          }
          return value;
        });
      }
      exports.defaulted = defaulted;
      function trimmed(struct) {
        return coerce(struct, (0, types_js_1.string)(), value => value.trim());
      }
      exports.trimmed = trimmed;
    }, {
      "../struct.cjs": 8,
      "../utils.cjs": 13,
      "./types.cjs": 11
    }],
    10: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.refine = exports.size = exports.pattern = exports.nonempty = exports.min = exports.max = exports.empty = void 0;
      const struct_js_1 = require("../struct.cjs");
      const utils_js_1 = require("../utils.cjs");
      function empty(struct) {
        return refine(struct, 'empty', value => {
          const size = getSize(value);
          return size === 0 || `Expected an empty ${struct.type} but received one with a size of \`${size}\``;
        });
      }
      exports.empty = empty;
      function getSize(value) {
        if (value instanceof Map || value instanceof Set) {
          return value.size;
        }
        return value.length;
      }
      function max(struct, threshold, options = {}) {
        const {
          exclusive
        } = options;
        return refine(struct, 'max', value => {
          return exclusive ? value < threshold : value <= threshold || `Expected a ${struct.type} less than ${exclusive ? '' : 'or equal to '}${threshold} but received \`${value}\``;
        });
      }
      exports.max = max;
      function min(struct, threshold, options = {}) {
        const {
          exclusive
        } = options;
        return refine(struct, 'min', value => {
          return exclusive ? value > threshold : value >= threshold || `Expected a ${struct.type} greater than ${exclusive ? '' : 'or equal to '}${threshold} but received \`${value}\``;
        });
      }
      exports.min = min;
      function nonempty(struct) {
        return refine(struct, 'nonempty', value => {
          const size = getSize(value);
          return size > 0 || `Expected a nonempty ${struct.type} but received an empty one`;
        });
      }
      exports.nonempty = nonempty;
      function pattern(struct, regexp) {
        return refine(struct, 'pattern', value => {
          return regexp.test(value) || `Expected a ${struct.type} matching \`/${regexp.source}/\` but received "${value}"`;
        });
      }
      exports.pattern = pattern;
      function size(struct, minimum, maximum = minimum) {
        const expected = `Expected a ${struct.type}`;
        const of = minimum === maximum ? `of \`${minimum}\`` : `between \`${minimum}\` and \`${maximum}\``;
        return refine(struct, 'size', value => {
          if (typeof value === 'number' || value instanceof Date) {
            return minimum <= value && value <= maximum || `${expected} ${of} but received \`${value}\``;
          } else if (value instanceof Map || value instanceof Set) {
            const {
              size
            } = value;
            return minimum <= size && size <= maximum || `${expected} with a size ${of} but received one with a size of \`${size}\``;
          }
          const {
            length
          } = value;
          return minimum <= length && length <= maximum || `${expected} with a length ${of} but received one with a length of \`${length}\``;
        });
      }
      exports.size = size;
      function refine(struct, name, refiner) {
        return new struct_js_1.Struct({
          ...struct,
          *refiner(value, ctx) {
            yield* struct.refiner(value, ctx);
            const result = refiner(value, ctx);
            const failures = (0, utils_js_1.toFailures)(result, ctx, struct, value);
            for (const failure of failures) {
              yield {
                ...failure,
                refinement: name
              };
            }
          }
        });
      }
      exports.refine = refine;
    }, {
      "../struct.cjs": 8,
      "../utils.cjs": 13
    }],
    11: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.unknown = exports.union = exports.type = exports.tuple = exports.string = exports.set = exports.regexp = exports.record = exports.optional = exports.object = exports.number = exports.nullable = exports.never = exports.map = exports.literal = exports.intersection = exports.integer = exports.instance = exports.func = exports.enums = exports.date = exports.boolean = exports.bigint = exports.array = exports.any = void 0;
      const struct_js_1 = require("../struct.cjs");
      const utils_js_1 = require("../utils.cjs");
      const utilities_js_1 = require("./utilities.cjs");
      function any() {
        return (0, utilities_js_1.define)('any', () => true);
      }
      exports.any = any;
      function array(Element) {
        return new struct_js_1.Struct({
          type: 'array',
          schema: Element,
          *entries(value) {
            if (Element && Array.isArray(value)) {
              for (const [index, arrayValue] of value.entries()) {
                yield [index, arrayValue, Element];
              }
            }
          },
          coercer(value) {
            return Array.isArray(value) ? value.slice() : value;
          },
          validator(value) {
            return Array.isArray(value) || `Expected an array value, but received: ${(0, utils_js_1.print)(value)}`;
          }
        });
      }
      exports.array = array;
      function bigint() {
        return (0, utilities_js_1.define)('bigint', value => {
          return typeof value === 'bigint';
        });
      }
      exports.bigint = bigint;
      function boolean() {
        return (0, utilities_js_1.define)('boolean', value => {
          return typeof value === 'boolean';
        });
      }
      exports.boolean = boolean;
      function date() {
        return (0, utilities_js_1.define)('date', value => {
          return value instanceof Date && !isNaN(value.getTime()) || `Expected a valid \`Date\` object, but received: ${(0, utils_js_1.print)(value)}`;
        });
      }
      exports.date = date;
      function enums(values) {
        const schema = {};
        const description = values.map(value => (0, utils_js_1.print)(value)).join();
        for (const key of values) {
          schema[key] = key;
        }
        return new struct_js_1.Struct({
          type: 'enums',
          schema,
          validator(value) {
            return values.includes(value) || `Expected one of \`${description}\`, but received: ${(0, utils_js_1.print)(value)}`;
          }
        });
      }
      exports.enums = enums;
      function func() {
        return (0, utilities_js_1.define)('func', value => {
          return typeof value === 'function' || `Expected a function, but received: ${(0, utils_js_1.print)(value)}`;
        });
      }
      exports.func = func;
      function instance(Class) {
        return (0, utilities_js_1.define)('instance', value => {
          return value instanceof Class || `Expected a \`${Class.name}\` instance, but received: ${(0, utils_js_1.print)(value)}`;
        });
      }
      exports.instance = instance;
      function integer() {
        return (0, utilities_js_1.define)('integer', value => {
          return typeof value === 'number' && !isNaN(value) && Number.isInteger(value) || `Expected an integer, but received: ${(0, utils_js_1.print)(value)}`;
        });
      }
      exports.integer = integer;
      function intersection(Structs) {
        return new struct_js_1.Struct({
          type: 'intersection',
          schema: null,
          *entries(value, context) {
            for (const {
              entries
            } of Structs) {
              yield* entries(value, context);
            }
          },
          *validator(value, context) {
            for (const {
              validator
            } of Structs) {
              yield* validator(value, context);
            }
          },
          *refiner(value, context) {
            for (const {
              refiner
            } of Structs) {
              yield* refiner(value, context);
            }
          }
        });
      }
      exports.intersection = intersection;
      function literal(constant) {
        const description = (0, utils_js_1.print)(constant);
        const valueType = typeof constant;
        return new struct_js_1.Struct({
          type: 'literal',
          schema: valueType === 'string' || valueType === 'number' || valueType === 'boolean' ? constant : null,
          validator(value) {
            return value === constant || `Expected the literal \`${description}\`, but received: ${(0, utils_js_1.print)(value)}`;
          }
        });
      }
      exports.literal = literal;
      function map(Key, Value) {
        return new struct_js_1.Struct({
          type: 'map',
          schema: null,
          *entries(value) {
            if (Key && Value && value instanceof Map) {
              for (const [mapKey, mapValue] of value.entries()) {
                yield [mapKey, mapKey, Key];
                yield [mapKey, mapValue, Value];
              }
            }
          },
          coercer(value) {
            return value instanceof Map ? new Map(value) : value;
          },
          validator(value) {
            return value instanceof Map || `Expected a \`Map\` object, but received: ${(0, utils_js_1.print)(value)}`;
          }
        });
      }
      exports.map = map;
      function never() {
        return (0, utilities_js_1.define)('never', () => false);
      }
      exports.never = never;
      function nullable(struct) {
        return new struct_js_1.Struct({
          ...struct,
          validator: (value, ctx) => value === null || struct.validator(value, ctx),
          refiner: (value, ctx) => value === null || struct.refiner(value, ctx)
        });
      }
      exports.nullable = nullable;
      function number() {
        return (0, utilities_js_1.define)('number', value => {
          return typeof value === 'number' && !isNaN(value) || `Expected a number, but received: ${(0, utils_js_1.print)(value)}`;
        });
      }
      exports.number = number;
      function object(schema) {
        const knowns = schema ? Object.keys(schema) : [];
        const Never = never();
        return new struct_js_1.Struct({
          type: 'object',
          schema: schema ?? null,
          *entries(value) {
            if (schema && (0, utils_js_1.isObject)(value)) {
              const unknowns = new Set(Object.keys(value));
              for (const key of knowns) {
                unknowns.delete(key);
                yield [key, value[key], schema[key]];
              }
              for (const key of unknowns) {
                yield [key, value[key], Never];
              }
            }
          },
          validator(value) {
            return (0, utils_js_1.isObject)(value) || `Expected an object, but received: ${(0, utils_js_1.print)(value)}`;
          },
          coercer(value) {
            return (0, utils_js_1.isObject)(value) ? {
              ...value
            } : value;
          }
        });
      }
      exports.object = object;
      function optional(struct) {
        return new struct_js_1.Struct({
          ...struct,
          validator: (value, ctx) => value === undefined || struct.validator(value, ctx),
          refiner: (value, ctx) => value === undefined || struct.refiner(value, ctx)
        });
      }
      exports.optional = optional;
      function record(Key, Value) {
        return new struct_js_1.Struct({
          type: 'record',
          schema: null,
          *entries(value) {
            if ((0, utils_js_1.isObject)(value)) {
              for (const objectKey in value) {
                const objectValue = value[objectKey];
                yield [objectKey, objectKey, Key];
                yield [objectKey, objectValue, Value];
              }
            }
          },
          validator(value) {
            return (0, utils_js_1.isObject)(value) || `Expected an object, but received: ${(0, utils_js_1.print)(value)}`;
          }
        });
      }
      exports.record = record;
      function regexp() {
        return (0, utilities_js_1.define)('regexp', value => {
          return value instanceof RegExp;
        });
      }
      exports.regexp = regexp;
      function set(Element) {
        return new struct_js_1.Struct({
          type: 'set',
          schema: null,
          *entries(value) {
            if (Element && value instanceof Set) {
              for (const setValue of value) {
                yield [setValue, setValue, Element];
              }
            }
          },
          coercer(value) {
            return value instanceof Set ? new Set(value) : value;
          },
          validator(value) {
            return value instanceof Set || `Expected a \`Set\` object, but received: ${(0, utils_js_1.print)(value)}`;
          }
        });
      }
      exports.set = set;
      function string() {
        return (0, utilities_js_1.define)('string', value => {
          return typeof value === 'string' || `Expected a string, but received: ${(0, utils_js_1.print)(value)}`;
        });
      }
      exports.string = string;
      function tuple(Structs) {
        const Never = never();
        return new struct_js_1.Struct({
          type: 'tuple',
          schema: null,
          *entries(value) {
            if (Array.isArray(value)) {
              const length = Math.max(Structs.length, value.length);
              for (let i = 0; i < length; i++) {
                yield [i, value[i], Structs[i] || Never];
              }
            }
          },
          validator(value) {
            return Array.isArray(value) || `Expected an array, but received: ${(0, utils_js_1.print)(value)}`;
          }
        });
      }
      exports.tuple = tuple;
      function type(schema) {
        const keys = Object.keys(schema);
        return new struct_js_1.Struct({
          type: 'type',
          schema,
          *entries(value) {
            if ((0, utils_js_1.isObject)(value)) {
              for (const k of keys) {
                yield [k, value[k], schema[k]];
              }
            }
          },
          validator(value) {
            return (0, utils_js_1.isObject)(value) || `Expected an object, but received: ${(0, utils_js_1.print)(value)}`;
          },
          coercer(value) {
            return (0, utils_js_1.isObject)(value) ? {
              ...value
            } : value;
          }
        });
      }
      exports.type = type;
      function union(Structs) {
        const description = Structs.map(struct => struct.type).join(' | ');
        return new struct_js_1.Struct({
          type: 'union',
          schema: null,
          coercer(value) {
            for (const InnerStruct of Structs) {
              const [error, coerced] = InnerStruct.validate(value, {
                coerce: true
              });
              if (!error) {
                return coerced;
              }
            }
            return value;
          },
          validator(value, ctx) {
            const failures = [];
            for (const InnerStruct of Structs) {
              const [...tuples] = (0, utils_js_1.run)(value, InnerStruct, ctx);
              const [first] = tuples;
              if (!first?.[0]) {
                return [];
              }
              for (const [failure] of tuples) {
                if (failure) {
                  failures.push(failure);
                }
              }
            }
            return [`Expected the value to satisfy a union of \`${description}\`, but received: ${(0, utils_js_1.print)(value)}`, ...failures];
          }
        });
      }
      exports.union = union;
      function unknown() {
        return (0, utilities_js_1.define)('unknown', () => true);
      }
      exports.unknown = unknown;
    }, {
      "../struct.cjs": 8,
      "../utils.cjs": 13,
      "./utilities.cjs": 12
    }],
    12: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.pick = exports.partial = exports.omit = exports.lazy = exports.dynamic = exports.deprecated = exports.define = exports.assign = void 0;
      const struct_js_1 = require("../struct.cjs");
      const types_js_1 = require("./types.cjs");
      function assign(...Structs) {
        const isType = Structs[0]?.type === 'type';
        const schemas = Structs.map(({
          schema
        }) => schema);
        const schema = Object.assign({}, ...schemas);
        return isType ? (0, types_js_1.type)(schema) : (0, types_js_1.object)(schema);
      }
      exports.assign = assign;
      function define(name, validator) {
        return new struct_js_1.Struct({
          type: name,
          schema: null,
          validator
        });
      }
      exports.define = define;
      function deprecated(struct, log) {
        return new struct_js_1.Struct({
          ...struct,
          refiner: (value, ctx) => value === undefined || struct.refiner(value, ctx),
          validator(value, ctx) {
            if (value === undefined) {
              return true;
            }
            log(value, ctx);
            return struct.validator(value, ctx);
          }
        });
      }
      exports.deprecated = deprecated;
      function dynamic(fn) {
        return new struct_js_1.Struct({
          type: 'dynamic',
          schema: null,
          *entries(value, ctx) {
            const struct = fn(value, ctx);
            yield* struct.entries(value, ctx);
          },
          validator(value, ctx) {
            const struct = fn(value, ctx);
            return struct.validator(value, ctx);
          },
          coercer(value, ctx) {
            const struct = fn(value, ctx);
            return struct.coercer(value, ctx);
          },
          refiner(value, ctx) {
            const struct = fn(value, ctx);
            return struct.refiner(value, ctx);
          }
        });
      }
      exports.dynamic = dynamic;
      function lazy(fn) {
        let struct;
        return new struct_js_1.Struct({
          type: 'lazy',
          schema: null,
          *entries(value, ctx) {
            struct ?? (struct = fn());
            yield* struct.entries(value, ctx);
          },
          validator(value, ctx) {
            struct ?? (struct = fn());
            return struct.validator(value, ctx);
          },
          coercer(value, ctx) {
            struct ?? (struct = fn());
            return struct.coercer(value, ctx);
          },
          refiner(value, ctx) {
            struct ?? (struct = fn());
            return struct.refiner(value, ctx);
          }
        });
      }
      exports.lazy = lazy;
      function omit(struct, keys) {
        const {
          schema
        } = struct;
        const subschema = {
          ...schema
        };
        for (const key of keys) {
          delete subschema[key];
        }
        switch (struct.type) {
          case 'type':
            return (0, types_js_1.type)(subschema);
          default:
            return (0, types_js_1.object)(subschema);
        }
      }
      exports.omit = omit;
      function partial(struct) {
        const isStruct = struct instanceof struct_js_1.Struct;
        const schema = isStruct ? {
          ...struct.schema
        } : {
          ...struct
        };
        for (const key in schema) {
          schema[key] = (0, types_js_1.optional)(schema[key]);
        }
        if (isStruct && struct.type === 'type') {
          return (0, types_js_1.type)(schema);
        }
        return (0, types_js_1.object)(schema);
      }
      exports.partial = partial;
      function pick(struct, keys) {
        const {
          schema
        } = struct;
        const subschema = {};
        for (const key of keys) {
          subschema[key] = schema[key];
        }
        switch (struct.type) {
          case 'type':
            return (0, types_js_1.type)(subschema);
          default:
            return (0, types_js_1.object)(subschema);
        }
      }
      exports.pick = pick;
    }, {
      "../struct.cjs": 8,
      "./types.cjs": 11
    }],
    13: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.run = exports.toFailures = exports.toFailure = exports.shiftIterator = exports.print = exports.isPlainObject = exports.isObject = void 0;
      function isIterable(value) {
        return isObject(value) && typeof value[Symbol.iterator] === 'function';
      }
      function isObject(value) {
        return typeof value === 'object' && value !== null;
      }
      exports.isObject = isObject;
      function isPlainObject(value) {
        if (Object.prototype.toString.call(value) !== '[object Object]') {
          return false;
        }
        const prototype = Object.getPrototypeOf(value);
        return prototype === null || prototype === Object.prototype;
      }
      exports.isPlainObject = isPlainObject;
      function print(value) {
        if (typeof value === 'symbol') {
          return value.toString();
        }
        return typeof value === 'string' ? JSON.stringify(value) : `${value}`;
      }
      exports.print = print;
      function shiftIterator(input) {
        const {
          done,
          value
        } = input.next();
        return done ? undefined : value;
      }
      exports.shiftIterator = shiftIterator;
      function toFailure(result, context, struct, value) {
        if (result === true) {
          return undefined;
        } else if (result === false) {
          result = {};
        } else if (typeof result === 'string') {
          result = {
            message: result
          };
        }
        const {
          path,
          branch
        } = context;
        const {
          type
        } = struct;
        const {
          refinement,
          message = `Expected a value of type \`${type}\`${refinement ? ` with refinement \`${refinement}\`` : ''}, but received: \`${print(value)}\``
        } = result;
        return {
          value,
          type,
          refinement,
          key: path[path.length - 1],
          path,
          branch,
          ...result,
          message
        };
      }
      exports.toFailure = toFailure;
      function* toFailures(result, context, struct, value) {
        if (!isIterable(result)) {
          result = [result];
        }
        for (const validationResult of result) {
          const failure = toFailure(validationResult, context, struct, value);
          if (failure) {
            yield failure;
          }
        }
      }
      exports.toFailures = toFailures;
      function* run(value, struct, options = {}) {
        const {
          path = [],
          branch = [value],
          coerce = false,
          mask = false
        } = options;
        const context = {
          path,
          branch
        };
        if (coerce) {
          value = struct.coercer(value, context);
          if (mask && struct.type !== 'type' && isObject(struct.schema) && isObject(value) && !Array.isArray(value)) {
            for (const key in value) {
              if (struct.schema[key] === undefined) {
                delete value[key];
              }
            }
          }
        }
        let status = 'valid';
        for (const failure of struct.validator(value, context)) {
          failure.explanation = options.message;
          status = 'not_valid';
          yield [failure, undefined];
        }
        for (let [innerKey, innerValue, innerStruct] of struct.entries(value, context)) {
          const iterable = run(innerValue, innerStruct, {
            path: innerKey === undefined ? path : [...path, innerKey],
            branch: innerKey === undefined ? branch : [...branch, innerValue],
            coerce,
            mask,
            message: options.message
          });
          for (const result of iterable) {
            if (result[0]) {
              status = result[0].refinement === null || result[0].refinement === undefined ? 'not_valid' : 'not_refined';
              yield [result[0], undefined];
            } else if (coerce) {
              innerValue = result[1];
              if (innerKey === undefined) {
                value = innerValue;
              } else if (value instanceof Map) {
                value.set(innerKey, innerValue);
              } else if (value instanceof Set) {
                value.add(innerValue);
              } else if (isObject(value)) {
                if (innerValue !== undefined || innerKey in value) {
                  value[innerKey] = innerValue;
                }
              }
            }
          }
        }
        if (status !== 'not_valid') {
          for (const failure of struct.refiner(value, context)) {
            failure.explanation = options.message;
            status = 'not_refined';
            yield [failure, undefined];
          }
        }
        if (status === 'valid') {
          yield [undefined, value];
        }
      }
      exports.run = run;
    }, {}],
    14: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.assertExhaustive = exports.assertStruct = exports.assert = exports.AssertionError = void 0;
      const superstruct_1 = require("@metamask/superstruct");
      const errors_1 = require("./errors.cjs");
      function isConstructable(fn) {
        return Boolean(typeof fn?.prototype?.constructor?.name === 'string');
      }
      function getErrorMessageWithoutTrailingPeriod(error) {
        return (0, errors_1.getErrorMessage)(error).replace(/\.$/u, '');
      }
      function getError(ErrorWrapper, message) {
        if (isConstructable(ErrorWrapper)) {
          return new ErrorWrapper({
            message
          });
        }
        return ErrorWrapper({
          message
        });
      }
      class AssertionError extends Error {
        constructor(options) {
          super(options.message);
          this.code = 'ERR_ASSERTION';
        }
      }
      exports.AssertionError = AssertionError;
      function assert(value, message = 'Assertion failed.', ErrorWrapper = AssertionError) {
        if (!value) {
          if (message instanceof Error) {
            throw message;
          }
          throw getError(ErrorWrapper, message);
        }
      }
      exports.assert = assert;
      function assertStruct(value, struct, errorPrefix = 'Assertion failed', ErrorWrapper = AssertionError) {
        try {
          (0, superstruct_1.assert)(value, struct);
        } catch (error) {
          throw getError(ErrorWrapper, `${errorPrefix}: ${getErrorMessageWithoutTrailingPeriod(error)}.`);
        }
      }
      exports.assertStruct = assertStruct;
      function assertExhaustive(_object) {
        throw new Error('Invalid branch reached. Should be detected during compilation.');
      }
      exports.assertExhaustive = assertExhaustive;
    }, {
      "./errors.cjs": 22,
      "@metamask/superstruct": 7
    }],
    15: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.base64 = void 0;
      const superstruct_1 = require("@metamask/superstruct");
      const assert_1 = require("./assert.cjs");
      const base64 = (struct, options = {}) => {
        const paddingRequired = options.paddingRequired ?? false;
        const characterSet = options.characterSet ?? 'base64';
        let letters;
        if (characterSet === 'base64') {
          letters = String.raw`[A-Za-z0-9+\/]`;
        } else {
          (0, assert_1.assert)(characterSet === 'base64url');
          letters = String.raw`[-_A-Za-z0-9]`;
        }
        let re;
        if (paddingRequired) {
          re = new RegExp(`^(?:${letters}{4})*(?:${letters}{3}=|${letters}{2}==)?$`, 'u');
        } else {
          re = new RegExp(`^(?:${letters}{4})*(?:${letters}{2,3}|${letters}{3}=|${letters}{2}==)?$`, 'u');
        }
        return (0, superstruct_1.pattern)(struct, re);
      };
      exports.base64 = base64;
    }, {
      "./assert.cjs": 14,
      "@metamask/superstruct": 7
    }],
    16: [function (require, module, exports) {
      (function () {
        (function () {
          "use strict";

          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.createDataView = exports.concatBytes = exports.valueToBytes = exports.base64ToBytes = exports.stringToBytes = exports.numberToBytes = exports.signedBigIntToBytes = exports.bigIntToBytes = exports.hexToBytes = exports.bytesToBase64 = exports.bytesToString = exports.bytesToNumber = exports.bytesToSignedBigInt = exports.bytesToBigInt = exports.bytesToHex = exports.assertIsBytes = exports.isBytes = void 0;
          const base_1 = require("@scure/base");
          const assert_1 = require("./assert.cjs");
          const hex_1 = require("./hex.cjs");
          const HEX_MINIMUM_NUMBER_CHARACTER = 48;
          const HEX_MAXIMUM_NUMBER_CHARACTER = 58;
          const HEX_CHARACTER_OFFSET = 87;
          function getPrecomputedHexValuesBuilder() {
            const lookupTable = [];
            return () => {
              if (lookupTable.length === 0) {
                for (let i = 0; i < 256; i++) {
                  lookupTable.push(i.toString(16).padStart(2, '0'));
                }
              }
              return lookupTable;
            };
          }
          const getPrecomputedHexValues = getPrecomputedHexValuesBuilder();
          function isBytes(value) {
            return value instanceof Uint8Array;
          }
          exports.isBytes = isBytes;
          function assertIsBytes(value) {
            (0, assert_1.assert)(isBytes(value), 'Value must be a Uint8Array.');
          }
          exports.assertIsBytes = assertIsBytes;
          function bytesToHex(bytes) {
            assertIsBytes(bytes);
            if (bytes.length === 0) {
              return '0x';
            }
            const lookupTable = getPrecomputedHexValues();
            const hexadecimal = new Array(bytes.length);
            for (let i = 0; i < bytes.length; i++) {
              hexadecimal[i] = lookupTable[bytes[i]];
            }
            return (0, hex_1.add0x)(hexadecimal.join(''));
          }
          exports.bytesToHex = bytesToHex;
          function bytesToBigInt(bytes) {
            assertIsBytes(bytes);
            const hexadecimal = bytesToHex(bytes);
            return BigInt(hexadecimal);
          }
          exports.bytesToBigInt = bytesToBigInt;
          function bytesToSignedBigInt(bytes) {
            assertIsBytes(bytes);
            let value = BigInt(0);
            for (const byte of bytes) {
              value = (value << BigInt(8)) + BigInt(byte);
            }
            return BigInt.asIntN(bytes.length * 8, value);
          }
          exports.bytesToSignedBigInt = bytesToSignedBigInt;
          function bytesToNumber(bytes) {
            assertIsBytes(bytes);
            const bigint = bytesToBigInt(bytes);
            (0, assert_1.assert)(bigint <= BigInt(Number.MAX_SAFE_INTEGER), 'Number is not a safe integer. Use `bytesToBigInt` instead.');
            return Number(bigint);
          }
          exports.bytesToNumber = bytesToNumber;
          function bytesToString(bytes) {
            assertIsBytes(bytes);
            return new TextDecoder().decode(bytes);
          }
          exports.bytesToString = bytesToString;
          function bytesToBase64(bytes) {
            assertIsBytes(bytes);
            return base_1.base64.encode(bytes);
          }
          exports.bytesToBase64 = bytesToBase64;
          function hexToBytes(value) {
            if (value?.toLowerCase?.() === '0x') {
              return new Uint8Array();
            }
            (0, hex_1.assertIsHexString)(value);
            const strippedValue = (0, hex_1.remove0x)(value).toLowerCase();
            const normalizedValue = strippedValue.length % 2 === 0 ? strippedValue : `0${strippedValue}`;
            const bytes = new Uint8Array(normalizedValue.length / 2);
            for (let i = 0; i < bytes.length; i++) {
              const c1 = normalizedValue.charCodeAt(i * 2);
              const c2 = normalizedValue.charCodeAt(i * 2 + 1);
              const n1 = c1 - (c1 < HEX_MAXIMUM_NUMBER_CHARACTER ? HEX_MINIMUM_NUMBER_CHARACTER : HEX_CHARACTER_OFFSET);
              const n2 = c2 - (c2 < HEX_MAXIMUM_NUMBER_CHARACTER ? HEX_MINIMUM_NUMBER_CHARACTER : HEX_CHARACTER_OFFSET);
              bytes[i] = n1 * 16 + n2;
            }
            return bytes;
          }
          exports.hexToBytes = hexToBytes;
          function bigIntToBytes(value) {
            (0, assert_1.assert)(typeof value === 'bigint', 'Value must be a bigint.');
            (0, assert_1.assert)(value >= BigInt(0), 'Value must be a non-negative bigint.');
            const hexadecimal = value.toString(16);
            return hexToBytes(hexadecimal);
          }
          exports.bigIntToBytes = bigIntToBytes;
          function bigIntFits(value, bytes) {
            (0, assert_1.assert)(bytes > 0);
            const mask = value >> BigInt(31);
            return !((~value & mask) + (value & ~mask) >> BigInt(bytes * 8 + ~0));
          }
          function signedBigIntToBytes(value, byteLength) {
            (0, assert_1.assert)(typeof value === 'bigint', 'Value must be a bigint.');
            (0, assert_1.assert)(typeof byteLength === 'number', 'Byte length must be a number.');
            (0, assert_1.assert)(byteLength > 0, 'Byte length must be greater than 0.');
            (0, assert_1.assert)(bigIntFits(value, byteLength), 'Byte length is too small to represent the given value.');
            let numberValue = value;
            const bytes = new Uint8Array(byteLength);
            for (let i = 0; i < bytes.length; i++) {
              bytes[i] = Number(BigInt.asUintN(8, numberValue));
              numberValue >>= BigInt(8);
            }
            return bytes.reverse();
          }
          exports.signedBigIntToBytes = signedBigIntToBytes;
          function numberToBytes(value) {
            (0, assert_1.assert)(typeof value === 'number', 'Value must be a number.');
            (0, assert_1.assert)(value >= 0, 'Value must be a non-negative number.');
            (0, assert_1.assert)(Number.isSafeInteger(value), 'Value is not a safe integer. Use `bigIntToBytes` instead.');
            const hexadecimal = value.toString(16);
            return hexToBytes(hexadecimal);
          }
          exports.numberToBytes = numberToBytes;
          function stringToBytes(value) {
            (0, assert_1.assert)(typeof value === 'string', 'Value must be a string.');
            return new TextEncoder().encode(value);
          }
          exports.stringToBytes = stringToBytes;
          function base64ToBytes(value) {
            (0, assert_1.assert)(typeof value === 'string', 'Value must be a string.');
            return base_1.base64.decode(value);
          }
          exports.base64ToBytes = base64ToBytes;
          function valueToBytes(value) {
            if (typeof value === 'bigint') {
              return bigIntToBytes(value);
            }
            if (typeof value === 'number') {
              return numberToBytes(value);
            }
            if (typeof value === 'string') {
              if (value.startsWith('0x')) {
                return hexToBytes(value);
              }
              return stringToBytes(value);
            }
            if (isBytes(value)) {
              return value;
            }
            throw new TypeError(`Unsupported value type: "${typeof value}".`);
          }
          exports.valueToBytes = valueToBytes;
          function concatBytes(values) {
            const normalizedValues = new Array(values.length);
            let byteLength = 0;
            for (let i = 0; i < values.length; i++) {
              const value = valueToBytes(values[i]);
              normalizedValues[i] = value;
              byteLength += value.length;
            }
            const bytes = new Uint8Array(byteLength);
            for (let i = 0, offset = 0; i < normalizedValues.length; i++) {
              bytes.set(normalizedValues[i], offset);
              offset += normalizedValues[i].length;
            }
            return bytes;
          }
          exports.concatBytes = concatBytes;
          function createDataView(bytes) {
            if (typeof Buffer !== 'undefined' && bytes instanceof Buffer) {
              const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
              return new DataView(buffer);
            }
            return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
          }
          exports.createDataView = createDataView;
        }).call(this);
      }).call(this, require("buffer").Buffer);
    }, {
      "./assert.cjs": 14,
      "./hex.cjs": 23,
      "@scure/base": 40,
      "buffer": 42
    }],
    17: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.toCaipChainId = exports.parseCaipAccountId = exports.parseCaipChainId = exports.isCaipAccountAddress = exports.isCaipAccountId = exports.isCaipReference = exports.isCaipNamespace = exports.isCaipChainId = exports.KnownCaipNamespace = exports.CaipAccountAddressStruct = exports.CaipAccountIdStruct = exports.CaipReferenceStruct = exports.CaipNamespaceStruct = exports.CaipChainIdStruct = exports.CAIP_ACCOUNT_ADDRESS_REGEX = exports.CAIP_ACCOUNT_ID_REGEX = exports.CAIP_REFERENCE_REGEX = exports.CAIP_NAMESPACE_REGEX = exports.CAIP_CHAIN_ID_REGEX = void 0;
      const superstruct_1 = require("@metamask/superstruct");
      exports.CAIP_CHAIN_ID_REGEX = /^(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-_a-zA-Z0-9]{1,32})$/u;
      exports.CAIP_NAMESPACE_REGEX = /^[-a-z0-9]{3,8}$/u;
      exports.CAIP_REFERENCE_REGEX = /^[-_a-zA-Z0-9]{1,32}$/u;
      exports.CAIP_ACCOUNT_ID_REGEX = /^(?<chainId>(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-_a-zA-Z0-9]{1,32})):(?<accountAddress>[-.%a-zA-Z0-9]{1,128})$/u;
      exports.CAIP_ACCOUNT_ADDRESS_REGEX = /^[-.%a-zA-Z0-9]{1,128}$/u;
      exports.CaipChainIdStruct = (0, superstruct_1.pattern)((0, superstruct_1.string)(), exports.CAIP_CHAIN_ID_REGEX);
      exports.CaipNamespaceStruct = (0, superstruct_1.pattern)((0, superstruct_1.string)(), exports.CAIP_NAMESPACE_REGEX);
      exports.CaipReferenceStruct = (0, superstruct_1.pattern)((0, superstruct_1.string)(), exports.CAIP_REFERENCE_REGEX);
      exports.CaipAccountIdStruct = (0, superstruct_1.pattern)((0, superstruct_1.string)(), exports.CAIP_ACCOUNT_ID_REGEX);
      exports.CaipAccountAddressStruct = (0, superstruct_1.pattern)((0, superstruct_1.string)(), exports.CAIP_ACCOUNT_ADDRESS_REGEX);
      var KnownCaipNamespace;
      (function (KnownCaipNamespace) {
        KnownCaipNamespace["Eip155"] = "eip155";
      })(KnownCaipNamespace = exports.KnownCaipNamespace || (exports.KnownCaipNamespace = {}));
      function isCaipChainId(value) {
        return (0, superstruct_1.is)(value, exports.CaipChainIdStruct);
      }
      exports.isCaipChainId = isCaipChainId;
      function isCaipNamespace(value) {
        return (0, superstruct_1.is)(value, exports.CaipNamespaceStruct);
      }
      exports.isCaipNamespace = isCaipNamespace;
      function isCaipReference(value) {
        return (0, superstruct_1.is)(value, exports.CaipReferenceStruct);
      }
      exports.isCaipReference = isCaipReference;
      function isCaipAccountId(value) {
        return (0, superstruct_1.is)(value, exports.CaipAccountIdStruct);
      }
      exports.isCaipAccountId = isCaipAccountId;
      function isCaipAccountAddress(value) {
        return (0, superstruct_1.is)(value, exports.CaipAccountAddressStruct);
      }
      exports.isCaipAccountAddress = isCaipAccountAddress;
      function parseCaipChainId(caipChainId) {
        const match = exports.CAIP_CHAIN_ID_REGEX.exec(caipChainId);
        if (!match?.groups) {
          throw new Error('Invalid CAIP chain ID.');
        }
        return {
          namespace: match.groups.namespace,
          reference: match.groups.reference
        };
      }
      exports.parseCaipChainId = parseCaipChainId;
      function parseCaipAccountId(caipAccountId) {
        const match = exports.CAIP_ACCOUNT_ID_REGEX.exec(caipAccountId);
        if (!match?.groups) {
          throw new Error('Invalid CAIP account ID.');
        }
        return {
          address: match.groups.accountAddress,
          chainId: match.groups.chainId,
          chain: {
            namespace: match.groups.namespace,
            reference: match.groups.reference
          }
        };
      }
      exports.parseCaipAccountId = parseCaipAccountId;
      function toCaipChainId(namespace, reference) {
        if (!isCaipNamespace(namespace)) {
          throw new Error(`Invalid "namespace", must match: ${exports.CAIP_NAMESPACE_REGEX.toString()}`);
        }
        if (!isCaipReference(reference)) {
          throw new Error(`Invalid "reference", must match: ${exports.CAIP_REFERENCE_REGEX.toString()}`);
        }
        return `${namespace}:${reference}`;
      }
      exports.toCaipChainId = toCaipChainId;
    }, {
      "@metamask/superstruct": 7
    }],
    18: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.ChecksumStruct = void 0;
      const superstruct_1 = require("@metamask/superstruct");
      const base64_1 = require("./base64.cjs");
      exports.ChecksumStruct = (0, superstruct_1.size)((0, base64_1.base64)((0, superstruct_1.string)(), {
        paddingRequired: true
      }), 44, 44);
    }, {
      "./base64.cjs": 15,
      "@metamask/superstruct": 7
    }],
    19: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.createHex = exports.createBytes = exports.createBigInt = exports.createNumber = void 0;
      const superstruct_1 = require("@metamask/superstruct");
      const assert_1 = require("./assert.cjs");
      const bytes_1 = require("./bytes.cjs");
      const hex_1 = require("./hex.cjs");
      const NumberLikeStruct = (0, superstruct_1.union)([(0, superstruct_1.number)(), (0, superstruct_1.bigint)(), (0, superstruct_1.string)(), hex_1.StrictHexStruct]);
      const NumberCoercer = (0, superstruct_1.coerce)((0, superstruct_1.number)(), NumberLikeStruct, Number);
      const BigIntCoercer = (0, superstruct_1.coerce)((0, superstruct_1.bigint)(), NumberLikeStruct, BigInt);
      const BytesLikeStruct = (0, superstruct_1.union)([hex_1.StrictHexStruct, (0, superstruct_1.instance)(Uint8Array)]);
      const BytesCoercer = (0, superstruct_1.coerce)((0, superstruct_1.instance)(Uint8Array), (0, superstruct_1.union)([hex_1.StrictHexStruct]), bytes_1.hexToBytes);
      const HexCoercer = (0, superstruct_1.coerce)(hex_1.StrictHexStruct, (0, superstruct_1.instance)(Uint8Array), bytes_1.bytesToHex);
      function createNumber(value) {
        try {
          const result = (0, superstruct_1.create)(value, NumberCoercer);
          (0, assert_1.assert)(Number.isFinite(result), `Expected a number-like value, got "${value}".`);
          return result;
        } catch (error) {
          if (error instanceof superstruct_1.StructError) {
            throw new Error(`Expected a number-like value, got "${value}".`);
          }
          throw error;
        }
      }
      exports.createNumber = createNumber;
      function createBigInt(value) {
        try {
          return (0, superstruct_1.create)(value, BigIntCoercer);
        } catch (error) {
          if (error instanceof superstruct_1.StructError) {
            throw new Error(`Expected a number-like value, got "${String(error.value)}".`);
          }
          throw error;
        }
      }
      exports.createBigInt = createBigInt;
      function createBytes(value) {
        if (typeof value === 'string' && value.toLowerCase() === '0x') {
          return new Uint8Array();
        }
        try {
          return (0, superstruct_1.create)(value, BytesCoercer);
        } catch (error) {
          if (error instanceof superstruct_1.StructError) {
            throw new Error(`Expected a bytes-like value, got "${String(error.value)}".`);
          }
          throw error;
        }
      }
      exports.createBytes = createBytes;
      function createHex(value) {
        if (value instanceof Uint8Array && value.length === 0 || typeof value === 'string' && value.toLowerCase() === '0x') {
          return '0x';
        }
        try {
          return (0, superstruct_1.create)(value, HexCoercer);
        } catch (error) {
          if (error instanceof superstruct_1.StructError) {
            throw new Error(`Expected a bytes-like value, got "${String(error.value)}".`);
          }
          throw error;
        }
      }
      exports.createHex = createHex;
    }, {
      "./assert.cjs": 14,
      "./bytes.cjs": 16,
      "./hex.cjs": 23,
      "@metamask/superstruct": 7
    }],
    20: [function (require, module, exports) {
      "use strict";

      var __classPrivateFieldGet = this && this.__classPrivateFieldGet || function (receiver, state, kind, f) {
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
      };
      var __classPrivateFieldSet = this && this.__classPrivateFieldSet || function (receiver, state, value, kind, f) {
        if (kind === "m") throw new TypeError("Private method is not writable");
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
      };
      var _FrozenMap_map, _FrozenSet_set;
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.FrozenSet = exports.FrozenMap = void 0;
      class FrozenMap {
        get size() {
          return __classPrivateFieldGet(this, _FrozenMap_map, "f").size;
        }
        [(_FrozenMap_map = new WeakMap(), Symbol.iterator)]() {
          return __classPrivateFieldGet(this, _FrozenMap_map, "f")[Symbol.iterator]();
        }
        constructor(entries) {
          _FrozenMap_map.set(this, void 0);
          __classPrivateFieldSet(this, _FrozenMap_map, new Map(entries), "f");
          Object.freeze(this);
        }
        entries() {
          return __classPrivateFieldGet(this, _FrozenMap_map, "f").entries();
        }
        forEach(callbackfn, thisArg) {
          return __classPrivateFieldGet(this, _FrozenMap_map, "f").forEach((value, key, _map) => callbackfn.call(thisArg, value, key, this));
        }
        get(key) {
          return __classPrivateFieldGet(this, _FrozenMap_map, "f").get(key);
        }
        has(key) {
          return __classPrivateFieldGet(this, _FrozenMap_map, "f").has(key);
        }
        keys() {
          return __classPrivateFieldGet(this, _FrozenMap_map, "f").keys();
        }
        values() {
          return __classPrivateFieldGet(this, _FrozenMap_map, "f").values();
        }
        toString() {
          return `FrozenMap(${this.size}) {${this.size > 0 ? ` ${[...this.entries()].map(([key, value]) => `${String(key)} => ${String(value)}`).join(', ')} ` : ''}}`;
        }
      }
      exports.FrozenMap = FrozenMap;
      class FrozenSet {
        get size() {
          return __classPrivateFieldGet(this, _FrozenSet_set, "f").size;
        }
        [(_FrozenSet_set = new WeakMap(), Symbol.iterator)]() {
          return __classPrivateFieldGet(this, _FrozenSet_set, "f")[Symbol.iterator]();
        }
        constructor(values) {
          _FrozenSet_set.set(this, void 0);
          __classPrivateFieldSet(this, _FrozenSet_set, new Set(values), "f");
          Object.freeze(this);
        }
        entries() {
          return __classPrivateFieldGet(this, _FrozenSet_set, "f").entries();
        }
        forEach(callbackfn, thisArg) {
          return __classPrivateFieldGet(this, _FrozenSet_set, "f").forEach((value, value2, _set) => callbackfn.call(thisArg, value, value2, this));
        }
        has(value) {
          return __classPrivateFieldGet(this, _FrozenSet_set, "f").has(value);
        }
        keys() {
          return __classPrivateFieldGet(this, _FrozenSet_set, "f").keys();
        }
        values() {
          return __classPrivateFieldGet(this, _FrozenSet_set, "f").values();
        }
        toString() {
          return `FrozenSet(${this.size}) {${this.size > 0 ? ` ${[...this.values()].map(member => String(member)).join(', ')} ` : ''}}`;
        }
      }
      exports.FrozenSet = FrozenSet;
      Object.freeze(FrozenMap);
      Object.freeze(FrozenMap.prototype);
      Object.freeze(FrozenSet);
      Object.freeze(FrozenSet.prototype);
    }, {}],
    21: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
    }, {}],
    22: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.wrapError = exports.getErrorMessage = exports.isErrorWithStack = exports.isErrorWithMessage = exports.isErrorWithCode = void 0;
      const pony_cause_1 = require("pony-cause");
      const misc_1 = require("./misc.cjs");
      function isError(error) {
        return error instanceof Error || (0, misc_1.isObject)(error) && error.constructor.name === 'Error';
      }
      function isErrorWithCode(error) {
        return typeof error === 'object' && error !== null && 'code' in error;
      }
      exports.isErrorWithCode = isErrorWithCode;
      function isErrorWithMessage(error) {
        return typeof error === 'object' && error !== null && 'message' in error;
      }
      exports.isErrorWithMessage = isErrorWithMessage;
      function isErrorWithStack(error) {
        return typeof error === 'object' && error !== null && 'stack' in error;
      }
      exports.isErrorWithStack = isErrorWithStack;
      function getErrorMessage(error) {
        if (isErrorWithMessage(error) && typeof error.message === 'string') {
          return error.message;
        }
        if ((0, misc_1.isNullOrUndefined)(error)) {
          return '';
        }
        return String(error);
      }
      exports.getErrorMessage = getErrorMessage;
      function wrapError(originalError, message) {
        if (isError(originalError)) {
          let error;
          if (Error.length === 2) {
            error = new Error(message, {
              cause: originalError
            });
          } else {
            error = new pony_cause_1.ErrorWithCause(message, {
              cause: originalError
            });
          }
          if (isErrorWithCode(originalError)) {
            error.code = originalError.code;
          }
          return error;
        }
        if (message.length > 0) {
          return new Error(`${String(originalError)}: ${message}`);
        }
        return new Error(String(originalError));
      }
      exports.wrapError = wrapError;
    }, {
      "./misc.cjs": 28,
      "pony-cause": 48
    }],
    23: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.remove0x = exports.add0x = exports.isValidChecksumAddress = exports.getChecksumAddress = exports.isValidHexAddress = exports.assertIsStrictHexString = exports.assertIsHexString = exports.isStrictHexString = exports.isHexString = exports.HexChecksumAddressStruct = exports.HexAddressStruct = exports.StrictHexStruct = exports.HexStruct = void 0;
      const superstruct_1 = require("@metamask/superstruct");
      const sha3_1 = require("@noble/hashes/sha3");
      const assert_1 = require("./assert.cjs");
      const bytes_1 = require("./bytes.cjs");
      exports.HexStruct = (0, superstruct_1.pattern)((0, superstruct_1.string)(), /^(?:0x)?[0-9a-f]+$/iu);
      exports.StrictHexStruct = (0, superstruct_1.pattern)((0, superstruct_1.string)(), /^0x[0-9a-f]+$/iu);
      exports.HexAddressStruct = (0, superstruct_1.pattern)((0, superstruct_1.string)(), /^0x[0-9a-f]{40}$/u);
      exports.HexChecksumAddressStruct = (0, superstruct_1.pattern)((0, superstruct_1.string)(), /^0x[0-9a-fA-F]{40}$/u);
      function isHexString(value) {
        return (0, superstruct_1.is)(value, exports.HexStruct);
      }
      exports.isHexString = isHexString;
      function isStrictHexString(value) {
        return (0, superstruct_1.is)(value, exports.StrictHexStruct);
      }
      exports.isStrictHexString = isStrictHexString;
      function assertIsHexString(value) {
        (0, assert_1.assert)(isHexString(value), 'Value must be a hexadecimal string.');
      }
      exports.assertIsHexString = assertIsHexString;
      function assertIsStrictHexString(value) {
        (0, assert_1.assert)(isStrictHexString(value), 'Value must be a hexadecimal string, starting with "0x".');
      }
      exports.assertIsStrictHexString = assertIsStrictHexString;
      function isValidHexAddress(possibleAddress) {
        return (0, superstruct_1.is)(possibleAddress, exports.HexAddressStruct) || isValidChecksumAddress(possibleAddress);
      }
      exports.isValidHexAddress = isValidHexAddress;
      function getChecksumAddress(address) {
        (0, assert_1.assert)((0, superstruct_1.is)(address, exports.HexChecksumAddressStruct), 'Invalid hex address.');
        const unPrefixed = remove0x(address.toLowerCase());
        const unPrefixedHash = remove0x((0, bytes_1.bytesToHex)((0, sha3_1.keccak_256)(unPrefixed)));
        return `0x${unPrefixed.split('').map((character, nibbleIndex) => {
          const hashCharacter = unPrefixedHash[nibbleIndex];
          (0, assert_1.assert)((0, superstruct_1.is)(hashCharacter, (0, superstruct_1.string)()), 'Hash shorter than address.');
          return parseInt(hashCharacter, 16) > 7 ? character.toUpperCase() : character;
        }).join('')}`;
      }
      exports.getChecksumAddress = getChecksumAddress;
      function isValidChecksumAddress(possibleChecksum) {
        if (!(0, superstruct_1.is)(possibleChecksum, exports.HexChecksumAddressStruct)) {
          return false;
        }
        return getChecksumAddress(possibleChecksum) === possibleChecksum;
      }
      exports.isValidChecksumAddress = isValidChecksumAddress;
      function add0x(hexadecimal) {
        if (hexadecimal.startsWith('0x')) {
          return hexadecimal;
        }
        if (hexadecimal.startsWith('0X')) {
          return `0x${hexadecimal.substring(2)}`;
        }
        return `0x${hexadecimal}`;
      }
      exports.add0x = add0x;
      function remove0x(hexadecimal) {
        if (hexadecimal.startsWith('0x') || hexadecimal.startsWith('0X')) {
          return hexadecimal.substring(2);
        }
        return hexadecimal;
      }
      exports.remove0x = remove0x;
    }, {
      "./assert.cjs": 14,
      "./bytes.cjs": 16,
      "@metamask/superstruct": 7,
      "@noble/hashes/sha3": 38
    }],
    24: [function (require, module, exports) {
      "use strict";

      var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            }
          };
        }
        Object.defineProperty(o, k2, desc);
      } : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = this && this.__exportStar || function (m, exports) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
      };
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      __exportStar(require("./assert.cjs"), exports);
      __exportStar(require("./base64.cjs"), exports);
      __exportStar(require("./bytes.cjs"), exports);
      __exportStar(require("./caip-types.cjs"), exports);
      __exportStar(require("./checksum.cjs"), exports);
      __exportStar(require("./coercers.cjs"), exports);
      __exportStar(require("./collections.cjs"), exports);
      __exportStar(require("./encryption-types.cjs"), exports);
      __exportStar(require("./errors.cjs"), exports);
      __exportStar(require("./hex.cjs"), exports);
      __exportStar(require("./json.cjs"), exports);
      __exportStar(require("./keyring.cjs"), exports);
      __exportStar(require("./logging.cjs"), exports);
      __exportStar(require("./misc.cjs"), exports);
      __exportStar(require("./number.cjs"), exports);
      __exportStar(require("./opaque.cjs"), exports);
      __exportStar(require("./promise.cjs"), exports);
      __exportStar(require("./time.cjs"), exports);
      __exportStar(require("./transaction-types.cjs"), exports);
      __exportStar(require("./versions.cjs"), exports);
    }, {
      "./assert.cjs": 14,
      "./base64.cjs": 15,
      "./bytes.cjs": 16,
      "./caip-types.cjs": 17,
      "./checksum.cjs": 18,
      "./coercers.cjs": 19,
      "./collections.cjs": 20,
      "./encryption-types.cjs": 21,
      "./errors.cjs": 22,
      "./hex.cjs": 23,
      "./json.cjs": 25,
      "./keyring.cjs": 26,
      "./logging.cjs": 27,
      "./misc.cjs": 28,
      "./number.cjs": 29,
      "./opaque.cjs": 30,
      "./promise.cjs": 31,
      "./time.cjs": 32,
      "./transaction-types.cjs": 33,
      "./versions.cjs": 34
    }],
    25: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.getJsonRpcIdValidator = exports.assertIsJsonRpcError = exports.isJsonRpcError = exports.assertIsJsonRpcFailure = exports.isJsonRpcFailure = exports.assertIsJsonRpcSuccess = exports.isJsonRpcSuccess = exports.assertIsJsonRpcResponse = exports.isJsonRpcResponse = exports.assertIsPendingJsonRpcResponse = exports.isPendingJsonRpcResponse = exports.JsonRpcResponseStruct = exports.JsonRpcFailureStruct = exports.JsonRpcSuccessStruct = exports.PendingJsonRpcResponseStruct = exports.assertIsJsonRpcRequest = exports.isJsonRpcRequest = exports.assertIsJsonRpcNotification = exports.isJsonRpcNotification = exports.JsonRpcNotificationStruct = exports.JsonRpcRequestStruct = exports.JsonRpcParamsStruct = exports.JsonRpcErrorStruct = exports.JsonRpcIdStruct = exports.JsonRpcVersionStruct = exports.jsonrpc2 = exports.getJsonSize = exports.getSafeJson = exports.isValidJson = exports.JsonStruct = exports.UnsafeJsonStruct = exports.exactOptional = exports.object = void 0;
      const superstruct_1 = require("@metamask/superstruct");
      const assert_1 = require("./assert.cjs");
      const misc_1 = require("./misc.cjs");
      const object = schema => (0, superstruct_1.object)(schema);
      exports.object = object;
      function hasOptional({
        path,
        branch
      }) {
        const field = path[path.length - 1];
        return (0, misc_1.hasProperty)(branch[branch.length - 2], field);
      }
      function exactOptional(struct) {
        return new superstruct_1.Struct({
          ...struct,
          type: `optional ${struct.type}`,
          validator: (value, context) => !hasOptional(context) || struct.validator(value, context),
          refiner: (value, context) => !hasOptional(context) || struct.refiner(value, context)
        });
      }
      exports.exactOptional = exactOptional;
      const finiteNumber = () => (0, superstruct_1.define)('finite number', value => {
        return (0, superstruct_1.is)(value, (0, superstruct_1.number)()) && Number.isFinite(value);
      });
      exports.UnsafeJsonStruct = (0, superstruct_1.union)([(0, superstruct_1.literal)(null), (0, superstruct_1.boolean)(), finiteNumber(), (0, superstruct_1.string)(), (0, superstruct_1.array)((0, superstruct_1.lazy)(() => exports.UnsafeJsonStruct)), (0, superstruct_1.record)((0, superstruct_1.string)(), (0, superstruct_1.lazy)(() => exports.UnsafeJsonStruct))]);
      exports.JsonStruct = (0, superstruct_1.coerce)(exports.UnsafeJsonStruct, (0, superstruct_1.any)(), value => {
        (0, assert_1.assertStruct)(value, exports.UnsafeJsonStruct);
        return JSON.parse(JSON.stringify(value, (propKey, propValue) => {
          if (propKey === '__proto__' || propKey === 'constructor') {
            return undefined;
          }
          return propValue;
        }));
      });
      function isValidJson(value) {
        try {
          getSafeJson(value);
          return true;
        } catch {
          return false;
        }
      }
      exports.isValidJson = isValidJson;
      function getSafeJson(value) {
        return (0, superstruct_1.create)(value, exports.JsonStruct);
      }
      exports.getSafeJson = getSafeJson;
      function getJsonSize(value) {
        (0, assert_1.assertStruct)(value, exports.JsonStruct, 'Invalid JSON value');
        const json = JSON.stringify(value);
        return new TextEncoder().encode(json).byteLength;
      }
      exports.getJsonSize = getJsonSize;
      exports.jsonrpc2 = '2.0';
      exports.JsonRpcVersionStruct = (0, superstruct_1.literal)(exports.jsonrpc2);
      exports.JsonRpcIdStruct = (0, superstruct_1.nullable)((0, superstruct_1.union)([(0, superstruct_1.number)(), (0, superstruct_1.string)()]));
      exports.JsonRpcErrorStruct = (0, exports.object)({
        code: (0, superstruct_1.integer)(),
        message: (0, superstruct_1.string)(),
        data: exactOptional(exports.JsonStruct),
        stack: exactOptional((0, superstruct_1.string)())
      });
      exports.JsonRpcParamsStruct = (0, superstruct_1.union)([(0, superstruct_1.record)((0, superstruct_1.string)(), exports.JsonStruct), (0, superstruct_1.array)(exports.JsonStruct)]);
      exports.JsonRpcRequestStruct = (0, exports.object)({
        id: exports.JsonRpcIdStruct,
        jsonrpc: exports.JsonRpcVersionStruct,
        method: (0, superstruct_1.string)(),
        params: exactOptional(exports.JsonRpcParamsStruct)
      });
      exports.JsonRpcNotificationStruct = (0, exports.object)({
        jsonrpc: exports.JsonRpcVersionStruct,
        method: (0, superstruct_1.string)(),
        params: exactOptional(exports.JsonRpcParamsStruct)
      });
      function isJsonRpcNotification(value) {
        return (0, superstruct_1.is)(value, exports.JsonRpcNotificationStruct);
      }
      exports.isJsonRpcNotification = isJsonRpcNotification;
      function assertIsJsonRpcNotification(value, ErrorWrapper) {
        (0, assert_1.assertStruct)(value, exports.JsonRpcNotificationStruct, 'Invalid JSON-RPC notification', ErrorWrapper);
      }
      exports.assertIsJsonRpcNotification = assertIsJsonRpcNotification;
      function isJsonRpcRequest(value) {
        return (0, superstruct_1.is)(value, exports.JsonRpcRequestStruct);
      }
      exports.isJsonRpcRequest = isJsonRpcRequest;
      function assertIsJsonRpcRequest(value, ErrorWrapper) {
        (0, assert_1.assertStruct)(value, exports.JsonRpcRequestStruct, 'Invalid JSON-RPC request', ErrorWrapper);
      }
      exports.assertIsJsonRpcRequest = assertIsJsonRpcRequest;
      exports.PendingJsonRpcResponseStruct = (0, superstruct_1.object)({
        id: exports.JsonRpcIdStruct,
        jsonrpc: exports.JsonRpcVersionStruct,
        result: (0, superstruct_1.optional)((0, superstruct_1.unknown)()),
        error: (0, superstruct_1.optional)(exports.JsonRpcErrorStruct)
      });
      exports.JsonRpcSuccessStruct = (0, exports.object)({
        id: exports.JsonRpcIdStruct,
        jsonrpc: exports.JsonRpcVersionStruct,
        result: exports.JsonStruct
      });
      exports.JsonRpcFailureStruct = (0, exports.object)({
        id: exports.JsonRpcIdStruct,
        jsonrpc: exports.JsonRpcVersionStruct,
        error: exports.JsonRpcErrorStruct
      });
      exports.JsonRpcResponseStruct = (0, superstruct_1.union)([exports.JsonRpcSuccessStruct, exports.JsonRpcFailureStruct]);
      function isPendingJsonRpcResponse(response) {
        return (0, superstruct_1.is)(response, exports.PendingJsonRpcResponseStruct);
      }
      exports.isPendingJsonRpcResponse = isPendingJsonRpcResponse;
      function assertIsPendingJsonRpcResponse(response, ErrorWrapper) {
        (0, assert_1.assertStruct)(response, exports.PendingJsonRpcResponseStruct, 'Invalid pending JSON-RPC response', ErrorWrapper);
      }
      exports.assertIsPendingJsonRpcResponse = assertIsPendingJsonRpcResponse;
      function isJsonRpcResponse(response) {
        return (0, superstruct_1.is)(response, exports.JsonRpcResponseStruct);
      }
      exports.isJsonRpcResponse = isJsonRpcResponse;
      function assertIsJsonRpcResponse(value, ErrorWrapper) {
        (0, assert_1.assertStruct)(value, exports.JsonRpcResponseStruct, 'Invalid JSON-RPC response', ErrorWrapper);
      }
      exports.assertIsJsonRpcResponse = assertIsJsonRpcResponse;
      function isJsonRpcSuccess(value) {
        return (0, superstruct_1.is)(value, exports.JsonRpcSuccessStruct);
      }
      exports.isJsonRpcSuccess = isJsonRpcSuccess;
      function assertIsJsonRpcSuccess(value, ErrorWrapper) {
        (0, assert_1.assertStruct)(value, exports.JsonRpcSuccessStruct, 'Invalid JSON-RPC success response', ErrorWrapper);
      }
      exports.assertIsJsonRpcSuccess = assertIsJsonRpcSuccess;
      function isJsonRpcFailure(value) {
        return (0, superstruct_1.is)(value, exports.JsonRpcFailureStruct);
      }
      exports.isJsonRpcFailure = isJsonRpcFailure;
      function assertIsJsonRpcFailure(value, ErrorWrapper) {
        (0, assert_1.assertStruct)(value, exports.JsonRpcFailureStruct, 'Invalid JSON-RPC failure response', ErrorWrapper);
      }
      exports.assertIsJsonRpcFailure = assertIsJsonRpcFailure;
      function isJsonRpcError(value) {
        return (0, superstruct_1.is)(value, exports.JsonRpcErrorStruct);
      }
      exports.isJsonRpcError = isJsonRpcError;
      function assertIsJsonRpcError(value, ErrorWrapper) {
        (0, assert_1.assertStruct)(value, exports.JsonRpcErrorStruct, 'Invalid JSON-RPC error', ErrorWrapper);
      }
      exports.assertIsJsonRpcError = assertIsJsonRpcError;
      function getJsonRpcIdValidator(options) {
        const {
          permitEmptyString,
          permitFractions,
          permitNull
        } = {
          permitEmptyString: true,
          permitFractions: false,
          permitNull: true,
          ...options
        };
        const isValidJsonRpcId = id => {
          return Boolean(typeof id === 'number' && (permitFractions || Number.isInteger(id)) || typeof id === 'string' && (permitEmptyString || id.length > 0) || permitNull && id === null);
        };
        return isValidJsonRpcId;
      }
      exports.getJsonRpcIdValidator = getJsonRpcIdValidator;
    }, {
      "./assert.cjs": 14,
      "./misc.cjs": 28,
      "@metamask/superstruct": 7
    }],
    26: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
    }, {}],
    27: [function (require, module, exports) {
      "use strict";

      var __importDefault = this && this.__importDefault || function (mod) {
        return mod && mod.__esModule ? mod : {
          "default": mod
        };
      };
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.createModuleLogger = exports.createProjectLogger = void 0;
      const debug_1 = __importDefault(require("debug"));
      const globalLogger = (0, debug_1.default)('metamask');
      function createProjectLogger(projectName) {
        return globalLogger.extend(projectName);
      }
      exports.createProjectLogger = createProjectLogger;
      function createModuleLogger(projectLogger, moduleName) {
        return projectLogger.extend(moduleName);
      }
      exports.createModuleLogger = createModuleLogger;
    }, {
      "debug": 44
    }],
    28: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.calculateNumberSize = exports.calculateStringSize = exports.isASCII = exports.isPlainObject = exports.ESCAPE_CHARACTERS_REGEXP = exports.JsonSize = exports.getKnownPropertyNames = exports.hasProperty = exports.isObject = exports.isNullOrUndefined = exports.isNonEmptyArray = void 0;
      function isNonEmptyArray(value) {
        return Array.isArray(value) && value.length > 0;
      }
      exports.isNonEmptyArray = isNonEmptyArray;
      function isNullOrUndefined(value) {
        return value === null || value === undefined;
      }
      exports.isNullOrUndefined = isNullOrUndefined;
      function isObject(value) {
        return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
      }
      exports.isObject = isObject;
      const hasProperty = (objectToCheck, name) => Object.hasOwnProperty.call(objectToCheck, name);
      exports.hasProperty = hasProperty;
      function getKnownPropertyNames(object) {
        return Object.getOwnPropertyNames(object);
      }
      exports.getKnownPropertyNames = getKnownPropertyNames;
      var JsonSize;
      (function (JsonSize) {
        JsonSize[JsonSize["Null"] = 4] = "Null";
        JsonSize[JsonSize["Comma"] = 1] = "Comma";
        JsonSize[JsonSize["Wrapper"] = 1] = "Wrapper";
        JsonSize[JsonSize["True"] = 4] = "True";
        JsonSize[JsonSize["False"] = 5] = "False";
        JsonSize[JsonSize["Quote"] = 1] = "Quote";
        JsonSize[JsonSize["Colon"] = 1] = "Colon";
        JsonSize[JsonSize["Date"] = 24] = "Date";
      })(JsonSize = exports.JsonSize || (exports.JsonSize = {}));
      exports.ESCAPE_CHARACTERS_REGEXP = /"|\\|\n|\r|\t/gu;
      function isPlainObject(value) {
        if (typeof value !== 'object' || value === null) {
          return false;
        }
        try {
          let proto = value;
          while (Object.getPrototypeOf(proto) !== null) {
            proto = Object.getPrototypeOf(proto);
          }
          return Object.getPrototypeOf(value) === proto;
        } catch (_) {
          return false;
        }
      }
      exports.isPlainObject = isPlainObject;
      function isASCII(character) {
        return character.charCodeAt(0) <= 127;
      }
      exports.isASCII = isASCII;
      function calculateStringSize(value) {
        const size = value.split('').reduce((total, character) => {
          if (isASCII(character)) {
            return total + 1;
          }
          return total + 2;
        }, 0);
        return size + (value.match(exports.ESCAPE_CHARACTERS_REGEXP) ?? []).length;
      }
      exports.calculateStringSize = calculateStringSize;
      function calculateNumberSize(value) {
        return value.toString().length;
      }
      exports.calculateNumberSize = calculateNumberSize;
    }, {}],
    29: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.hexToBigInt = exports.hexToNumber = exports.bigIntToHex = exports.numberToHex = void 0;
      const assert_1 = require("./assert.cjs");
      const hex_1 = require("./hex.cjs");
      const numberToHex = value => {
        (0, assert_1.assert)(typeof value === 'number', 'Value must be a number.');
        (0, assert_1.assert)(value >= 0, 'Value must be a non-negative number.');
        (0, assert_1.assert)(Number.isSafeInteger(value), 'Value is not a safe integer. Use `bigIntToHex` instead.');
        return (0, hex_1.add0x)(value.toString(16));
      };
      exports.numberToHex = numberToHex;
      const bigIntToHex = value => {
        (0, assert_1.assert)(typeof value === 'bigint', 'Value must be a bigint.');
        (0, assert_1.assert)(value >= 0, 'Value must be a non-negative bigint.');
        return (0, hex_1.add0x)(value.toString(16));
      };
      exports.bigIntToHex = bigIntToHex;
      const hexToNumber = value => {
        (0, hex_1.assertIsHexString)(value);
        const numberValue = parseInt(value, 16);
        (0, assert_1.assert)(Number.isSafeInteger(numberValue), 'Value is not a safe integer. Use `hexToBigInt` instead.');
        return numberValue;
      };
      exports.hexToNumber = hexToNumber;
      const hexToBigInt = value => {
        (0, hex_1.assertIsHexString)(value);
        return BigInt((0, hex_1.add0x)(value));
      };
      exports.hexToBigInt = hexToBigInt;
    }, {
      "./assert.cjs": 14,
      "./hex.cjs": 23
    }],
    30: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
    }, {}],
    31: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.createDeferredPromise = void 0;
      function createDeferredPromise({
        suppressUnhandledRejection = false
      } = {}) {
        let resolve;
        let reject;
        const promise = new Promise((innerResolve, innerReject) => {
          resolve = innerResolve;
          reject = innerReject;
        });
        if (suppressUnhandledRejection) {
          promise.catch(_error => {});
        }
        return {
          promise,
          resolve,
          reject
        };
      }
      exports.createDeferredPromise = createDeferredPromise;
    }, {}],
    32: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.timeSince = exports.inMilliseconds = exports.Duration = void 0;
      var Duration;
      (function (Duration) {
        Duration[Duration["Millisecond"] = 1] = "Millisecond";
        Duration[Duration["Second"] = 1000] = "Second";
        Duration[Duration["Minute"] = 60000] = "Minute";
        Duration[Duration["Hour"] = 3600000] = "Hour";
        Duration[Duration["Day"] = 86400000] = "Day";
        Duration[Duration["Week"] = 604800000] = "Week";
        Duration[Duration["Year"] = 31536000000] = "Year";
      })(Duration = exports.Duration || (exports.Duration = {}));
      const isNonNegativeInteger = number => Number.isInteger(number) && number >= 0;
      const assertIsNonNegativeInteger = (number, name) => {
        if (!isNonNegativeInteger(number)) {
          throw new Error(`"${name}" must be a non-negative integer. Received: "${number}".`);
        }
      };
      function inMilliseconds(count, duration) {
        assertIsNonNegativeInteger(count, 'count');
        return count * duration;
      }
      exports.inMilliseconds = inMilliseconds;
      function timeSince(timestamp) {
        assertIsNonNegativeInteger(timestamp, 'timestamp');
        return Date.now() - timestamp;
      }
      exports.timeSince = timeSince;
    }, {}],
    33: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
    }, {}],
    34: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.satisfiesVersionRange = exports.gtRange = exports.gtVersion = exports.assertIsSemVerRange = exports.assertIsSemVerVersion = exports.isValidSemVerRange = exports.isValidSemVerVersion = exports.VersionRangeStruct = exports.VersionStruct = void 0;
      const superstruct_1 = require("@metamask/superstruct");
      const semver_1 = require("semver");
      const assert_1 = require("./assert.cjs");
      exports.VersionStruct = (0, superstruct_1.refine)((0, superstruct_1.string)(), 'Version', value => {
        if ((0, semver_1.valid)(value) === null) {
          return `Expected SemVer version, got "${value}"`;
        }
        return true;
      });
      exports.VersionRangeStruct = (0, superstruct_1.refine)((0, superstruct_1.string)(), 'Version range', value => {
        if ((0, semver_1.validRange)(value) === null) {
          return `Expected SemVer range, got "${value}"`;
        }
        return true;
      });
      function isValidSemVerVersion(version) {
        return (0, superstruct_1.is)(version, exports.VersionStruct);
      }
      exports.isValidSemVerVersion = isValidSemVerVersion;
      function isValidSemVerRange(versionRange) {
        return (0, superstruct_1.is)(versionRange, exports.VersionRangeStruct);
      }
      exports.isValidSemVerRange = isValidSemVerRange;
      function assertIsSemVerVersion(version) {
        (0, assert_1.assertStruct)(version, exports.VersionStruct);
      }
      exports.assertIsSemVerVersion = assertIsSemVerVersion;
      function assertIsSemVerRange(range) {
        (0, assert_1.assertStruct)(range, exports.VersionRangeStruct);
      }
      exports.assertIsSemVerRange = assertIsSemVerRange;
      function gtVersion(version1, version2) {
        return (0, semver_1.gt)(version1, version2);
      }
      exports.gtVersion = gtVersion;
      function gtRange(version, range) {
        return (0, semver_1.gtr)(version, range);
      }
      exports.gtRange = gtRange;
      function satisfiesVersionRange(version, versionRange) {
        return (0, semver_1.satisfies)(version, versionRange, {
          includePrerelease: true
        });
      }
      exports.satisfiesVersionRange = satisfiesVersionRange;
    }, {
      "./assert.cjs": 14,
      "@metamask/superstruct": 7,
      "semver": 79
    }],
    35: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.output = exports.exists = exports.hash = exports.bytes = exports.bool = exports.number = exports.isBytes = void 0;
      function number(n) {
        if (!Number.isSafeInteger(n) || n < 0) throw new Error(`positive integer expected, not ${n}`);
      }
      exports.number = number;
      function bool(b) {
        if (typeof b !== 'boolean') throw new Error(`boolean expected, not ${b}`);
      }
      exports.bool = bool;
      function isBytes(a) {
        return a instanceof Uint8Array || a != null && typeof a === 'object' && a.constructor.name === 'Uint8Array';
      }
      exports.isBytes = isBytes;
      function bytes(b, ...lengths) {
        if (!isBytes(b)) throw new Error('Uint8Array expected');
        if (lengths.length > 0 && !lengths.includes(b.length)) throw new Error(`Uint8Array expected of length ${lengths}, not of length=${b.length}`);
      }
      exports.bytes = bytes;
      function hash(h) {
        if (typeof h !== 'function' || typeof h.create !== 'function') throw new Error('Hash should be wrapped by utils.wrapConstructor');
        number(h.outputLen);
        number(h.blockLen);
      }
      exports.hash = hash;
      function exists(instance, checkFinished = true) {
        if (instance.destroyed) throw new Error('Hash instance has been destroyed');
        if (checkFinished && instance.finished) throw new Error('Hash#digest() has already been called');
      }
      exports.exists = exists;
      function output(out, instance) {
        bytes(out);
        const min = instance.outputLen;
        if (out.length < min) {
          throw new Error(`digestInto() expects output buffer of length at least ${min}`);
        }
      }
      exports.output = output;
      const assert = {
        number,
        bool,
        bytes,
        hash,
        exists,
        output
      };
      exports.default = assert;
    }, {}],
    36: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.add5L = exports.add5H = exports.add4H = exports.add4L = exports.add3H = exports.add3L = exports.add = exports.rotlBL = exports.rotlBH = exports.rotlSL = exports.rotlSH = exports.rotr32L = exports.rotr32H = exports.rotrBL = exports.rotrBH = exports.rotrSL = exports.rotrSH = exports.shrSL = exports.shrSH = exports.toBig = exports.split = exports.fromBig = void 0;
      const U32_MASK64 = BigInt(2 ** 32 - 1);
      const _32n = BigInt(32);
      function fromBig(n, le = false) {
        if (le) return {
          h: Number(n & U32_MASK64),
          l: Number(n >> _32n & U32_MASK64)
        };
        return {
          h: Number(n >> _32n & U32_MASK64) | 0,
          l: Number(n & U32_MASK64) | 0
        };
      }
      exports.fromBig = fromBig;
      function split(lst, le = false) {
        let Ah = new Uint32Array(lst.length);
        let Al = new Uint32Array(lst.length);
        for (let i = 0; i < lst.length; i++) {
          const {
            h,
            l
          } = fromBig(lst[i], le);
          [Ah[i], Al[i]] = [h, l];
        }
        return [Ah, Al];
      }
      exports.split = split;
      const toBig = (h, l) => BigInt(h >>> 0) << _32n | BigInt(l >>> 0);
      exports.toBig = toBig;
      const shrSH = (h, _l, s) => h >>> s;
      exports.shrSH = shrSH;
      const shrSL = (h, l, s) => h << 32 - s | l >>> s;
      exports.shrSL = shrSL;
      const rotrSH = (h, l, s) => h >>> s | l << 32 - s;
      exports.rotrSH = rotrSH;
      const rotrSL = (h, l, s) => h << 32 - s | l >>> s;
      exports.rotrSL = rotrSL;
      const rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
      exports.rotrBH = rotrBH;
      const rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
      exports.rotrBL = rotrBL;
      const rotr32H = (_h, l) => l;
      exports.rotr32H = rotr32H;
      const rotr32L = (h, _l) => h;
      exports.rotr32L = rotr32L;
      const rotlSH = (h, l, s) => h << s | l >>> 32 - s;
      exports.rotlSH = rotlSH;
      const rotlSL = (h, l, s) => l << s | h >>> 32 - s;
      exports.rotlSL = rotlSL;
      const rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;
      exports.rotlBH = rotlBH;
      const rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
      exports.rotlBL = rotlBL;
      function add(Ah, Al, Bh, Bl) {
        const l = (Al >>> 0) + (Bl >>> 0);
        return {
          h: Ah + Bh + (l / 2 ** 32 | 0) | 0,
          l: l | 0
        };
      }
      exports.add = add;
      const add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
      exports.add3L = add3L;
      const add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
      exports.add3H = add3H;
      const add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
      exports.add4L = add4L;
      const add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
      exports.add4H = add4H;
      const add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
      exports.add5L = add5L;
      const add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
      exports.add5H = add5H;
      const u64 = {
        fromBig,
        split,
        toBig,
        shrSH,
        shrSL,
        rotrSH,
        rotrSL,
        rotrBH,
        rotrBL,
        rotr32H,
        rotr32L,
        rotlSH,
        rotlSL,
        rotlBH,
        rotlBL,
        add,
        add3L,
        add3H,
        add4L,
        add4H,
        add5H,
        add5L
      };
      exports.default = u64;
    }, {}],
    37: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.crypto = void 0;
      exports.crypto = typeof globalThis === 'object' && 'crypto' in globalThis ? globalThis.crypto : undefined;
    }, {}],
    38: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.shake256 = exports.shake128 = exports.keccak_512 = exports.keccak_384 = exports.keccak_256 = exports.keccak_224 = exports.sha3_512 = exports.sha3_384 = exports.sha3_256 = exports.sha3_224 = exports.Keccak = exports.keccakP = void 0;
      const _assert_js_1 = require("./_assert.js");
      const _u64_js_1 = require("./_u64.js");
      const utils_js_1 = require("./utils.js");
      const SHA3_PI = [];
      const SHA3_ROTL = [];
      const _SHA3_IOTA = [];
      const _0n = BigInt(0);
      const _1n = BigInt(1);
      const _2n = BigInt(2);
      const _7n = BigInt(7);
      const _256n = BigInt(256);
      const _0x71n = BigInt(0x71);
      for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
        [x, y] = [y, (2 * x + 3 * y) % 5];
        SHA3_PI.push(2 * (5 * y + x));
        SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
        let t = _0n;
        for (let j = 0; j < 7; j++) {
          R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
          if (R & _2n) t ^= _1n << (_1n << BigInt(j)) - _1n;
        }
        _SHA3_IOTA.push(t);
      }
      const [SHA3_IOTA_H, SHA3_IOTA_L] = (0, _u64_js_1.split)(_SHA3_IOTA, true);
      const rotlH = (h, l, s) => s > 32 ? (0, _u64_js_1.rotlBH)(h, l, s) : (0, _u64_js_1.rotlSH)(h, l, s);
      const rotlL = (h, l, s) => s > 32 ? (0, _u64_js_1.rotlBL)(h, l, s) : (0, _u64_js_1.rotlSL)(h, l, s);
      function keccakP(s, rounds = 24) {
        const B = new Uint32Array(5 * 2);
        for (let round = 24 - rounds; round < 24; round++) {
          for (let x = 0; x < 10; x++) B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
          for (let x = 0; x < 10; x += 2) {
            const idx1 = (x + 8) % 10;
            const idx0 = (x + 2) % 10;
            const B0 = B[idx0];
            const B1 = B[idx0 + 1];
            const Th = rotlH(B0, B1, 1) ^ B[idx1];
            const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
            for (let y = 0; y < 50; y += 10) {
              s[x + y] ^= Th;
              s[x + y + 1] ^= Tl;
            }
          }
          let curH = s[2];
          let curL = s[3];
          for (let t = 0; t < 24; t++) {
            const shift = SHA3_ROTL[t];
            const Th = rotlH(curH, curL, shift);
            const Tl = rotlL(curH, curL, shift);
            const PI = SHA3_PI[t];
            curH = s[PI];
            curL = s[PI + 1];
            s[PI] = Th;
            s[PI + 1] = Tl;
          }
          for (let y = 0; y < 50; y += 10) {
            for (let x = 0; x < 10; x++) B[x] = s[y + x];
            for (let x = 0; x < 10; x++) s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
          }
          s[0] ^= SHA3_IOTA_H[round];
          s[1] ^= SHA3_IOTA_L[round];
        }
        B.fill(0);
      }
      exports.keccakP = keccakP;
      class Keccak extends utils_js_1.Hash {
        constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
          super();
          this.blockLen = blockLen;
          this.suffix = suffix;
          this.outputLen = outputLen;
          this.enableXOF = enableXOF;
          this.rounds = rounds;
          this.pos = 0;
          this.posOut = 0;
          this.finished = false;
          this.destroyed = false;
          (0, _assert_js_1.number)(outputLen);
          if (0 >= this.blockLen || this.blockLen >= 200) throw new Error('Sha3 supports only keccak-f1600 function');
          this.state = new Uint8Array(200);
          this.state32 = (0, utils_js_1.u32)(this.state);
        }
        keccak() {
          if (!utils_js_1.isLE) (0, utils_js_1.byteSwap32)(this.state32);
          keccakP(this.state32, this.rounds);
          if (!utils_js_1.isLE) (0, utils_js_1.byteSwap32)(this.state32);
          this.posOut = 0;
          this.pos = 0;
        }
        update(data) {
          (0, _assert_js_1.exists)(this);
          const {
            blockLen,
            state
          } = this;
          data = (0, utils_js_1.toBytes)(data);
          const len = data.length;
          for (let pos = 0; pos < len;) {
            const take = Math.min(blockLen - this.pos, len - pos);
            for (let i = 0; i < take; i++) state[this.pos++] ^= data[pos++];
            if (this.pos === blockLen) this.keccak();
          }
          return this;
        }
        finish() {
          if (this.finished) return;
          this.finished = true;
          const {
            state,
            suffix,
            pos,
            blockLen
          } = this;
          state[pos] ^= suffix;
          if ((suffix & 0x80) !== 0 && pos === blockLen - 1) this.keccak();
          state[blockLen - 1] ^= 0x80;
          this.keccak();
        }
        writeInto(out) {
          (0, _assert_js_1.exists)(this, false);
          (0, _assert_js_1.bytes)(out);
          this.finish();
          const bufferOut = this.state;
          const {
            blockLen
          } = this;
          for (let pos = 0, len = out.length; pos < len;) {
            if (this.posOut >= blockLen) this.keccak();
            const take = Math.min(blockLen - this.posOut, len - pos);
            out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
            this.posOut += take;
            pos += take;
          }
          return out;
        }
        xofInto(out) {
          if (!this.enableXOF) throw new Error('XOF is not possible for this instance');
          return this.writeInto(out);
        }
        xof(bytes) {
          (0, _assert_js_1.number)(bytes);
          return this.xofInto(new Uint8Array(bytes));
        }
        digestInto(out) {
          (0, _assert_js_1.output)(out, this);
          if (this.finished) throw new Error('digest() was already called');
          this.writeInto(out);
          this.destroy();
          return out;
        }
        digest() {
          return this.digestInto(new Uint8Array(this.outputLen));
        }
        destroy() {
          this.destroyed = true;
          this.state.fill(0);
        }
        _cloneInto(to) {
          const {
            blockLen,
            suffix,
            outputLen,
            rounds,
            enableXOF
          } = this;
          to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
          to.state32.set(this.state32);
          to.pos = this.pos;
          to.posOut = this.posOut;
          to.finished = this.finished;
          to.rounds = rounds;
          to.suffix = suffix;
          to.outputLen = outputLen;
          to.enableXOF = enableXOF;
          to.destroyed = this.destroyed;
          return to;
        }
      }
      exports.Keccak = Keccak;
      const gen = (suffix, blockLen, outputLen) => (0, utils_js_1.wrapConstructor)(() => new Keccak(blockLen, suffix, outputLen));
      exports.sha3_224 = gen(0x06, 144, 224 / 8);
      exports.sha3_256 = gen(0x06, 136, 256 / 8);
      exports.sha3_384 = gen(0x06, 104, 384 / 8);
      exports.sha3_512 = gen(0x06, 72, 512 / 8);
      exports.keccak_224 = gen(0x01, 144, 224 / 8);
      exports.keccak_256 = gen(0x01, 136, 256 / 8);
      exports.keccak_384 = gen(0x01, 104, 384 / 8);
      exports.keccak_512 = gen(0x01, 72, 512 / 8);
      const genShake = (suffix, blockLen, outputLen) => (0, utils_js_1.wrapXOFConstructorWithOpts)((opts = {}) => new Keccak(blockLen, suffix, opts.dkLen === undefined ? outputLen : opts.dkLen, true));
      exports.shake128 = genShake(0x1f, 168, 128 / 8);
      exports.shake256 = genShake(0x1f, 136, 256 / 8);
    }, {
      "./_assert.js": 35,
      "./_u64.js": 36,
      "./utils.js": 39
    }],
    39: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.randomBytes = exports.wrapXOFConstructorWithOpts = exports.wrapConstructorWithOpts = exports.wrapConstructor = exports.checkOpts = exports.Hash = exports.concatBytes = exports.toBytes = exports.utf8ToBytes = exports.asyncLoop = exports.nextTick = exports.hexToBytes = exports.bytesToHex = exports.byteSwap32 = exports.byteSwapIfBE = exports.byteSwap = exports.isLE = exports.rotl = exports.rotr = exports.createView = exports.u32 = exports.u8 = exports.isBytes = void 0;
      const crypto_1 = require("@noble/hashes/crypto");
      const _assert_js_1 = require("./_assert.js");
      function isBytes(a) {
        return a instanceof Uint8Array || a != null && typeof a === 'object' && a.constructor.name === 'Uint8Array';
      }
      exports.isBytes = isBytes;
      const u8 = arr => new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
      exports.u8 = u8;
      const u32 = arr => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
      exports.u32 = u32;
      const createView = arr => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
      exports.createView = createView;
      const rotr = (word, shift) => word << 32 - shift | word >>> shift;
      exports.rotr = rotr;
      const rotl = (word, shift) => word << shift | word >>> 32 - shift >>> 0;
      exports.rotl = rotl;
      exports.isLE = new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44;
      const byteSwap = word => word << 24 & 0xff000000 | word << 8 & 0xff0000 | word >>> 8 & 0xff00 | word >>> 24 & 0xff;
      exports.byteSwap = byteSwap;
      exports.byteSwapIfBE = exports.isLE ? n => n : n => (0, exports.byteSwap)(n);
      function byteSwap32(arr) {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = (0, exports.byteSwap)(arr[i]);
        }
      }
      exports.byteSwap32 = byteSwap32;
      const hexes = Array.from({
        length: 256
      }, (_, i) => i.toString(16).padStart(2, '0'));
      function bytesToHex(bytes) {
        (0, _assert_js_1.bytes)(bytes);
        let hex = '';
        for (let i = 0; i < bytes.length; i++) {
          hex += hexes[bytes[i]];
        }
        return hex;
      }
      exports.bytesToHex = bytesToHex;
      const asciis = {
        _0: 48,
        _9: 57,
        _A: 65,
        _F: 70,
        _a: 97,
        _f: 102
      };
      function asciiToBase16(char) {
        if (char >= asciis._0 && char <= asciis._9) return char - asciis._0;
        if (char >= asciis._A && char <= asciis._F) return char - (asciis._A - 10);
        if (char >= asciis._a && char <= asciis._f) return char - (asciis._a - 10);
        return;
      }
      function hexToBytes(hex) {
        if (typeof hex !== 'string') throw new Error('hex string expected, got ' + typeof hex);
        const hl = hex.length;
        const al = hl / 2;
        if (hl % 2) throw new Error('padded hex string expected, got unpadded hex of length ' + hl);
        const array = new Uint8Array(al);
        for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
          const n1 = asciiToBase16(hex.charCodeAt(hi));
          const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
          if (n1 === undefined || n2 === undefined) {
            const char = hex[hi] + hex[hi + 1];
            throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
          }
          array[ai] = n1 * 16 + n2;
        }
        return array;
      }
      exports.hexToBytes = hexToBytes;
      const nextTick = async () => {};
      exports.nextTick = nextTick;
      async function asyncLoop(iters, tick, cb) {
        let ts = Date.now();
        for (let i = 0; i < iters; i++) {
          cb(i);
          const diff = Date.now() - ts;
          if (diff >= 0 && diff < tick) continue;
          await (0, exports.nextTick)();
          ts += diff;
        }
      }
      exports.asyncLoop = asyncLoop;
      function utf8ToBytes(str) {
        if (typeof str !== 'string') throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
        return new Uint8Array(new TextEncoder().encode(str));
      }
      exports.utf8ToBytes = utf8ToBytes;
      function toBytes(data) {
        if (typeof data === 'string') data = utf8ToBytes(data);
        (0, _assert_js_1.bytes)(data);
        return data;
      }
      exports.toBytes = toBytes;
      function concatBytes(...arrays) {
        let sum = 0;
        for (let i = 0; i < arrays.length; i++) {
          const a = arrays[i];
          (0, _assert_js_1.bytes)(a);
          sum += a.length;
        }
        const res = new Uint8Array(sum);
        for (let i = 0, pad = 0; i < arrays.length; i++) {
          const a = arrays[i];
          res.set(a, pad);
          pad += a.length;
        }
        return res;
      }
      exports.concatBytes = concatBytes;
      class Hash {
        clone() {
          return this._cloneInto();
        }
      }
      exports.Hash = Hash;
      const toStr = {}.toString;
      function checkOpts(defaults, opts) {
        if (opts !== undefined && toStr.call(opts) !== '[object Object]') throw new Error('Options should be object or undefined');
        const merged = Object.assign(defaults, opts);
        return merged;
      }
      exports.checkOpts = checkOpts;
      function wrapConstructor(hashCons) {
        const hashC = msg => hashCons().update(toBytes(msg)).digest();
        const tmp = hashCons();
        hashC.outputLen = tmp.outputLen;
        hashC.blockLen = tmp.blockLen;
        hashC.create = () => hashCons();
        return hashC;
      }
      exports.wrapConstructor = wrapConstructor;
      function wrapConstructorWithOpts(hashCons) {
        const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
        const tmp = hashCons({});
        hashC.outputLen = tmp.outputLen;
        hashC.blockLen = tmp.blockLen;
        hashC.create = opts => hashCons(opts);
        return hashC;
      }
      exports.wrapConstructorWithOpts = wrapConstructorWithOpts;
      function wrapXOFConstructorWithOpts(hashCons) {
        const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
        const tmp = hashCons({});
        hashC.outputLen = tmp.outputLen;
        hashC.blockLen = tmp.blockLen;
        hashC.create = opts => hashCons(opts);
        return hashC;
      }
      exports.wrapXOFConstructorWithOpts = wrapXOFConstructorWithOpts;
      function randomBytes(bytesLength = 32) {
        if (crypto_1.crypto && typeof crypto_1.crypto.getRandomValues === 'function') {
          return crypto_1.crypto.getRandomValues(new Uint8Array(bytesLength));
        }
        throw new Error('crypto.getRandomValues must be defined');
      }
      exports.randomBytes = randomBytes;
    }, {
      "./_assert.js": 35,
      "@noble/hashes/crypto": 37
    }],
    40: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.bytes = exports.stringToBytes = exports.str = exports.bytesToString = exports.hex = exports.utf8 = exports.bech32m = exports.bech32 = exports.base58check = exports.base58xmr = exports.base58xrp = exports.base58flickr = exports.base58 = exports.base64urlnopad = exports.base64url = exports.base64 = exports.base32crockford = exports.base32hex = exports.base32 = exports.base16 = exports.utils = exports.assertNumber = void 0;
      function assertNumber(n) {
        if (!Number.isSafeInteger(n)) throw new Error(`Wrong integer: ${n}`);
      }
      exports.assertNumber = assertNumber;
      function chain(...args) {
        const wrap = (a, b) => c => a(b(c));
        const encode = Array.from(args).reverse().reduce((acc, i) => acc ? wrap(acc, i.encode) : i.encode, undefined);
        const decode = args.reduce((acc, i) => acc ? wrap(acc, i.decode) : i.decode, undefined);
        return {
          encode,
          decode
        };
      }
      function alphabet(alphabet) {
        return {
          encode: digits => {
            if (!Array.isArray(digits) || digits.length && typeof digits[0] !== 'number') throw new Error('alphabet.encode input should be an array of numbers');
            return digits.map(i => {
              assertNumber(i);
              if (i < 0 || i >= alphabet.length) throw new Error(`Digit index outside alphabet: ${i} (alphabet: ${alphabet.length})`);
              return alphabet[i];
            });
          },
          decode: input => {
            if (!Array.isArray(input) || input.length && typeof input[0] !== 'string') throw new Error('alphabet.decode input should be array of strings');
            return input.map(letter => {
              if (typeof letter !== 'string') throw new Error(`alphabet.decode: not string element=${letter}`);
              const index = alphabet.indexOf(letter);
              if (index === -1) throw new Error(`Unknown letter: "${letter}". Allowed: ${alphabet}`);
              return index;
            });
          }
        };
      }
      function join(separator = '') {
        if (typeof separator !== 'string') throw new Error('join separator should be string');
        return {
          encode: from => {
            if (!Array.isArray(from) || from.length && typeof from[0] !== 'string') throw new Error('join.encode input should be array of strings');
            for (let i of from) if (typeof i !== 'string') throw new Error(`join.encode: non-string input=${i}`);
            return from.join(separator);
          },
          decode: to => {
            if (typeof to !== 'string') throw new Error('join.decode input should be string');
            return to.split(separator);
          }
        };
      }
      function padding(bits, chr = '=') {
        assertNumber(bits);
        if (typeof chr !== 'string') throw new Error('padding chr should be string');
        return {
          encode(data) {
            if (!Array.isArray(data) || data.length && typeof data[0] !== 'string') throw new Error('padding.encode input should be array of strings');
            for (let i of data) if (typeof i !== 'string') throw new Error(`padding.encode: non-string input=${i}`);
            while (data.length * bits % 8) data.push(chr);
            return data;
          },
          decode(input) {
            if (!Array.isArray(input) || input.length && typeof input[0] !== 'string') throw new Error('padding.encode input should be array of strings');
            for (let i of input) if (typeof i !== 'string') throw new Error(`padding.decode: non-string input=${i}`);
            let end = input.length;
            if (end * bits % 8) throw new Error('Invalid padding: string should have whole number of bytes');
            for (; end > 0 && input[end - 1] === chr; end--) {
              if (!((end - 1) * bits % 8)) throw new Error('Invalid padding: string has too much padding');
            }
            return input.slice(0, end);
          }
        };
      }
      function normalize(fn) {
        if (typeof fn !== 'function') throw new Error('normalize fn should be function');
        return {
          encode: from => from,
          decode: to => fn(to)
        };
      }
      function convertRadix(data, from, to) {
        if (from < 2) throw new Error(`convertRadix: wrong from=${from}, base cannot be less than 2`);
        if (to < 2) throw new Error(`convertRadix: wrong to=${to}, base cannot be less than 2`);
        if (!Array.isArray(data)) throw new Error('convertRadix: data should be array');
        if (!data.length) return [];
        let pos = 0;
        const res = [];
        const digits = Array.from(data);
        digits.forEach(d => {
          assertNumber(d);
          if (d < 0 || d >= from) throw new Error(`Wrong integer: ${d}`);
        });
        while (true) {
          let carry = 0;
          let done = true;
          for (let i = pos; i < digits.length; i++) {
            const digit = digits[i];
            const digitBase = from * carry + digit;
            if (!Number.isSafeInteger(digitBase) || from * carry / from !== carry || digitBase - digit !== from * carry) {
              throw new Error('convertRadix: carry overflow');
            }
            carry = digitBase % to;
            const rounded = Math.floor(digitBase / to);
            digits[i] = rounded;
            if (!Number.isSafeInteger(rounded) || rounded * to + carry !== digitBase) throw new Error('convertRadix: carry overflow');
            if (!done) continue;else if (!rounded) pos = i;else done = false;
          }
          res.push(carry);
          if (done) break;
        }
        for (let i = 0; i < data.length - 1 && data[i] === 0; i++) res.push(0);
        return res.reverse();
      }
      const gcd = (a, b) => !b ? a : gcd(b, a % b);
      const radix2carry = (from, to) => from + (to - gcd(from, to));
      function convertRadix2(data, from, to, padding) {
        if (!Array.isArray(data)) throw new Error('convertRadix2: data should be array');
        if (from <= 0 || from > 32) throw new Error(`convertRadix2: wrong from=${from}`);
        if (to <= 0 || to > 32) throw new Error(`convertRadix2: wrong to=${to}`);
        if (radix2carry(from, to) > 32) {
          throw new Error(`convertRadix2: carry overflow from=${from} to=${to} carryBits=${radix2carry(from, to)}`);
        }
        let carry = 0;
        let pos = 0;
        const mask = 2 ** to - 1;
        const res = [];
        for (const n of data) {
          assertNumber(n);
          if (n >= 2 ** from) throw new Error(`convertRadix2: invalid data word=${n} from=${from}`);
          carry = carry << from | n;
          if (pos + from > 32) throw new Error(`convertRadix2: carry overflow pos=${pos} from=${from}`);
          pos += from;
          for (; pos >= to; pos -= to) res.push((carry >> pos - to & mask) >>> 0);
          carry &= 2 ** pos - 1;
        }
        carry = carry << to - pos & mask;
        if (!padding && pos >= from) throw new Error('Excess padding');
        if (!padding && carry) throw new Error(`Non-zero padding: ${carry}`);
        if (padding && pos > 0) res.push(carry >>> 0);
        return res;
      }
      function radix(num) {
        assertNumber(num);
        return {
          encode: bytes => {
            if (!(bytes instanceof Uint8Array)) throw new Error('radix.encode input should be Uint8Array');
            return convertRadix(Array.from(bytes), 2 ** 8, num);
          },
          decode: digits => {
            if (!Array.isArray(digits) || digits.length && typeof digits[0] !== 'number') throw new Error('radix.decode input should be array of strings');
            return Uint8Array.from(convertRadix(digits, num, 2 ** 8));
          }
        };
      }
      function radix2(bits, revPadding = false) {
        assertNumber(bits);
        if (bits <= 0 || bits > 32) throw new Error('radix2: bits should be in (0..32]');
        if (radix2carry(8, bits) > 32 || radix2carry(bits, 8) > 32) throw new Error('radix2: carry overflow');
        return {
          encode: bytes => {
            if (!(bytes instanceof Uint8Array)) throw new Error('radix2.encode input should be Uint8Array');
            return convertRadix2(Array.from(bytes), 8, bits, !revPadding);
          },
          decode: digits => {
            if (!Array.isArray(digits) || digits.length && typeof digits[0] !== 'number') throw new Error('radix2.decode input should be array of strings');
            return Uint8Array.from(convertRadix2(digits, bits, 8, revPadding));
          }
        };
      }
      function unsafeWrapper(fn) {
        if (typeof fn !== 'function') throw new Error('unsafeWrapper fn should be function');
        return function (...args) {
          try {
            return fn.apply(null, args);
          } catch (e) {}
        };
      }
      function checksum(len, fn) {
        assertNumber(len);
        if (typeof fn !== 'function') throw new Error('checksum fn should be function');
        return {
          encode(data) {
            if (!(data instanceof Uint8Array)) throw new Error('checksum.encode: input should be Uint8Array');
            const checksum = fn(data).slice(0, len);
            const res = new Uint8Array(data.length + len);
            res.set(data);
            res.set(checksum, data.length);
            return res;
          },
          decode(data) {
            if (!(data instanceof Uint8Array)) throw new Error('checksum.decode: input should be Uint8Array');
            const payload = data.slice(0, -len);
            const newChecksum = fn(payload).slice(0, len);
            const oldChecksum = data.slice(-len);
            for (let i = 0; i < len; i++) if (newChecksum[i] !== oldChecksum[i]) throw new Error('Invalid checksum');
            return payload;
          }
        };
      }
      exports.utils = {
        alphabet,
        chain,
        checksum,
        radix,
        radix2,
        join,
        padding
      };
      exports.base16 = chain(radix2(4), alphabet('0123456789ABCDEF'), join(''));
      exports.base32 = chain(radix2(5), alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'), padding(5), join(''));
      exports.base32hex = chain(radix2(5), alphabet('0123456789ABCDEFGHIJKLMNOPQRSTUV'), padding(5), join(''));
      exports.base32crockford = chain(radix2(5), alphabet('0123456789ABCDEFGHJKMNPQRSTVWXYZ'), join(''), normalize(s => s.toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1')));
      exports.base64 = chain(radix2(6), alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'), padding(6), join(''));
      exports.base64url = chain(radix2(6), alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'), padding(6), join(''));
      exports.base64urlnopad = chain(radix2(6), alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'), join(''));
      const genBase58 = abc => chain(radix(58), alphabet(abc), join(''));
      exports.base58 = genBase58('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');
      exports.base58flickr = genBase58('123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ');
      exports.base58xrp = genBase58('rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz');
      const XMR_BLOCK_LEN = [0, 2, 3, 5, 6, 7, 9, 10, 11];
      exports.base58xmr = {
        encode(data) {
          let res = '';
          for (let i = 0; i < data.length; i += 8) {
            const block = data.subarray(i, i + 8);
            res += exports.base58.encode(block).padStart(XMR_BLOCK_LEN[block.length], '1');
          }
          return res;
        },
        decode(str) {
          let res = [];
          for (let i = 0; i < str.length; i += 11) {
            const slice = str.slice(i, i + 11);
            const blockLen = XMR_BLOCK_LEN.indexOf(slice.length);
            const block = exports.base58.decode(slice);
            for (let j = 0; j < block.length - blockLen; j++) {
              if (block[j] !== 0) throw new Error('base58xmr: wrong padding');
            }
            res = res.concat(Array.from(block.slice(block.length - blockLen)));
          }
          return Uint8Array.from(res);
        }
      };
      const base58check = sha256 => chain(checksum(4, data => sha256(sha256(data))), exports.base58);
      exports.base58check = base58check;
      const BECH_ALPHABET = chain(alphabet('qpzry9x8gf2tvdw0s3jn54khce6mua7l'), join(''));
      const POLYMOD_GENERATORS = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
      function bech32Polymod(pre) {
        const b = pre >> 25;
        let chk = (pre & 0x1ffffff) << 5;
        for (let i = 0; i < POLYMOD_GENERATORS.length; i++) {
          if ((b >> i & 1) === 1) chk ^= POLYMOD_GENERATORS[i];
        }
        return chk;
      }
      function bechChecksum(prefix, words, encodingConst = 1) {
        const len = prefix.length;
        let chk = 1;
        for (let i = 0; i < len; i++) {
          const c = prefix.charCodeAt(i);
          if (c < 33 || c > 126) throw new Error(`Invalid prefix (${prefix})`);
          chk = bech32Polymod(chk) ^ c >> 5;
        }
        chk = bech32Polymod(chk);
        for (let i = 0; i < len; i++) chk = bech32Polymod(chk) ^ prefix.charCodeAt(i) & 0x1f;
        for (let v of words) chk = bech32Polymod(chk) ^ v;
        for (let i = 0; i < 6; i++) chk = bech32Polymod(chk);
        chk ^= encodingConst;
        return BECH_ALPHABET.encode(convertRadix2([chk % 2 ** 30], 30, 5, false));
      }
      function genBech32(encoding) {
        const ENCODING_CONST = encoding === 'bech32' ? 1 : 0x2bc830a3;
        const _words = radix2(5);
        const fromWords = _words.decode;
        const toWords = _words.encode;
        const fromWordsUnsafe = unsafeWrapper(fromWords);
        function encode(prefix, words, limit = 90) {
          if (typeof prefix !== 'string') throw new Error(`bech32.encode prefix should be string, not ${typeof prefix}`);
          if (!Array.isArray(words) || words.length && typeof words[0] !== 'number') throw new Error(`bech32.encode words should be array of numbers, not ${typeof words}`);
          const actualLength = prefix.length + 7 + words.length;
          if (limit !== false && actualLength > limit) throw new TypeError(`Length ${actualLength} exceeds limit ${limit}`);
          const lowered = prefix.toLowerCase();
          const sum = bechChecksum(lowered, words, ENCODING_CONST);
          return `${lowered}1${BECH_ALPHABET.encode(words)}${sum}`;
        }
        function decode(str, limit = 90) {
          if (typeof str !== 'string') throw new Error(`bech32.decode input should be string, not ${typeof str}`);
          if (str.length < 8 || limit !== false && str.length > limit) throw new TypeError(`Wrong string length: ${str.length} (${str}). Expected (8..${limit})`);
          const lowered = str.toLowerCase();
          if (str !== lowered && str !== str.toUpperCase()) throw new Error(`String must be lowercase or uppercase`);
          str = lowered;
          const sepIndex = str.lastIndexOf('1');
          if (sepIndex === 0 || sepIndex === -1) throw new Error(`Letter "1" must be present between prefix and data only`);
          const prefix = str.slice(0, sepIndex);
          const _words = str.slice(sepIndex + 1);
          if (_words.length < 6) throw new Error('Data must be at least 6 characters long');
          const words = BECH_ALPHABET.decode(_words).slice(0, -6);
          const sum = bechChecksum(prefix, words, ENCODING_CONST);
          if (!_words.endsWith(sum)) throw new Error(`Invalid checksum in ${str}: expected "${sum}"`);
          return {
            prefix,
            words
          };
        }
        const decodeUnsafe = unsafeWrapper(decode);
        function decodeToBytes(str) {
          const {
            prefix,
            words
          } = decode(str, false);
          return {
            prefix,
            words,
            bytes: fromWords(words)
          };
        }
        return {
          encode,
          decode,
          decodeToBytes,
          decodeUnsafe,
          fromWords,
          fromWordsUnsafe,
          toWords
        };
      }
      exports.bech32 = genBech32('bech32');
      exports.bech32m = genBech32('bech32m');
      exports.utf8 = {
        encode: data => new TextDecoder().decode(data),
        decode: str => new TextEncoder().encode(str)
      };
      exports.hex = chain(radix2(4), alphabet('0123456789abcdef'), join(''), normalize(s => {
        if (typeof s !== 'string' || s.length % 2) throw new TypeError(`hex.decode: expected string, got ${typeof s} with length ${s.length}`);
        return s.toLowerCase();
      }));
      const CODERS = {
        utf8: exports.utf8,
        hex: exports.hex,
        base16: exports.base16,
        base32: exports.base32,
        base64: exports.base64,
        base64url: exports.base64url,
        base58: exports.base58,
        base58xmr: exports.base58xmr
      };
      const coderTypeError = 'Invalid encoding type. Available types: utf8, hex, base16, base32, base64, base64url, base58, base58xmr';
      const bytesToString = (type, bytes) => {
        if (typeof type !== 'string' || !CODERS.hasOwnProperty(type)) throw new TypeError(coderTypeError);
        if (!(bytes instanceof Uint8Array)) throw new TypeError('bytesToString() expects Uint8Array');
        return CODERS[type].encode(bytes);
      };
      exports.bytesToString = bytesToString;
      exports.str = exports.bytesToString;
      const stringToBytes = (type, str) => {
        if (!CODERS.hasOwnProperty(type)) throw new TypeError(coderTypeError);
        if (typeof str !== 'string') throw new TypeError('stringToBytes() expects string');
        return CODERS[type].decode(str);
      };
      exports.stringToBytes = stringToBytes;
      exports.bytes = exports.stringToBytes;
    }, {}],
    41: [function (require, module, exports) {
      'use strict';

      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray;
      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
      var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      for (var i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }
      revLookup['-'.charCodeAt(0)] = 62;
      revLookup['_'.charCodeAt(0)] = 63;
      function getLens(b64) {
        var len = b64.length;
        if (len % 4 > 0) {
          throw new Error('Invalid string. Length must be a multiple of 4');
        }
        var validLen = b64.indexOf('=');
        if (validLen === -1) validLen = len;
        var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
        return [validLen, placeHoldersLen];
      }
      function byteLength(b64) {
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function _byteLength(b64, validLen, placeHoldersLen) {
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function toByteArray(b64) {
        var tmp;
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
        var curByte = 0;
        var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
        var i;
        for (i = 0; i < len; i += 4) {
          tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
          arr[curByte++] = tmp >> 16 & 0xFF;
          arr[curByte++] = tmp >> 8 & 0xFF;
          arr[curByte++] = tmp & 0xFF;
        }
        if (placeHoldersLen === 2) {
          tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
          arr[curByte++] = tmp & 0xFF;
        }
        if (placeHoldersLen === 1) {
          tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
          arr[curByte++] = tmp >> 8 & 0xFF;
          arr[curByte++] = tmp & 0xFF;
        }
        return arr;
      }
      function tripletToBase64(num) {
        return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
      }
      function encodeChunk(uint8, start, end) {
        var tmp;
        var output = [];
        for (var i = start; i < end; i += 3) {
          tmp = (uint8[i] << 16 & 0xFF0000) + (uint8[i + 1] << 8 & 0xFF00) + (uint8[i + 2] & 0xFF);
          output.push(tripletToBase64(tmp));
        }
        return output.join('');
      }
      function fromByteArray(uint8) {
        var tmp;
        var len = uint8.length;
        var extraBytes = len % 3;
        var parts = [];
        var maxChunkLength = 16383;
        for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
          parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
        }
        if (extraBytes === 1) {
          tmp = uint8[len - 1];
          parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 0x3F] + '==');
        } else if (extraBytes === 2) {
          tmp = (uint8[len - 2] << 8) + uint8[len - 1];
          parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 0x3F] + lookup[tmp << 2 & 0x3F] + '=');
        }
        return parts.join('');
      }
    }, {}],
    42: [function (require, module, exports) {
      (function () {
        (function () {
          'use strict';

          var base64 = require('base64-js');
          var ieee754 = require('ieee754');
          exports.Buffer = Buffer;
          exports.SlowBuffer = SlowBuffer;
          exports.INSPECT_MAX_BYTES = 50;
          var K_MAX_LENGTH = 0x7fffffff;
          exports.kMaxLength = K_MAX_LENGTH;
          Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();
          if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' && typeof console.error === 'function') {
            console.error('This browser lacks typed array (Uint8Array) support which is required by ' + '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.');
          }
          function typedArraySupport() {
            try {
              var arr = new Uint8Array(1);
              arr.__proto__ = {
                __proto__: Uint8Array.prototype,
                foo: function () {
                  return 42;
                }
              };
              return arr.foo() === 42;
            } catch (e) {
              return false;
            }
          }
          Object.defineProperty(Buffer.prototype, 'parent', {
            enumerable: true,
            get: function () {
              if (!Buffer.isBuffer(this)) return undefined;
              return this.buffer;
            }
          });
          Object.defineProperty(Buffer.prototype, 'offset', {
            enumerable: true,
            get: function () {
              if (!Buffer.isBuffer(this)) return undefined;
              return this.byteOffset;
            }
          });
          function createBuffer(length) {
            if (length > K_MAX_LENGTH) {
              throw new RangeError('The value "' + length + '" is invalid for option "size"');
            }
            var buf = new Uint8Array(length);
            buf.__proto__ = Buffer.prototype;
            return buf;
          }
          function Buffer(arg, encodingOrOffset, length) {
            if (typeof arg === 'number') {
              if (typeof encodingOrOffset === 'string') {
                throw new TypeError('The "string" argument must be of type string. Received type number');
              }
              return allocUnsafe(arg);
            }
            return from(arg, encodingOrOffset, length);
          }
          if (typeof Symbol !== 'undefined' && Symbol.species != null && Buffer[Symbol.species] === Buffer) {
            Object.defineProperty(Buffer, Symbol.species, {
              value: null,
              configurable: true,
              enumerable: false,
              writable: false
            });
          }
          Buffer.poolSize = 8192;
          function from(value, encodingOrOffset, length) {
            if (typeof value === 'string') {
              return fromString(value, encodingOrOffset);
            }
            if (ArrayBuffer.isView(value)) {
              return fromArrayLike(value);
            }
            if (value == null) {
              throw TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + typeof value);
            }
            if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
              return fromArrayBuffer(value, encodingOrOffset, length);
            }
            if (typeof value === 'number') {
              throw new TypeError('The "value" argument must not be of type number. Received type number');
            }
            var valueOf = value.valueOf && value.valueOf();
            if (valueOf != null && valueOf !== value) {
              return Buffer.from(valueOf, encodingOrOffset, length);
            }
            var b = fromObject(value);
            if (b) return b;
            if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === 'function') {
              return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length);
            }
            throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + typeof value);
          }
          Buffer.from = function (value, encodingOrOffset, length) {
            return from(value, encodingOrOffset, length);
          };
          Buffer.prototype.__proto__ = Uint8Array.prototype;
          Buffer.__proto__ = Uint8Array;
          function assertSize(size) {
            if (typeof size !== 'number') {
              throw new TypeError('"size" argument must be of type number');
            } else if (size < 0) {
              throw new RangeError('The value "' + size + '" is invalid for option "size"');
            }
          }
          function alloc(size, fill, encoding) {
            assertSize(size);
            if (size <= 0) {
              return createBuffer(size);
            }
            if (fill !== undefined) {
              return typeof encoding === 'string' ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
            }
            return createBuffer(size);
          }
          Buffer.alloc = function (size, fill, encoding) {
            return alloc(size, fill, encoding);
          };
          function allocUnsafe(size) {
            assertSize(size);
            return createBuffer(size < 0 ? 0 : checked(size) | 0);
          }
          Buffer.allocUnsafe = function (size) {
            return allocUnsafe(size);
          };
          Buffer.allocUnsafeSlow = function (size) {
            return allocUnsafe(size);
          };
          function fromString(string, encoding) {
            if (typeof encoding !== 'string' || encoding === '') {
              encoding = 'utf8';
            }
            if (!Buffer.isEncoding(encoding)) {
              throw new TypeError('Unknown encoding: ' + encoding);
            }
            var length = byteLength(string, encoding) | 0;
            var buf = createBuffer(length);
            var actual = buf.write(string, encoding);
            if (actual !== length) {
              buf = buf.slice(0, actual);
            }
            return buf;
          }
          function fromArrayLike(array) {
            var length = array.length < 0 ? 0 : checked(array.length) | 0;
            var buf = createBuffer(length);
            for (var i = 0; i < length; i += 1) {
              buf[i] = array[i] & 255;
            }
            return buf;
          }
          function fromArrayBuffer(array, byteOffset, length) {
            if (byteOffset < 0 || array.byteLength < byteOffset) {
              throw new RangeError('"offset" is outside of buffer bounds');
            }
            if (array.byteLength < byteOffset + (length || 0)) {
              throw new RangeError('"length" is outside of buffer bounds');
            }
            var buf;
            if (byteOffset === undefined && length === undefined) {
              buf = new Uint8Array(array);
            } else if (length === undefined) {
              buf = new Uint8Array(array, byteOffset);
            } else {
              buf = new Uint8Array(array, byteOffset, length);
            }
            buf.__proto__ = Buffer.prototype;
            return buf;
          }
          function fromObject(obj) {
            if (Buffer.isBuffer(obj)) {
              var len = checked(obj.length) | 0;
              var buf = createBuffer(len);
              if (buf.length === 0) {
                return buf;
              }
              obj.copy(buf, 0, 0, len);
              return buf;
            }
            if (obj.length !== undefined) {
              if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
                return createBuffer(0);
              }
              return fromArrayLike(obj);
            }
            if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
              return fromArrayLike(obj.data);
            }
          }
          function checked(length) {
            if (length >= K_MAX_LENGTH) {
              throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes');
            }
            return length | 0;
          }
          function SlowBuffer(length) {
            if (+length != length) {
              length = 0;
            }
            return Buffer.alloc(+length);
          }
          Buffer.isBuffer = function isBuffer(b) {
            return b != null && b._isBuffer === true && b !== Buffer.prototype;
          };
          Buffer.compare = function compare(a, b) {
            if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
            if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);
            if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
              throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
            }
            if (a === b) return 0;
            var x = a.length;
            var y = b.length;
            for (var i = 0, len = Math.min(x, y); i < len; ++i) {
              if (a[i] !== b[i]) {
                x = a[i];
                y = b[i];
                break;
              }
            }
            if (x < y) return -1;
            if (y < x) return 1;
            return 0;
          };
          Buffer.isEncoding = function isEncoding(encoding) {
            switch (String(encoding).toLowerCase()) {
              case 'hex':
              case 'utf8':
              case 'utf-8':
              case 'ascii':
              case 'latin1':
              case 'binary':
              case 'base64':
              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return true;
              default:
                return false;
            }
          };
          Buffer.concat = function concat(list, length) {
            if (!Array.isArray(list)) {
              throw new TypeError('"list" argument must be an Array of Buffers');
            }
            if (list.length === 0) {
              return Buffer.alloc(0);
            }
            var i;
            if (length === undefined) {
              length = 0;
              for (i = 0; i < list.length; ++i) {
                length += list[i].length;
              }
            }
            var buffer = Buffer.allocUnsafe(length);
            var pos = 0;
            for (i = 0; i < list.length; ++i) {
              var buf = list[i];
              if (isInstance(buf, Uint8Array)) {
                buf = Buffer.from(buf);
              }
              if (!Buffer.isBuffer(buf)) {
                throw new TypeError('"list" argument must be an Array of Buffers');
              }
              buf.copy(buffer, pos);
              pos += buf.length;
            }
            return buffer;
          };
          function byteLength(string, encoding) {
            if (Buffer.isBuffer(string)) {
              return string.length;
            }
            if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
              return string.byteLength;
            }
            if (typeof string !== 'string') {
              throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' + 'Received type ' + typeof string);
            }
            var len = string.length;
            var mustMatch = arguments.length > 2 && arguments[2] === true;
            if (!mustMatch && len === 0) return 0;
            var loweredCase = false;
            for (;;) {
              switch (encoding) {
                case 'ascii':
                case 'latin1':
                case 'binary':
                  return len;
                case 'utf8':
                case 'utf-8':
                  return utf8ToBytes(string).length;
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                  return len * 2;
                case 'hex':
                  return len >>> 1;
                case 'base64':
                  return base64ToBytes(string).length;
                default:
                  if (loweredCase) {
                    return mustMatch ? -1 : utf8ToBytes(string).length;
                  }
                  encoding = ('' + encoding).toLowerCase();
                  loweredCase = true;
              }
            }
          }
          Buffer.byteLength = byteLength;
          function slowToString(encoding, start, end) {
            var loweredCase = false;
            if (start === undefined || start < 0) {
              start = 0;
            }
            if (start > this.length) {
              return '';
            }
            if (end === undefined || end > this.length) {
              end = this.length;
            }
            if (end <= 0) {
              return '';
            }
            end >>>= 0;
            start >>>= 0;
            if (end <= start) {
              return '';
            }
            if (!encoding) encoding = 'utf8';
            while (true) {
              switch (encoding) {
                case 'hex':
                  return hexSlice(this, start, end);
                case 'utf8':
                case 'utf-8':
                  return utf8Slice(this, start, end);
                case 'ascii':
                  return asciiSlice(this, start, end);
                case 'latin1':
                case 'binary':
                  return latin1Slice(this, start, end);
                case 'base64':
                  return base64Slice(this, start, end);
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                  return utf16leSlice(this, start, end);
                default:
                  if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
                  encoding = (encoding + '').toLowerCase();
                  loweredCase = true;
              }
            }
          }
          Buffer.prototype._isBuffer = true;
          function swap(b, n, m) {
            var i = b[n];
            b[n] = b[m];
            b[m] = i;
          }
          Buffer.prototype.swap16 = function swap16() {
            var len = this.length;
            if (len % 2 !== 0) {
              throw new RangeError('Buffer size must be a multiple of 16-bits');
            }
            for (var i = 0; i < len; i += 2) {
              swap(this, i, i + 1);
            }
            return this;
          };
          Buffer.prototype.swap32 = function swap32() {
            var len = this.length;
            if (len % 4 !== 0) {
              throw new RangeError('Buffer size must be a multiple of 32-bits');
            }
            for (var i = 0; i < len; i += 4) {
              swap(this, i, i + 3);
              swap(this, i + 1, i + 2);
            }
            return this;
          };
          Buffer.prototype.swap64 = function swap64() {
            var len = this.length;
            if (len % 8 !== 0) {
              throw new RangeError('Buffer size must be a multiple of 64-bits');
            }
            for (var i = 0; i < len; i += 8) {
              swap(this, i, i + 7);
              swap(this, i + 1, i + 6);
              swap(this, i + 2, i + 5);
              swap(this, i + 3, i + 4);
            }
            return this;
          };
          Buffer.prototype.toString = function toString() {
            var length = this.length;
            if (length === 0) return '';
            if (arguments.length === 0) return utf8Slice(this, 0, length);
            return slowToString.apply(this, arguments);
          };
          Buffer.prototype.toLocaleString = Buffer.prototype.toString;
          Buffer.prototype.equals = function equals(b) {
            if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
            if (this === b) return true;
            return Buffer.compare(this, b) === 0;
          };
          Buffer.prototype.inspect = function inspect() {
            var str = '';
            var max = exports.INSPECT_MAX_BYTES;
            str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim();
            if (this.length > max) str += ' ... ';
            return '<Buffer ' + str + '>';
          };
          Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
            if (isInstance(target, Uint8Array)) {
              target = Buffer.from(target, target.offset, target.byteLength);
            }
            if (!Buffer.isBuffer(target)) {
              throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. ' + 'Received type ' + typeof target);
            }
            if (start === undefined) {
              start = 0;
            }
            if (end === undefined) {
              end = target ? target.length : 0;
            }
            if (thisStart === undefined) {
              thisStart = 0;
            }
            if (thisEnd === undefined) {
              thisEnd = this.length;
            }
            if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
              throw new RangeError('out of range index');
            }
            if (thisStart >= thisEnd && start >= end) {
              return 0;
            }
            if (thisStart >= thisEnd) {
              return -1;
            }
            if (start >= end) {
              return 1;
            }
            start >>>= 0;
            end >>>= 0;
            thisStart >>>= 0;
            thisEnd >>>= 0;
            if (this === target) return 0;
            var x = thisEnd - thisStart;
            var y = end - start;
            var len = Math.min(x, y);
            var thisCopy = this.slice(thisStart, thisEnd);
            var targetCopy = target.slice(start, end);
            for (var i = 0; i < len; ++i) {
              if (thisCopy[i] !== targetCopy[i]) {
                x = thisCopy[i];
                y = targetCopy[i];
                break;
              }
            }
            if (x < y) return -1;
            if (y < x) return 1;
            return 0;
          };
          function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
            if (buffer.length === 0) return -1;
            if (typeof byteOffset === 'string') {
              encoding = byteOffset;
              byteOffset = 0;
            } else if (byteOffset > 0x7fffffff) {
              byteOffset = 0x7fffffff;
            } else if (byteOffset < -0x80000000) {
              byteOffset = -0x80000000;
            }
            byteOffset = +byteOffset;
            if (numberIsNaN(byteOffset)) {
              byteOffset = dir ? 0 : buffer.length - 1;
            }
            if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
            if (byteOffset >= buffer.length) {
              if (dir) return -1;else byteOffset = buffer.length - 1;
            } else if (byteOffset < 0) {
              if (dir) byteOffset = 0;else return -1;
            }
            if (typeof val === 'string') {
              val = Buffer.from(val, encoding);
            }
            if (Buffer.isBuffer(val)) {
              if (val.length === 0) {
                return -1;
              }
              return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
            } else if (typeof val === 'number') {
              val = val & 0xFF;
              if (typeof Uint8Array.prototype.indexOf === 'function') {
                if (dir) {
                  return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
                } else {
                  return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
                }
              }
              return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
            }
            throw new TypeError('val must be string, number or Buffer');
          }
          function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
            var indexSize = 1;
            var arrLength = arr.length;
            var valLength = val.length;
            if (encoding !== undefined) {
              encoding = String(encoding).toLowerCase();
              if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
                if (arr.length < 2 || val.length < 2) {
                  return -1;
                }
                indexSize = 2;
                arrLength /= 2;
                valLength /= 2;
                byteOffset /= 2;
              }
            }
            function read(buf, i) {
              if (indexSize === 1) {
                return buf[i];
              } else {
                return buf.readUInt16BE(i * indexSize);
              }
            }
            var i;
            if (dir) {
              var foundIndex = -1;
              for (i = byteOffset; i < arrLength; i++) {
                if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                  if (foundIndex === -1) foundIndex = i;
                  if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
                } else {
                  if (foundIndex !== -1) i -= i - foundIndex;
                  foundIndex = -1;
                }
              }
            } else {
              if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
              for (i = byteOffset; i >= 0; i--) {
                var found = true;
                for (var j = 0; j < valLength; j++) {
                  if (read(arr, i + j) !== read(val, j)) {
                    found = false;
                    break;
                  }
                }
                if (found) return i;
              }
            }
            return -1;
          }
          Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
            return this.indexOf(val, byteOffset, encoding) !== -1;
          };
          Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
            return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
          };
          Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
            return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
          };
          function hexWrite(buf, string, offset, length) {
            offset = Number(offset) || 0;
            var remaining = buf.length - offset;
            if (!length) {
              length = remaining;
            } else {
              length = Number(length);
              if (length > remaining) {
                length = remaining;
              }
            }
            var strLen = string.length;
            if (length > strLen / 2) {
              length = strLen / 2;
            }
            for (var i = 0; i < length; ++i) {
              var parsed = parseInt(string.substr(i * 2, 2), 16);
              if (numberIsNaN(parsed)) return i;
              buf[offset + i] = parsed;
            }
            return i;
          }
          function utf8Write(buf, string, offset, length) {
            return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
          }
          function asciiWrite(buf, string, offset, length) {
            return blitBuffer(asciiToBytes(string), buf, offset, length);
          }
          function latin1Write(buf, string, offset, length) {
            return asciiWrite(buf, string, offset, length);
          }
          function base64Write(buf, string, offset, length) {
            return blitBuffer(base64ToBytes(string), buf, offset, length);
          }
          function ucs2Write(buf, string, offset, length) {
            return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
          }
          Buffer.prototype.write = function write(string, offset, length, encoding) {
            if (offset === undefined) {
              encoding = 'utf8';
              length = this.length;
              offset = 0;
            } else if (length === undefined && typeof offset === 'string') {
              encoding = offset;
              length = this.length;
              offset = 0;
            } else if (isFinite(offset)) {
              offset = offset >>> 0;
              if (isFinite(length)) {
                length = length >>> 0;
                if (encoding === undefined) encoding = 'utf8';
              } else {
                encoding = length;
                length = undefined;
              }
            } else {
              throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
            }
            var remaining = this.length - offset;
            if (length === undefined || length > remaining) length = remaining;
            if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
              throw new RangeError('Attempt to write outside buffer bounds');
            }
            if (!encoding) encoding = 'utf8';
            var loweredCase = false;
            for (;;) {
              switch (encoding) {
                case 'hex':
                  return hexWrite(this, string, offset, length);
                case 'utf8':
                case 'utf-8':
                  return utf8Write(this, string, offset, length);
                case 'ascii':
                  return asciiWrite(this, string, offset, length);
                case 'latin1':
                case 'binary':
                  return latin1Write(this, string, offset, length);
                case 'base64':
                  return base64Write(this, string, offset, length);
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                  return ucs2Write(this, string, offset, length);
                default:
                  if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
                  encoding = ('' + encoding).toLowerCase();
                  loweredCase = true;
              }
            }
          };
          Buffer.prototype.toJSON = function toJSON() {
            return {
              type: 'Buffer',
              data: Array.prototype.slice.call(this._arr || this, 0)
            };
          };
          function base64Slice(buf, start, end) {
            if (start === 0 && end === buf.length) {
              return base64.fromByteArray(buf);
            } else {
              return base64.fromByteArray(buf.slice(start, end));
            }
          }
          function utf8Slice(buf, start, end) {
            end = Math.min(buf.length, end);
            var res = [];
            var i = start;
            while (i < end) {
              var firstByte = buf[i];
              var codePoint = null;
              var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;
              if (i + bytesPerSequence <= end) {
                var secondByte, thirdByte, fourthByte, tempCodePoint;
                switch (bytesPerSequence) {
                  case 1:
                    if (firstByte < 0x80) {
                      codePoint = firstByte;
                    }
                    break;
                  case 2:
                    secondByte = buf[i + 1];
                    if ((secondByte & 0xC0) === 0x80) {
                      tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;
                      if (tempCodePoint > 0x7F) {
                        codePoint = tempCodePoint;
                      }
                    }
                    break;
                  case 3:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];
                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                      tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;
                      if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                        codePoint = tempCodePoint;
                      }
                    }
                    break;
                  case 4:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];
                    fourthByte = buf[i + 3];
                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                      tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;
                      if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                        codePoint = tempCodePoint;
                      }
                    }
                }
              }
              if (codePoint === null) {
                codePoint = 0xFFFD;
                bytesPerSequence = 1;
              } else if (codePoint > 0xFFFF) {
                codePoint -= 0x10000;
                res.push(codePoint >>> 10 & 0x3FF | 0xD800);
                codePoint = 0xDC00 | codePoint & 0x3FF;
              }
              res.push(codePoint);
              i += bytesPerSequence;
            }
            return decodeCodePointsArray(res);
          }
          var MAX_ARGUMENTS_LENGTH = 0x1000;
          function decodeCodePointsArray(codePoints) {
            var len = codePoints.length;
            if (len <= MAX_ARGUMENTS_LENGTH) {
              return String.fromCharCode.apply(String, codePoints);
            }
            var res = '';
            var i = 0;
            while (i < len) {
              res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
            }
            return res;
          }
          function asciiSlice(buf, start, end) {
            var ret = '';
            end = Math.min(buf.length, end);
            for (var i = start; i < end; ++i) {
              ret += String.fromCharCode(buf[i] & 0x7F);
            }
            return ret;
          }
          function latin1Slice(buf, start, end) {
            var ret = '';
            end = Math.min(buf.length, end);
            for (var i = start; i < end; ++i) {
              ret += String.fromCharCode(buf[i]);
            }
            return ret;
          }
          function hexSlice(buf, start, end) {
            var len = buf.length;
            if (!start || start < 0) start = 0;
            if (!end || end < 0 || end > len) end = len;
            var out = '';
            for (var i = start; i < end; ++i) {
              out += toHex(buf[i]);
            }
            return out;
          }
          function utf16leSlice(buf, start, end) {
            var bytes = buf.slice(start, end);
            var res = '';
            for (var i = 0; i < bytes.length; i += 2) {
              res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
            }
            return res;
          }
          Buffer.prototype.slice = function slice(start, end) {
            var len = this.length;
            start = ~~start;
            end = end === undefined ? len : ~~end;
            if (start < 0) {
              start += len;
              if (start < 0) start = 0;
            } else if (start > len) {
              start = len;
            }
            if (end < 0) {
              end += len;
              if (end < 0) end = 0;
            } else if (end > len) {
              end = len;
            }
            if (end < start) end = start;
            var newBuf = this.subarray(start, end);
            newBuf.__proto__ = Buffer.prototype;
            return newBuf;
          };
          function checkOffset(offset, ext, length) {
            if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
            if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
          }
          Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);
            var val = this[offset];
            var mul = 1;
            var i = 0;
            while (++i < byteLength && (mul *= 0x100)) {
              val += this[offset + i] * mul;
            }
            return val;
          };
          Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) {
              checkOffset(offset, byteLength, this.length);
            }
            var val = this[offset + --byteLength];
            var mul = 1;
            while (byteLength > 0 && (mul *= 0x100)) {
              val += this[offset + --byteLength] * mul;
            }
            return val;
          };
          Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 1, this.length);
            return this[offset];
          };
          Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            return this[offset] | this[offset + 1] << 8;
          };
          Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            return this[offset] << 8 | this[offset + 1];
          };
          Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
          };
          Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
          };
          Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);
            var val = this[offset];
            var mul = 1;
            var i = 0;
            while (++i < byteLength && (mul *= 0x100)) {
              val += this[offset + i] * mul;
            }
            mul *= 0x80;
            if (val >= mul) val -= Math.pow(2, 8 * byteLength);
            return val;
          };
          Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);
            var i = byteLength;
            var mul = 1;
            var val = this[offset + --i];
            while (i > 0 && (mul *= 0x100)) {
              val += this[offset + --i] * mul;
            }
            mul *= 0x80;
            if (val >= mul) val -= Math.pow(2, 8 * byteLength);
            return val;
          };
          Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 1, this.length);
            if (!(this[offset] & 0x80)) return this[offset];
            return (0xff - this[offset] + 1) * -1;
          };
          Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            var val = this[offset] | this[offset + 1] << 8;
            return val & 0x8000 ? val | 0xFFFF0000 : val;
          };
          Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            var val = this[offset + 1] | this[offset] << 8;
            return val & 0x8000 ? val | 0xFFFF0000 : val;
          };
          Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
          };
          Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
          };
          Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return ieee754.read(this, offset, true, 23, 4);
          };
          Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return ieee754.read(this, offset, false, 23, 4);
          };
          Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 8, this.length);
            return ieee754.read(this, offset, true, 52, 8);
          };
          Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 8, this.length);
            return ieee754.read(this, offset, false, 52, 8);
          };
          function checkInt(buf, value, offset, ext, max, min) {
            if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
            if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
            if (offset + ext > buf.length) throw new RangeError('Index out of range');
          }
          Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) {
              var maxBytes = Math.pow(2, 8 * byteLength) - 1;
              checkInt(this, value, offset, byteLength, maxBytes, 0);
            }
            var mul = 1;
            var i = 0;
            this[offset] = value & 0xFF;
            while (++i < byteLength && (mul *= 0x100)) {
              this[offset + i] = value / mul & 0xFF;
            }
            return offset + byteLength;
          };
          Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) {
              var maxBytes = Math.pow(2, 8 * byteLength) - 1;
              checkInt(this, value, offset, byteLength, maxBytes, 0);
            }
            var i = byteLength - 1;
            var mul = 1;
            this[offset + i] = value & 0xFF;
            while (--i >= 0 && (mul *= 0x100)) {
              this[offset + i] = value / mul & 0xFF;
            }
            return offset + byteLength;
          };
          Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
            this[offset] = value & 0xff;
            return offset + 1;
          };
          Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
            this[offset] = value & 0xff;
            this[offset + 1] = value >>> 8;
            return offset + 2;
          };
          Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
            this[offset] = value >>> 8;
            this[offset + 1] = value & 0xff;
            return offset + 2;
          };
          Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
            this[offset + 3] = value >>> 24;
            this[offset + 2] = value >>> 16;
            this[offset + 1] = value >>> 8;
            this[offset] = value & 0xff;
            return offset + 4;
          };
          Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
            this[offset] = value >>> 24;
            this[offset + 1] = value >>> 16;
            this[offset + 2] = value >>> 8;
            this[offset + 3] = value & 0xff;
            return offset + 4;
          };
          Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
              var limit = Math.pow(2, 8 * byteLength - 1);
              checkInt(this, value, offset, byteLength, limit - 1, -limit);
            }
            var i = 0;
            var mul = 1;
            var sub = 0;
            this[offset] = value & 0xFF;
            while (++i < byteLength && (mul *= 0x100)) {
              if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
                sub = 1;
              }
              this[offset + i] = (value / mul >> 0) - sub & 0xFF;
            }
            return offset + byteLength;
          };
          Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
              var limit = Math.pow(2, 8 * byteLength - 1);
              checkInt(this, value, offset, byteLength, limit - 1, -limit);
            }
            var i = byteLength - 1;
            var mul = 1;
            var sub = 0;
            this[offset + i] = value & 0xFF;
            while (--i >= 0 && (mul *= 0x100)) {
              if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
                sub = 1;
              }
              this[offset + i] = (value / mul >> 0) - sub & 0xFF;
            }
            return offset + byteLength;
          };
          Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
            if (value < 0) value = 0xff + value + 1;
            this[offset] = value & 0xff;
            return offset + 1;
          };
          Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
            this[offset] = value & 0xff;
            this[offset + 1] = value >>> 8;
            return offset + 2;
          };
          Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
            this[offset] = value >>> 8;
            this[offset + 1] = value & 0xff;
            return offset + 2;
          };
          Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
            this[offset] = value & 0xff;
            this[offset + 1] = value >>> 8;
            this[offset + 2] = value >>> 16;
            this[offset + 3] = value >>> 24;
            return offset + 4;
          };
          Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
            if (value < 0) value = 0xffffffff + value + 1;
            this[offset] = value >>> 24;
            this[offset + 1] = value >>> 16;
            this[offset + 2] = value >>> 8;
            this[offset + 3] = value & 0xff;
            return offset + 4;
          };
          function checkIEEE754(buf, value, offset, ext, max, min) {
            if (offset + ext > buf.length) throw new RangeError('Index out of range');
            if (offset < 0) throw new RangeError('Index out of range');
          }
          function writeFloat(buf, value, offset, littleEndian, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
              checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
            }
            ieee754.write(buf, value, offset, littleEndian, 23, 4);
            return offset + 4;
          }
          Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
            return writeFloat(this, value, offset, true, noAssert);
          };
          Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
            return writeFloat(this, value, offset, false, noAssert);
          };
          function writeDouble(buf, value, offset, littleEndian, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
              checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
            }
            ieee754.write(buf, value, offset, littleEndian, 52, 8);
            return offset + 8;
          }
          Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
            return writeDouble(this, value, offset, true, noAssert);
          };
          Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
            return writeDouble(this, value, offset, false, noAssert);
          };
          Buffer.prototype.copy = function copy(target, targetStart, start, end) {
            if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer');
            if (!start) start = 0;
            if (!end && end !== 0) end = this.length;
            if (targetStart >= target.length) targetStart = target.length;
            if (!targetStart) targetStart = 0;
            if (end > 0 && end < start) end = start;
            if (end === start) return 0;
            if (target.length === 0 || this.length === 0) return 0;
            if (targetStart < 0) {
              throw new RangeError('targetStart out of bounds');
            }
            if (start < 0 || start >= this.length) throw new RangeError('Index out of range');
            if (end < 0) throw new RangeError('sourceEnd out of bounds');
            if (end > this.length) end = this.length;
            if (target.length - targetStart < end - start) {
              end = target.length - targetStart + start;
            }
            var len = end - start;
            if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
              this.copyWithin(targetStart, start, end);
            } else if (this === target && start < targetStart && targetStart < end) {
              for (var i = len - 1; i >= 0; --i) {
                target[i + targetStart] = this[i + start];
              }
            } else {
              Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
            }
            return len;
          };
          Buffer.prototype.fill = function fill(val, start, end, encoding) {
            if (typeof val === 'string') {
              if (typeof start === 'string') {
                encoding = start;
                start = 0;
                end = this.length;
              } else if (typeof end === 'string') {
                encoding = end;
                end = this.length;
              }
              if (encoding !== undefined && typeof encoding !== 'string') {
                throw new TypeError('encoding must be a string');
              }
              if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
                throw new TypeError('Unknown encoding: ' + encoding);
              }
              if (val.length === 1) {
                var code = val.charCodeAt(0);
                if (encoding === 'utf8' && code < 128 || encoding === 'latin1') {
                  val = code;
                }
              }
            } else if (typeof val === 'number') {
              val = val & 255;
            }
            if (start < 0 || this.length < start || this.length < end) {
              throw new RangeError('Out of range index');
            }
            if (end <= start) {
              return this;
            }
            start = start >>> 0;
            end = end === undefined ? this.length : end >>> 0;
            if (!val) val = 0;
            var i;
            if (typeof val === 'number') {
              for (i = start; i < end; ++i) {
                this[i] = val;
              }
            } else {
              var bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
              var len = bytes.length;
              if (len === 0) {
                throw new TypeError('The value "' + val + '" is invalid for argument "value"');
              }
              for (i = 0; i < end - start; ++i) {
                this[i + start] = bytes[i % len];
              }
            }
            return this;
          };
          var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
          function base64clean(str) {
            str = str.split('=')[0];
            str = str.trim().replace(INVALID_BASE64_RE, '');
            if (str.length < 2) return '';
            while (str.length % 4 !== 0) {
              str = str + '=';
            }
            return str;
          }
          function toHex(n) {
            if (n < 16) return '0' + n.toString(16);
            return n.toString(16);
          }
          function utf8ToBytes(string, units) {
            units = units || Infinity;
            var codePoint;
            var length = string.length;
            var leadSurrogate = null;
            var bytes = [];
            for (var i = 0; i < length; ++i) {
              codePoint = string.charCodeAt(i);
              if (codePoint > 0xD7FF && codePoint < 0xE000) {
                if (!leadSurrogate) {
                  if (codePoint > 0xDBFF) {
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                    continue;
                  } else if (i + 1 === length) {
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                    continue;
                  }
                  leadSurrogate = codePoint;
                  continue;
                }
                if (codePoint < 0xDC00) {
                  if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                  leadSurrogate = codePoint;
                  continue;
                }
                codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
              } else if (leadSurrogate) {
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              }
              leadSurrogate = null;
              if (codePoint < 0x80) {
                if ((units -= 1) < 0) break;
                bytes.push(codePoint);
              } else if (codePoint < 0x800) {
                if ((units -= 2) < 0) break;
                bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
              } else if (codePoint < 0x10000) {
                if ((units -= 3) < 0) break;
                bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
              } else if (codePoint < 0x110000) {
                if ((units -= 4) < 0) break;
                bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
              } else {
                throw new Error('Invalid code point');
              }
            }
            return bytes;
          }
          function asciiToBytes(str) {
            var byteArray = [];
            for (var i = 0; i < str.length; ++i) {
              byteArray.push(str.charCodeAt(i) & 0xFF);
            }
            return byteArray;
          }
          function utf16leToBytes(str, units) {
            var c, hi, lo;
            var byteArray = [];
            for (var i = 0; i < str.length; ++i) {
              if ((units -= 2) < 0) break;
              c = str.charCodeAt(i);
              hi = c >> 8;
              lo = c % 256;
              byteArray.push(lo);
              byteArray.push(hi);
            }
            return byteArray;
          }
          function base64ToBytes(str) {
            return base64.toByteArray(base64clean(str));
          }
          function blitBuffer(src, dst, offset, length) {
            for (var i = 0; i < length; ++i) {
              if (i + offset >= dst.length || i >= src.length) break;
              dst[i + offset] = src[i];
            }
            return i;
          }
          function isInstance(obj, type) {
            return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
          }
          function numberIsNaN(obj) {
            return obj !== obj;
          }
        }).call(this);
      }).call(this, require("buffer").Buffer);
    }, {
      "base64-js": 41,
      "buffer": 42,
      "ieee754": 47
    }],
    43: [function (require, module, exports) {
      var s = 1000;
      var m = s * 60;
      var h = m * 60;
      var d = h * 24;
      var w = d * 7;
      var y = d * 365.25;
      module.exports = function (val, options) {
        options = options || {};
        var type = typeof val;
        if (type === 'string' && val.length > 0) {
          return parse(val);
        } else if (type === 'number' && isFinite(val)) {
          return options.long ? fmtLong(val) : fmtShort(val);
        }
        throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val));
      };
      function parse(str) {
        str = String(str);
        if (str.length > 100) {
          return;
        }
        var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
        if (!match) {
          return;
        }
        var n = parseFloat(match[1]);
        var type = (match[2] || 'ms').toLowerCase();
        switch (type) {
          case 'years':
          case 'year':
          case 'yrs':
          case 'yr':
          case 'y':
            return n * y;
          case 'weeks':
          case 'week':
          case 'w':
            return n * w;
          case 'days':
          case 'day':
          case 'd':
            return n * d;
          case 'hours':
          case 'hour':
          case 'hrs':
          case 'hr':
          case 'h':
            return n * h;
          case 'minutes':
          case 'minute':
          case 'mins':
          case 'min':
          case 'm':
            return n * m;
          case 'seconds':
          case 'second':
          case 'secs':
          case 'sec':
          case 's':
            return n * s;
          case 'milliseconds':
          case 'millisecond':
          case 'msecs':
          case 'msec':
          case 'ms':
            return n;
          default:
            return undefined;
        }
      }
      function fmtShort(ms) {
        var msAbs = Math.abs(ms);
        if (msAbs >= d) {
          return Math.round(ms / d) + 'd';
        }
        if (msAbs >= h) {
          return Math.round(ms / h) + 'h';
        }
        if (msAbs >= m) {
          return Math.round(ms / m) + 'm';
        }
        if (msAbs >= s) {
          return Math.round(ms / s) + 's';
        }
        return ms + 'ms';
      }
      function fmtLong(ms) {
        var msAbs = Math.abs(ms);
        if (msAbs >= d) {
          return plural(ms, msAbs, d, 'day');
        }
        if (msAbs >= h) {
          return plural(ms, msAbs, h, 'hour');
        }
        if (msAbs >= m) {
          return plural(ms, msAbs, m, 'minute');
        }
        if (msAbs >= s) {
          return plural(ms, msAbs, s, 'second');
        }
        return ms + ' ms';
      }
      function plural(ms, msAbs, n, name) {
        var isPlural = msAbs >= n * 1.5;
        return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
      }
    }, {}],
    44: [function (require, module, exports) {
      (function (process) {
        (function () {
          exports.formatArgs = formatArgs;
          exports.save = save;
          exports.load = load;
          exports.useColors = useColors;
          exports.storage = localstorage();
          exports.destroy = (() => {
            let warned = false;
            return () => {
              if (!warned) {
                warned = true;
                console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
              }
            };
          })();
          exports.colors = ['#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933', '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'];
          function useColors() {
            if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
              return true;
            }
            if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
              return false;
            }
            return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
          }
          function formatArgs(args) {
            args[0] = (this.useColors ? '%c' : '') + this.namespace + (this.useColors ? ' %c' : ' ') + args[0] + (this.useColors ? '%c ' : ' ') + '+' + module.exports.humanize(this.diff);
            if (!this.useColors) {
              return;
            }
            const c = 'color: ' + this.color;
            args.splice(1, 0, c, 'color: inherit');
            let index = 0;
            let lastC = 0;
            args[0].replace(/%[a-zA-Z%]/g, match => {
              if (match === '%%') {
                return;
              }
              index++;
              if (match === '%c') {
                lastC = index;
              }
            });
            args.splice(lastC, 0, c);
          }
          exports.log = console.debug || console.log || (() => {});
          function save(namespaces) {
            try {
              if (namespaces) {
                exports.storage.setItem('debug', namespaces);
              } else {
                exports.storage.removeItem('debug');
              }
            } catch (error) {}
          }
          function load() {
            let r;
            try {
              r = exports.storage.getItem('debug');
            } catch (error) {}
            if (!r && typeof process !== 'undefined' && 'env' in process) {
              r = process.env.DEBUG;
            }
            return r;
          }
          function localstorage() {
            try {
              return localStorage;
            } catch (error) {}
          }
          module.exports = require('./common')(exports);
          const {
            formatters
          } = module.exports;
          formatters.j = function (v) {
            try {
              return JSON.stringify(v);
            } catch (error) {
              return '[UnexpectedJSONParseError]: ' + error.message;
            }
          };
        }).call(this);
      }).call(this, require('_process'));
    }, {
      "./common": 45,
      "_process": 51
    }],
    45: [function (require, module, exports) {
      function setup(env) {
        createDebug.debug = createDebug;
        createDebug.default = createDebug;
        createDebug.coerce = coerce;
        createDebug.disable = disable;
        createDebug.enable = enable;
        createDebug.enabled = enabled;
        createDebug.humanize = require('ms');
        createDebug.destroy = destroy;
        Object.keys(env).forEach(key => {
          createDebug[key] = env[key];
        });
        createDebug.names = [];
        createDebug.skips = [];
        createDebug.formatters = {};
        function selectColor(namespace) {
          let hash = 0;
          for (let i = 0; i < namespace.length; i++) {
            hash = (hash << 5) - hash + namespace.charCodeAt(i);
            hash |= 0;
          }
          return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
        }
        createDebug.selectColor = selectColor;
        function createDebug(namespace) {
          let prevTime;
          let enableOverride = null;
          let namespacesCache;
          let enabledCache;
          function debug(...args) {
            if (!debug.enabled) {
              return;
            }
            const self = debug;
            const curr = Number(new Date());
            const ms = curr - (prevTime || curr);
            self.diff = ms;
            self.prev = prevTime;
            self.curr = curr;
            prevTime = curr;
            args[0] = createDebug.coerce(args[0]);
            if (typeof args[0] !== 'string') {
              args.unshift('%O');
            }
            let index = 0;
            args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
              if (match === '%%') {
                return '%';
              }
              index++;
              const formatter = createDebug.formatters[format];
              if (typeof formatter === 'function') {
                const val = args[index];
                match = formatter.call(self, val);
                args.splice(index, 1);
                index--;
              }
              return match;
            });
            createDebug.formatArgs.call(self, args);
            const logFn = self.log || createDebug.log;
            logFn.apply(self, args);
          }
          debug.namespace = namespace;
          debug.useColors = createDebug.useColors();
          debug.color = createDebug.selectColor(namespace);
          debug.extend = extend;
          debug.destroy = createDebug.destroy;
          Object.defineProperty(debug, 'enabled', {
            enumerable: true,
            configurable: false,
            get: () => {
              if (enableOverride !== null) {
                return enableOverride;
              }
              if (namespacesCache !== createDebug.namespaces) {
                namespacesCache = createDebug.namespaces;
                enabledCache = createDebug.enabled(namespace);
              }
              return enabledCache;
            },
            set: v => {
              enableOverride = v;
            }
          });
          if (typeof createDebug.init === 'function') {
            createDebug.init(debug);
          }
          return debug;
        }
        function extend(namespace, delimiter) {
          const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
          newDebug.log = this.log;
          return newDebug;
        }
        function enable(namespaces) {
          createDebug.save(namespaces);
          createDebug.namespaces = namespaces;
          createDebug.names = [];
          createDebug.skips = [];
          let i;
          const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
          const len = split.length;
          for (i = 0; i < len; i++) {
            if (!split[i]) {
              continue;
            }
            namespaces = split[i].replace(/\*/g, '.*?');
            if (namespaces[0] === '-') {
              createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
            } else {
              createDebug.names.push(new RegExp('^' + namespaces + '$'));
            }
          }
        }
        function disable() {
          const namespaces = [...createDebug.names.map(toNamespace), ...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)].join(',');
          createDebug.enable('');
          return namespaces;
        }
        function enabled(name) {
          if (name[name.length - 1] === '*') {
            return true;
          }
          let i;
          let len;
          for (i = 0, len = createDebug.skips.length; i < len; i++) {
            if (createDebug.skips[i].test(name)) {
              return false;
            }
          }
          for (i = 0, len = createDebug.names.length; i < len; i++) {
            if (createDebug.names[i].test(name)) {
              return true;
            }
          }
          return false;
        }
        function toNamespace(regexp) {
          return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, '*');
        }
        function coerce(val) {
          if (val instanceof Error) {
            return val.stack || val.message;
          }
          return val;
        }
        function destroy() {
          console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
        }
        createDebug.enable(createDebug.load());
        return createDebug;
      }
      module.exports = setup;
    }, {
      "ms": 43
    }],
    46: [function (require, module, exports) {
      module.exports = stringify;
      stringify.default = stringify;
      stringify.stable = deterministicStringify;
      stringify.stableStringify = deterministicStringify;
      var LIMIT_REPLACE_NODE = '[...]';
      var CIRCULAR_REPLACE_NODE = '[Circular]';
      var arr = [];
      var replacerStack = [];
      function defaultOptions() {
        return {
          depthLimit: Number.MAX_SAFE_INTEGER,
          edgesLimit: Number.MAX_SAFE_INTEGER
        };
      }
      function stringify(obj, replacer, spacer, options) {
        if (typeof options === 'undefined') {
          options = defaultOptions();
        }
        decirc(obj, '', 0, [], undefined, 0, options);
        var res;
        try {
          if (replacerStack.length === 0) {
            res = JSON.stringify(obj, replacer, spacer);
          } else {
            res = JSON.stringify(obj, replaceGetterValues(replacer), spacer);
          }
        } catch (_) {
          return JSON.stringify('[unable to serialize, circular reference is too complex to analyze]');
        } finally {
          while (arr.length !== 0) {
            var part = arr.pop();
            if (part.length === 4) {
              Object.defineProperty(part[0], part[1], part[3]);
            } else {
              part[0][part[1]] = part[2];
            }
          }
        }
        return res;
      }
      function setReplace(replace, val, k, parent) {
        var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k);
        if (propertyDescriptor.get !== undefined) {
          if (propertyDescriptor.configurable) {
            Object.defineProperty(parent, k, {
              value: replace
            });
            arr.push([parent, k, val, propertyDescriptor]);
          } else {
            replacerStack.push([val, k, replace]);
          }
        } else {
          parent[k] = replace;
          arr.push([parent, k, val]);
        }
      }
      function decirc(val, k, edgeIndex, stack, parent, depth, options) {
        depth += 1;
        var i;
        if (typeof val === 'object' && val !== null) {
          for (i = 0; i < stack.length; i++) {
            if (stack[i] === val) {
              setReplace(CIRCULAR_REPLACE_NODE, val, k, parent);
              return;
            }
          }
          if (typeof options.depthLimit !== 'undefined' && depth > options.depthLimit) {
            setReplace(LIMIT_REPLACE_NODE, val, k, parent);
            return;
          }
          if (typeof options.edgesLimit !== 'undefined' && edgeIndex + 1 > options.edgesLimit) {
            setReplace(LIMIT_REPLACE_NODE, val, k, parent);
            return;
          }
          stack.push(val);
          if (Array.isArray(val)) {
            for (i = 0; i < val.length; i++) {
              decirc(val[i], i, i, stack, val, depth, options);
            }
          } else {
            var keys = Object.keys(val);
            for (i = 0; i < keys.length; i++) {
              var key = keys[i];
              decirc(val[key], key, i, stack, val, depth, options);
            }
          }
          stack.pop();
        }
      }
      function compareFunction(a, b) {
        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
        return 0;
      }
      function deterministicStringify(obj, replacer, spacer, options) {
        if (typeof options === 'undefined') {
          options = defaultOptions();
        }
        var tmp = deterministicDecirc(obj, '', 0, [], undefined, 0, options) || obj;
        var res;
        try {
          if (replacerStack.length === 0) {
            res = JSON.stringify(tmp, replacer, spacer);
          } else {
            res = JSON.stringify(tmp, replaceGetterValues(replacer), spacer);
          }
        } catch (_) {
          return JSON.stringify('[unable to serialize, circular reference is too complex to analyze]');
        } finally {
          while (arr.length !== 0) {
            var part = arr.pop();
            if (part.length === 4) {
              Object.defineProperty(part[0], part[1], part[3]);
            } else {
              part[0][part[1]] = part[2];
            }
          }
        }
        return res;
      }
      function deterministicDecirc(val, k, edgeIndex, stack, parent, depth, options) {
        depth += 1;
        var i;
        if (typeof val === 'object' && val !== null) {
          for (i = 0; i < stack.length; i++) {
            if (stack[i] === val) {
              setReplace(CIRCULAR_REPLACE_NODE, val, k, parent);
              return;
            }
          }
          try {
            if (typeof val.toJSON === 'function') {
              return;
            }
          } catch (_) {
            return;
          }
          if (typeof options.depthLimit !== 'undefined' && depth > options.depthLimit) {
            setReplace(LIMIT_REPLACE_NODE, val, k, parent);
            return;
          }
          if (typeof options.edgesLimit !== 'undefined' && edgeIndex + 1 > options.edgesLimit) {
            setReplace(LIMIT_REPLACE_NODE, val, k, parent);
            return;
          }
          stack.push(val);
          if (Array.isArray(val)) {
            for (i = 0; i < val.length; i++) {
              deterministicDecirc(val[i], i, i, stack, val, depth, options);
            }
          } else {
            var tmp = {};
            var keys = Object.keys(val).sort(compareFunction);
            for (i = 0; i < keys.length; i++) {
              var key = keys[i];
              deterministicDecirc(val[key], key, i, stack, val, depth, options);
              tmp[key] = val[key];
            }
            if (typeof parent !== 'undefined') {
              arr.push([parent, k, val]);
              parent[k] = tmp;
            } else {
              return tmp;
            }
          }
          stack.pop();
        }
      }
      function replaceGetterValues(replacer) {
        replacer = typeof replacer !== 'undefined' ? replacer : function (k, v) {
          return v;
        };
        return function (key, val) {
          if (replacerStack.length > 0) {
            for (var i = 0; i < replacerStack.length; i++) {
              var part = replacerStack[i];
              if (part[1] === key && part[0] === val) {
                val = part[2];
                replacerStack.splice(i, 1);
                break;
              }
            }
          }
          return replacer.call(this, key, val);
        };
      }
    }, {}],
    47: [function (require, module, exports) {
      exports.read = function (buffer, offset, isLE, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i = isLE ? nBytes - 1 : 0;
        var d = isLE ? -1 : 1;
        var s = buffer[offset + i];
        i += d;
        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };
      exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i = isLE ? 0 : nBytes - 1;
        var d = isLE ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
        value = Math.abs(value);
        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);
          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }
          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }
          if (value * c >= 2) {
            e++;
            c /= 2;
          }
          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }
        for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
        e = e << mLen | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
        buffer[offset + i - d] |= s * 128;
      };
    }, {}],
    48: [function (require, module, exports) {
      'use strict';

      const {
        ErrorWithCause
      } = require('./lib/error-with-cause');
      const {
        findCauseByReference,
        getErrorCause,
        messageWithCauses,
        stackWithCauses
      } = require('./lib/helpers');
      module.exports = {
        ErrorWithCause,
        findCauseByReference,
        getErrorCause,
        stackWithCauses,
        messageWithCauses
      };
    }, {
      "./lib/error-with-cause": 49,
      "./lib/helpers": 50
    }],
    49: [function (require, module, exports) {
      'use strict';

      class ErrorWithCause extends Error {
        constructor(message, {
          cause
        } = {}) {
          super(message);
          this.name = ErrorWithCause.name;
          if (cause) {
            this.cause = cause;
          }
          this.message = message;
        }
      }
      module.exports = {
        ErrorWithCause
      };
    }, {}],
    50: [function (require, module, exports) {
      'use strict';

      const findCauseByReference = (err, reference) => {
        if (!err || !reference) return;
        if (!(err instanceof Error)) return;
        if (!(reference.prototype instanceof Error) && reference !== Error) return;
        const seen = new Set();
        let currentErr = err;
        while (currentErr && !seen.has(currentErr)) {
          seen.add(currentErr);
          if (currentErr instanceof reference) {
            return currentErr;
          }
          currentErr = getErrorCause(currentErr);
        }
      };
      const getErrorCause = err => {
        if (!err || typeof err !== 'object' || !('cause' in err)) {
          return;
        }
        if (typeof err.cause === 'function') {
          const causeResult = err.cause();
          return causeResult instanceof Error ? causeResult : undefined;
        } else {
          return err.cause instanceof Error ? err.cause : undefined;
        }
      };
      const _stackWithCauses = (err, seen) => {
        if (!(err instanceof Error)) return '';
        const stack = err.stack || '';
        if (seen.has(err)) {
          return stack + '\ncauses have become circular...';
        }
        const cause = getErrorCause(err);
        if (cause) {
          seen.add(err);
          return stack + '\ncaused by: ' + _stackWithCauses(cause, seen);
        } else {
          return stack;
        }
      };
      const stackWithCauses = err => _stackWithCauses(err, new Set());
      const _messageWithCauses = (err, seen, skip) => {
        if (!(err instanceof Error)) return '';
        const message = skip ? '' : err.message || '';
        if (seen.has(err)) {
          return message + ': ...';
        }
        const cause = getErrorCause(err);
        if (cause) {
          seen.add(err);
          const skipIfVErrorStyleCause = 'cause' in err && typeof err.cause === 'function';
          return message + (skipIfVErrorStyleCause ? '' : ': ') + _messageWithCauses(cause, seen, skipIfVErrorStyleCause);
        } else {
          return message;
        }
      };
      const messageWithCauses = err => _messageWithCauses(err, new Set());
      module.exports = {
        findCauseByReference,
        getErrorCause,
        stackWithCauses,
        messageWithCauses
      };
    }, {}],
    51: [function (require, module, exports) {
      var process = module.exports = {};
      var cachedSetTimeout;
      var cachedClearTimeout;
      function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
      }
      function defaultClearTimeout() {
        throw new Error('clearTimeout has not been defined');
      }
      (function () {
        try {
          if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
          } else {
            cachedSetTimeout = defaultSetTimout;
          }
        } catch (e) {
          cachedSetTimeout = defaultSetTimout;
        }
        try {
          if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
          } else {
            cachedClearTimeout = defaultClearTimeout;
          }
        } catch (e) {
          cachedClearTimeout = defaultClearTimeout;
        }
      })();
      function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
          return setTimeout(fun, 0);
        }
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
        }
        try {
          return cachedSetTimeout(fun, 0);
        } catch (e) {
          try {
            return cachedSetTimeout.call(null, fun, 0);
          } catch (e) {
            return cachedSetTimeout.call(this, fun, 0);
          }
        }
      }
      function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
          return clearTimeout(marker);
        }
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
        }
        try {
          return cachedClearTimeout(marker);
        } catch (e) {
          try {
            return cachedClearTimeout.call(null, marker);
          } catch (e) {
            return cachedClearTimeout.call(this, marker);
          }
        }
      }
      var queue = [];
      var draining = false;
      var currentQueue;
      var queueIndex = -1;
      function cleanUpNextTick() {
        if (!draining || !currentQueue) {
          return;
        }
        draining = false;
        if (currentQueue.length) {
          queue = currentQueue.concat(queue);
        } else {
          queueIndex = -1;
        }
        if (queue.length) {
          drainQueue();
        }
      }
      function drainQueue() {
        if (draining) {
          return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;
        var len = queue.length;
        while (len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
            if (currentQueue) {
              currentQueue[queueIndex].run();
            }
          }
          queueIndex = -1;
          len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
      }
      process.nextTick = function (fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
          }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
        }
      };
      function Item(fun, array) {
        this.fun = fun;
        this.array = array;
      }
      Item.prototype.run = function () {
        this.fun.apply(null, this.array);
      };
      process.title = 'browser';
      process.browser = true;
      process.env = {};
      process.argv = [];
      process.version = '';
      process.versions = {};
      function noop() {}
      process.on = noop;
      process.addListener = noop;
      process.once = noop;
      process.off = noop;
      process.removeListener = noop;
      process.removeAllListeners = noop;
      process.emit = noop;
      process.prependListener = noop;
      process.prependOnceListener = noop;
      process.listeners = function (name) {
        return [];
      };
      process.binding = function (name) {
        throw new Error('process.binding is not supported');
      };
      process.cwd = function () {
        return '/';
      };
      process.chdir = function (dir) {
        throw new Error('process.chdir is not supported');
      };
      process.umask = function () {
        return 0;
      };
    }, {}],
    52: [function (require, module, exports) {
      const ANY = Symbol('SemVer ANY');
      class Comparator {
        static get ANY() {
          return ANY;
        }
        constructor(comp, options) {
          options = parseOptions(options);
          if (comp instanceof Comparator) {
            if (comp.loose === !!options.loose) {
              return comp;
            } else {
              comp = comp.value;
            }
          }
          comp = comp.trim().split(/\s+/).join(' ');
          debug('comparator', comp, options);
          this.options = options;
          this.loose = !!options.loose;
          this.parse(comp);
          if (this.semver === ANY) {
            this.value = '';
          } else {
            this.value = this.operator + this.semver.version;
          }
          debug('comp', this);
        }
        parse(comp) {
          const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
          const m = comp.match(r);
          if (!m) {
            throw new TypeError(`Invalid comparator: ${comp}`);
          }
          this.operator = m[1] !== undefined ? m[1] : '';
          if (this.operator === '=') {
            this.operator = '';
          }
          if (!m[2]) {
            this.semver = ANY;
          } else {
            this.semver = new SemVer(m[2], this.options.loose);
          }
        }
        toString() {
          return this.value;
        }
        test(version) {
          debug('Comparator.test', version, this.options.loose);
          if (this.semver === ANY || version === ANY) {
            return true;
          }
          if (typeof version === 'string') {
            try {
              version = new SemVer(version, this.options);
            } catch (er) {
              return false;
            }
          }
          return cmp(version, this.operator, this.semver, this.options);
        }
        intersects(comp, options) {
          if (!(comp instanceof Comparator)) {
            throw new TypeError('a Comparator is required');
          }
          if (this.operator === '') {
            if (this.value === '') {
              return true;
            }
            return new Range(comp.value, options).test(this.value);
          } else if (comp.operator === '') {
            if (comp.value === '') {
              return true;
            }
            return new Range(this.value, options).test(comp.semver);
          }
          options = parseOptions(options);
          if (options.includePrerelease && (this.value === '<0.0.0-0' || comp.value === '<0.0.0-0')) {
            return false;
          }
          if (!options.includePrerelease && (this.value.startsWith('<0.0.0') || comp.value.startsWith('<0.0.0'))) {
            return false;
          }
          if (this.operator.startsWith('>') && comp.operator.startsWith('>')) {
            return true;
          }
          if (this.operator.startsWith('<') && comp.operator.startsWith('<')) {
            return true;
          }
          if (this.semver.version === comp.semver.version && this.operator.includes('=') && comp.operator.includes('=')) {
            return true;
          }
          if (cmp(this.semver, '<', comp.semver, options) && this.operator.startsWith('>') && comp.operator.startsWith('<')) {
            return true;
          }
          if (cmp(this.semver, '>', comp.semver, options) && this.operator.startsWith('<') && comp.operator.startsWith('>')) {
            return true;
          }
          return false;
        }
      }
      module.exports = Comparator;
      const parseOptions = require('../internal/parse-options');
      const {
        safeRe: re,
        t
      } = require('../internal/re');
      const cmp = require('../functions/cmp');
      const debug = require('../internal/debug');
      const SemVer = require('./semver');
      const Range = require('./range');
    }, {
      "../functions/cmp": 56,
      "../internal/debug": 81,
      "../internal/parse-options": 83,
      "../internal/re": 84,
      "./range": 53,
      "./semver": 54
    }],
    53: [function (require, module, exports) {
      class Range {
        constructor(range, options) {
          options = parseOptions(options);
          if (range instanceof Range) {
            if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
              return range;
            } else {
              return new Range(range.raw, options);
            }
          }
          if (range instanceof Comparator) {
            this.raw = range.value;
            this.set = [[range]];
            this.format();
            return this;
          }
          this.options = options;
          this.loose = !!options.loose;
          this.includePrerelease = !!options.includePrerelease;
          this.raw = range.trim().split(/\s+/).join(' ');
          this.set = this.raw.split('||').map(r => this.parseRange(r.trim())).filter(c => c.length);
          if (!this.set.length) {
            throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
          }
          if (this.set.length > 1) {
            const first = this.set[0];
            this.set = this.set.filter(c => !isNullSet(c[0]));
            if (this.set.length === 0) {
              this.set = [first];
            } else if (this.set.length > 1) {
              for (const c of this.set) {
                if (c.length === 1 && isAny(c[0])) {
                  this.set = [c];
                  break;
                }
              }
            }
          }
          this.format();
        }
        format() {
          this.range = this.set.map(comps => comps.join(' ').trim()).join('||').trim();
          return this.range;
        }
        toString() {
          return this.range;
        }
        parseRange(range) {
          const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
          const memoKey = memoOpts + ':' + range;
          const cached = cache.get(memoKey);
          if (cached) {
            return cached;
          }
          const loose = this.options.loose;
          const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
          range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
          debug('hyphen replace', range);
          range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
          debug('comparator trim', range);
          range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
          debug('tilde trim', range);
          range = range.replace(re[t.CARETTRIM], caretTrimReplace);
          debug('caret trim', range);
          let rangeList = range.split(' ').map(comp => parseComparator(comp, this.options)).join(' ').split(/\s+/).map(comp => replaceGTE0(comp, this.options));
          if (loose) {
            rangeList = rangeList.filter(comp => {
              debug('loose invalid filter', comp, this.options);
              return !!comp.match(re[t.COMPARATORLOOSE]);
            });
          }
          debug('range list', rangeList);
          const rangeMap = new Map();
          const comparators = rangeList.map(comp => new Comparator(comp, this.options));
          for (const comp of comparators) {
            if (isNullSet(comp)) {
              return [comp];
            }
            rangeMap.set(comp.value, comp);
          }
          if (rangeMap.size > 1 && rangeMap.has('')) {
            rangeMap.delete('');
          }
          const result = [...rangeMap.values()];
          cache.set(memoKey, result);
          return result;
        }
        intersects(range, options) {
          if (!(range instanceof Range)) {
            throw new TypeError('a Range is required');
          }
          return this.set.some(thisComparators => {
            return isSatisfiable(thisComparators, options) && range.set.some(rangeComparators => {
              return isSatisfiable(rangeComparators, options) && thisComparators.every(thisComparator => {
                return rangeComparators.every(rangeComparator => {
                  return thisComparator.intersects(rangeComparator, options);
                });
              });
            });
          });
        }
        test(version) {
          if (!version) {
            return false;
          }
          if (typeof version === 'string') {
            try {
              version = new SemVer(version, this.options);
            } catch (er) {
              return false;
            }
          }
          for (let i = 0; i < this.set.length; i++) {
            if (testSet(this.set[i], version, this.options)) {
              return true;
            }
          }
          return false;
        }
      }
      module.exports = Range;
      const LRU = require('lru-cache');
      const cache = new LRU({
        max: 1000
      });
      const parseOptions = require('../internal/parse-options');
      const Comparator = require('./comparator');
      const debug = require('../internal/debug');
      const SemVer = require('./semver');
      const {
        safeRe: re,
        t,
        comparatorTrimReplace,
        tildeTrimReplace,
        caretTrimReplace
      } = require('../internal/re');
      const {
        FLAG_INCLUDE_PRERELEASE,
        FLAG_LOOSE
      } = require('../internal/constants');
      const isNullSet = c => c.value === '<0.0.0-0';
      const isAny = c => c.value === '';
      const isSatisfiable = (comparators, options) => {
        let result = true;
        const remainingComparators = comparators.slice();
        let testComparator = remainingComparators.pop();
        while (result && remainingComparators.length) {
          result = remainingComparators.every(otherComparator => {
            return testComparator.intersects(otherComparator, options);
          });
          testComparator = remainingComparators.pop();
        }
        return result;
      };
      const parseComparator = (comp, options) => {
        debug('comp', comp, options);
        comp = replaceCarets(comp, options);
        debug('caret', comp);
        comp = replaceTildes(comp, options);
        debug('tildes', comp);
        comp = replaceXRanges(comp, options);
        debug('xrange', comp);
        comp = replaceStars(comp, options);
        debug('stars', comp);
        return comp;
      };
      const isX = id => !id || id.toLowerCase() === 'x' || id === '*';
      const replaceTildes = (comp, options) => {
        return comp.trim().split(/\s+/).map(c => replaceTilde(c, options)).join(' ');
      };
      const replaceTilde = (comp, options) => {
        const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
        return comp.replace(r, (_, M, m, p, pr) => {
          debug('tilde', comp, _, M, m, p, pr);
          let ret;
          if (isX(M)) {
            ret = '';
          } else if (isX(m)) {
            ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
          } else if (isX(p)) {
            ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
          } else if (pr) {
            debug('replaceTilde pr', pr);
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
          }
          debug('tilde return', ret);
          return ret;
        });
      };
      const replaceCarets = (comp, options) => {
        return comp.trim().split(/\s+/).map(c => replaceCaret(c, options)).join(' ');
      };
      const replaceCaret = (comp, options) => {
        debug('caret', comp, options);
        const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
        const z = options.includePrerelease ? '-0' : '';
        return comp.replace(r, (_, M, m, p, pr) => {
          debug('caret', comp, _, M, m, p, pr);
          let ret;
          if (isX(M)) {
            ret = '';
          } else if (isX(m)) {
            ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
          } else if (isX(p)) {
            if (M === '0') {
              ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
            } else {
              ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
            }
          } else if (pr) {
            debug('replaceCaret pr', pr);
            if (M === '0') {
              if (m === '0') {
                ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
              } else {
                ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
              }
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
            }
          } else {
            debug('no pr');
            if (M === '0') {
              if (m === '0') {
                ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
              } else {
                ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
              }
            } else {
              ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
            }
          }
          debug('caret return', ret);
          return ret;
        });
      };
      const replaceXRanges = (comp, options) => {
        debug('replaceXRanges', comp, options);
        return comp.split(/\s+/).map(c => replaceXRange(c, options)).join(' ');
      };
      const replaceXRange = (comp, options) => {
        comp = comp.trim();
        const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
        return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
          debug('xRange', comp, ret, gtlt, M, m, p, pr);
          const xM = isX(M);
          const xm = xM || isX(m);
          const xp = xm || isX(p);
          const anyX = xp;
          if (gtlt === '=' && anyX) {
            gtlt = '';
          }
          pr = options.includePrerelease ? '-0' : '';
          if (xM) {
            if (gtlt === '>' || gtlt === '<') {
              ret = '<0.0.0-0';
            } else {
              ret = '*';
            }
          } else if (gtlt && anyX) {
            if (xm) {
              m = 0;
            }
            p = 0;
            if (gtlt === '>') {
              gtlt = '>=';
              if (xm) {
                M = +M + 1;
                m = 0;
                p = 0;
              } else {
                m = +m + 1;
                p = 0;
              }
            } else if (gtlt === '<=') {
              gtlt = '<';
              if (xm) {
                M = +M + 1;
              } else {
                m = +m + 1;
              }
            }
            if (gtlt === '<') {
              pr = '-0';
            }
            ret = `${gtlt + M}.${m}.${p}${pr}`;
          } else if (xm) {
            ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
          } else if (xp) {
            ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
          }
          debug('xRange return', ret);
          return ret;
        });
      };
      const replaceStars = (comp, options) => {
        debug('replaceStars', comp, options);
        return comp.trim().replace(re[t.STAR], '');
      };
      const replaceGTE0 = (comp, options) => {
        debug('replaceGTE0', comp, options);
        return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], '');
      };
      const hyphenReplace = incPr => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) => {
        if (isX(fM)) {
          from = '';
        } else if (isX(fm)) {
          from = `>=${fM}.0.0${incPr ? '-0' : ''}`;
        } else if (isX(fp)) {
          from = `>=${fM}.${fm}.0${incPr ? '-0' : ''}`;
        } else if (fpr) {
          from = `>=${from}`;
        } else {
          from = `>=${from}${incPr ? '-0' : ''}`;
        }
        if (isX(tM)) {
          to = '';
        } else if (isX(tm)) {
          to = `<${+tM + 1}.0.0-0`;
        } else if (isX(tp)) {
          to = `<${tM}.${+tm + 1}.0-0`;
        } else if (tpr) {
          to = `<=${tM}.${tm}.${tp}-${tpr}`;
        } else if (incPr) {
          to = `<${tM}.${tm}.${+tp + 1}-0`;
        } else {
          to = `<=${to}`;
        }
        return `${from} ${to}`.trim();
      };
      const testSet = (set, version, options) => {
        for (let i = 0; i < set.length; i++) {
          if (!set[i].test(version)) {
            return false;
          }
        }
        if (version.prerelease.length && !options.includePrerelease) {
          for (let i = 0; i < set.length; i++) {
            debug(set[i].semver);
            if (set[i].semver === Comparator.ANY) {
              continue;
            }
            if (set[i].semver.prerelease.length > 0) {
              const allowed = set[i].semver;
              if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
                return true;
              }
            }
          }
          return false;
        }
        return true;
      };
    }, {
      "../internal/constants": 80,
      "../internal/debug": 81,
      "../internal/parse-options": 83,
      "../internal/re": 84,
      "./comparator": 52,
      "./semver": 54,
      "lru-cache": 85
    }],
    54: [function (require, module, exports) {
      const debug = require('../internal/debug');
      const {
        MAX_LENGTH,
        MAX_SAFE_INTEGER
      } = require('../internal/constants');
      const {
        safeRe: re,
        t
      } = require('../internal/re');
      const parseOptions = require('../internal/parse-options');
      const {
        compareIdentifiers
      } = require('../internal/identifiers');
      class SemVer {
        constructor(version, options) {
          options = parseOptions(options);
          if (version instanceof SemVer) {
            if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
              return version;
            } else {
              version = version.version;
            }
          } else if (typeof version !== 'string') {
            throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
          }
          if (version.length > MAX_LENGTH) {
            throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
          }
          debug('SemVer', version, options);
          this.options = options;
          this.loose = !!options.loose;
          this.includePrerelease = !!options.includePrerelease;
          const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
          if (!m) {
            throw new TypeError(`Invalid Version: ${version}`);
          }
          this.raw = version;
          this.major = +m[1];
          this.minor = +m[2];
          this.patch = +m[3];
          if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
            throw new TypeError('Invalid major version');
          }
          if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
            throw new TypeError('Invalid minor version');
          }
          if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
            throw new TypeError('Invalid patch version');
          }
          if (!m[4]) {
            this.prerelease = [];
          } else {
            this.prerelease = m[4].split('.').map(id => {
              if (/^[0-9]+$/.test(id)) {
                const num = +id;
                if (num >= 0 && num < MAX_SAFE_INTEGER) {
                  return num;
                }
              }
              return id;
            });
          }
          this.build = m[5] ? m[5].split('.') : [];
          this.format();
        }
        format() {
          this.version = `${this.major}.${this.minor}.${this.patch}`;
          if (this.prerelease.length) {
            this.version += `-${this.prerelease.join('.')}`;
          }
          return this.version;
        }
        toString() {
          return this.version;
        }
        compare(other) {
          debug('SemVer.compare', this.version, this.options, other);
          if (!(other instanceof SemVer)) {
            if (typeof other === 'string' && other === this.version) {
              return 0;
            }
            other = new SemVer(other, this.options);
          }
          if (other.version === this.version) {
            return 0;
          }
          return this.compareMain(other) || this.comparePre(other);
        }
        compareMain(other) {
          if (!(other instanceof SemVer)) {
            other = new SemVer(other, this.options);
          }
          return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
        }
        comparePre(other) {
          if (!(other instanceof SemVer)) {
            other = new SemVer(other, this.options);
          }
          if (this.prerelease.length && !other.prerelease.length) {
            return -1;
          } else if (!this.prerelease.length && other.prerelease.length) {
            return 1;
          } else if (!this.prerelease.length && !other.prerelease.length) {
            return 0;
          }
          let i = 0;
          do {
            const a = this.prerelease[i];
            const b = other.prerelease[i];
            debug('prerelease compare', i, a, b);
            if (a === undefined && b === undefined) {
              return 0;
            } else if (b === undefined) {
              return 1;
            } else if (a === undefined) {
              return -1;
            } else if (a === b) {
              continue;
            } else {
              return compareIdentifiers(a, b);
            }
          } while (++i);
        }
        compareBuild(other) {
          if (!(other instanceof SemVer)) {
            other = new SemVer(other, this.options);
          }
          let i = 0;
          do {
            const a = this.build[i];
            const b = other.build[i];
            debug('prerelease compare', i, a, b);
            if (a === undefined && b === undefined) {
              return 0;
            } else if (b === undefined) {
              return 1;
            } else if (a === undefined) {
              return -1;
            } else if (a === b) {
              continue;
            } else {
              return compareIdentifiers(a, b);
            }
          } while (++i);
        }
        inc(release, identifier, identifierBase) {
          switch (release) {
            case 'premajor':
              this.prerelease.length = 0;
              this.patch = 0;
              this.minor = 0;
              this.major++;
              this.inc('pre', identifier, identifierBase);
              break;
            case 'preminor':
              this.prerelease.length = 0;
              this.patch = 0;
              this.minor++;
              this.inc('pre', identifier, identifierBase);
              break;
            case 'prepatch':
              this.prerelease.length = 0;
              this.inc('patch', identifier, identifierBase);
              this.inc('pre', identifier, identifierBase);
              break;
            case 'prerelease':
              if (this.prerelease.length === 0) {
                this.inc('patch', identifier, identifierBase);
              }
              this.inc('pre', identifier, identifierBase);
              break;
            case 'major':
              if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
                this.major++;
              }
              this.minor = 0;
              this.patch = 0;
              this.prerelease = [];
              break;
            case 'minor':
              if (this.patch !== 0 || this.prerelease.length === 0) {
                this.minor++;
              }
              this.patch = 0;
              this.prerelease = [];
              break;
            case 'patch':
              if (this.prerelease.length === 0) {
                this.patch++;
              }
              this.prerelease = [];
              break;
            case 'pre':
              {
                const base = Number(identifierBase) ? 1 : 0;
                if (!identifier && identifierBase === false) {
                  throw new Error('invalid increment argument: identifier is empty');
                }
                if (this.prerelease.length === 0) {
                  this.prerelease = [base];
                } else {
                  let i = this.prerelease.length;
                  while (--i >= 0) {
                    if (typeof this.prerelease[i] === 'number') {
                      this.prerelease[i]++;
                      i = -2;
                    }
                  }
                  if (i === -1) {
                    if (identifier === this.prerelease.join('.') && identifierBase === false) {
                      throw new Error('invalid increment argument: identifier already exists');
                    }
                    this.prerelease.push(base);
                  }
                }
                if (identifier) {
                  let prerelease = [identifier, base];
                  if (identifierBase === false) {
                    prerelease = [identifier];
                  }
                  if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
                    if (isNaN(this.prerelease[1])) {
                      this.prerelease = prerelease;
                    }
                  } else {
                    this.prerelease = prerelease;
                  }
                }
                break;
              }
            default:
              throw new Error(`invalid increment argument: ${release}`);
          }
          this.raw = this.format();
          if (this.build.length) {
            this.raw += `+${this.build.join('.')}`;
          }
          return this;
        }
      }
      module.exports = SemVer;
    }, {
      "../internal/constants": 80,
      "../internal/debug": 81,
      "../internal/identifiers": 82,
      "../internal/parse-options": 83,
      "../internal/re": 84
    }],
    55: [function (require, module, exports) {
      const parse = require('./parse');
      const clean = (version, options) => {
        const s = parse(version.trim().replace(/^[=v]+/, ''), options);
        return s ? s.version : null;
      };
      module.exports = clean;
    }, {
      "./parse": 71
    }],
    56: [function (require, module, exports) {
      const eq = require('./eq');
      const neq = require('./neq');
      const gt = require('./gt');
      const gte = require('./gte');
      const lt = require('./lt');
      const lte = require('./lte');
      const cmp = (a, op, b, loose) => {
        switch (op) {
          case '===':
            if (typeof a === 'object') {
              a = a.version;
            }
            if (typeof b === 'object') {
              b = b.version;
            }
            return a === b;
          case '!==':
            if (typeof a === 'object') {
              a = a.version;
            }
            if (typeof b === 'object') {
              b = b.version;
            }
            return a !== b;
          case '':
          case '=':
          case '==':
            return eq(a, b, loose);
          case '!=':
            return neq(a, b, loose);
          case '>':
            return gt(a, b, loose);
          case '>=':
            return gte(a, b, loose);
          case '<':
            return lt(a, b, loose);
          case '<=':
            return lte(a, b, loose);
          default:
            throw new TypeError(`Invalid operator: ${op}`);
        }
      };
      module.exports = cmp;
    }, {
      "./eq": 62,
      "./gt": 63,
      "./gte": 64,
      "./lt": 66,
      "./lte": 67,
      "./neq": 70
    }],
    57: [function (require, module, exports) {
      const SemVer = require('../classes/semver');
      const parse = require('./parse');
      const {
        safeRe: re,
        t
      } = require('../internal/re');
      const coerce = (version, options) => {
        if (version instanceof SemVer) {
          return version;
        }
        if (typeof version === 'number') {
          version = String(version);
        }
        if (typeof version !== 'string') {
          return null;
        }
        options = options || {};
        let match = null;
        if (!options.rtl) {
          match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
        } else {
          const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
          let next;
          while ((next = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)) {
            if (!match || next.index + next[0].length !== match.index + match[0].length) {
              match = next;
            }
            coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
          }
          coerceRtlRegex.lastIndex = -1;
        }
        if (match === null) {
          return null;
        }
        const major = match[2];
        const minor = match[3] || '0';
        const patch = match[4] || '0';
        const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : '';
        const build = options.includePrerelease && match[6] ? `+${match[6]}` : '';
        return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
      };
      module.exports = coerce;
    }, {
      "../classes/semver": 54,
      "../internal/re": 84,
      "./parse": 71
    }],
    58: [function (require, module, exports) {
      const SemVer = require('../classes/semver');
      const compareBuild = (a, b, loose) => {
        const versionA = new SemVer(a, loose);
        const versionB = new SemVer(b, loose);
        return versionA.compare(versionB) || versionA.compareBuild(versionB);
      };
      module.exports = compareBuild;
    }, {
      "../classes/semver": 54
    }],
    59: [function (require, module, exports) {
      const compare = require('./compare');
      const compareLoose = (a, b) => compare(a, b, true);
      module.exports = compareLoose;
    }, {
      "./compare": 60
    }],
    60: [function (require, module, exports) {
      const SemVer = require('../classes/semver');
      const compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
      module.exports = compare;
    }, {
      "../classes/semver": 54
    }],
    61: [function (require, module, exports) {
      const parse = require('./parse.js');
      const diff = (version1, version2) => {
        const v1 = parse(version1, null, true);
        const v2 = parse(version2, null, true);
        const comparison = v1.compare(v2);
        if (comparison === 0) {
          return null;
        }
        const v1Higher = comparison > 0;
        const highVersion = v1Higher ? v1 : v2;
        const lowVersion = v1Higher ? v2 : v1;
        const highHasPre = !!highVersion.prerelease.length;
        const lowHasPre = !!lowVersion.prerelease.length;
        if (lowHasPre && !highHasPre) {
          if (!lowVersion.patch && !lowVersion.minor) {
            return 'major';
          }
          if (highVersion.patch) {
            return 'patch';
          }
          if (highVersion.minor) {
            return 'minor';
          }
          return 'major';
        }
        const prefix = highHasPre ? 'pre' : '';
        if (v1.major !== v2.major) {
          return prefix + 'major';
        }
        if (v1.minor !== v2.minor) {
          return prefix + 'minor';
        }
        if (v1.patch !== v2.patch) {
          return prefix + 'patch';
        }
        return 'prerelease';
      };
      module.exports = diff;
    }, {
      "./parse.js": 71
    }],
    62: [function (require, module, exports) {
      const compare = require('./compare');
      const eq = (a, b, loose) => compare(a, b, loose) === 0;
      module.exports = eq;
    }, {
      "./compare": 60
    }],
    63: [function (require, module, exports) {
      const compare = require('./compare');
      const gt = (a, b, loose) => compare(a, b, loose) > 0;
      module.exports = gt;
    }, {
      "./compare": 60
    }],
    64: [function (require, module, exports) {
      const compare = require('./compare');
      const gte = (a, b, loose) => compare(a, b, loose) >= 0;
      module.exports = gte;
    }, {
      "./compare": 60
    }],
    65: [function (require, module, exports) {
      const SemVer = require('../classes/semver');
      const inc = (version, release, options, identifier, identifierBase) => {
        if (typeof options === 'string') {
          identifierBase = identifier;
          identifier = options;
          options = undefined;
        }
        try {
          return new SemVer(version instanceof SemVer ? version.version : version, options).inc(release, identifier, identifierBase).version;
        } catch (er) {
          return null;
        }
      };
      module.exports = inc;
    }, {
      "../classes/semver": 54
    }],
    66: [function (require, module, exports) {
      const compare = require('./compare');
      const lt = (a, b, loose) => compare(a, b, loose) < 0;
      module.exports = lt;
    }, {
      "./compare": 60
    }],
    67: [function (require, module, exports) {
      const compare = require('./compare');
      const lte = (a, b, loose) => compare(a, b, loose) <= 0;
      module.exports = lte;
    }, {
      "./compare": 60
    }],
    68: [function (require, module, exports) {
      const SemVer = require('../classes/semver');
      const major = (a, loose) => new SemVer(a, loose).major;
      module.exports = major;
    }, {
      "../classes/semver": 54
    }],
    69: [function (require, module, exports) {
      const SemVer = require('../classes/semver');
      const minor = (a, loose) => new SemVer(a, loose).minor;
      module.exports = minor;
    }, {
      "../classes/semver": 54
    }],
    70: [function (require, module, exports) {
      const compare = require('./compare');
      const neq = (a, b, loose) => compare(a, b, loose) !== 0;
      module.exports = neq;
    }, {
      "./compare": 60
    }],
    71: [function (require, module, exports) {
      const SemVer = require('../classes/semver');
      const parse = (version, options, throwErrors = false) => {
        if (version instanceof SemVer) {
          return version;
        }
        try {
          return new SemVer(version, options);
        } catch (er) {
          if (!throwErrors) {
            return null;
          }
          throw er;
        }
      };
      module.exports = parse;
    }, {
      "../classes/semver": 54
    }],
    72: [function (require, module, exports) {
      const SemVer = require('../classes/semver');
      const patch = (a, loose) => new SemVer(a, loose).patch;
      module.exports = patch;
    }, {
      "../classes/semver": 54
    }],
    73: [function (require, module, exports) {
      const parse = require('./parse');
      const prerelease = (version, options) => {
        const parsed = parse(version, options);
        return parsed && parsed.prerelease.length ? parsed.prerelease : null;
      };
      module.exports = prerelease;
    }, {
      "./parse": 71
    }],
    74: [function (require, module, exports) {
      const compare = require('./compare');
      const rcompare = (a, b, loose) => compare(b, a, loose);
      module.exports = rcompare;
    }, {
      "./compare": 60
    }],
    75: [function (require, module, exports) {
      const compareBuild = require('./compare-build');
      const rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
      module.exports = rsort;
    }, {
      "./compare-build": 58
    }],
    76: [function (require, module, exports) {
      const Range = require('../classes/range');
      const satisfies = (version, range, options) => {
        try {
          range = new Range(range, options);
        } catch (er) {
          return false;
        }
        return range.test(version);
      };
      module.exports = satisfies;
    }, {
      "../classes/range": 53
    }],
    77: [function (require, module, exports) {
      const compareBuild = require('./compare-build');
      const sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
      module.exports = sort;
    }, {
      "./compare-build": 58
    }],
    78: [function (require, module, exports) {
      const parse = require('./parse');
      const valid = (version, options) => {
        const v = parse(version, options);
        return v ? v.version : null;
      };
      module.exports = valid;
    }, {
      "./parse": 71
    }],
    79: [function (require, module, exports) {
      const internalRe = require('./internal/re');
      const constants = require('./internal/constants');
      const SemVer = require('./classes/semver');
      const identifiers = require('./internal/identifiers');
      const parse = require('./functions/parse');
      const valid = require('./functions/valid');
      const clean = require('./functions/clean');
      const inc = require('./functions/inc');
      const diff = require('./functions/diff');
      const major = require('./functions/major');
      const minor = require('./functions/minor');
      const patch = require('./functions/patch');
      const prerelease = require('./functions/prerelease');
      const compare = require('./functions/compare');
      const rcompare = require('./functions/rcompare');
      const compareLoose = require('./functions/compare-loose');
      const compareBuild = require('./functions/compare-build');
      const sort = require('./functions/sort');
      const rsort = require('./functions/rsort');
      const gt = require('./functions/gt');
      const lt = require('./functions/lt');
      const eq = require('./functions/eq');
      const neq = require('./functions/neq');
      const gte = require('./functions/gte');
      const lte = require('./functions/lte');
      const cmp = require('./functions/cmp');
      const coerce = require('./functions/coerce');
      const Comparator = require('./classes/comparator');
      const Range = require('./classes/range');
      const satisfies = require('./functions/satisfies');
      const toComparators = require('./ranges/to-comparators');
      const maxSatisfying = require('./ranges/max-satisfying');
      const minSatisfying = require('./ranges/min-satisfying');
      const minVersion = require('./ranges/min-version');
      const validRange = require('./ranges/valid');
      const outside = require('./ranges/outside');
      const gtr = require('./ranges/gtr');
      const ltr = require('./ranges/ltr');
      const intersects = require('./ranges/intersects');
      const simplifyRange = require('./ranges/simplify');
      const subset = require('./ranges/subset');
      module.exports = {
        parse,
        valid,
        clean,
        inc,
        diff,
        major,
        minor,
        patch,
        prerelease,
        compare,
        rcompare,
        compareLoose,
        compareBuild,
        sort,
        rsort,
        gt,
        lt,
        eq,
        neq,
        gte,
        lte,
        cmp,
        coerce,
        Comparator,
        Range,
        satisfies,
        toComparators,
        maxSatisfying,
        minSatisfying,
        minVersion,
        validRange,
        outside,
        gtr,
        ltr,
        intersects,
        simplifyRange,
        subset,
        SemVer,
        re: internalRe.re,
        src: internalRe.src,
        tokens: internalRe.t,
        SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
        RELEASE_TYPES: constants.RELEASE_TYPES,
        compareIdentifiers: identifiers.compareIdentifiers,
        rcompareIdentifiers: identifiers.rcompareIdentifiers
      };
    }, {
      "./classes/comparator": 52,
      "./classes/range": 53,
      "./classes/semver": 54,
      "./functions/clean": 55,
      "./functions/cmp": 56,
      "./functions/coerce": 57,
      "./functions/compare": 60,
      "./functions/compare-build": 58,
      "./functions/compare-loose": 59,
      "./functions/diff": 61,
      "./functions/eq": 62,
      "./functions/gt": 63,
      "./functions/gte": 64,
      "./functions/inc": 65,
      "./functions/lt": 66,
      "./functions/lte": 67,
      "./functions/major": 68,
      "./functions/minor": 69,
      "./functions/neq": 70,
      "./functions/parse": 71,
      "./functions/patch": 72,
      "./functions/prerelease": 73,
      "./functions/rcompare": 74,
      "./functions/rsort": 75,
      "./functions/satisfies": 76,
      "./functions/sort": 77,
      "./functions/valid": 78,
      "./internal/constants": 80,
      "./internal/identifiers": 82,
      "./internal/re": 84,
      "./ranges/gtr": 86,
      "./ranges/intersects": 87,
      "./ranges/ltr": 88,
      "./ranges/max-satisfying": 89,
      "./ranges/min-satisfying": 90,
      "./ranges/min-version": 91,
      "./ranges/outside": 92,
      "./ranges/simplify": 93,
      "./ranges/subset": 94,
      "./ranges/to-comparators": 95,
      "./ranges/valid": 96
    }],
    80: [function (require, module, exports) {
      const SEMVER_SPEC_VERSION = '2.0.0';
      const MAX_LENGTH = 256;
      const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
      const MAX_SAFE_COMPONENT_LENGTH = 16;
      const MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
      const RELEASE_TYPES = ['major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'];
      module.exports = {
        MAX_LENGTH,
        MAX_SAFE_COMPONENT_LENGTH,
        MAX_SAFE_BUILD_LENGTH,
        MAX_SAFE_INTEGER,
        RELEASE_TYPES,
        SEMVER_SPEC_VERSION,
        FLAG_INCLUDE_PRERELEASE: 0b001,
        FLAG_LOOSE: 0b010
      };
    }, {}],
    81: [function (require, module, exports) {
      (function (process) {
        (function () {
          const debug = typeof process === 'object' && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error('SEMVER', ...args) : () => {};
          module.exports = debug;
        }).call(this);
      }).call(this, require('_process'));
    }, {
      "_process": 51
    }],
    82: [function (require, module, exports) {
      const numeric = /^[0-9]+$/;
      const compareIdentifiers = (a, b) => {
        const anum = numeric.test(a);
        const bnum = numeric.test(b);
        if (anum && bnum) {
          a = +a;
          b = +b;
        }
        return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
      };
      const rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
      module.exports = {
        compareIdentifiers,
        rcompareIdentifiers
      };
    }, {}],
    83: [function (require, module, exports) {
      const looseOption = Object.freeze({
        loose: true
      });
      const emptyOpts = Object.freeze({});
      const parseOptions = options => {
        if (!options) {
          return emptyOpts;
        }
        if (typeof options !== 'object') {
          return looseOption;
        }
        return options;
      };
      module.exports = parseOptions;
    }, {}],
    84: [function (require, module, exports) {
      const {
        MAX_SAFE_COMPONENT_LENGTH,
        MAX_SAFE_BUILD_LENGTH,
        MAX_LENGTH
      } = require('./constants');
      const debug = require('./debug');
      exports = module.exports = {};
      const re = exports.re = [];
      const safeRe = exports.safeRe = [];
      const src = exports.src = [];
      const t = exports.t = {};
      let R = 0;
      const LETTERDASHNUMBER = '[a-zA-Z0-9-]';
      const safeRegexReplacements = [['\\s', 1], ['\\d', MAX_LENGTH], [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]];
      const makeSafeRegex = value => {
        for (const [token, max] of safeRegexReplacements) {
          value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
        }
        return value;
      };
      const createToken = (name, value, isGlobal) => {
        const safe = makeSafeRegex(value);
        const index = R++;
        debug(name, index, value);
        t[name] = index;
        src[index] = value;
        re[index] = new RegExp(value, isGlobal ? 'g' : undefined);
        safeRe[index] = new RegExp(safe, isGlobal ? 'g' : undefined);
      };
      createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*');
      createToken('NUMERICIDENTIFIERLOOSE', '\\d+');
      createToken('NONNUMERICIDENTIFIER', `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
      createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` + `(${src[t.NUMERICIDENTIFIER]})\\.` + `(${src[t.NUMERICIDENTIFIER]})`);
      createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` + `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` + `(${src[t.NUMERICIDENTIFIERLOOSE]})`);
      createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NUMERICIDENTIFIER]}|${src[t.NONNUMERICIDENTIFIER]})`);
      createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NUMERICIDENTIFIERLOOSE]}|${src[t.NONNUMERICIDENTIFIER]})`);
      createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
      createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
      createToken('BUILDIDENTIFIER', `${LETTERDASHNUMBER}+`);
      createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
      createToken('FULLPLAIN', `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
      createToken('FULL', `^${src[t.FULLPLAIN]}$`);
      createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
      createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`);
      createToken('GTLT', '((?:<|>)?=?)');
      createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
      createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
      createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` + `(?:\\.(${src[t.XRANGEIDENTIFIER]})` + `(?:\\.(${src[t.XRANGEIDENTIFIER]})` + `(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?` + `)?)?`);
      createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?` + `)?)?`);
      createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
      createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
      createToken('COERCEPLAIN', `${'(^|[^\\d])' + '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` + `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` + `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
      createToken('COERCE', `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
      createToken('COERCEFULL', src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?` + `(?:${src[t.BUILD]})?` + `(?:$|[^\\d])`);
      createToken('COERCERTL', src[t.COERCE], true);
      createToken('COERCERTLFULL', src[t.COERCEFULL], true);
      createToken('LONETILDE', '(?:~>?)');
      createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true);
      exports.tildeTrimReplace = '$1~';
      createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
      createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
      createToken('LONECARET', '(?:\\^)');
      createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true);
      exports.caretTrimReplace = '$1^';
      createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
      createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
      createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
      createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
      createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
      exports.comparatorTrimReplace = '$1$2$3';
      createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` + `\\s+-\\s+` + `(${src[t.XRANGEPLAIN]})` + `\\s*$`);
      createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` + `\\s+-\\s+` + `(${src[t.XRANGEPLAINLOOSE]})` + `\\s*$`);
      createToken('STAR', '(<|>)?=?\\s*\\*');
      createToken('GTE0', '^\\s*>=\\s*0\\.0\\.0\\s*$');
      createToken('GTE0PRE', '^\\s*>=\\s*0\\.0\\.0-0\\s*$');
    }, {
      "./constants": 80,
      "./debug": 81
    }],
    85: [function (require, module, exports) {
      'use strict';

      const Yallist = require('yallist');
      const MAX = Symbol('max');
      const LENGTH = Symbol('length');
      const LENGTH_CALCULATOR = Symbol('lengthCalculator');
      const ALLOW_STALE = Symbol('allowStale');
      const MAX_AGE = Symbol('maxAge');
      const DISPOSE = Symbol('dispose');
      const NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet');
      const LRU_LIST = Symbol('lruList');
      const CACHE = Symbol('cache');
      const UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet');
      const naiveLength = () => 1;
      class LRUCache {
        constructor(options) {
          if (typeof options === 'number') options = {
            max: options
          };
          if (!options) options = {};
          if (options.max && (typeof options.max !== 'number' || options.max < 0)) throw new TypeError('max must be a non-negative number');
          const max = this[MAX] = options.max || Infinity;
          const lc = options.length || naiveLength;
          this[LENGTH_CALCULATOR] = typeof lc !== 'function' ? naiveLength : lc;
          this[ALLOW_STALE] = options.stale || false;
          if (options.maxAge && typeof options.maxAge !== 'number') throw new TypeError('maxAge must be a number');
          this[MAX_AGE] = options.maxAge || 0;
          this[DISPOSE] = options.dispose;
          this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
          this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
          this.reset();
        }
        set max(mL) {
          if (typeof mL !== 'number' || mL < 0) throw new TypeError('max must be a non-negative number');
          this[MAX] = mL || Infinity;
          trim(this);
        }
        get max() {
          return this[MAX];
        }
        set allowStale(allowStale) {
          this[ALLOW_STALE] = !!allowStale;
        }
        get allowStale() {
          return this[ALLOW_STALE];
        }
        set maxAge(mA) {
          if (typeof mA !== 'number') throw new TypeError('maxAge must be a non-negative number');
          this[MAX_AGE] = mA;
          trim(this);
        }
        get maxAge() {
          return this[MAX_AGE];
        }
        set lengthCalculator(lC) {
          if (typeof lC !== 'function') lC = naiveLength;
          if (lC !== this[LENGTH_CALCULATOR]) {
            this[LENGTH_CALCULATOR] = lC;
            this[LENGTH] = 0;
            this[LRU_LIST].forEach(hit => {
              hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
              this[LENGTH] += hit.length;
            });
          }
          trim(this);
        }
        get lengthCalculator() {
          return this[LENGTH_CALCULATOR];
        }
        get length() {
          return this[LENGTH];
        }
        get itemCount() {
          return this[LRU_LIST].length;
        }
        rforEach(fn, thisp) {
          thisp = thisp || this;
          for (let walker = this[LRU_LIST].tail; walker !== null;) {
            const prev = walker.prev;
            forEachStep(this, fn, walker, thisp);
            walker = prev;
          }
        }
        forEach(fn, thisp) {
          thisp = thisp || this;
          for (let walker = this[LRU_LIST].head; walker !== null;) {
            const next = walker.next;
            forEachStep(this, fn, walker, thisp);
            walker = next;
          }
        }
        keys() {
          return this[LRU_LIST].toArray().map(k => k.key);
        }
        values() {
          return this[LRU_LIST].toArray().map(k => k.value);
        }
        reset() {
          if (this[DISPOSE] && this[LRU_LIST] && this[LRU_LIST].length) {
            this[LRU_LIST].forEach(hit => this[DISPOSE](hit.key, hit.value));
          }
          this[CACHE] = new Map();
          this[LRU_LIST] = new Yallist();
          this[LENGTH] = 0;
        }
        dump() {
          return this[LRU_LIST].map(hit => isStale(this, hit) ? false : {
            k: hit.key,
            v: hit.value,
            e: hit.now + (hit.maxAge || 0)
          }).toArray().filter(h => h);
        }
        dumpLru() {
          return this[LRU_LIST];
        }
        set(key, value, maxAge) {
          maxAge = maxAge || this[MAX_AGE];
          if (maxAge && typeof maxAge !== 'number') throw new TypeError('maxAge must be a number');
          const now = maxAge ? Date.now() : 0;
          const len = this[LENGTH_CALCULATOR](value, key);
          if (this[CACHE].has(key)) {
            if (len > this[MAX]) {
              del(this, this[CACHE].get(key));
              return false;
            }
            const node = this[CACHE].get(key);
            const item = node.value;
            if (this[DISPOSE]) {
              if (!this[NO_DISPOSE_ON_SET]) this[DISPOSE](key, item.value);
            }
            item.now = now;
            item.maxAge = maxAge;
            item.value = value;
            this[LENGTH] += len - item.length;
            item.length = len;
            this.get(key);
            trim(this);
            return true;
          }
          const hit = new Entry(key, value, len, now, maxAge);
          if (hit.length > this[MAX]) {
            if (this[DISPOSE]) this[DISPOSE](key, value);
            return false;
          }
          this[LENGTH] += hit.length;
          this[LRU_LIST].unshift(hit);
          this[CACHE].set(key, this[LRU_LIST].head);
          trim(this);
          return true;
        }
        has(key) {
          if (!this[CACHE].has(key)) return false;
          const hit = this[CACHE].get(key).value;
          return !isStale(this, hit);
        }
        get(key) {
          return get(this, key, true);
        }
        peek(key) {
          return get(this, key, false);
        }
        pop() {
          const node = this[LRU_LIST].tail;
          if (!node) return null;
          del(this, node);
          return node.value;
        }
        del(key) {
          del(this, this[CACHE].get(key));
        }
        load(arr) {
          this.reset();
          const now = Date.now();
          for (let l = arr.length - 1; l >= 0; l--) {
            const hit = arr[l];
            const expiresAt = hit.e || 0;
            if (expiresAt === 0) this.set(hit.k, hit.v);else {
              const maxAge = expiresAt - now;
              if (maxAge > 0) {
                this.set(hit.k, hit.v, maxAge);
              }
            }
          }
        }
        prune() {
          this[CACHE].forEach((value, key) => get(this, key, false));
        }
      }
      const get = (self, key, doUse) => {
        const node = self[CACHE].get(key);
        if (node) {
          const hit = node.value;
          if (isStale(self, hit)) {
            del(self, node);
            if (!self[ALLOW_STALE]) return undefined;
          } else {
            if (doUse) {
              if (self[UPDATE_AGE_ON_GET]) node.value.now = Date.now();
              self[LRU_LIST].unshiftNode(node);
            }
          }
          return hit.value;
        }
      };
      const isStale = (self, hit) => {
        if (!hit || !hit.maxAge && !self[MAX_AGE]) return false;
        const diff = Date.now() - hit.now;
        return hit.maxAge ? diff > hit.maxAge : self[MAX_AGE] && diff > self[MAX_AGE];
      };
      const trim = self => {
        if (self[LENGTH] > self[MAX]) {
          for (let walker = self[LRU_LIST].tail; self[LENGTH] > self[MAX] && walker !== null;) {
            const prev = walker.prev;
            del(self, walker);
            walker = prev;
          }
        }
      };
      const del = (self, node) => {
        if (node) {
          const hit = node.value;
          if (self[DISPOSE]) self[DISPOSE](hit.key, hit.value);
          self[LENGTH] -= hit.length;
          self[CACHE].delete(hit.key);
          self[LRU_LIST].removeNode(node);
        }
      };
      class Entry {
        constructor(key, value, length, now, maxAge) {
          this.key = key;
          this.value = value;
          this.length = length;
          this.now = now;
          this.maxAge = maxAge || 0;
        }
      }
      const forEachStep = (self, fn, node, thisp) => {
        let hit = node.value;
        if (isStale(self, hit)) {
          del(self, node);
          if (!self[ALLOW_STALE]) hit = undefined;
        }
        if (hit) fn.call(thisp, hit.value, hit.key, self);
      };
      module.exports = LRUCache;
    }, {
      "yallist": 98
    }],
    86: [function (require, module, exports) {
      const outside = require('./outside');
      const gtr = (version, range, options) => outside(version, range, '>', options);
      module.exports = gtr;
    }, {
      "./outside": 92
    }],
    87: [function (require, module, exports) {
      const Range = require('../classes/range');
      const intersects = (r1, r2, options) => {
        r1 = new Range(r1, options);
        r2 = new Range(r2, options);
        return r1.intersects(r2, options);
      };
      module.exports = intersects;
    }, {
      "../classes/range": 53
    }],
    88: [function (require, module, exports) {
      const outside = require('./outside');
      const ltr = (version, range, options) => outside(version, range, '<', options);
      module.exports = ltr;
    }, {
      "./outside": 92
    }],
    89: [function (require, module, exports) {
      const SemVer = require('../classes/semver');
      const Range = require('../classes/range');
      const maxSatisfying = (versions, range, options) => {
        let max = null;
        let maxSV = null;
        let rangeObj = null;
        try {
          rangeObj = new Range(range, options);
        } catch (er) {
          return null;
        }
        versions.forEach(v => {
          if (rangeObj.test(v)) {
            if (!max || maxSV.compare(v) === -1) {
              max = v;
              maxSV = new SemVer(max, options);
            }
          }
        });
        return max;
      };
      module.exports = maxSatisfying;
    }, {
      "../classes/range": 53,
      "../classes/semver": 54
    }],
    90: [function (require, module, exports) {
      const SemVer = require('../classes/semver');
      const Range = require('../classes/range');
      const minSatisfying = (versions, range, options) => {
        let min = null;
        let minSV = null;
        let rangeObj = null;
        try {
          rangeObj = new Range(range, options);
        } catch (er) {
          return null;
        }
        versions.forEach(v => {
          if (rangeObj.test(v)) {
            if (!min || minSV.compare(v) === 1) {
              min = v;
              minSV = new SemVer(min, options);
            }
          }
        });
        return min;
      };
      module.exports = minSatisfying;
    }, {
      "../classes/range": 53,
      "../classes/semver": 54
    }],
    91: [function (require, module, exports) {
      const SemVer = require('../classes/semver');
      const Range = require('../classes/range');
      const gt = require('../functions/gt');
      const minVersion = (range, loose) => {
        range = new Range(range, loose);
        let minver = new SemVer('0.0.0');
        if (range.test(minver)) {
          return minver;
        }
        minver = new SemVer('0.0.0-0');
        if (range.test(minver)) {
          return minver;
        }
        minver = null;
        for (let i = 0; i < range.set.length; ++i) {
          const comparators = range.set[i];
          let setMin = null;
          comparators.forEach(comparator => {
            const compver = new SemVer(comparator.semver.version);
            switch (comparator.operator) {
              case '>':
                if (compver.prerelease.length === 0) {
                  compver.patch++;
                } else {
                  compver.prerelease.push(0);
                }
                compver.raw = compver.format();
              case '':
              case '>=':
                if (!setMin || gt(compver, setMin)) {
                  setMin = compver;
                }
                break;
              case '<':
              case '<=':
                break;
              default:
                throw new Error(`Unexpected operation: ${comparator.operator}`);
            }
          });
          if (setMin && (!minver || gt(minver, setMin))) {
            minver = setMin;
          }
        }
        if (minver && range.test(minver)) {
          return minver;
        }
        return null;
      };
      module.exports = minVersion;
    }, {
      "../classes/range": 53,
      "../classes/semver": 54,
      "../functions/gt": 63
    }],
    92: [function (require, module, exports) {
      const SemVer = require('../classes/semver');
      const Comparator = require('../classes/comparator');
      const {
        ANY
      } = Comparator;
      const Range = require('../classes/range');
      const satisfies = require('../functions/satisfies');
      const gt = require('../functions/gt');
      const lt = require('../functions/lt');
      const lte = require('../functions/lte');
      const gte = require('../functions/gte');
      const outside = (version, range, hilo, options) => {
        version = new SemVer(version, options);
        range = new Range(range, options);
        let gtfn, ltefn, ltfn, comp, ecomp;
        switch (hilo) {
          case '>':
            gtfn = gt;
            ltefn = lte;
            ltfn = lt;
            comp = '>';
            ecomp = '>=';
            break;
          case '<':
            gtfn = lt;
            ltefn = gte;
            ltfn = gt;
            comp = '<';
            ecomp = '<=';
            break;
          default:
            throw new TypeError('Must provide a hilo val of "<" or ">"');
        }
        if (satisfies(version, range, options)) {
          return false;
        }
        for (let i = 0; i < range.set.length; ++i) {
          const comparators = range.set[i];
          let high = null;
          let low = null;
          comparators.forEach(comparator => {
            if (comparator.semver === ANY) {
              comparator = new Comparator('>=0.0.0');
            }
            high = high || comparator;
            low = low || comparator;
            if (gtfn(comparator.semver, high.semver, options)) {
              high = comparator;
            } else if (ltfn(comparator.semver, low.semver, options)) {
              low = comparator;
            }
          });
          if (high.operator === comp || high.operator === ecomp) {
            return false;
          }
          if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
            return false;
          } else if (low.operator === ecomp && ltfn(version, low.semver)) {
            return false;
          }
        }
        return true;
      };
      module.exports = outside;
    }, {
      "../classes/comparator": 52,
      "../classes/range": 53,
      "../classes/semver": 54,
      "../functions/gt": 63,
      "../functions/gte": 64,
      "../functions/lt": 66,
      "../functions/lte": 67,
      "../functions/satisfies": 76
    }],
    93: [function (require, module, exports) {
      const satisfies = require('../functions/satisfies.js');
      const compare = require('../functions/compare.js');
      module.exports = (versions, range, options) => {
        const set = [];
        let first = null;
        let prev = null;
        const v = versions.sort((a, b) => compare(a, b, options));
        for (const version of v) {
          const included = satisfies(version, range, options);
          if (included) {
            prev = version;
            if (!first) {
              first = version;
            }
          } else {
            if (prev) {
              set.push([first, prev]);
            }
            prev = null;
            first = null;
          }
        }
        if (first) {
          set.push([first, null]);
        }
        const ranges = [];
        for (const [min, max] of set) {
          if (min === max) {
            ranges.push(min);
          } else if (!max && min === v[0]) {
            ranges.push('*');
          } else if (!max) {
            ranges.push(`>=${min}`);
          } else if (min === v[0]) {
            ranges.push(`<=${max}`);
          } else {
            ranges.push(`${min} - ${max}`);
          }
        }
        const simplified = ranges.join(' || ');
        const original = typeof range.raw === 'string' ? range.raw : String(range);
        return simplified.length < original.length ? simplified : range;
      };
    }, {
      "../functions/compare.js": 60,
      "../functions/satisfies.js": 76
    }],
    94: [function (require, module, exports) {
      const Range = require('../classes/range.js');
      const Comparator = require('../classes/comparator.js');
      const {
        ANY
      } = Comparator;
      const satisfies = require('../functions/satisfies.js');
      const compare = require('../functions/compare.js');
      const subset = (sub, dom, options = {}) => {
        if (sub === dom) {
          return true;
        }
        sub = new Range(sub, options);
        dom = new Range(dom, options);
        let sawNonNull = false;
        OUTER: for (const simpleSub of sub.set) {
          for (const simpleDom of dom.set) {
            const isSub = simpleSubset(simpleSub, simpleDom, options);
            sawNonNull = sawNonNull || isSub !== null;
            if (isSub) {
              continue OUTER;
            }
          }
          if (sawNonNull) {
            return false;
          }
        }
        return true;
      };
      const minimumVersionWithPreRelease = [new Comparator('>=0.0.0-0')];
      const minimumVersion = [new Comparator('>=0.0.0')];
      const simpleSubset = (sub, dom, options) => {
        if (sub === dom) {
          return true;
        }
        if (sub.length === 1 && sub[0].semver === ANY) {
          if (dom.length === 1 && dom[0].semver === ANY) {
            return true;
          } else if (options.includePrerelease) {
            sub = minimumVersionWithPreRelease;
          } else {
            sub = minimumVersion;
          }
        }
        if (dom.length === 1 && dom[0].semver === ANY) {
          if (options.includePrerelease) {
            return true;
          } else {
            dom = minimumVersion;
          }
        }
        const eqSet = new Set();
        let gt, lt;
        for (const c of sub) {
          if (c.operator === '>' || c.operator === '>=') {
            gt = higherGT(gt, c, options);
          } else if (c.operator === '<' || c.operator === '<=') {
            lt = lowerLT(lt, c, options);
          } else {
            eqSet.add(c.semver);
          }
        }
        if (eqSet.size > 1) {
          return null;
        }
        let gtltComp;
        if (gt && lt) {
          gtltComp = compare(gt.semver, lt.semver, options);
          if (gtltComp > 0) {
            return null;
          } else if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<=')) {
            return null;
          }
        }
        for (const eq of eqSet) {
          if (gt && !satisfies(eq, String(gt), options)) {
            return null;
          }
          if (lt && !satisfies(eq, String(lt), options)) {
            return null;
          }
          for (const c of dom) {
            if (!satisfies(eq, String(c), options)) {
              return false;
            }
          }
          return true;
        }
        let higher, lower;
        let hasDomLT, hasDomGT;
        let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
        let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
        if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === '<' && needDomLTPre.prerelease[0] === 0) {
          needDomLTPre = false;
        }
        for (const c of dom) {
          hasDomGT = hasDomGT || c.operator === '>' || c.operator === '>=';
          hasDomLT = hasDomLT || c.operator === '<' || c.operator === '<=';
          if (gt) {
            if (needDomGTPre) {
              if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
                needDomGTPre = false;
              }
            }
            if (c.operator === '>' || c.operator === '>=') {
              higher = higherGT(gt, c, options);
              if (higher === c && higher !== gt) {
                return false;
              }
            } else if (gt.operator === '>=' && !satisfies(gt.semver, String(c), options)) {
              return false;
            }
          }
          if (lt) {
            if (needDomLTPre) {
              if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
                needDomLTPre = false;
              }
            }
            if (c.operator === '<' || c.operator === '<=') {
              lower = lowerLT(lt, c, options);
              if (lower === c && lower !== lt) {
                return false;
              }
            } else if (lt.operator === '<=' && !satisfies(lt.semver, String(c), options)) {
              return false;
            }
          }
          if (!c.operator && (lt || gt) && gtltComp !== 0) {
            return false;
          }
        }
        if (gt && hasDomLT && !lt && gtltComp !== 0) {
          return false;
        }
        if (lt && hasDomGT && !gt && gtltComp !== 0) {
          return false;
        }
        if (needDomGTPre || needDomLTPre) {
          return false;
        }
        return true;
      };
      const higherGT = (a, b, options) => {
        if (!a) {
          return b;
        }
        const comp = compare(a.semver, b.semver, options);
        return comp > 0 ? a : comp < 0 ? b : b.operator === '>' && a.operator === '>=' ? b : a;
      };
      const lowerLT = (a, b, options) => {
        if (!a) {
          return b;
        }
        const comp = compare(a.semver, b.semver, options);
        return comp < 0 ? a : comp > 0 ? b : b.operator === '<' && a.operator === '<=' ? b : a;
      };
      module.exports = subset;
    }, {
      "../classes/comparator.js": 52,
      "../classes/range.js": 53,
      "../functions/compare.js": 60,
      "../functions/satisfies.js": 76
    }],
    95: [function (require, module, exports) {
      const Range = require('../classes/range');
      const toComparators = (range, options) => new Range(range, options).set.map(comp => comp.map(c => c.value).join(' ').trim().split(' '));
      module.exports = toComparators;
    }, {
      "../classes/range": 53
    }],
    96: [function (require, module, exports) {
      const Range = require('../classes/range');
      const validRange = (range, options) => {
        try {
          return new Range(range, options).range || '*';
        } catch (er) {
          return null;
        }
      };
      module.exports = validRange;
    }, {
      "../classes/range": 53
    }],
    97: [function (require, module, exports) {
      'use strict';

      module.exports = function (Yallist) {
        Yallist.prototype[Symbol.iterator] = function* () {
          for (let walker = this.head; walker; walker = walker.next) {
            yield walker.value;
          }
        };
      };
    }, {}],
    98: [function (require, module, exports) {
      'use strict';

      module.exports = Yallist;
      Yallist.Node = Node;
      Yallist.create = Yallist;
      function Yallist(list) {
        var self = this;
        if (!(self instanceof Yallist)) {
          self = new Yallist();
        }
        self.tail = null;
        self.head = null;
        self.length = 0;
        if (list && typeof list.forEach === 'function') {
          list.forEach(function (item) {
            self.push(item);
          });
        } else if (arguments.length > 0) {
          for (var i = 0, l = arguments.length; i < l; i++) {
            self.push(arguments[i]);
          }
        }
        return self;
      }
      Yallist.prototype.removeNode = function (node) {
        if (node.list !== this) {
          throw new Error('removing node which does not belong to this list');
        }
        var next = node.next;
        var prev = node.prev;
        if (next) {
          next.prev = prev;
        }
        if (prev) {
          prev.next = next;
        }
        if (node === this.head) {
          this.head = next;
        }
        if (node === this.tail) {
          this.tail = prev;
        }
        node.list.length--;
        node.next = null;
        node.prev = null;
        node.list = null;
        return next;
      };
      Yallist.prototype.unshiftNode = function (node) {
        if (node === this.head) {
          return;
        }
        if (node.list) {
          node.list.removeNode(node);
        }
        var head = this.head;
        node.list = this;
        node.next = head;
        if (head) {
          head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
          this.tail = node;
        }
        this.length++;
      };
      Yallist.prototype.pushNode = function (node) {
        if (node === this.tail) {
          return;
        }
        if (node.list) {
          node.list.removeNode(node);
        }
        var tail = this.tail;
        node.list = this;
        node.prev = tail;
        if (tail) {
          tail.next = node;
        }
        this.tail = node;
        if (!this.head) {
          this.head = node;
        }
        this.length++;
      };
      Yallist.prototype.push = function () {
        for (var i = 0, l = arguments.length; i < l; i++) {
          push(this, arguments[i]);
        }
        return this.length;
      };
      Yallist.prototype.unshift = function () {
        for (var i = 0, l = arguments.length; i < l; i++) {
          unshift(this, arguments[i]);
        }
        return this.length;
      };
      Yallist.prototype.pop = function () {
        if (!this.tail) {
          return undefined;
        }
        var res = this.tail.value;
        this.tail = this.tail.prev;
        if (this.tail) {
          this.tail.next = null;
        } else {
          this.head = null;
        }
        this.length--;
        return res;
      };
      Yallist.prototype.shift = function () {
        if (!this.head) {
          return undefined;
        }
        var res = this.head.value;
        this.head = this.head.next;
        if (this.head) {
          this.head.prev = null;
        } else {
          this.tail = null;
        }
        this.length--;
        return res;
      };
      Yallist.prototype.forEach = function (fn, thisp) {
        thisp = thisp || this;
        for (var walker = this.head, i = 0; walker !== null; i++) {
          fn.call(thisp, walker.value, i, this);
          walker = walker.next;
        }
      };
      Yallist.prototype.forEachReverse = function (fn, thisp) {
        thisp = thisp || this;
        for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
          fn.call(thisp, walker.value, i, this);
          walker = walker.prev;
        }
      };
      Yallist.prototype.get = function (n) {
        for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
          walker = walker.next;
        }
        if (i === n && walker !== null) {
          return walker.value;
        }
      };
      Yallist.prototype.getReverse = function (n) {
        for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
          walker = walker.prev;
        }
        if (i === n && walker !== null) {
          return walker.value;
        }
      };
      Yallist.prototype.map = function (fn, thisp) {
        thisp = thisp || this;
        var res = new Yallist();
        for (var walker = this.head; walker !== null;) {
          res.push(fn.call(thisp, walker.value, this));
          walker = walker.next;
        }
        return res;
      };
      Yallist.prototype.mapReverse = function (fn, thisp) {
        thisp = thisp || this;
        var res = new Yallist();
        for (var walker = this.tail; walker !== null;) {
          res.push(fn.call(thisp, walker.value, this));
          walker = walker.prev;
        }
        return res;
      };
      Yallist.prototype.reduce = function (fn, initial) {
        var acc;
        var walker = this.head;
        if (arguments.length > 1) {
          acc = initial;
        } else if (this.head) {
          walker = this.head.next;
          acc = this.head.value;
        } else {
          throw new TypeError('Reduce of empty list with no initial value');
        }
        for (var i = 0; walker !== null; i++) {
          acc = fn(acc, walker.value, i);
          walker = walker.next;
        }
        return acc;
      };
      Yallist.prototype.reduceReverse = function (fn, initial) {
        var acc;
        var walker = this.tail;
        if (arguments.length > 1) {
          acc = initial;
        } else if (this.tail) {
          walker = this.tail.prev;
          acc = this.tail.value;
        } else {
          throw new TypeError('Reduce of empty list with no initial value');
        }
        for (var i = this.length - 1; walker !== null; i--) {
          acc = fn(acc, walker.value, i);
          walker = walker.prev;
        }
        return acc;
      };
      Yallist.prototype.toArray = function () {
        var arr = new Array(this.length);
        for (var i = 0, walker = this.head; walker !== null; i++) {
          arr[i] = walker.value;
          walker = walker.next;
        }
        return arr;
      };
      Yallist.prototype.toArrayReverse = function () {
        var arr = new Array(this.length);
        for (var i = 0, walker = this.tail; walker !== null; i++) {
          arr[i] = walker.value;
          walker = walker.prev;
        }
        return arr;
      };
      Yallist.prototype.slice = function (from, to) {
        to = to || this.length;
        if (to < 0) {
          to += this.length;
        }
        from = from || 0;
        if (from < 0) {
          from += this.length;
        }
        var ret = new Yallist();
        if (to < from || to < 0) {
          return ret;
        }
        if (from < 0) {
          from = 0;
        }
        if (to > this.length) {
          to = this.length;
        }
        for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
          walker = walker.next;
        }
        for (; walker !== null && i < to; i++, walker = walker.next) {
          ret.push(walker.value);
        }
        return ret;
      };
      Yallist.prototype.sliceReverse = function (from, to) {
        to = to || this.length;
        if (to < 0) {
          to += this.length;
        }
        from = from || 0;
        if (from < 0) {
          from += this.length;
        }
        var ret = new Yallist();
        if (to < from || to < 0) {
          return ret;
        }
        if (from < 0) {
          from = 0;
        }
        if (to > this.length) {
          to = this.length;
        }
        for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
          walker = walker.prev;
        }
        for (; walker !== null && i > from; i--, walker = walker.prev) {
          ret.push(walker.value);
        }
        return ret;
      };
      Yallist.prototype.splice = function (start, deleteCount, ...nodes) {
        if (start > this.length) {
          start = this.length - 1;
        }
        if (start < 0) {
          start = this.length + start;
        }
        for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
          walker = walker.next;
        }
        var ret = [];
        for (var i = 0; walker && i < deleteCount; i++) {
          ret.push(walker.value);
          walker = this.removeNode(walker);
        }
        if (walker === null) {
          walker = this.tail;
        }
        if (walker !== this.head && walker !== this.tail) {
          walker = walker.prev;
        }
        for (var i = 0; i < nodes.length; i++) {
          walker = insert(this, walker, nodes[i]);
        }
        return ret;
      };
      Yallist.prototype.reverse = function () {
        var head = this.head;
        var tail = this.tail;
        for (var walker = head; walker !== null; walker = walker.prev) {
          var p = walker.prev;
          walker.prev = walker.next;
          walker.next = p;
        }
        this.head = tail;
        this.tail = head;
        return this;
      };
      function insert(self, node, value) {
        var inserted = node === self.head ? new Node(value, null, node, self) : new Node(value, node, node.next, self);
        if (inserted.next === null) {
          self.tail = inserted;
        }
        if (inserted.prev === null) {
          self.head = inserted;
        }
        self.length++;
        return inserted;
      }
      function push(self, item) {
        self.tail = new Node(item, self.tail, null, self);
        if (!self.head) {
          self.head = self.tail;
        }
        self.length++;
      }
      function unshift(self, item) {
        self.head = new Node(item, null, self.head, self);
        if (!self.tail) {
          self.tail = self.head;
        }
        self.length++;
      }
      function Node(value, prev, next, list) {
        if (!(this instanceof Node)) {
          return new Node(value, prev, next, list);
        }
        this.list = list;
        this.value = value;
        if (prev) {
          prev.next = this;
          this.prev = prev;
        } else {
          this.prev = null;
        }
        if (next) {
          next.prev = this;
          this.next = next;
        } else {
          this.next = null;
        }
      }
      try {
        require('./iterator.js')(Yallist);
      } catch (er) {}
    }, {
      "./iterator.js": 97
    }],
    99: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.onRpcRequest = void 0;
      var _snapsSdk = require("@metamask/snaps-sdk");
      const onRpcRequest = async ({
        request
      }) => {
        switch (request.method) {
          case 'hello':
            return 'Hello from Browserify!';
          default:
            {
              throw new _snapsSdk.MethodNotFoundError({
                method: request.method
              });
            }
        }
      };
      exports.onRpcRequest = onRpcRequest;
    }, {
      "@metamask/snaps-sdk": 100
    }],
    100: [function (require, module, exports) {
      "use strict";

      var __defProp = Object.defineProperty;
      var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
      var __getOwnPropNames = Object.getOwnPropertyNames;
      var __hasOwnProp = Object.prototype.hasOwnProperty;
      var __export = (target, all) => {
        for (var name in all) __defProp(target, name, {
          get: all[name],
          enumerable: true
        });
      };
      var __copyProps = (to, from, except, desc) => {
        if (from && typeof from === "object" || typeof from === "function") {
          for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
            get: () => from[key],
            enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
          });
        }
        return to;
      };
      var __toCommonJS = mod => __copyProps(__defProp({}, "__esModule", {
        value: true
      }), mod);
      var __accessCheck = (obj, member, msg) => {
        if (!member.has(obj)) throw TypeError("Cannot " + msg);
      };
      var __privateGet = (obj, member, getter) => {
        __accessCheck(obj, member, "read from private field");
        return getter ? getter.call(obj) : member.get(obj);
      };
      var __privateAdd = (obj, member, value) => {
        if (member.has(obj)) throw TypeError("Cannot add the same private member more than once");
        member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
      };
      var __privateSet = (obj, member, value, setter) => {
        __accessCheck(obj, member, "write to private field");
        setter ? setter.call(obj, value) : member.set(obj, value);
        return value;
      };
      var src_exports = {};
      __export(src_exports, {
        AddressStruct: () => AddressStruct,
        AuxiliaryFileEncoding: () => AuxiliaryFileEncoding,
        ButtonClickEventStruct: () => ButtonClickEventStruct,
        ButtonStruct: () => ButtonStruct,
        ButtonType: () => ButtonType,
        ButtonVariant: () => ButtonVariant,
        ChainDisconnectedError: () => ChainDisconnectedError,
        ComponentOrElementStruct: () => ComponentOrElementStruct,
        ComponentStruct: () => ComponentStruct,
        CopyableStruct: () => CopyableStruct,
        DialogType: () => DialogType,
        DisconnectedError: () => DisconnectedError,
        DividerStruct: () => DividerStruct,
        FileStruct: () => FileStruct,
        FileUploadEventStruct: () => FileUploadEventStruct,
        FormComponentStruct: () => FormComponentStruct,
        FormStateStruct: () => FormStateStruct,
        FormStruct: () => FormStruct,
        FormSubmitEventStruct: () => FormSubmitEventStruct,
        GenericEventStruct: () => GenericEventStruct,
        HeadingStruct: () => HeadingStruct,
        ImageStruct: () => ImageStruct,
        InputChangeEventStruct: () => InputChangeEventStruct,
        InputStruct: () => InputStruct,
        InputType: () => InputType,
        InterfaceContextStruct: () => InterfaceContextStruct,
        InterfaceStateStruct: () => InterfaceStateStruct,
        InternalError: () => InternalError,
        InvalidInputError: () => InvalidInputError,
        InvalidParamsError: () => InvalidParamsError,
        InvalidRequestError: () => InvalidRequestError,
        LimitExceededError: () => LimitExceededError,
        ManageStateOperation: () => ManageStateOperation,
        MethodNotFoundError: () => MethodNotFoundError,
        MethodNotSupportedError: () => MethodNotSupportedError,
        NodeType: () => NodeType,
        NotificationType: () => NotificationType,
        PanelStruct: () => PanelStruct,
        ParseError: () => ParseError,
        ResourceNotFoundError: () => ResourceNotFoundError,
        ResourceUnavailableError: () => ResourceUnavailableError,
        RowStruct: () => RowStruct,
        RowVariant: () => RowVariant,
        SNAP_ERROR_CODE: () => SNAP_ERROR_CODE,
        SNAP_ERROR_MESSAGE: () => SNAP_ERROR_MESSAGE,
        SeverityLevel: () => SeverityLevel,
        SnapError: () => SnapError,
        SpinnerStruct: () => SpinnerStruct,
        StateStruct: () => StateStruct,
        TextStruct: () => TextStruct,
        TransactionRejected: () => TransactionRejected,
        UnauthorizedError: () => UnauthorizedError,
        UnsupportedMethodError: () => UnsupportedMethodError,
        UserInputEventStruct: () => UserInputEventStruct,
        UserInputEventType: () => UserInputEventType,
        UserRejectedRequestError: () => UserRejectedRequestError,
        address: () => address,
        assert: () => import_utils9.assert,
        assertIsComponent: () => assertIsComponent,
        button: () => button,
        copyable: () => copyable,
        divider: () => divider,
        enumValue: () => enumValue,
        form: () => form,
        getErrorData: () => getErrorData,
        getErrorMessage: () => getErrorMessage,
        getErrorStack: () => getErrorStack,
        getImageComponent: () => getImageComponent,
        getImageData: () => getImageData,
        heading: () => heading,
        image: () => image,
        input: () => input,
        isComponent: () => isComponent,
        literal: () => literal,
        panel: () => panel,
        row: () => row,
        spinner: () => spinner,
        text: () => text,
        union: () => union
      });
      module.exports = __toCommonJS(src_exports);
      var _code, _message, _data, _stack;
      var SnapError = class extends Error {
        constructor(error, data = {}) {
          const message = getErrorMessage(error);
          super(message);
          __privateAdd(this, _code, void 0);
          __privateAdd(this, _message, void 0);
          __privateAdd(this, _data, void 0);
          __privateAdd(this, _stack, void 0);
          __privateSet(this, _message, message);
          __privateSet(this, _code, getErrorCode(error));
          const mergedData = {
            ...getErrorData(error),
            ...data
          };
          if (Object.keys(mergedData).length > 0) {
            __privateSet(this, _data, mergedData);
          }
          __privateSet(this, _stack, super.stack);
        }
        get name() {
          return "SnapError";
        }
        get code() {
          return __privateGet(this, _code);
        }
        get message() {
          return __privateGet(this, _message);
        }
        get data() {
          return __privateGet(this, _data);
        }
        get stack() {
          return __privateGet(this, _stack);
        }
        toJSON() {
          return {
            code: SNAP_ERROR_CODE,
            message: SNAP_ERROR_MESSAGE,
            data: {
              cause: {
                code: this.code,
                message: this.message,
                stack: this.stack,
                ...(this.data ? {
                  data: this.data
                } : {})
              }
            }
          };
        }
        serialize() {
          return this.toJSON();
        }
      };
      _code = new WeakMap();
      _message = new WeakMap();
      _data = new WeakMap();
      _stack = new WeakMap();
      function createSnapError(fn) {
        return class SnapJsonRpcError extends SnapError {
          constructor(message, data) {
            if (typeof message === "object") {
              const error2 = fn();
              super({
                code: error2.code,
                message: error2.message,
                data: message
              });
              return;
            }
            const error = fn(message);
            super({
              code: error.code,
              message: error.message,
              data
            });
          }
        };
      }
      var import_utils = require("@metamask/utils");
      var SNAP_ERROR_CODE = -31002;
      var SNAP_ERROR_MESSAGE = "Snap Error";
      function getErrorMessage(error) {
        if ((0, import_utils.isObject)(error) && (0, import_utils.hasProperty)(error, "message") && typeof error.message === "string") {
          return error.message;
        }
        return String(error);
      }
      function getErrorStack(error) {
        if ((0, import_utils.isObject)(error) && (0, import_utils.hasProperty)(error, "stack") && typeof error.stack === "string") {
          return error.stack;
        }
        return void 0;
      }
      function getErrorCode(error) {
        if ((0, import_utils.isObject)(error) && (0, import_utils.hasProperty)(error, "code") && typeof error.code === "number" && Number.isInteger(error.code)) {
          return error.code;
        }
        return -32603;
      }
      function getErrorData(error) {
        if ((0, import_utils.isObject)(error) && (0, import_utils.hasProperty)(error, "data") && typeof error.data === "object" && error.data !== null && (0, import_utils.isValidJson)(error.data) && !Array.isArray(error.data)) {
          return error.data;
        }
        return {};
      }
      var import_superstruct = require("@metamask/superstruct");
      var import_utils2 = require("@metamask/utils");
      function literal(value) {
        return (0, import_superstruct.define)(JSON.stringify(value), (0, import_superstruct.literal)(value).validator);
      }
      function union([head, ...tail]) {
        const struct = (0, import_superstruct.union)([head, ...tail]);
        return new import_superstruct.Struct({
          ...struct,
          schema: [head, ...tail]
        });
      }
      function enumValue(constant) {
        return literal(constant);
      }
      function typedUnion(structs) {
        return new import_superstruct.Struct({
          type: "union",
          schema: null,
          *entries(value, context) {
            if (!(0, import_utils2.isPlainObject)(value) || !(0, import_utils2.hasProperty)(value, "type")) {
              return;
            }
            const {
              type
            } = value;
            const struct = structs.find(({
              schema
            }) => (0, import_superstruct.is)(type, schema.type));
            if (!struct) {
              return;
            }
            for (const entry of struct.entries(value, context)) {
              yield entry;
            }
          },
          validator(value, context) {
            const types = structs.map(({
              schema
            }) => schema.type.type);
            if (!(0, import_utils2.isPlainObject)(value) || !(0, import_utils2.hasProperty)(value, "type") || typeof value.type !== "string") {
              return `Expected type to be one of: ${types.join(", ")}, but received: undefined`;
            }
            const {
              type
            } = value;
            const struct = structs.find(({
              schema
            }) => (0, import_superstruct.is)(type, schema.type));
            if (struct) {
              return struct.validator(value, context);
            }
            return `Expected type to be one of: ${types.join(", ")}, but received: "${type}"`;
          }
        });
      }
      function nullUnion(structs) {
        return union(structs);
      }
      var import_superstruct2 = require("@metamask/superstruct");
      function svg() {
        return (0, import_superstruct2.refine)((0, import_superstruct2.string)(), "SVG", value => {
          if (!value.includes("<svg")) {
            return "Value is not a valid SVG.";
          }
          return true;
        });
      }
      var import_utils9 = require("@metamask/utils");
      var import_rpc_errors = require("@metamask/rpc-errors");
      var InternalError = createSnapError(import_rpc_errors.rpcErrors.internal);
      var InvalidInputError = createSnapError(import_rpc_errors.rpcErrors.invalidInput);
      var InvalidParamsError = createSnapError(import_rpc_errors.rpcErrors.invalidParams);
      var InvalidRequestError = createSnapError(import_rpc_errors.rpcErrors.invalidRequest);
      var LimitExceededError = createSnapError(import_rpc_errors.rpcErrors.limitExceeded);
      var MethodNotFoundError = createSnapError(import_rpc_errors.rpcErrors.methodNotFound);
      var MethodNotSupportedError = createSnapError(import_rpc_errors.rpcErrors.methodNotSupported);
      var ParseError = createSnapError(import_rpc_errors.rpcErrors.parse);
      var ResourceNotFoundError = createSnapError(import_rpc_errors.rpcErrors.resourceNotFound);
      var ResourceUnavailableError = createSnapError(import_rpc_errors.rpcErrors.resourceUnavailable);
      var TransactionRejected = createSnapError(import_rpc_errors.rpcErrors.transactionRejected);
      var ChainDisconnectedError = createSnapError(import_rpc_errors.providerErrors.chainDisconnected);
      var DisconnectedError = createSnapError(import_rpc_errors.providerErrors.disconnected);
      var UnauthorizedError = createSnapError(import_rpc_errors.providerErrors.unauthorized);
      var UnsupportedMethodError = createSnapError(import_rpc_errors.providerErrors.unsupportedMethod);
      var UserRejectedRequestError = createSnapError(import_rpc_errors.providerErrors.userRejectedRequest);
      var import_utils6 = require("@metamask/utils");
      var import_superstruct4 = require("@metamask/superstruct");
      var import_utils4 = require("@metamask/utils");
      var import_utils3 = require("@metamask/utils");
      function createBuilder(type, struct, keys = []) {
        return (...args) => {
          if (args.length === 1 && (0, import_utils3.isPlainObject)(args[0])) {
            const node2 = {
              ...args[0],
              type
            };
            (0, import_utils3.assertStruct)(node2, struct, `Invalid ${type} component`);
            return node2;
          }
          const node = keys.reduce((partialNode, key, index) => {
            if (args[index] !== void 0) {
              return {
                ...partialNode,
                [key]: args[index]
              };
            }
            return partialNode;
          }, {
            type
          });
          (0, import_utils3.assertStruct)(node, struct, `Invalid ${type} component`);
          return node;
        };
      }
      var import_superstruct3 = require("@metamask/superstruct");
      var NodeType = (NodeType2 => {
        NodeType2["Copyable"] = "copyable";
        NodeType2["Divider"] = "divider";
        NodeType2["Heading"] = "heading";
        NodeType2["Panel"] = "panel";
        NodeType2["Spinner"] = "spinner";
        NodeType2["Text"] = "text";
        NodeType2["Image"] = "image";
        NodeType2["Row"] = "row";
        NodeType2["Address"] = "address";
        NodeType2["Button"] = "button";
        NodeType2["Input"] = "input";
        NodeType2["Form"] = "form";
        return NodeType2;
      })(NodeType || {});
      var NodeStruct = (0, import_superstruct3.object)({
        type: (0, import_superstruct3.string)()
      });
      var LiteralStruct = (0, import_superstruct3.assign)(NodeStruct, (0, import_superstruct3.object)({
        value: (0, import_superstruct3.unknown)()
      }));
      var AddressStruct = (0, import_superstruct4.assign)(LiteralStruct, (0, import_superstruct4.object)({
        type: (0, import_superstruct4.literal)("address"),
        value: import_utils4.HexChecksumAddressStruct
      }));
      var address = createBuilder("address", AddressStruct, ["value"]);
      var import_superstruct5 = require("@metamask/superstruct");
      var CopyableStruct = (0, import_superstruct5.assign)(LiteralStruct, (0, import_superstruct5.object)({
        type: (0, import_superstruct5.literal)("copyable"),
        value: (0, import_superstruct5.string)(),
        sensitive: (0, import_superstruct5.optional)((0, import_superstruct5.boolean)())
      }));
      var copyable = createBuilder("copyable", CopyableStruct, ["value", "sensitive"]);
      var import_superstruct6 = require("@metamask/superstruct");
      var DividerStruct = (0, import_superstruct6.assign)(NodeStruct, (0, import_superstruct6.object)({
        type: (0, import_superstruct6.literal)("divider")
      }));
      var divider = createBuilder("divider", DividerStruct);
      var import_superstruct7 = require("@metamask/superstruct");
      var HeadingStruct = (0, import_superstruct7.assign)(LiteralStruct, (0, import_superstruct7.object)({
        type: (0, import_superstruct7.literal)("heading"),
        value: (0, import_superstruct7.string)()
      }));
      var heading = createBuilder("heading", HeadingStruct, ["value"]);
      var import_superstruct8 = require("@metamask/superstruct");
      var ImageStruct = (0, import_superstruct8.assign)(NodeStruct, (0, import_superstruct8.object)({
        type: (0, import_superstruct8.literal)("image"),
        value: svg()
      }));
      var image = createBuilder("image", ImageStruct, ["value"]);
      var import_superstruct15 = require("@metamask/superstruct");
      var import_superstruct9 = require("@metamask/superstruct");
      var ButtonVariant = (ButtonVariant2 => {
        ButtonVariant2["Primary"] = "primary";
        ButtonVariant2["Secondary"] = "secondary";
        return ButtonVariant2;
      })(ButtonVariant || {});
      var ButtonType = (ButtonType2 => {
        ButtonType2["Button"] = "button";
        ButtonType2["Submit"] = "submit";
        return ButtonType2;
      })(ButtonType || {});
      var ButtonStruct = (0, import_superstruct9.assign)(LiteralStruct, (0, import_superstruct9.object)({
        type: (0, import_superstruct9.literal)("button"),
        value: (0, import_superstruct9.string)(),
        variant: (0, import_superstruct9.optional)((0, import_superstruct9.union)([enumValue("primary"), enumValue("secondary")])),
        buttonType: (0, import_superstruct9.optional)((0, import_superstruct9.union)([enumValue("button"), enumValue("submit")])),
        name: (0, import_superstruct9.optional)((0, import_superstruct9.string)())
      }));
      var button = createBuilder("button", ButtonStruct, ["value", "buttonType", "name", "variant"]);
      var import_superstruct11 = require("@metamask/superstruct");
      var import_superstruct10 = require("@metamask/superstruct");
      var InputType = (InputType2 => {
        InputType2["Text"] = "text";
        InputType2["Number"] = "number";
        InputType2["Password"] = "password";
        return InputType2;
      })(InputType || {});
      var InputStruct = (0, import_superstruct10.assign)(LiteralStruct, (0, import_superstruct10.object)({
        type: (0, import_superstruct10.literal)("input"),
        value: (0, import_superstruct10.optional)((0, import_superstruct10.string)()),
        name: (0, import_superstruct10.string)(),
        inputType: (0, import_superstruct10.optional)((0, import_superstruct10.union)([enumValue("text"), enumValue("password"), enumValue("number")])),
        placeholder: (0, import_superstruct10.optional)((0, import_superstruct10.string)()),
        label: (0, import_superstruct10.optional)((0, import_superstruct10.string)()),
        error: (0, import_superstruct10.optional)((0, import_superstruct10.string)())
      }));
      var input = createBuilder("input", InputStruct, ["name", "inputType", "placeholder", "value", "label"]);
      var FormComponentStruct = (0, import_superstruct11.union)([InputStruct, ButtonStruct]);
      var FormStruct = (0, import_superstruct11.assign)(NodeStruct, (0, import_superstruct11.object)({
        type: (0, import_superstruct11.literal)("form"),
        children: (0, import_superstruct11.array)(FormComponentStruct),
        name: (0, import_superstruct11.string)()
      }));
      var form = createBuilder("form", FormStruct, ["name", "children"]);
      var import_superstruct13 = require("@metamask/superstruct");
      var import_superstruct12 = require("@metamask/superstruct");
      var TextStruct = (0, import_superstruct12.assign)(LiteralStruct, (0, import_superstruct12.object)({
        type: (0, import_superstruct12.literal)("text"),
        value: (0, import_superstruct12.string)(),
        markdown: (0, import_superstruct12.optional)((0, import_superstruct12.boolean)())
      }));
      var text = createBuilder("text", TextStruct, ["value", "markdown"]);
      var RowVariant = (RowVariant2 => {
        RowVariant2["Default"] = "default";
        RowVariant2["Critical"] = "critical";
        RowVariant2["Warning"] = "warning";
        return RowVariant2;
      })(RowVariant || {});
      var RowComponentStruct = (0, import_superstruct13.union)([ImageStruct, TextStruct, AddressStruct]);
      var RowStruct = (0, import_superstruct13.assign)(LiteralStruct, (0, import_superstruct13.object)({
        type: (0, import_superstruct13.literal)("row"),
        variant: (0, import_superstruct13.optional)((0, import_superstruct13.union)([enumValue("default"), enumValue("critical"), enumValue("warning")])),
        label: (0, import_superstruct13.string)(),
        value: RowComponentStruct
      }));
      var row = createBuilder("row", RowStruct, ["label", "value", "variant"]);
      var import_superstruct14 = require("@metamask/superstruct");
      var SpinnerStruct = (0, import_superstruct14.assign)(NodeStruct, (0, import_superstruct14.object)({
        type: (0, import_superstruct14.literal)("spinner")
      }));
      var spinner = createBuilder("spinner", SpinnerStruct);
      var ParentStruct = (0, import_superstruct15.assign)(NodeStruct, (0, import_superstruct15.object)({
        children: (0, import_superstruct15.array)((0, import_superstruct15.lazy)(() => ComponentStruct))
      }));
      var PanelStruct = (0, import_superstruct15.assign)(ParentStruct, (0, import_superstruct15.object)({
        type: (0, import_superstruct15.literal)("panel")
      }));
      var panel = createBuilder("panel", PanelStruct, ["children"]);
      var ComponentStruct = typedUnion([CopyableStruct, DividerStruct, HeadingStruct, ImageStruct, PanelStruct, SpinnerStruct, TextStruct, RowStruct, AddressStruct, InputStruct, FormStruct, ButtonStruct]);
      var import_superstruct16 = require("@metamask/superstruct");
      var import_utils5 = require("@metamask/utils");
      function isComponent(value) {
        return (0, import_superstruct16.is)(value, ComponentStruct);
      }
      function assertIsComponent(value) {
        (0, import_utils5.assertStruct)(value, ComponentStruct, "Invalid component");
      }
      async function getRawImageData(url, options) {
        if (typeof fetch !== "function") {
          throw new Error(`Failed to fetch image data from "${url}": Using this function requires the "endowment:network-access" permission.`);
        }
        return fetch(url, options).then(async response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch image data from "${url}": ${response.status} ${response.statusText}`);
          }
          const blob = await response.blob();
          (0, import_utils6.assert)(blob.type === "image/jpeg" || blob.type === "image/png", "Expected image data to be a JPEG or PNG image.");
          return blob;
        });
      }
      async function getImageData(url, options) {
        const blob = await getRawImageData(url, options);
        const bytes = new Uint8Array(await blob.arrayBuffer());
        return `data:${blob.type};base64,${(0, import_utils6.bytesToBase64)(bytes)}`;
      }
      async function getImageComponent(url, {
        width,
        height = width,
        request
      }) {
        (0, import_utils6.assert)(typeof width === "number" && width > 0, "Expected width to be a number greater than 0.");
        (0, import_utils6.assert)(typeof height === "number" && height > 0, "Expected height to be a number greater than 0.");
        const imageData = await getImageData(url, request);
        const size = `width="${width}" height="${height}"`;
        return image(`<svg ${size.trim()} xmlns="http://www.w3.org/2000/svg"><image ${size.trim()} href="${imageData}" /></svg>`);
      }
      var SeverityLevel = (SeverityLevel2 => {
        SeverityLevel2["Critical"] = "critical";
        return SeverityLevel2;
      })(SeverityLevel || {});
      var import_superstruct17 = require("@metamask/superstruct");
      var UserInputEventType = (UserInputEventType2 => {
        UserInputEventType2["ButtonClickEvent"] = "ButtonClickEvent";
        UserInputEventType2["FormSubmitEvent"] = "FormSubmitEvent";
        UserInputEventType2["InputChangeEvent"] = "InputChangeEvent";
        UserInputEventType2["FileUploadEvent"] = "FileUploadEvent";
        return UserInputEventType2;
      })(UserInputEventType || {});
      var GenericEventStruct = (0, import_superstruct17.object)({
        type: (0, import_superstruct17.string)(),
        name: (0, import_superstruct17.optional)((0, import_superstruct17.string)())
      });
      var ButtonClickEventStruct = (0, import_superstruct17.assign)(GenericEventStruct, (0, import_superstruct17.object)({
        type: (0, import_superstruct17.literal)("ButtonClickEvent"),
        name: (0, import_superstruct17.optional)((0, import_superstruct17.string)())
      }));
      var FileStruct = (0, import_superstruct17.object)({
        name: (0, import_superstruct17.string)(),
        size: (0, import_superstruct17.number)(),
        contentType: (0, import_superstruct17.string)(),
        contents: (0, import_superstruct17.string)()
      });
      var FormSubmitEventStruct = (0, import_superstruct17.assign)(GenericEventStruct, (0, import_superstruct17.object)({
        type: (0, import_superstruct17.literal)("FormSubmitEvent"),
        value: (0, import_superstruct17.record)((0, import_superstruct17.string)(), (0, import_superstruct17.nullable)((0, import_superstruct17.union)([(0, import_superstruct17.string)(), FileStruct, (0, import_superstruct17.boolean)()]))),
        name: (0, import_superstruct17.string)()
      }));
      var InputChangeEventStruct = (0, import_superstruct17.assign)(GenericEventStruct, (0, import_superstruct17.object)({
        type: (0, import_superstruct17.literal)("InputChangeEvent"),
        name: (0, import_superstruct17.string)(),
        value: (0, import_superstruct17.union)([(0, import_superstruct17.string)(), (0, import_superstruct17.boolean)()])
      }));
      var FileUploadEventStruct = (0, import_superstruct17.assign)(GenericEventStruct, (0, import_superstruct17.object)({
        type: (0, import_superstruct17.literal)("FileUploadEvent"),
        name: (0, import_superstruct17.string)(),
        file: (0, import_superstruct17.nullable)(FileStruct)
      }));
      var UserInputEventStruct = (0, import_superstruct17.union)([ButtonClickEventStruct, FormSubmitEventStruct, InputChangeEventStruct, FileUploadEventStruct]);
      var DialogType = (DialogType2 => {
        DialogType2["Alert"] = "alert";
        DialogType2["Confirmation"] = "confirmation";
        DialogType2["Prompt"] = "prompt";
        return DialogType2;
      })(DialogType || {});
      var AuxiliaryFileEncoding = (AuxiliaryFileEncoding2 => {
        AuxiliaryFileEncoding2["Base64"] = "base64";
        AuxiliaryFileEncoding2["Hex"] = "hex";
        AuxiliaryFileEncoding2["Utf8"] = "utf8";
        return AuxiliaryFileEncoding2;
      })(AuxiliaryFileEncoding || {});
      var ManageStateOperation = (ManageStateOperation2 => {
        ManageStateOperation2["ClearState"] = "clear";
        ManageStateOperation2["GetState"] = "get";
        ManageStateOperation2["UpdateState"] = "update";
        return ManageStateOperation2;
      })(ManageStateOperation || {});
      var NotificationType = (NotificationType2 => {
        NotificationType2["InApp"] = "inApp";
        NotificationType2["Native"] = "native";
        return NotificationType2;
      })(NotificationType || {});
      var import_superstruct19 = require("@metamask/superstruct");
      var import_utils8 = require("@metamask/utils");
      var import_superstruct18 = require("@metamask/superstruct");
      var import_utils7 = require("@metamask/utils");
      var KeyStruct = nullUnion([(0, import_superstruct18.string)(), (0, import_superstruct18.number)()]);
      var StringElementStruct = children([(0, import_superstruct18.string)()]);
      var ElementStruct = (0, import_superstruct18.object)({
        type: (0, import_superstruct18.string)(),
        props: (0, import_superstruct18.record)((0, import_superstruct18.string)(), import_utils7.JsonStruct),
        key: (0, import_superstruct18.nullable)(KeyStruct)
      });
      function nestable(struct) {
        const nestableStruct = nullUnion([struct, (0, import_superstruct18.array)((0, import_superstruct18.lazy)(() => nestableStruct))]);
        return nestableStruct;
      }
      function children(structs) {
        return nestable((0, import_superstruct18.nullable)(nullUnion([...structs, (0, import_superstruct18.boolean)()])));
      }
      function element(name, props = {}) {
        return (0, import_superstruct18.object)({
          type: literal(name),
          props: (0, import_superstruct18.object)(props),
          key: (0, import_superstruct18.nullable)(KeyStruct)
        });
      }
      var ButtonStruct2 = element("Button", {
        children: StringElementStruct,
        name: (0, import_superstruct18.optional)((0, import_superstruct18.string)()),
        type: (0, import_superstruct18.optional)(nullUnion([literal("button"), literal("submit")])),
        variant: (0, import_superstruct18.optional)(nullUnion([literal("primary"), literal("destructive")])),
        disabled: (0, import_superstruct18.optional)((0, import_superstruct18.boolean)())
      });
      var CheckboxStruct = element("Checkbox", {
        name: (0, import_superstruct18.string)(),
        checked: (0, import_superstruct18.optional)((0, import_superstruct18.boolean)()),
        label: (0, import_superstruct18.optional)((0, import_superstruct18.string)()),
        variant: (0, import_superstruct18.optional)(nullUnion([literal("default"), literal("toggle")]))
      });
      var InputStruct2 = element("Input", {
        name: (0, import_superstruct18.string)(),
        type: (0, import_superstruct18.optional)(nullUnion([literal("text"), literal("password"), literal("number")])),
        value: (0, import_superstruct18.optional)((0, import_superstruct18.string)()),
        placeholder: (0, import_superstruct18.optional)((0, import_superstruct18.string)())
      });
      var OptionStruct = element("Option", {
        value: (0, import_superstruct18.string)(),
        children: (0, import_superstruct18.string)()
      });
      var DropdownStruct = element("Dropdown", {
        name: (0, import_superstruct18.string)(),
        value: (0, import_superstruct18.optional)((0, import_superstruct18.string)()),
        children: children([OptionStruct])
      });
      var FileInputStruct = element("FileInput", {
        name: (0, import_superstruct18.string)(),
        accept: nullUnion([(0, import_superstruct18.optional)((0, import_superstruct18.array)((0, import_superstruct18.string)()))]),
        compact: (0, import_superstruct18.optional)((0, import_superstruct18.boolean)())
      });
      var BUTTON_INPUT = [InputStruct2, ButtonStruct2];
      var FIELD_CHILDREN_ARRAY = [InputStruct2, DropdownStruct, FileInputStruct, CheckboxStruct];
      var FieldChildUnionStruct = nullUnion([...FIELD_CHILDREN_ARRAY, ...BUTTON_INPUT]);
      var FieldChildStruct = nullUnion([(0, import_superstruct18.tuple)(BUTTON_INPUT), ...FIELD_CHILDREN_ARRAY]);
      var FieldStruct = element("Field", {
        label: (0, import_superstruct18.optional)((0, import_superstruct18.string)()),
        error: (0, import_superstruct18.optional)((0, import_superstruct18.string)()),
        children: FieldChildStruct
      });
      var FormChildStruct = children([FieldStruct, (0, import_superstruct18.lazy)(() => BoxChildStruct)]);
      var FormStruct2 = element("Form", {
        children: FormChildStruct,
        name: (0, import_superstruct18.string)()
      });
      var BoldStruct = element("Bold", {
        children: children([(0, import_superstruct18.string)(), (0, import_superstruct18.lazy)(() => ItalicStruct)])
      });
      var ItalicStruct = element("Italic", {
        children: children([(0, import_superstruct18.string)(), (0, import_superstruct18.lazy)(() => BoldStruct)])
      });
      var FormattingStruct = nullUnion([BoldStruct, ItalicStruct]);
      var AddressStruct2 = element("Address", {
        address: import_utils7.HexChecksumAddressStruct
      });
      var BoxChildrenStruct = children([(0, import_superstruct18.lazy)(() => BoxChildStruct)]);
      var BoxStruct = element("Box", {
        children: BoxChildrenStruct,
        direction: (0, import_superstruct18.optional)(nullUnion([literal("horizontal"), literal("vertical")])),
        alignment: (0, import_superstruct18.optional)(nullUnion([literal("start"), literal("center"), literal("end"), literal("space-between"), literal("space-around")]))
      });
      var FooterChildStruct = nullUnion([(0, import_superstruct18.tuple)([ButtonStruct2, ButtonStruct2]), ButtonStruct2]);
      var FooterStruct = element("Footer", {
        children: FooterChildStruct
      });
      var ContainerChildStruct = nullUnion([(0, import_superstruct18.tuple)([BoxStruct, FooterStruct]), BoxStruct]);
      var ContainerStruct = element("Container", {
        children: ContainerChildStruct
      });
      var CopyableStruct2 = element("Copyable", {
        value: (0, import_superstruct18.string)(),
        sensitive: (0, import_superstruct18.optional)((0, import_superstruct18.boolean)())
      });
      var DividerStruct2 = element("Divider");
      var ValueStruct = element("Value", {
        value: (0, import_superstruct18.string)(),
        extra: (0, import_superstruct18.string)()
      });
      var CardStruct = element("Card", {
        image: (0, import_superstruct18.optional)((0, import_superstruct18.string)()),
        title: (0, import_superstruct18.string)(),
        description: (0, import_superstruct18.optional)((0, import_superstruct18.string)()),
        value: (0, import_superstruct18.string)(),
        extra: (0, import_superstruct18.optional)((0, import_superstruct18.string)())
      });
      var HeadingStruct2 = element("Heading", {
        children: StringElementStruct
      });
      var ImageStruct2 = element("Image", {
        src: svg(),
        alt: (0, import_superstruct18.optional)((0, import_superstruct18.string)())
      });
      var LinkStruct = element("Link", {
        href: (0, import_superstruct18.string)(),
        children: children([FormattingStruct, (0, import_superstruct18.string)()])
      });
      var TextStruct2 = element("Text", {
        children: children([(0, import_superstruct18.string)(), BoldStruct, ItalicStruct, LinkStruct]),
        alignment: (0, import_superstruct18.optional)(nullUnion([literal("start"), literal("center"), literal("end")]))
      });
      var TooltipChildStruct = nullUnion([TextStruct2, BoldStruct, ItalicStruct, LinkStruct, ImageStruct2, (0, import_superstruct18.boolean)()]);
      var TooltipContentStruct = nullUnion([TextStruct2, BoldStruct, ItalicStruct, LinkStruct, (0, import_superstruct18.string)()]);
      var TooltipStruct = element("Tooltip", {
        children: (0, import_superstruct18.nullable)(TooltipChildStruct),
        content: TooltipContentStruct
      });
      var RowStruct2 = element("Row", {
        label: (0, import_superstruct18.string)(),
        children: nullUnion([AddressStruct2, ImageStruct2, TextStruct2, ValueStruct]),
        variant: (0, import_superstruct18.optional)(nullUnion([literal("default"), literal("warning"), literal("critical")])),
        tooltip: (0, import_superstruct18.optional)((0, import_superstruct18.string)())
      });
      var SpinnerStruct2 = element("Spinner");
      var BoxChildStruct = typedUnion([AddressStruct2, BoldStruct, BoxStruct, ButtonStruct2, CopyableStruct2, DividerStruct2, DropdownStruct, FileInputStruct, FormStruct2, HeadingStruct2, InputStruct2, ImageStruct2, ItalicStruct, LinkStruct, RowStruct2, SpinnerStruct2, TextStruct2, TooltipStruct, CheckboxStruct, CardStruct]);
      var RootJSXElementStruct = nullUnion([BoxChildStruct, ContainerStruct]);
      var JSXElementStruct = typedUnion([ButtonStruct2, InputStruct2, FileInputStruct, FieldStruct, FormStruct2, BoldStruct, ItalicStruct, AddressStruct2, BoxStruct, CopyableStruct2, DividerStruct2, HeadingStruct2, ImageStruct2, LinkStruct, RowStruct2, SpinnerStruct2, TextStruct2, DropdownStruct, OptionStruct, ValueStruct, TooltipStruct, CheckboxStruct, FooterStruct, ContainerStruct, CardStruct]);
      var StateStruct = (0, import_superstruct19.union)([FileStruct, (0, import_superstruct19.string)(), (0, import_superstruct19.boolean)()]);
      var FormStateStruct = (0, import_superstruct19.record)((0, import_superstruct19.string)(), (0, import_superstruct19.nullable)(StateStruct));
      var InterfaceStateStruct = (0, import_superstruct19.record)((0, import_superstruct19.string)(), (0, import_superstruct19.union)([FormStateStruct, (0, import_superstruct19.nullable)(StateStruct)]));
      var ComponentOrElementStruct = (0, import_superstruct19.union)([ComponentStruct, RootJSXElementStruct]);
      var InterfaceContextStruct = (0, import_superstruct19.record)((0, import_superstruct19.string)(), import_utils8.JsonStruct);
    }, {
      "@metamask/rpc-errors": 5,
      "@metamask/superstruct": 7,
      "@metamask/utils": 24
    }]
  }, {}, [99])(99);
});