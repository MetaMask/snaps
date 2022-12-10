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
      const {
        JsonRpcError,
        EthJsonRpcError
      } = require('./src/classes');

      const {
        serializeError,
        getMessageFromCode
      } = require('./src/utils');

      const errors = require('./src/errors');

      const ERROR_CODES = require('./src/errorCodes.json');

      module.exports = {
        errors,
        JsonRpcError,
        EthJsonRpcError,
        serializeError,
        getMessageFromCode,
        ERROR_CODES
      };
    }, {
      "./src/classes": 2,
      "./src/errorCodes.json": 3,
      "./src/errors": 5,
      "./src/utils": 6
    }],
    2: [function (require, module, exports) {
      const safeStringify = require('fast-safe-stringify');

      class JsonRpcError extends Error {
        constructor(code, message, data) {
          if (!Number.isInteger(code)) throw new Error('"code" must be an integer.');
          if (!message || typeof message !== 'string') throw new Error('"message" must be a nonempty string.');
          super(message);
          this.code = code;
          if (data !== undefined) this.data = data;
        }

        serialize() {
          const serialized = {
            code: this.code,
            message: this.message
          };
          if (this.data !== undefined) serialized.data = this.data;
          if (this.stack) serialized.stack = this.stack;
          return serialized;
        }

        toString() {
          return safeStringify(this.serialize(), stringifyReplacer, 2);
        }

      }

      class EthJsonRpcError extends JsonRpcError {
        constructor(code, message, data) {
          if (!isValidEthCode(code)) {
            throw new Error('"code" must be an integer such that: 1000 <= code <= 4999');
          }

          super(code, message, data);
        }

      }

      function isValidEthCode(code) {
        return Number.isInteger(code) && code >= 1000 && code <= 4999;
      }

      function stringifyReplacer(_, value) {
        if (value === '[Circular]') {
          return;
        }

        return value;
      }

      module.exports = {
        JsonRpcError,
        EthJsonRpcError
      };
    }, {
      "fast-safe-stringify": 7
    }],
    3: [function (require, module, exports) {
      module.exports = {
        "jsonRpc": {
          "parse": -32700,
          "invalidRequest": -32600,
          "methodNotFound": -32601,
          "invalidParams": -32602,
          "internal": -32603
        },
        "eth": {
          "userRejectedRequest": 4001,
          "unauthorized": 4100,
          "unsupportedMethod": 4200
        }
      };
    }, {}],
    4: [function (require, module, exports) {
      module.exports = {
        "-32700": {
          "standard": "JSON RPC 2.0",
          "message": "Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text."
        },
        "-32600": {
          "standard": "JSON RPC 2.0",
          "message": "The JSON sent is not a valid Request object."
        },
        "-32601": {
          "standard": "JSON RPC 2.0",
          "message": "The method does not exist / is not available."
        },
        "-32602": {
          "standard": "JSON RPC 2.0",
          "message": "Invalid method parameter(s)."
        },
        "-32603": {
          "standard": "JSON RPC 2.0",
          "message": "Internal JSON-RPC error."
        },
        "4001": {
          "standard": "EIP 1193",
          "message": "User rejected the request."
        },
        "4100": {
          "standard": "EIP 1193",
          "message": "The requested account and/or method has not been authorized by the user."
        },
        "4200": {
          "standard": "EIP 1193",
          "message": "The requested method is not supported by this Ethereum provider."
        }
      };
    }, {}],
    5: [function (require, module, exports) {
      const {
        JsonRpcError,
        EthJsonRpcError
      } = require('./classes');

      const {
        getMessageFromCode
      } = require('./utils');

      const ERROR_CODES = require('./errorCodes.json');

      module.exports = {
        parse: (message, data) => getJsonRpcError(ERROR_CODES.jsonRpc.parse, message, data),
        invalidRequest: (message, data) => getJsonRpcError(ERROR_CODES.jsonRpc.invalidRequest, message, data),
        invalidParams: (message, data) => getJsonRpcError(ERROR_CODES.jsonRpc.invalidParams, message, data),
        methodNotFound: (message, data) => getJsonRpcError(ERROR_CODES.jsonRpc.methodNotFound, message, data),
        internal: (message, data) => getJsonRpcError(ERROR_CODES.jsonRpc.internal, message, data),
        server: (code, message, data) => {
          if (!Number.isInteger(code) || code > -32000 || code < -32099) {
            throw new Error('"code" must be an integer such that: -32099 <= code <= -32000');
          }

          return getJsonRpcError(code, message, data);
        },
        eth: {
          userRejectedRequest: (message, data) => {
            return getEthJsonRpcError(ERROR_CODES.eth.userRejectedRequest, message, data);
          },
          unauthorized: (message, data) => {
            return getEthJsonRpcError(ERROR_CODES.eth.unauthorized, message, data);
          },
          unsupportedMethod: (message, data) => {
            return getEthJsonRpcError(ERROR_CODES.eth.unsupportedMethod, message, data);
          },
          custom: (code, message, data) => {
            if (!message || typeof message !== 'string') throw new Error('"message" must be a nonempty string');
            return new EthJsonRpcError(code, message, data);
          }
        }
      };

      function getJsonRpcError(code, message, data) {
        return new JsonRpcError(code, message || getMessageFromCode(code), data);
      }

      function getEthJsonRpcError(code, message, data) {
        return new EthJsonRpcError(code, message || getMessageFromCode(code), data);
      }
    }, {
      "./classes": 2,
      "./errorCodes.json": 3,
      "./utils": 6
    }],
    6: [function (require, module, exports) {
      const errorValues = require('./errorValues.json');

      const FALLBACK_ERROR_CODE = require('./errorCodes.json').jsonRpc.internal;

      const {
        JsonRpcError
      } = require('./classes');

      const JSON_RPC_SERVER_ERROR_MESSAGE = 'Unspecified server error.';
      const FALLBACK_MESSAGE = 'Unspecified error message. This is  bug, please report it.';
      const FALLBACK_ERROR = {
        code: FALLBACK_ERROR_CODE,
        message: getMessageFromCode(FALLBACK_ERROR_CODE)
      };

      function getMessageFromCode(code, fallbackMessage = FALLBACK_MESSAGE) {
        if (Number.isInteger(code)) {
          const codeString = code.toString();
          if (errorValues[codeString]) return errorValues[codeString].message;
          if (isJsonRpcServerError(code)) return JSON_RPC_SERVER_ERROR_MESSAGE;
        }

        return fallbackMessage;
      }

      function isValidCode(code) {
        if (!Number.isInteger(code)) return false;
        const codeString = code.toString();
        if (errorValues[codeString]) return true;
        if (isJsonRpcServerError(code)) return true;
        return false;
      }

      function serializeError(error, fallbackError = FALLBACK_ERROR) {
        if (!fallbackError || !Number.isInteger(fallbackError.code) || typeof fallbackError.message !== 'string') {
          throw new Error('fallbackError must contain integer number code and string message.');
        }

        if (typeof error === 'object' && error instanceof JsonRpcError) {
          return error.serialize();
        }

        const serialized = {};

        if (error && isValidCode(error.code)) {
          serialized.code = error.code;

          if (error.message && typeof error.message === 'string') {
            serialized.message = error.message;
            if (error.hasOwnProperty('data')) serialized.data = error.data;
          } else {
            serialized.message = getMessageFromCode(serialized.code);
            serialized.data = {
              originalError: assignOriginalError(error)
            };
          }
        } else {
          serialized.code = fallbackError.code;
          serialized.message = error && error.message ? error.message : fallbackError.message;
          serialized.data = {
            originalError: assignOriginalError(error)
          };
        }

        if (error && error.stack) serialized.stack = error.stack;
        return serialized;
      }

      function isJsonRpcServerError(code) {
        return code >= -32099 && code <= -32000;
      }

      function assignOriginalError(error) {
        if (error && typeof error === 'object' && !Array.isArray(error)) {
          return Object.assign({}, error);
        }

        return error;
      }

      module.exports = {
        getMessageFromCode,
        isValidCode,
        serializeError,
        JSON_RPC_SERVER_ERROR_MESSAGE
      };
    }, {
      "./classes": 2,
      "./errorCodes.json": 3,
      "./errorValues.json": 4
    }],
    7: [function (require, module, exports) {
      module.exports = stringify;
      stringify.default = stringify;
      stringify.stable = deterministicStringify;
      stringify.stableStringify = deterministicStringify;
      var arr = [];
      var replacerStack = [];

      function stringify(obj, replacer, spacer) {
        decirc(obj, '', [], undefined);
        var res;

        if (replacerStack.length === 0) {
          res = JSON.stringify(obj, replacer, spacer);
        } else {
          res = JSON.stringify(obj, replaceGetterValues(replacer), spacer);
        }

        while (arr.length !== 0) {
          var part = arr.pop();

          if (part.length === 4) {
            Object.defineProperty(part[0], part[1], part[3]);
          } else {
            part[0][part[1]] = part[2];
          }
        }

        return res;
      }

      function decirc(val, k, stack, parent) {
        var i;

        if (typeof val === 'object' && val !== null) {
          for (i = 0; i < stack.length; i++) {
            if (stack[i] === val) {
              var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k);

              if (propertyDescriptor.get !== undefined) {
                if (propertyDescriptor.configurable) {
                  Object.defineProperty(parent, k, {
                    value: '[Circular]'
                  });
                  arr.push([parent, k, val, propertyDescriptor]);
                } else {
                  replacerStack.push([val, k]);
                }
              } else {
                parent[k] = '[Circular]';
                arr.push([parent, k, val]);
              }

              return;
            }
          }

          stack.push(val);

          if (Array.isArray(val)) {
            for (i = 0; i < val.length; i++) {
              decirc(val[i], i, stack, val);
            }
          } else {
            var keys = Object.keys(val);

            for (i = 0; i < keys.length; i++) {
              var key = keys[i];
              decirc(val[key], key, stack, val);
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

      function deterministicStringify(obj, replacer, spacer) {
        var tmp = deterministicDecirc(obj, '', [], undefined) || obj;
        var res;

        if (replacerStack.length === 0) {
          res = JSON.stringify(tmp, replacer, spacer);
        } else {
          res = JSON.stringify(tmp, replaceGetterValues(replacer), spacer);
        }

        while (arr.length !== 0) {
          var part = arr.pop();

          if (part.length === 4) {
            Object.defineProperty(part[0], part[1], part[3]);
          } else {
            part[0][part[1]] = part[2];
          }
        }

        return res;
      }

      function deterministicDecirc(val, k, stack, parent) {
        var i;

        if (typeof val === 'object' && val !== null) {
          for (i = 0; i < stack.length; i++) {
            if (stack[i] === val) {
              var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k);

              if (propertyDescriptor.get !== undefined) {
                if (propertyDescriptor.configurable) {
                  Object.defineProperty(parent, k, {
                    value: '[Circular]'
                  });
                  arr.push([parent, k, val, propertyDescriptor]);
                } else {
                  replacerStack.push([val, k]);
                }
              } else {
                parent[k] = '[Circular]';
                arr.push([parent, k, val]);
              }

              return;
            }
          }

          if (typeof val.toJSON === 'function') {
            return;
          }

          stack.push(val);

          if (Array.isArray(val)) {
            for (i = 0; i < val.length; i++) {
              deterministicDecirc(val[i], i, stack, val);
            }
          } else {
            var tmp = {};
            var keys = Object.keys(val).sort(compareFunction);

            for (i = 0; i < keys.length; i++) {
              var key = keys[i];
              deterministicDecirc(val[key], key, stack, val);
              tmp[key] = val[key];
            }

            if (parent !== undefined) {
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
        replacer = replacer !== undefined ? replacer : function (k, v) {
          return v;
        };
        return function (key, val) {
          if (replacerStack.length > 0) {
            for (var i = 0; i < replacerStack.length; i++) {
              var part = replacerStack[i];

              if (part[1] === key && part[0] === val) {
                val = '[Circular]';
                replacerStack.splice(i, 1);
                break;
              }
            }
          }

          return replacer.call(this, key, val);
        };
      }
    }, {}],
    8: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      Object.defineProperty(exports, "v1", {
        enumerable: true,
        get: function () {
          return _v.default;
        }
      });
      Object.defineProperty(exports, "v3", {
        enumerable: true,
        get: function () {
          return _v2.default;
        }
      });
      Object.defineProperty(exports, "v4", {
        enumerable: true,
        get: function () {
          return _v3.default;
        }
      });
      Object.defineProperty(exports, "v5", {
        enumerable: true,
        get: function () {
          return _v4.default;
        }
      });
      Object.defineProperty(exports, "NIL", {
        enumerable: true,
        get: function () {
          return _nil.default;
        }
      });
      Object.defineProperty(exports, "version", {
        enumerable: true,
        get: function () {
          return _version.default;
        }
      });
      Object.defineProperty(exports, "validate", {
        enumerable: true,
        get: function () {
          return _validate.default;
        }
      });
      Object.defineProperty(exports, "stringify", {
        enumerable: true,
        get: function () {
          return _stringify.default;
        }
      });
      Object.defineProperty(exports, "parse", {
        enumerable: true,
        get: function () {
          return _parse.default;
        }
      });

      var _v = _interopRequireDefault(require("./v1.js"));

      var _v2 = _interopRequireDefault(require("./v3.js"));

      var _v3 = _interopRequireDefault(require("./v4.js"));

      var _v4 = _interopRequireDefault(require("./v5.js"));

      var _nil = _interopRequireDefault(require("./nil.js"));

      var _version = _interopRequireDefault(require("./version.js"));

      var _validate = _interopRequireDefault(require("./validate.js"));

      var _stringify = _interopRequireDefault(require("./stringify.js"));

      var _parse = _interopRequireDefault(require("./parse.js"));

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }
    }, {
      "./nil.js": 10,
      "./parse.js": 11,
      "./stringify.js": 15,
      "./v1.js": 16,
      "./v3.js": 17,
      "./v4.js": 19,
      "./v5.js": 20,
      "./validate.js": 21,
      "./version.js": 22
    }],
    9: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;

      function md5(bytes) {
        if (typeof bytes === 'string') {
          const msg = unescape(encodeURIComponent(bytes));
          bytes = new Uint8Array(msg.length);

          for (let i = 0; i < msg.length; ++i) {
            bytes[i] = msg.charCodeAt(i);
          }
        }

        return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
      }

      function md5ToHexEncodedArray(input) {
        const output = [];
        const length32 = input.length * 32;
        const hexTab = '0123456789abcdef';

        for (let i = 0; i < length32; i += 8) {
          const x = input[i >> 5] >>> i % 32 & 0xff;
          const hex = parseInt(hexTab.charAt(x >>> 4 & 0x0f) + hexTab.charAt(x & 0x0f), 16);
          output.push(hex);
        }

        return output;
      }

      function getOutputLength(inputLength8) {
        return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
      }

      function wordsToMd5(x, len) {
        x[len >> 5] |= 0x80 << len % 32;
        x[getOutputLength(len) - 1] = len;
        let a = 1732584193;
        let b = -271733879;
        let c = -1732584194;
        let d = 271733878;

        for (let i = 0; i < x.length; i += 16) {
          const olda = a;
          const oldb = b;
          const oldc = c;
          const oldd = d;
          a = md5ff(a, b, c, d, x[i], 7, -680876936);
          d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
          c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
          b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
          a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
          d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
          c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
          b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
          a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
          d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
          c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
          b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
          a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
          d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
          c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
          b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
          a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
          d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
          c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
          b = md5gg(b, c, d, a, x[i], 20, -373897302);
          a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
          d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
          c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
          b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
          a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
          d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
          c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
          b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
          a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
          d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
          c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
          b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
          a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
          d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
          c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
          b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
          a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
          d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
          c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
          b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
          a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
          d = md5hh(d, a, b, c, x[i], 11, -358537222);
          c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
          b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
          a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
          d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
          c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
          b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
          a = md5ii(a, b, c, d, x[i], 6, -198630844);
          d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
          c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
          b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
          a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
          d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
          c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
          b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
          a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
          d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
          c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
          b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
          a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
          d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
          c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
          b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
          a = safeAdd(a, olda);
          b = safeAdd(b, oldb);
          c = safeAdd(c, oldc);
          d = safeAdd(d, oldd);
        }

        return [a, b, c, d];
      }

      function bytesToWords(input) {
        if (input.length === 0) {
          return [];
        }

        const length8 = input.length * 8;
        const output = new Uint32Array(getOutputLength(length8));

        for (let i = 0; i < length8; i += 8) {
          output[i >> 5] |= (input[i / 8] & 0xff) << i % 32;
        }

        return output;
      }

      function safeAdd(x, y) {
        const lsw = (x & 0xffff) + (y & 0xffff);
        const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return msw << 16 | lsw & 0xffff;
      }

      function bitRotateLeft(num, cnt) {
        return num << cnt | num >>> 32 - cnt;
      }

      function md5cmn(q, a, b, x, s, t) {
        return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
      }

      function md5ff(a, b, c, d, x, s, t) {
        return md5cmn(b & c | ~b & d, a, b, x, s, t);
      }

      function md5gg(a, b, c, d, x, s, t) {
        return md5cmn(b & d | c & ~d, a, b, x, s, t);
      }

      function md5hh(a, b, c, d, x, s, t) {
        return md5cmn(b ^ c ^ d, a, b, x, s, t);
      }

      function md5ii(a, b, c, d, x, s, t) {
        return md5cmn(c ^ (b | ~d), a, b, x, s, t);
      }

      var _default = md5;
      exports.default = _default;
    }, {}],
    10: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _default = '00000000-0000-0000-0000-000000000000';
      exports.default = _default;
    }, {}],
    11: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;

      var _validate = _interopRequireDefault(require("./validate.js"));

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }

      function parse(uuid) {
        if (!(0, _validate.default)(uuid)) {
          throw TypeError('Invalid UUID');
        }

        let v;
        const arr = new Uint8Array(16);
        arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
        arr[1] = v >>> 16 & 0xff;
        arr[2] = v >>> 8 & 0xff;
        arr[3] = v & 0xff;
        arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
        arr[5] = v & 0xff;
        arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
        arr[7] = v & 0xff;
        arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
        arr[9] = v & 0xff;
        arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000 & 0xff;
        arr[11] = v / 0x100000000 & 0xff;
        arr[12] = v >>> 24 & 0xff;
        arr[13] = v >>> 16 & 0xff;
        arr[14] = v >>> 8 & 0xff;
        arr[15] = v & 0xff;
        return arr;
      }

      var _default = parse;
      exports.default = _default;
    }, {
      "./validate.js": 21
    }],
    12: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
      exports.default = _default;
    }, {}],
    13: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = rng;
      let getRandomValues;
      const rnds8 = new Uint8Array(16);

      function rng() {
        if (!getRandomValues) {
          getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

          if (!getRandomValues) {
            throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
          }
        }

        return getRandomValues(rnds8);
      }
    }, {}],
    14: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;

      function f(s, x, y, z) {
        switch (s) {
          case 0:
            return x & y ^ ~x & z;

          case 1:
            return x ^ y ^ z;

          case 2:
            return x & y ^ x & z ^ y & z;

          case 3:
            return x ^ y ^ z;
        }
      }

      function ROTL(x, n) {
        return x << n | x >>> 32 - n;
      }

      function sha1(bytes) {
        const K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
        const H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];

        if (typeof bytes === 'string') {
          const msg = unescape(encodeURIComponent(bytes));
          bytes = [];

          for (let i = 0; i < msg.length; ++i) {
            bytes.push(msg.charCodeAt(i));
          }
        } else if (!Array.isArray(bytes)) {
          bytes = Array.prototype.slice.call(bytes);
        }

        bytes.push(0x80);
        const l = bytes.length / 4 + 2;
        const N = Math.ceil(l / 16);
        const M = new Array(N);

        for (let i = 0; i < N; ++i) {
          const arr = new Uint32Array(16);

          for (let j = 0; j < 16; ++j) {
            arr[j] = bytes[i * 64 + j * 4] << 24 | bytes[i * 64 + j * 4 + 1] << 16 | bytes[i * 64 + j * 4 + 2] << 8 | bytes[i * 64 + j * 4 + 3];
          }

          M[i] = arr;
        }

        M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
        M[N - 1][14] = Math.floor(M[N - 1][14]);
        M[N - 1][15] = (bytes.length - 1) * 8 & 0xffffffff;

        for (let i = 0; i < N; ++i) {
          const W = new Uint32Array(80);

          for (let t = 0; t < 16; ++t) {
            W[t] = M[i][t];
          }

          for (let t = 16; t < 80; ++t) {
            W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
          }

          let a = H[0];
          let b = H[1];
          let c = H[2];
          let d = H[3];
          let e = H[4];

          for (let t = 0; t < 80; ++t) {
            const s = Math.floor(t / 20);
            const T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[t] >>> 0;
            e = d;
            d = c;
            c = ROTL(b, 30) >>> 0;
            b = a;
            a = T;
          }

          H[0] = H[0] + a >>> 0;
          H[1] = H[1] + b >>> 0;
          H[2] = H[2] + c >>> 0;
          H[3] = H[3] + d >>> 0;
          H[4] = H[4] + e >>> 0;
        }

        return [H[0] >> 24 & 0xff, H[0] >> 16 & 0xff, H[0] >> 8 & 0xff, H[0] & 0xff, H[1] >> 24 & 0xff, H[1] >> 16 & 0xff, H[1] >> 8 & 0xff, H[1] & 0xff, H[2] >> 24 & 0xff, H[2] >> 16 & 0xff, H[2] >> 8 & 0xff, H[2] & 0xff, H[3] >> 24 & 0xff, H[3] >> 16 & 0xff, H[3] >> 8 & 0xff, H[3] & 0xff, H[4] >> 24 & 0xff, H[4] >> 16 & 0xff, H[4] >> 8 & 0xff, H[4] & 0xff];
      }

      var _default = sha1;
      exports.default = _default;
    }, {}],
    15: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;

      var _validate = _interopRequireDefault(require("./validate.js"));

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }

      const byteToHex = [];

      for (let i = 0; i < 256; ++i) {
        byteToHex.push((i + 0x100).toString(16).substr(1));
      }

      function stringify(arr, offset = 0) {
        const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();

        if (!(0, _validate.default)(uuid)) {
          throw TypeError('Stringified UUID is invalid');
        }

        return uuid;
      }

      var _default = stringify;
      exports.default = _default;
    }, {
      "./validate.js": 21
    }],
    16: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;

      var _rng = _interopRequireDefault(require("./rng.js"));

      var _stringify = _interopRequireDefault(require("./stringify.js"));

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }

      let _nodeId;

      let _clockseq;

      let _lastMSecs = 0;
      let _lastNSecs = 0;

      function v1(options, buf, offset) {
        let i = buf && offset || 0;
        const b = buf || new Array(16);
        options = options || {};
        let node = options.node || _nodeId;
        let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

        if (node == null || clockseq == null) {
          const seedBytes = options.random || (options.rng || _rng.default)();

          if (node == null) {
            node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
          }

          if (clockseq == null) {
            clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
          }
        }

        let msecs = options.msecs !== undefined ? options.msecs : Date.now();
        let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;
        const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000;

        if (dt < 0 && options.clockseq === undefined) {
          clockseq = clockseq + 1 & 0x3fff;
        }

        if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
          nsecs = 0;
        }

        if (nsecs >= 10000) {
          throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
        }

        _lastMSecs = msecs;
        _lastNSecs = nsecs;
        _clockseq = clockseq;
        msecs += 12219292800000;
        const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
        b[i++] = tl >>> 24 & 0xff;
        b[i++] = tl >>> 16 & 0xff;
        b[i++] = tl >>> 8 & 0xff;
        b[i++] = tl & 0xff;
        const tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
        b[i++] = tmh >>> 8 & 0xff;
        b[i++] = tmh & 0xff;
        b[i++] = tmh >>> 24 & 0xf | 0x10;
        b[i++] = tmh >>> 16 & 0xff;
        b[i++] = clockseq >>> 8 | 0x80;
        b[i++] = clockseq & 0xff;

        for (let n = 0; n < 6; ++n) {
          b[i + n] = node[n];
        }

        return buf || (0, _stringify.default)(b);
      }

      var _default = v1;
      exports.default = _default;
    }, {
      "./rng.js": 13,
      "./stringify.js": 15
    }],
    17: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;

      var _v = _interopRequireDefault(require("./v35.js"));

      var _md = _interopRequireDefault(require("./md5.js"));

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }

      const v3 = (0, _v.default)('v3', 0x30, _md.default);
      var _default = v3;
      exports.default = _default;
    }, {
      "./md5.js": 9,
      "./v35.js": 18
    }],
    18: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = _default;
      exports.URL = exports.DNS = void 0;

      var _stringify = _interopRequireDefault(require("./stringify.js"));

      var _parse = _interopRequireDefault(require("./parse.js"));

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }

      function stringToBytes(str) {
        str = unescape(encodeURIComponent(str));
        const bytes = [];

        for (let i = 0; i < str.length; ++i) {
          bytes.push(str.charCodeAt(i));
        }

        return bytes;
      }

      const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
      exports.DNS = DNS;
      const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
      exports.URL = URL;

      function _default(name, version, hashfunc) {
        function generateUUID(value, namespace, buf, offset) {
          if (typeof value === 'string') {
            value = stringToBytes(value);
          }

          if (typeof namespace === 'string') {
            namespace = (0, _parse.default)(namespace);
          }

          if (namespace.length !== 16) {
            throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
          }

          let bytes = new Uint8Array(16 + value.length);
          bytes.set(namespace);
          bytes.set(value, namespace.length);
          bytes = hashfunc(bytes);
          bytes[6] = bytes[6] & 0x0f | version;
          bytes[8] = bytes[8] & 0x3f | 0x80;

          if (buf) {
            offset = offset || 0;

            for (let i = 0; i < 16; ++i) {
              buf[offset + i] = bytes[i];
            }

            return buf;
          }

          return (0, _stringify.default)(bytes);
        }

        try {
          generateUUID.name = name;
        } catch (err) {}

        generateUUID.DNS = DNS;
        generateUUID.URL = URL;
        return generateUUID;
      }
    }, {
      "./parse.js": 11,
      "./stringify.js": 15
    }],
    19: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;

      var _rng = _interopRequireDefault(require("./rng.js"));

      var _stringify = _interopRequireDefault(require("./stringify.js"));

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }

      function v4(options, buf, offset) {
        options = options || {};

        const rnds = options.random || (options.rng || _rng.default)();

        rnds[6] = rnds[6] & 0x0f | 0x40;
        rnds[8] = rnds[8] & 0x3f | 0x80;

        if (buf) {
          offset = offset || 0;

          for (let i = 0; i < 16; ++i) {
            buf[offset + i] = rnds[i];
          }

          return buf;
        }

        return (0, _stringify.default)(rnds);
      }

      var _default = v4;
      exports.default = _default;
    }, {
      "./rng.js": 13,
      "./stringify.js": 15
    }],
    20: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;

      var _v = _interopRequireDefault(require("./v35.js"));

      var _sha = _interopRequireDefault(require("./sha1.js"));

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }

      const v5 = (0, _v.default)('v5', 0x50, _sha.default);
      var _default = v5;
      exports.default = _default;
    }, {
      "./sha1.js": 14,
      "./v35.js": 18
    }],
    21: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;

      var _regex = _interopRequireDefault(require("./regex.js"));

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }

      function validate(uuid) {
        return typeof uuid === 'string' && _regex.default.test(uuid);
      }

      var _default = validate;
      exports.default = _default;
    }, {
      "./regex.js": 12
    }],
    22: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;

      var _validate = _interopRequireDefault(require("./validate.js"));

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }

      function version(uuid) {
        if (!(0, _validate.default)(uuid)) {
          throw TypeError('Invalid UUID');
        }

        return parseInt(uuid.substr(14, 1), 16);
      }

      var _default = version;
      exports.default = _default;
    }, {
      "./validate.js": 21
    }],
    23: [function (require, module, exports) {
      "use strict";

      const {
        errors: rpcErrors
      } = require('eth-json-rpc-errors');

      const {
        IPFS
      } = require('./ipfs');

      const ipfs = new IPFS({
        host: 'ipfs.infura.io',
        protocol: 'https'
      });

      module.exports.onRpcRequest = async ({
        request
      }) => {
        switch (request.method) {
          case 'add':
            return await ipfs.add(request.params[0]);

          case 'cat':
            return await ipfs.cat(request.params[0]);

          default:
            throw rpcErrors.eth.methodNotFound(request);
        }
      };
    }, {
      "./ipfs": 24,
      "eth-json-rpc-errors": 1
    }],
    24: [function (require, module, exports) {
      "use strict";

      const {
        v4: uuidV4
      } = require('uuid');

      module.exports.IPFS = class IPFS {
        constructor(provider) {
          this.setProvider(provider);
        }

        setProvider(provider) {
          this.provider = Object.assign({
            host: '127.0.0.1',
            pinning: true,
            port: '5001',
            protocol: 'http',
            base: '/api/v0'
          }, provider || {});
          this.requestBase = `${this.provider.protocol}://${this.provider.host}:${this.provider.port}${this.provider.base}`;
        }

        async add(inputString) {
          const boundary = uuidV4();
          const body = `--${boundary}\r\nContent-Disposition: form-data; name="input"\r\nContent-Type: application/octet-stream\r\n\r\n${inputString}\r\n--${boundary}--`;
          return this.send(`${this.requestBase}/add?pin=${this.provider.pinning}`, {
            method: 'POST',
            body,
            headers: {
              'Content-Type': `multipart/form-data; boundary=${boundary}`
            }
          });
        }

        async cat(ipfsHash) {
          return this.send(`${this.requestBase}/cat?arg=${ipfsHash}`, {
            method: 'POST'
          });
        }

        async send(url, options) {
          const response = await fetch(url, options);

          if (!response.ok) {
            throw new Error(`IPFS api call failed, status ${response.status}: ${response.statusText}`);
          }

          return response.text();
        }

      };
    }, {
      "uuid": 8
    }]
  }, {}, [23])(23);
});