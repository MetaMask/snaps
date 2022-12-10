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
      exports.decodeSingle = exports.decode = exports.encodeSingle = exports.encode = void 0;

      const utils_1 = require("@metamask/utils");

      const packer_1 = require("./packer");

      const errors_1 = require("./errors");

      const encode = (types, values) => {
        try {
          return (0, packer_1.pack)(types, values);
        } catch (error) {
          if (error instanceof errors_1.ParserError) {
            throw new errors_1.ParserError(`Unable to encode value: ${error.message}`, error);
          }

          throw new errors_1.ParserError(`An unexpected error occurred: ${(0, errors_1.getErrorMessage)(error)}`, error);
        }
      };

      exports.encode = encode;

      const encodeSingle = (type, value) => {
        return (0, exports.encode)([type], [value]);
      };

      exports.encodeSingle = encodeSingle;

      const decode = (types, value) => {
        const bytes = (0, utils_1.createBytes)(value);

        try {
          return (0, packer_1.unpack)(types, bytes);
        } catch (error) {
          if (error instanceof errors_1.ParserError) {
            throw new errors_1.ParserError(`Unable to decode value: ${error.message}`, error);
          }

          throw new errors_1.ParserError(`An unexpected error occurred: ${(0, errors_1.getErrorMessage)(error)}`, error);
        }
      };

      exports.decode = decode;

      const decodeSingle = (type, value) => {
        const result = (0, exports.decode)([type], value);
        (0, utils_1.assert)(result.length === 1, new errors_1.ParserError('Decoded value array has unexpected length.'));
        return result[0];
      };

      exports.decodeSingle = decodeSingle;
    }, {
      "./errors": 2,
      "./packer": 5,
      "@metamask/utils": 26
    }],
    2: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.ParserError = exports.getErrorStack = exports.getErrorMessage = void 0;

      const utils_1 = require("@metamask/utils");

      const getErrorMessage = error => {
        if (typeof error === 'string') {
          return error;
        }

        if (error instanceof Error) {
          return error.message;
        }

        if ((0, utils_1.isObject)(error) && (0, utils_1.hasProperty)(error, 'message') && typeof error.message === 'string') {
          return error.message;
        }

        return 'Unknown error.';
      };

      exports.getErrorMessage = getErrorMessage;

      const getErrorStack = error => {
        if (error instanceof Error) {
          return error.stack;
        }

        return undefined;
      };

      exports.getErrorStack = getErrorStack;

      class ParserError extends Error {
        constructor(message, originalError) {
          super(message);
          this.name = 'ParserError';
          const originalStack = (0, exports.getErrorStack)(originalError);

          if (originalStack) {
            this.stack = originalStack;
          }
        }

      }

      exports.ParserError = ParserError;
    }, {
      "@metamask/utils": 26
    }],
    3: [function (require, module, exports) {
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

      __exportStar(require("./abi"), exports);

      __exportStar(require("./errors"), exports);

      __exportStar(require("./types"), exports);
    }, {
      "./abi": 1,
      "./errors": 2,
      "./types": 18
    }],
    4: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.iterate = void 0;

      const utils_1 = require("@metamask/utils");

      const iterate = function* (buffer, size = 32) {
        for (let pointer = 0; pointer < buffer.length; pointer += size) {
          const skip = length => {
            (0, utils_1.assert)(length >= 0, 'Cannot skip a negative number of bytes.');
            (0, utils_1.assert)(length % size === 0, 'Length must be a multiple of the size.');
            pointer += length;
          };

          const value = buffer.subarray(pointer);
          yield {
            skip,
            value
          };
        }

        return {
          skip: () => undefined,
          value: new Uint8Array()
        };
      };

      exports.iterate = iterate;
    }, {
      "@metamask/utils": 26
    }],
    5: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.unpack = exports.pack = exports.isDynamicParser = exports.getParser = void 0;

      const utils_1 = require("@metamask/utils");

      const iterator_1 = require("./iterator");

      const parsers_1 = require("./parsers");

      const utils_2 = require("./utils");

      const errors_1 = require("./errors");

      const getParser = type => {
        const parsers = {
          address: parsers_1.address,
          array: parsers_1.array,
          bool: parsers_1.bool,
          bytes: parsers_1.bytes,
          fixedBytes: parsers_1.fixedBytes,
          function: parsers_1.fn,
          number: parsers_1.number,
          string: parsers_1.string,
          tuple: parsers_1.tuple
        };
        const staticParser = parsers[type];

        if (staticParser) {
          return staticParser;
        }

        const parser = Object.values(parsers).find(value => value.isType(type));

        if (parser) {
          return parser;
        }

        throw new errors_1.ParserError(`The type "${type}" is not supported.`);
      };

      exports.getParser = getParser;

      const isDynamicParser = (parser, type) => {
        const {
          isDynamic
        } = parser;

        if (typeof isDynamic === 'function') {
          return isDynamic(type);
        }

        return isDynamic;
      };

      exports.isDynamicParser = isDynamicParser;

      const pack = (types, values, buffer = new Uint8Array()) => {
        (0, utils_1.assert)(types.length === values.length, new errors_1.ParserError(`The number of types (${types.length}) does not match the number of values (${values.length}).`));
        const {
          staticBuffer,
          dynamicBuffer,
          pointers
        } = types.reduce(({
          staticBuffer,
          dynamicBuffer,
          pointers
        }, type, index) => {
          const parser = (0, exports.getParser)(type);
          const value = values[index];

          if (!(0, exports.isDynamicParser)(parser, type)) {
            return {
              staticBuffer: parser.encode({
                buffer: staticBuffer,
                value,
                type
              }),
              dynamicBuffer,
              pointers
            };
          }

          const newStaticBuffer = (0, utils_1.concatBytes)([staticBuffer, new Uint8Array(32)]);
          const newDynamicBuffer = parser.encode({
            buffer: dynamicBuffer,
            value,
            type
          });
          return {
            staticBuffer: newStaticBuffer,
            dynamicBuffer: newDynamicBuffer,
            pointers: [...pointers, {
              position: staticBuffer.length,
              pointer: dynamicBuffer.length
            }]
          };
        }, {
          staticBuffer: new Uint8Array(),
          dynamicBuffer: new Uint8Array(),
          pointers: []
        });
        const dynamicStart = staticBuffer.length;
        const updatedBuffer = pointers.reduce((target, {
          pointer,
          position
        }) => {
          const offset = (0, utils_2.padStart)((0, utils_1.numberToBytes)(dynamicStart + pointer));
          return (0, utils_2.set)(target, offset, position);
        }, staticBuffer);
        return (0, utils_1.concatBytes)([buffer, updatedBuffer, dynamicBuffer]);
      };

      exports.pack = pack;

      const unpack = (types, buffer) => {
        const iterator = (0, iterator_1.iterate)(buffer);
        return types.map(type => {
          const {
            value: {
              value,
              skip
            },
            done
          } = iterator.next();
          (0, utils_1.assert)(!done, new errors_1.ParserError(`The encoded value is invalid for the provided types. Reached end of buffer while attempting to parse "${type}".`));
          const parser = (0, exports.getParser)(type);
          const isDynamic = (0, exports.isDynamicParser)(parser, type);

          if (isDynamic) {
            const pointer = (0, utils_1.bytesToNumber)(value.subarray(0, 32));
            const target = buffer.subarray(pointer);
            return parser.decode({
              type,
              value: target,
              skip
            });
          }

          return parser.decode({
            type,
            value,
            skip
          });
        });
      };

      exports.unpack = unpack;
    }, {
      "./errors": 2,
      "./iterator": 4,
      "./parsers": 12,
      "./utils": 20,
      "@metamask/utils": 26
    }],
    6: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.address = exports.getAddress = void 0;

      const utils_1 = require("@metamask/utils");

      const utils_2 = require("../utils");

      const errors_1 = require("../errors");

      const getAddress = value => {
        const bytesValue = (0, utils_1.createBytes)(value);
        (0, utils_1.assert)(bytesValue.length === 20, new errors_1.ParserError(`Invalid address value. Expected address to be 20 bytes long, but received ${bytesValue.length} bytes.`));
        return bytesValue;
      };

      exports.getAddress = getAddress;
      exports.address = {
        isDynamic: false,
        isType: type => type === 'address',

        getByteLength() {
          return 32;
        },

        encode({
          buffer,
          value
        }) {
          const addressBuffer = (0, utils_2.padStart)((0, exports.getAddress)(value));
          return (0, utils_1.concatBytes)([buffer, addressBuffer]);
        },

        decode({
          value
        }) {
          return (0, utils_1.add0x)((0, utils_1.bytesToHex)(value.slice(12, 32)));
        }

      };
    }, {
      "../errors": 2,
      "../utils": 20,
      "@metamask/utils": 26
    }],
    7: [function (require, module, exports) {
      "use strict";

      var __rest = this && this.__rest || function (s, e) {
        var t = {};

        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];

        if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
        }
        return t;
      };

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.array = exports.getTupleType = exports.getArrayType = exports.isArrayType = void 0;

      const utils_1 = require("@metamask/utils");

      const packer_1 = require("../packer");

      const utils_2 = require("../utils");

      const errors_1 = require("../errors");

      const tuple_1 = require("./tuple");

      const ARRAY_REGEX = /^(?<type>.*)\[(?<length>\d*?)\]$/u;

      const isArrayType = type => ARRAY_REGEX.test(type);

      exports.isArrayType = isArrayType;

      const getArrayType = type => {
        var _a;

        const match = type.match(ARRAY_REGEX);
        (0, utils_1.assert)((_a = match === null || match === void 0 ? void 0 : match.groups) === null || _a === void 0 ? void 0 : _a.type, new errors_1.ParserError(`Invalid array type. Expected an array type, but received "${type}".`));
        return [match.groups.type, match.groups.length ? parseInt(match.groups.length, 10) : undefined];
      };

      exports.getArrayType = getArrayType;

      const getTupleType = (innerType, length) => {
        return `(${new Array(length).fill(innerType).join(',')})`;
      };

      exports.getTupleType = getTupleType;
      exports.array = {
        isDynamic(type) {
          const [innerType, length] = (0, exports.getArrayType)(type);
          return length === undefined || (0, packer_1.isDynamicParser)((0, packer_1.getParser)(innerType), innerType);
        },

        isType(type) {
          return (0, exports.isArrayType)(type);
        },

        getByteLength(type) {
          (0, utils_1.assert)((0, exports.isArrayType)(type), new errors_1.ParserError(`Expected an array type, but received "${type}".`));
          const [innerType, length] = (0, exports.getArrayType)(type);

          if (!(0, packer_1.isDynamicParser)(this, type) && length !== undefined) {
            return tuple_1.tuple.getByteLength((0, exports.getTupleType)(innerType, length));
          }

          return 32;
        },

        encode({
          type,
          buffer,
          value
        }) {
          const [arrayType, fixedLength] = (0, exports.getArrayType)(type);

          if (fixedLength) {
            (0, utils_1.assert)(fixedLength === value.length, new errors_1.ParserError(`Array length does not match type length. Expected a length of ${fixedLength}, but received ${value.length}.`));
            return tuple_1.tuple.encode({
              type: (0, exports.getTupleType)(arrayType, fixedLength),
              buffer,
              value
            });
          }

          const arrayLength = (0, utils_2.padStart)((0, utils_1.numberToBytes)(value.length));
          return (0, packer_1.pack)(new Array(value.length).fill(arrayType), value, (0, utils_1.concatBytes)([buffer, arrayLength]));
        },

        decode(_a) {
          var {
            type,
            value
          } = _a,
              rest = __rest(_a, ["type", "value"]);

          const [arrayType, fixedLength] = (0, exports.getArrayType)(type);

          if (fixedLength) {
            const result = tuple_1.tuple.decode(Object.assign({
              type: (0, exports.getTupleType)(arrayType, fixedLength),
              value
            }, rest));
            (0, utils_1.assert)(result.length === fixedLength, new errors_1.ParserError(`Array length does not match type length. Expected a length of ${fixedLength}, but received ${result.length}.`));
            return result;
          }

          const arrayLength = (0, utils_1.bytesToNumber)(value.subarray(0, 32));
          return (0, packer_1.unpack)(new Array(arrayLength).fill(arrayType), value.subarray(32));
        }

      };
    }, {
      "../errors": 2,
      "../packer": 5,
      "../utils": 20,
      "./tuple": 16,
      "@metamask/utils": 26
    }],
    8: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.bool = exports.getBooleanValue = void 0;

      const superstruct_1 = require("superstruct");

      const errors_1 = require("../errors");

      const number_1 = require("./number");

      const BooleanCoercer = (0, superstruct_1.coerce)((0, superstruct_1.boolean)(), (0, superstruct_1.union)([(0, superstruct_1.literal)('true'), (0, superstruct_1.literal)('false')]), value => value === 'true');

      const getBooleanValue = value => {
        try {
          const booleanValue = (0, superstruct_1.create)(value, BooleanCoercer);

          if (booleanValue) {
            return BigInt(1);
          }

          return BigInt(0);
        } catch (_a) {
          throw new errors_1.ParserError(`Invalid boolean value. Expected a boolean literal, or the string "true" or "false", but received "${value}".`);
        }
      };

      exports.getBooleanValue = getBooleanValue;
      exports.bool = {
        isDynamic: false,
        isType: type => type === 'bool',

        getByteLength() {
          return 32;
        },

        encode({
          buffer,
          value
        }) {
          const booleanValue = (0, exports.getBooleanValue)(value);
          return number_1.number.encode({
            type: 'uint256',
            buffer,
            value: booleanValue
          });
        },

        decode(args) {
          return number_1.number.decode(Object.assign(Object.assign({}, args), {
            type: 'uint256'
          })) === BigInt(1);
        }

      };
    }, {
      "../errors": 2,
      "./number": 13,
      "superstruct": 39
    }],
    9: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.bytes = void 0;

      const utils_1 = require("@metamask/utils");

      const utils_2 = require("../utils");

      exports.bytes = {
        isDynamic: true,
        isType: type => type === 'bytes',

        getByteLength() {
          return 32;
        },

        encode({
          buffer,
          value
        }) {
          const bufferValue = (0, utils_1.createBytes)(value);
          const paddedSize = Math.ceil(bufferValue.byteLength / 32) * 32;
          return (0, utils_1.concatBytes)([buffer, (0, utils_2.padStart)((0, utils_1.numberToBytes)(bufferValue.byteLength)), (0, utils_2.padEnd)(bufferValue, paddedSize)]);
        },

        decode({
          value
        }) {
          const bytesValue = value.subarray(0, 32);
          const length = (0, utils_1.bytesToNumber)(bytesValue);
          return value.slice(32, 32 + length);
        }

      };
    }, {
      "../utils": 20,
      "@metamask/utils": 26
    }],
    10: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.fixedBytes = exports.getByteLength = void 0;

      const utils_1 = require("@metamask/utils");

      const utils_2 = require("../utils");

      const errors_1 = require("../errors");

      const BYTES_REGEX = /^bytes([0-9]{1,2})$/u;

      const getByteLength = type => {
        var _a;

        const bytes = (_a = type.match(BYTES_REGEX)) === null || _a === void 0 ? void 0 : _a[1];
        (0, utils_1.assert)(bytes, `Invalid byte length. Expected a number between 1 and 32, but received "${type}".`);
        const length = Number(bytes);
        (0, utils_1.assert)(length > 0 && length <= 32, new errors_1.ParserError(`Invalid byte length. Expected a number between 1 and 32, but received "${type}".`));
        return length;
      };

      exports.getByteLength = getByteLength;
      exports.fixedBytes = {
        isDynamic: false,

        isType(type) {
          return BYTES_REGEX.test(type);
        },

        getByteLength() {
          return 32;
        },

        encode({
          type,
          buffer,
          value
        }) {
          const length = (0, exports.getByteLength)(type);
          const bufferValue = (0, utils_1.createBytes)(value);
          (0, utils_1.assert)(bufferValue.length === length, new errors_1.ParserError(`Expected a value of length ${length}, but received a value of length ${bufferValue.length}.`));
          return (0, utils_1.concatBytes)([buffer, (0, utils_2.padEnd)(bufferValue)]);
        },

        decode({
          type,
          value
        }) {
          const length = (0, exports.getByteLength)(type);
          return value.slice(0, length);
        }

      };
    }, {
      "../errors": 2,
      "../utils": 20,
      "@metamask/utils": 26
    }],
    11: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.fn = exports.getFunction = void 0;

      const utils_1 = require("@metamask/utils");

      const superstruct_1 = require("superstruct");

      const errors_1 = require("../errors");

      const fixed_bytes_1 = require("./fixed-bytes");

      const FunctionStruct = (0, superstruct_1.coerce)((0, superstruct_1.object)({
        address: utils_1.StrictHexStruct,
        selector: utils_1.StrictHexStruct
      }), (0, superstruct_1.union)([utils_1.StrictHexStruct, (0, superstruct_1.instance)(Uint8Array)]), value => {
        const bytes = (0, utils_1.createBytes)(value);
        (0, utils_1.assert)(bytes.length === 24, new errors_1.ParserError(`Invalid Solidity function. Expected function to be 24 bytes long, but received ${bytes.length} bytes.`));
        return {
          address: (0, utils_1.bytesToHex)(bytes.subarray(0, 20)),
          selector: (0, utils_1.bytesToHex)(bytes.subarray(20, 24))
        };
      });

      const getFunction = input => {
        const value = (0, superstruct_1.create)(input, FunctionStruct);
        return (0, utils_1.concatBytes)([(0, utils_1.hexToBytes)(value.address), (0, utils_1.hexToBytes)(value.selector)]);
      };

      exports.getFunction = getFunction;
      exports.fn = {
        isDynamic: false,
        isType: type => type === 'function',

        getByteLength() {
          return 32;
        },

        encode({
          buffer,
          value
        }) {
          const fnValue = (0, exports.getFunction)(value);
          return fixed_bytes_1.fixedBytes.encode({
            type: 'bytes24',
            buffer,
            value: fnValue
          });
        },

        decode({
          value
        }) {
          return {
            address: (0, utils_1.bytesToHex)(value.slice(0, 20)),
            selector: (0, utils_1.bytesToHex)(value.slice(20, 24))
          };
        }

      };
    }, {
      "../errors": 2,
      "./fixed-bytes": 10,
      "@metamask/utils": 26,
      "superstruct": 39
    }],
    12: [function (require, module, exports) {
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

      __exportStar(require("./address"), exports);

      __exportStar(require("./array"), exports);

      __exportStar(require("./bool"), exports);

      __exportStar(require("./bytes"), exports);

      __exportStar(require("./fixed-bytes"), exports);

      __exportStar(require("./function"), exports);

      __exportStar(require("./number"), exports);

      __exportStar(require("./parser"), exports);

      __exportStar(require("./string"), exports);

      __exportStar(require("./tuple"), exports);
    }, {
      "./address": 6,
      "./array": 7,
      "./bool": 8,
      "./bytes": 9,
      "./fixed-bytes": 10,
      "./function": 11,
      "./number": 13,
      "./parser": 14,
      "./string": 15,
      "./tuple": 16
    }],
    13: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.number = exports.getBigInt = exports.isSigned = void 0;

      const utils_1 = require("@metamask/utils");

      const utils_2 = require("../utils");

      const errors_1 = require("../errors");

      const NUMBER_REGEX = /^u?int([0-9]*)?$/u;

      const isSigned = type => {
        return !type.startsWith('u');
      };

      exports.isSigned = isSigned;

      const getBigInt = value => {
        try {
          return (0, utils_1.createBigInt)(value);
        } catch (_a) {
          throw new errors_1.ParserError(`Invalid number. Expected a valid number value, but received "${value}".`);
        }
      };

      exports.getBigInt = getBigInt;
      exports.number = {
        isDynamic: false,

        isType(type) {
          return NUMBER_REGEX.test(type);
        },

        getByteLength() {
          return 32;
        },

        encode({
          type,
          buffer,
          value
        }) {
          const bigIntValue = (0, exports.getBigInt)(value);

          if ((0, exports.isSigned)(type)) {
            return (0, utils_1.concatBytes)([buffer, (0, utils_2.padStart)((0, utils_1.signedBigIntToBytes)(bigIntValue, 32))]);
          }

          return (0, utils_1.concatBytes)([buffer, (0, utils_2.padStart)((0, utils_1.bigIntToBytes)(bigIntValue))]);
        },

        decode({
          type,
          value
        }) {
          const buffer = value.slice(0, 32);

          if ((0, exports.isSigned)(type)) {
            return (0, utils_1.bytesToSignedBigInt)(buffer);
          }

          return (0, utils_1.bytesToBigInt)(buffer);
        }

      };
    }, {
      "../errors": 2,
      "../utils": 20,
      "@metamask/utils": 26
    }],
    14: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
    }, {}],
    15: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.string = void 0;

      const utils_1 = require("@metamask/utils");

      const bytes_1 = require("./bytes");

      exports.string = {
        isDynamic: true,
        isType: type => type === 'string',

        getByteLength() {
          return 32;
        },

        encode({
          buffer,
          value
        }) {
          return bytes_1.bytes.encode({
            type: 'bytes',
            buffer,
            value: (0, utils_1.stringToBytes)(value)
          });
        },

        decode(args) {
          return (0, utils_1.bytesToString)(bytes_1.bytes.decode(args));
        }

      };
    }, {
      "./bytes": 9,
      "@metamask/utils": 26
    }],
    16: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.tuple = exports.getTupleElements = void 0;

      const utils_1 = require("@metamask/utils");

      const packer_1 = require("../packer");

      const errors_1 = require("../errors");

      const TUPLE_REGEX = /^\((.+)\)$/u;

      const isTupleType = type => TUPLE_REGEX.test(type);

      const getTupleElements = type => {
        (0, utils_1.assert)(type[0] === '(' && type[type.length - 1] === ')', new errors_1.ParserError(`Invalid tuple type. Expected tuple type, but received "${type}".`));
        const elements = [];
        let current = '';
        let depth = 0;

        for (let i = 1; i < type.length - 1; i++) {
          const char = type[i];

          if (char === ',' && depth === 0) {
            elements.push(current.trim());
            current = '';
          } else {
            current += char;

            if (char === '(') {
              depth += 1;
            } else if (char === ')') {
              depth -= 1;
            }
          }
        }

        if (current.trim()) {
          elements.push(current.trim());
        }

        return elements;
      };

      exports.getTupleElements = getTupleElements;
      exports.tuple = {
        isDynamic(type) {
          const elements = (0, exports.getTupleElements)(type);
          return elements.some(element => {
            const parser = (0, packer_1.getParser)(element);
            return (0, packer_1.isDynamicParser)(parser, element);
          });
        },

        isType(type) {
          return isTupleType(type);
        },

        getByteLength(type) {
          if ((0, packer_1.isDynamicParser)(this, type)) {
            return 32;
          }

          const elements = (0, exports.getTupleElements)(type);
          return elements.reduce((total, element) => {
            return total + (0, packer_1.getParser)(element).getByteLength(element);
          }, 0);
        },

        encode({
          type,
          buffer,
          value
        }) {
          const elements = (0, exports.getTupleElements)(type);
          return (0, packer_1.pack)(elements, value, buffer);
        },

        decode({
          type,
          value,
          skip
        }) {
          const elements = (0, exports.getTupleElements)(type);
          const length = this.getByteLength(type) - 32;
          skip(length);
          return (0, packer_1.unpack)(elements, value);
        }

      };
    }, {
      "../errors": 2,
      "../packer": 5,
      "@metamask/utils": 26
    }],
    17: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
    }, {}],
    18: [function (require, module, exports) {
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

      __exportStar(require("./abi"), exports);
    }, {
      "./abi": 17
    }],
    19: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.padEnd = exports.padStart = exports.set = void 0;

      const utils_1 = require("@metamask/utils");

      const BUFFER_WIDTH = 32;

      const set = (target, buffer, position) => {
        return (0, utils_1.concatBytes)([target.subarray(0, position), buffer, target.subarray(position + buffer.length)]);
      };

      exports.set = set;

      const padStart = (buffer, length = BUFFER_WIDTH) => {
        const padding = new Uint8Array(Math.max(length - buffer.length, 0)).fill(0x00);
        return (0, utils_1.concatBytes)([padding, buffer]);
      };

      exports.padStart = padStart;

      const padEnd = (buffer, length = BUFFER_WIDTH) => {
        const padding = new Uint8Array(Math.max(length - buffer.length, 0)).fill(0x00);
        return (0, utils_1.concatBytes)([buffer, padding]);
      };

      exports.padEnd = padEnd;
    }, {
      "@metamask/utils": 26
    }],
    20: [function (require, module, exports) {
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

      __exportStar(require("./buffer"), exports);
    }, {
      "./buffer": 19
    }],
    21: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.assertExhaustive = exports.assertStruct = exports.assert = exports.AssertionError = void 0;

      const superstruct_1 = require("superstruct");

      function isErrorWithMessage(error) {
        return typeof error === 'object' && error !== null && 'message' in error;
      }

      function isConstructable(fn) {
        var _a, _b;

        return Boolean(typeof ((_b = (_a = fn === null || fn === void 0 ? void 0 : fn.prototype) === null || _a === void 0 ? void 0 : _a.constructor) === null || _b === void 0 ? void 0 : _b.name) === 'string');
      }

      function getErrorMessage(error) {
        const message = isErrorWithMessage(error) ? error.message : String(error);

        if (message.endsWith('.')) {
          return message.slice(0, -1);
        }

        return message;
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
          throw getError(ErrorWrapper, `${errorPrefix}: ${getErrorMessage(error)}.`);
        }
      }

      exports.assertStruct = assertStruct;

      function assertExhaustive(_object) {
        throw new Error('Invalid branch reached. Should be detected during compilation.');
      }

      exports.assertExhaustive = assertExhaustive;
    }, {
      "superstruct": 39
    }],
    22: [function (require, module, exports) {
      (function () {
        (function () {
          "use strict";

          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.createDataView = exports.concatBytes = exports.valueToBytes = exports.stringToBytes = exports.numberToBytes = exports.signedBigIntToBytes = exports.bigIntToBytes = exports.hexToBytes = exports.bytesToString = exports.bytesToNumber = exports.bytesToSignedBigInt = exports.bytesToBigInt = exports.bytesToHex = exports.assertIsBytes = exports.isBytes = void 0;

          const assert_1 = require("./assert");

          const hex_1 = require("./hex");

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
            const hex = new Array(bytes.length);

            for (let i = 0; i < bytes.length; i++) {
              hex[i] = lookupTable[bytes[i]];
            }

            return (0, hex_1.add0x)(hex.join(''));
          }

          exports.bytesToHex = bytesToHex;

          function bytesToBigInt(bytes) {
            assertIsBytes(bytes);
            const hex = bytesToHex(bytes);
            return BigInt(hex);
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

          function hexToBytes(value) {
            var _a;

            if (((_a = value === null || value === void 0 ? void 0 : value.toLowerCase) === null || _a === void 0 ? void 0 : _a.call(value)) === '0x') {
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
            const hex = value.toString(16);
            return hexToBytes(hex);
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
            const hex = value.toString(16);
            return hexToBytes(hex);
          }

          exports.numberToBytes = numberToBytes;

          function stringToBytes(value) {
            (0, assert_1.assert)(typeof value === 'string', 'Value must be a string.');
            return new TextEncoder().encode(value);
          }

          exports.stringToBytes = stringToBytes;

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
      "./assert": 21,
      "./hex": 25,
      "buffer": 33
    }],
    23: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.createHex = exports.createBytes = exports.createBigInt = exports.createNumber = void 0;

      const superstruct_1 = require("superstruct");

      const hex_1 = require("./hex");

      const assert_1 = require("./assert");

      const bytes_1 = require("./bytes");

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
            throw new Error(`Expected a number-like value, got "${error.value}".`);
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
            throw new Error(`Expected a bytes-like value, got "${error.value}".`);
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
            throw new Error(`Expected a bytes-like value, got "${error.value}".`);
          }

          throw error;
        }
      }

      exports.createHex = createHex;
    }, {
      "./assert": 21,
      "./bytes": 22,
      "./hex": 25,
      "superstruct": 39
    }],
    24: [function (require, module, exports) {
      "use strict";

      var __classPrivateFieldSet = this && this.__classPrivateFieldSet || function (receiver, state, value, kind, f) {
        if (kind === "m") throw new TypeError("Private method is not writable");
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
      };

      var __classPrivateFieldGet = this && this.__classPrivateFieldGet || function (receiver, state, kind, f) {
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
      };

      var _FrozenMap_map, _FrozenSet_set;

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.FrozenSet = exports.FrozenMap = void 0;

      class FrozenMap {
        constructor(entries) {
          _FrozenMap_map.set(this, void 0);

          __classPrivateFieldSet(this, _FrozenMap_map, new Map(entries), "f");

          Object.freeze(this);
        }

        get size() {
          return __classPrivateFieldGet(this, _FrozenMap_map, "f").size;
        }

        [(_FrozenMap_map = new WeakMap(), Symbol.iterator)]() {
          return __classPrivateFieldGet(this, _FrozenMap_map, "f")[Symbol.iterator]();
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
        constructor(values) {
          _FrozenSet_set.set(this, void 0);

          __classPrivateFieldSet(this, _FrozenSet_set, new Set(values), "f");

          Object.freeze(this);
        }

        get size() {
          return __classPrivateFieldGet(this, _FrozenSet_set, "f").size;
        }

        [(_FrozenSet_set = new WeakMap(), Symbol.iterator)]() {
          return __classPrivateFieldGet(this, _FrozenSet_set, "f")[Symbol.iterator]();
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
    25: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.remove0x = exports.add0x = exports.assertIsStrictHexString = exports.assertIsHexString = exports.isStrictHexString = exports.isHexString = exports.StrictHexStruct = exports.HexStruct = void 0;

      const superstruct_1 = require("superstruct");

      const assert_1 = require("./assert");

      exports.HexStruct = (0, superstruct_1.pattern)((0, superstruct_1.string)(), /^(?:0x)?[0-9a-f]+$/iu);
      exports.StrictHexStruct = (0, superstruct_1.pattern)((0, superstruct_1.string)(), /^0x[0-9a-f]+$/iu);

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

      function add0x(hex) {
        if (hex.startsWith('0x')) {
          return hex;
        }

        if (hex.startsWith('0X')) {
          return `0x${hex.substring(2)}`;
        }

        return `0x${hex}`;
      }

      exports.add0x = add0x;

      function remove0x(hex) {
        if (hex.startsWith('0x') || hex.startsWith('0X')) {
          return hex.substring(2);
        }

        return hex;
      }

      exports.remove0x = remove0x;
    }, {
      "./assert": 21,
      "superstruct": 39
    }],
    26: [function (require, module, exports) {
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

      __exportStar(require("./assert"), exports);

      __exportStar(require("./bytes"), exports);

      __exportStar(require("./coercers"), exports);

      __exportStar(require("./collections"), exports);

      __exportStar(require("./hex"), exports);

      __exportStar(require("./json"), exports);

      __exportStar(require("./logging"), exports);

      __exportStar(require("./misc"), exports);

      __exportStar(require("./number"), exports);

      __exportStar(require("./time"), exports);
    }, {
      "./assert": 21,
      "./bytes": 22,
      "./coercers": 23,
      "./collections": 24,
      "./hex": 25,
      "./json": 27,
      "./logging": 28,
      "./misc": 29,
      "./number": 30,
      "./time": 31
    }],
    27: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.validateJsonAndGetSize = exports.getJsonRpcIdValidator = exports.assertIsJsonRpcError = exports.isJsonRpcError = exports.assertIsJsonRpcFailure = exports.isJsonRpcFailure = exports.assertIsJsonRpcSuccess = exports.isJsonRpcSuccess = exports.assertIsJsonRpcResponse = exports.isJsonRpcResponse = exports.assertIsPendingJsonRpcResponse = exports.isPendingJsonRpcResponse = exports.JsonRpcResponseStruct = exports.JsonRpcFailureStruct = exports.JsonRpcSuccessStruct = exports.PendingJsonRpcResponseStruct = exports.assertIsJsonRpcRequest = exports.isJsonRpcRequest = exports.assertIsJsonRpcNotification = exports.isJsonRpcNotification = exports.JsonRpcNotificationStruct = exports.JsonRpcRequestStruct = exports.JsonRpcParamsStruct = exports.JsonRpcErrorStruct = exports.JsonRpcIdStruct = exports.JsonRpcVersionStruct = exports.jsonrpc2 = exports.isValidJson = exports.JsonStruct = void 0;

      const superstruct_1 = require("superstruct");

      const misc_1 = require("./misc");

      const assert_1 = require("./assert");

      exports.JsonStruct = (0, superstruct_1.define)('Json', value => {
        const [isValid] = validateJsonAndGetSize(value, true);
        return isValid;
      });

      function isValidJson(value) {
        return (0, superstruct_1.is)(value, exports.JsonStruct);
      }

      exports.isValidJson = isValidJson;
      exports.jsonrpc2 = '2.0';
      exports.JsonRpcVersionStruct = (0, superstruct_1.literal)(exports.jsonrpc2);
      exports.JsonRpcIdStruct = (0, superstruct_1.nullable)((0, superstruct_1.union)([(0, superstruct_1.number)(), (0, superstruct_1.string)()]));
      exports.JsonRpcErrorStruct = (0, superstruct_1.object)({
        code: (0, superstruct_1.integer)(),
        message: (0, superstruct_1.string)(),
        data: (0, superstruct_1.optional)(exports.JsonStruct),
        stack: (0, superstruct_1.optional)((0, superstruct_1.string)())
      });
      exports.JsonRpcParamsStruct = (0, superstruct_1.optional)((0, superstruct_1.union)([(0, superstruct_1.object)(), (0, superstruct_1.array)()]));
      exports.JsonRpcRequestStruct = (0, superstruct_1.object)({
        id: exports.JsonRpcIdStruct,
        jsonrpc: exports.JsonRpcVersionStruct,
        method: (0, superstruct_1.string)(),
        params: exports.JsonRpcParamsStruct
      });
      exports.JsonRpcNotificationStruct = (0, superstruct_1.omit)(exports.JsonRpcRequestStruct, ['id']);

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
      exports.JsonRpcSuccessStruct = (0, superstruct_1.object)({
        id: exports.JsonRpcIdStruct,
        jsonrpc: exports.JsonRpcVersionStruct,
        result: exports.JsonStruct
      });
      exports.JsonRpcFailureStruct = (0, superstruct_1.object)({
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
        } = Object.assign({
          permitEmptyString: true,
          permitFractions: false,
          permitNull: true
        }, options);

        const isValidJsonRpcId = id => {
          return Boolean(typeof id === 'number' && (permitFractions || Number.isInteger(id)) || typeof id === 'string' && (permitEmptyString || id.length > 0) || permitNull && id === null);
        };

        return isValidJsonRpcId;
      }

      exports.getJsonRpcIdValidator = getJsonRpcIdValidator;

      function validateJsonAndGetSize(jsObject, skipSizingProcess = false) {
        const seenObjects = new Set();

        function getJsonSerializableInfo(value, skipSizing) {
          if (value === undefined) {
            return [false, 0];
          } else if (value === null) {
            return [true, skipSizing ? 0 : misc_1.JsonSize.Null];
          }

          const typeOfValue = typeof value;

          try {
            if (typeOfValue === 'function') {
              return [false, 0];
            } else if (typeOfValue === 'string' || value instanceof String) {
              return [true, skipSizing ? 0 : (0, misc_1.calculateStringSize)(value) + misc_1.JsonSize.Quote * 2];
            } else if (typeOfValue === 'boolean' || value instanceof Boolean) {
              if (skipSizing) {
                return [true, 0];
              }

              return [true, value == true ? misc_1.JsonSize.True : misc_1.JsonSize.False];
            } else if (typeOfValue === 'number' || value instanceof Number) {
              if (skipSizing) {
                return [true, 0];
              }

              return [true, (0, misc_1.calculateNumberSize)(value)];
            } else if (value instanceof Date) {
              if (skipSizing) {
                return [true, 0];
              }

              return [true, isNaN(value.getDate()) ? misc_1.JsonSize.Null : misc_1.JsonSize.Date + misc_1.JsonSize.Quote * 2];
            }
          } catch (_) {
            return [false, 0];
          }

          if (!(0, misc_1.isPlainObject)(value) && !Array.isArray(value)) {
            return [false, 0];
          }

          if (seenObjects.has(value)) {
            return [false, 0];
          }

          seenObjects.add(value);

          try {
            return [true, Object.entries(value).reduce((sum, [key, nestedValue], idx, arr) => {
              let [valid, size] = getJsonSerializableInfo(nestedValue, skipSizing);

              if (!valid) {
                throw new Error('JSON validation did not pass. Validation process stopped.');
              }

              seenObjects.delete(value);

              if (skipSizing) {
                return 0;
              }

              const keySize = Array.isArray(value) ? 0 : key.length + misc_1.JsonSize.Comma + misc_1.JsonSize.Colon * 2;
              const separator = idx < arr.length - 1 ? misc_1.JsonSize.Comma : 0;
              return sum + keySize + size + separator;
            }, skipSizing ? 0 : misc_1.JsonSize.Wrapper * 2)];
          } catch (_) {
            return [false, 0];
          }
        }

        return getJsonSerializableInfo(jsObject, skipSizingProcess);
      }

      exports.validateJsonAndGetSize = validateJsonAndGetSize;
    }, {
      "./assert": 21,
      "./misc": 29,
      "superstruct": 39
    }],
    28: [function (require, module, exports) {
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
      "debug": 35
    }],
    29: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.calculateNumberSize = exports.calculateStringSize = exports.isASCII = exports.isPlainObject = exports.ESCAPE_CHARACTERS_REGEXP = exports.JsonSize = exports.hasProperty = exports.isObject = exports.isNullOrUndefined = exports.isNonEmptyArray = void 0;

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

      const hasProperty = (object, name) => Object.hasOwnProperty.call(object, name);

      exports.hasProperty = hasProperty;
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
        var _a;

        const size = value.split('').reduce((total, character) => {
          if (isASCII(character)) {
            return total + 1;
          }

          return total + 2;
        }, 0);
        return size + ((_a = value.match(exports.ESCAPE_CHARACTERS_REGEXP)) !== null && _a !== void 0 ? _a : []).length;
      }

      exports.calculateStringSize = calculateStringSize;

      function calculateNumberSize(value) {
        return value.toString().length;
      }

      exports.calculateNumberSize = calculateNumberSize;
    }, {}],
    30: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.hexToBigInt = exports.hexToNumber = exports.bigIntToHex = exports.numberToHex = void 0;

      const hex_1 = require("./hex");

      const assert_1 = require("./assert");

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
      "./assert": 21,
      "./hex": 25
    }],
    31: [function (require, module, exports) {
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
    32: [function (require, module, exports) {
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
    33: [function (require, module, exports) {
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
      "base64-js": 32,
      "buffer": 33,
      "ieee754": 37
    }],
    34: [function (require, module, exports) {
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
    35: [function (require, module, exports) {
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
      "./common": 36,
      "_process": 38
    }],
    36: [function (require, module, exports) {
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
      "ms": 34
    }],
    37: [function (require, module, exports) {
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
    38: [function (require, module, exports) {
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
    39: [function (require, module, exports) {
      'use strict';

      Object.defineProperty(exports, '__esModule', {
        value: true
      });

      class StructError extends TypeError {
        constructor(failure, failures) {
          let cached;
          const {
            message,
            ...rest
          } = failure;
          const {
            path
          } = failure;
          const msg = path.length === 0 ? message : `At path: ${path.join('.')} -- ${message}`;
          super(msg);
          this.value = void 0;
          this.key = void 0;
          this.type = void 0;
          this.refinement = void 0;
          this.path = void 0;
          this.branch = void 0;
          this.failures = void 0;
          Object.assign(this, rest);
          this.name = this.constructor.name;

          this.failures = () => {
            return cached ?? (cached = [failure, ...failures()]);
          };
        }

      }

      function isIterable(x) {
        return isObject(x) && typeof x[Symbol.iterator] === 'function';
      }

      function isObject(x) {
        return typeof x === 'object' && x != null;
      }

      function isPlainObject(x) {
        if (Object.prototype.toString.call(x) !== '[object Object]') {
          return false;
        }

        const prototype = Object.getPrototypeOf(x);
        return prototype === null || prototype === Object.prototype;
      }

      function print(value) {
        if (typeof value === 'symbol') {
          return value.toString();
        }

        return typeof value === 'string' ? JSON.stringify(value) : `${value}`;
      }

      function shiftIterator(input) {
        const {
          done,
          value
        } = input.next();
        return done ? undefined : value;
      }

      function toFailure(result, context, struct, value) {
        if (result === true) {
          return;
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

      function* toFailures(result, context, struct, value) {
        if (!isIterable(result)) {
          result = [result];
        }

        for (const r of result) {
          const failure = toFailure(r, context, struct, value);

          if (failure) {
            yield failure;
          }
        }
      }

      function* run(value, struct, options) {
        if (options === void 0) {
          options = {};
        }

        const {
          path = [],
          branch = [value],
          coerce = false,
          mask = false
        } = options;
        const ctx = {
          path,
          branch
        };

        if (coerce) {
          value = struct.coercer(value, ctx);

          if (mask && struct.type !== 'type' && isObject(struct.schema) && isObject(value) && !Array.isArray(value)) {
            for (const key in value) {
              if (struct.schema[key] === undefined) {
                delete value[key];
              }
            }
          }
        }

        let status = 'valid';

        for (const failure of struct.validator(value, ctx)) {
          status = 'not_valid';
          yield [failure, undefined];
        }

        for (let [k, v, s] of struct.entries(value, ctx)) {
          const ts = run(v, s, {
            path: k === undefined ? path : [...path, k],
            branch: k === undefined ? branch : [...branch, v],
            coerce,
            mask
          });

          for (const t of ts) {
            if (t[0]) {
              status = t[0].refinement != null ? 'not_refined' : 'not_valid';
              yield [t[0], undefined];
            } else if (coerce) {
              v = t[1];

              if (k === undefined) {
                value = v;
              } else if (value instanceof Map) {
                value.set(k, v);
              } else if (value instanceof Set) {
                value.add(v);
              } else if (isObject(value)) {
                if (v !== undefined || k in value) value[k] = v;
              }
            }
          }
        }

        if (status !== 'not_valid') {
          for (const failure of struct.refiner(value, ctx)) {
            status = 'not_refined';
            yield [failure, undefined];
          }
        }

        if (status === 'valid') {
          yield [undefined, value];
        }
      }

      class Struct {
        constructor(props) {
          this.TYPE = void 0;
          this.type = void 0;
          this.schema = void 0;
          this.coercer = void 0;
          this.validator = void 0;
          this.refiner = void 0;
          this.entries = void 0;
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
              return toFailures(result, context, this, value);
            };
          } else {
            this.validator = () => [];
          }

          if (refiner) {
            this.refiner = (value, context) => {
              const result = refiner(value, context);
              return toFailures(result, context, this, value);
            };
          } else {
            this.refiner = () => [];
          }
        }

        assert(value) {
          return assert(value, this);
        }

        create(value) {
          return create(value, this);
        }

        is(value) {
          return is(value, this);
        }

        mask(value) {
          return mask(value, this);
        }

        validate(value, options) {
          if (options === void 0) {
            options = {};
          }

          return validate(value, this, options);
        }

      }

      function assert(value, struct) {
        const result = validate(value, struct);

        if (result[0]) {
          throw result[0];
        }
      }

      function create(value, struct) {
        const result = validate(value, struct, {
          coerce: true
        });

        if (result[0]) {
          throw result[0];
        } else {
          return result[1];
        }
      }

      function mask(value, struct) {
        const result = validate(value, struct, {
          coerce: true,
          mask: true
        });

        if (result[0]) {
          throw result[0];
        } else {
          return result[1];
        }
      }

      function is(value, struct) {
        const result = validate(value, struct);
        return !result[0];
      }

      function validate(value, struct, options) {
        if (options === void 0) {
          options = {};
        }

        const tuples = run(value, struct, options);
        const tuple = shiftIterator(tuples);

        if (tuple[0]) {
          const error = new StructError(tuple[0], function* () {
            for (const t of tuples) {
              if (t[0]) {
                yield t[0];
              }
            }
          });
          return [error, undefined];
        } else {
          const v = tuple[1];
          return [undefined, v];
        }
      }

      function assign() {
        for (var _len = arguments.length, Structs = new Array(_len), _key = 0; _key < _len; _key++) {
          Structs[_key] = arguments[_key];
        }

        const isType = Structs[0].type === 'type';
        const schemas = Structs.map(s => s.schema);
        const schema = Object.assign({}, ...schemas);
        return isType ? type(schema) : object(schema);
      }

      function define(name, validator) {
        return new Struct({
          type: name,
          schema: null,
          validator
        });
      }

      function deprecated(struct, log) {
        return new Struct({ ...struct,
          refiner: (value, ctx) => value === undefined || struct.refiner(value, ctx),

          validator(value, ctx) {
            if (value === undefined) {
              return true;
            } else {
              log(value, ctx);
              return struct.validator(value, ctx);
            }
          }

        });
      }

      function dynamic(fn) {
        return new Struct({
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

      function lazy(fn) {
        let struct;
        return new Struct({
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

      function omit(struct, keys) {
        const {
          schema
        } = struct;
        const subschema = { ...schema
        };

        for (const key of keys) {
          delete subschema[key];
        }

        switch (struct.type) {
          case 'type':
            return type(subschema);

          default:
            return object(subschema);
        }
      }

      function partial(struct) {
        const schema = struct instanceof Struct ? { ...struct.schema
        } : { ...struct
        };

        for (const key in schema) {
          schema[key] = optional(schema[key]);
        }

        return object(schema);
      }

      function pick(struct, keys) {
        const {
          schema
        } = struct;
        const subschema = {};

        for (const key of keys) {
          subschema[key] = schema[key];
        }

        return object(subschema);
      }

      function struct(name, validator) {
        console.warn('superstruct@0.11 - The `struct` helper has been renamed to `define`.');
        return define(name, validator);
      }

      function any() {
        return define('any', () => true);
      }

      function array(Element) {
        return new Struct({
          type: 'array',
          schema: Element,

          *entries(value) {
            if (Element && Array.isArray(value)) {
              for (const [i, v] of value.entries()) {
                yield [i, v, Element];
              }
            }
          },

          coercer(value) {
            return Array.isArray(value) ? value.slice() : value;
          },

          validator(value) {
            return Array.isArray(value) || `Expected an array value, but received: ${print(value)}`;
          }

        });
      }

      function bigint() {
        return define('bigint', value => {
          return typeof value === 'bigint';
        });
      }

      function boolean() {
        return define('boolean', value => {
          return typeof value === 'boolean';
        });
      }

      function date() {
        return define('date', value => {
          return value instanceof Date && !isNaN(value.getTime()) || `Expected a valid \`Date\` object, but received: ${print(value)}`;
        });
      }

      function enums(values) {
        const schema = {};
        const description = values.map(v => print(v)).join();

        for (const key of values) {
          schema[key] = key;
        }

        return new Struct({
          type: 'enums',
          schema,

          validator(value) {
            return values.includes(value) || `Expected one of \`${description}\`, but received: ${print(value)}`;
          }

        });
      }

      function func() {
        return define('func', value => {
          return typeof value === 'function' || `Expected a function, but received: ${print(value)}`;
        });
      }

      function instance(Class) {
        return define('instance', value => {
          return value instanceof Class || `Expected a \`${Class.name}\` instance, but received: ${print(value)}`;
        });
      }

      function integer() {
        return define('integer', value => {
          return typeof value === 'number' && !isNaN(value) && Number.isInteger(value) || `Expected an integer, but received: ${print(value)}`;
        });
      }

      function intersection(Structs) {
        return new Struct({
          type: 'intersection',
          schema: null,

          *entries(value, ctx) {
            for (const S of Structs) {
              yield* S.entries(value, ctx);
            }
          },

          *validator(value, ctx) {
            for (const S of Structs) {
              yield* S.validator(value, ctx);
            }
          },

          *refiner(value, ctx) {
            for (const S of Structs) {
              yield* S.refiner(value, ctx);
            }
          }

        });
      }

      function literal(constant) {
        const description = print(constant);
        const t = typeof constant;
        return new Struct({
          type: 'literal',
          schema: t === 'string' || t === 'number' || t === 'boolean' ? constant : null,

          validator(value) {
            return value === constant || `Expected the literal \`${description}\`, but received: ${print(value)}`;
          }

        });
      }

      function map(Key, Value) {
        return new Struct({
          type: 'map',
          schema: null,

          *entries(value) {
            if (Key && Value && value instanceof Map) {
              for (const [k, v] of value.entries()) {
                yield [k, k, Key];
                yield [k, v, Value];
              }
            }
          },

          coercer(value) {
            return value instanceof Map ? new Map(value) : value;
          },

          validator(value) {
            return value instanceof Map || `Expected a \`Map\` object, but received: ${print(value)}`;
          }

        });
      }

      function never() {
        return define('never', () => false);
      }

      function nullable(struct) {
        return new Struct({ ...struct,
          validator: (value, ctx) => value === null || struct.validator(value, ctx),
          refiner: (value, ctx) => value === null || struct.refiner(value, ctx)
        });
      }

      function number() {
        return define('number', value => {
          return typeof value === 'number' && !isNaN(value) || `Expected a number, but received: ${print(value)}`;
        });
      }

      function object(schema) {
        const knowns = schema ? Object.keys(schema) : [];
        const Never = never();
        return new Struct({
          type: 'object',
          schema: schema ? schema : null,

          *entries(value) {
            if (schema && isObject(value)) {
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
            return isObject(value) || `Expected an object, but received: ${print(value)}`;
          },

          coercer(value) {
            return isObject(value) ? { ...value
            } : value;
          }

        });
      }

      function optional(struct) {
        return new Struct({ ...struct,
          validator: (value, ctx) => value === undefined || struct.validator(value, ctx),
          refiner: (value, ctx) => value === undefined || struct.refiner(value, ctx)
        });
      }

      function record(Key, Value) {
        return new Struct({
          type: 'record',
          schema: null,

          *entries(value) {
            if (isObject(value)) {
              for (const k in value) {
                const v = value[k];
                yield [k, k, Key];
                yield [k, v, Value];
              }
            }
          },

          validator(value) {
            return isObject(value) || `Expected an object, but received: ${print(value)}`;
          }

        });
      }

      function regexp() {
        return define('regexp', value => {
          return value instanceof RegExp;
        });
      }

      function set(Element) {
        return new Struct({
          type: 'set',
          schema: null,

          *entries(value) {
            if (Element && value instanceof Set) {
              for (const v of value) {
                yield [v, v, Element];
              }
            }
          },

          coercer(value) {
            return value instanceof Set ? new Set(value) : value;
          },

          validator(value) {
            return value instanceof Set || `Expected a \`Set\` object, but received: ${print(value)}`;
          }

        });
      }

      function string() {
        return define('string', value => {
          return typeof value === 'string' || `Expected a string, but received: ${print(value)}`;
        });
      }

      function tuple(Structs) {
        const Never = never();
        return new Struct({
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
            return Array.isArray(value) || `Expected an array, but received: ${print(value)}`;
          }

        });
      }

      function type(schema) {
        const keys = Object.keys(schema);
        return new Struct({
          type: 'type',
          schema,

          *entries(value) {
            if (isObject(value)) {
              for (const k of keys) {
                yield [k, value[k], schema[k]];
              }
            }
          },

          validator(value) {
            return isObject(value) || `Expected an object, but received: ${print(value)}`;
          }

        });
      }

      function union(Structs) {
        const description = Structs.map(s => s.type).join(' | ');
        return new Struct({
          type: 'union',
          schema: null,

          coercer(value, ctx) {
            const firstMatch = Structs.find(s => {
              const [e] = s.validate(value, {
                coerce: true
              });
              return !e;
            }) || unknown();
            return firstMatch.coercer(value, ctx);
          },

          validator(value, ctx) {
            const failures = [];

            for (const S of Structs) {
              const [...tuples] = run(value, S, ctx);
              const [first] = tuples;

              if (!first[0]) {
                return [];
              } else {
                for (const [failure] of tuples) {
                  if (failure) {
                    failures.push(failure);
                  }
                }
              }
            }

            return [`Expected the value to satisfy a union of \`${description}\`, but received: ${print(value)}`, ...failures];
          }

        });
      }

      function unknown() {
        return define('unknown', () => true);
      }

      function coerce(struct, condition, coercer) {
        return new Struct({ ...struct,
          coercer: (value, ctx) => {
            return is(value, condition) ? struct.coercer(coercer(value, ctx), ctx) : struct.coercer(value, ctx);
          }
        });
      }

      function defaulted(struct, fallback, options) {
        if (options === void 0) {
          options = {};
        }

        return coerce(struct, unknown(), x => {
          const f = typeof fallback === 'function' ? fallback() : fallback;

          if (x === undefined) {
            return f;
          }

          if (!options.strict && isPlainObject(x) && isPlainObject(f)) {
            const ret = { ...x
            };
            let changed = false;

            for (const key in f) {
              if (ret[key] === undefined) {
                ret[key] = f[key];
                changed = true;
              }
            }

            if (changed) {
              return ret;
            }
          }

          return x;
        });
      }

      function trimmed(struct) {
        return coerce(struct, string(), x => x.trim());
      }

      function empty(struct) {
        return refine(struct, 'empty', value => {
          const size = getSize(value);
          return size === 0 || `Expected an empty ${struct.type} but received one with a size of \`${size}\``;
        });
      }

      function getSize(value) {
        if (value instanceof Map || value instanceof Set) {
          return value.size;
        } else {
          return value.length;
        }
      }

      function max(struct, threshold, options) {
        if (options === void 0) {
          options = {};
        }

        const {
          exclusive
        } = options;
        return refine(struct, 'max', value => {
          return exclusive ? value < threshold : value <= threshold || `Expected a ${struct.type} less than ${exclusive ? '' : 'or equal to '}${threshold} but received \`${value}\``;
        });
      }

      function min(struct, threshold, options) {
        if (options === void 0) {
          options = {};
        }

        const {
          exclusive
        } = options;
        return refine(struct, 'min', value => {
          return exclusive ? value > threshold : value >= threshold || `Expected a ${struct.type} greater than ${exclusive ? '' : 'or equal to '}${threshold} but received \`${value}\``;
        });
      }

      function nonempty(struct) {
        return refine(struct, 'nonempty', value => {
          const size = getSize(value);
          return size > 0 || `Expected a nonempty ${struct.type} but received an empty one`;
        });
      }

      function pattern(struct, regexp) {
        return refine(struct, 'pattern', value => {
          return regexp.test(value) || `Expected a ${struct.type} matching \`/${regexp.source}/\` but received "${value}"`;
        });
      }

      function size(struct, min, max) {
        if (max === void 0) {
          max = min;
        }

        const expected = `Expected a ${struct.type}`;
        const of = min === max ? `of \`${min}\`` : `between \`${min}\` and \`${max}\``;
        return refine(struct, 'size', value => {
          if (typeof value === 'number' || value instanceof Date) {
            return min <= value && value <= max || `${expected} ${of} but received \`${value}\``;
          } else if (value instanceof Map || value instanceof Set) {
            const {
              size
            } = value;
            return min <= size && size <= max || `${expected} with a size ${of} but received one with a size of \`${size}\``;
          } else {
            const {
              length
            } = value;
            return min <= length && length <= max || `${expected} with a length ${of} but received one with a length of \`${length}\``;
          }
        });
      }

      function refine(struct, name, refiner) {
        return new Struct({ ...struct,

          *refiner(value, ctx) {
            yield* struct.refiner(value, ctx);
            const result = refiner(value, ctx);
            const failures = toFailures(result, ctx, struct, value);

            for (const failure of failures) {
              yield { ...failure,
                refinement: name
              };
            }
          }

        });
      }

      exports.Struct = Struct;
      exports.StructError = StructError;
      exports.any = any;
      exports.array = array;
      exports.assert = assert;
      exports.assign = assign;
      exports.bigint = bigint;
      exports.boolean = boolean;
      exports.coerce = coerce;
      exports.create = create;
      exports.date = date;
      exports.defaulted = defaulted;
      exports.define = define;
      exports.deprecated = deprecated;
      exports.dynamic = dynamic;
      exports.empty = empty;
      exports.enums = enums;
      exports.func = func;
      exports.instance = instance;
      exports.integer = integer;
      exports.intersection = intersection;
      exports.is = is;
      exports.lazy = lazy;
      exports.literal = literal;
      exports.map = map;
      exports.mask = mask;
      exports.max = max;
      exports.min = min;
      exports.never = never;
      exports.nonempty = nonempty;
      exports.nullable = nullable;
      exports.number = number;
      exports.object = object;
      exports.omit = omit;
      exports.optional = optional;
      exports.partial = partial;
      exports.pattern = pattern;
      exports.pick = pick;
      exports.record = record;
      exports.refine = refine;
      exports.regexp = regexp;
      exports.set = set;
      exports.size = size;
      exports.string = string;
      exports.struct = struct;
      exports.trimmed = trimmed;
      exports.tuple = tuple;
      exports.type = type;
      exports.union = union;
      exports.unknown = unknown;
      exports.validate = validate;
    }, {}],
    40: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.onTransaction = void 0;

      var _insights = require("./insights");

      const onTransaction = async ({
        transaction
      }) => {
        return {
          insights: await (0, _insights.getInsights)(transaction)
        };
      };

      exports.onTransaction = onTransaction;
    }, {
      "./insights": 41
    }],
    41: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.getInsights = exports.getFunctionsBySignature = void 0;

      var _utils = require("@metamask/utils");

      var _abiUtils = require("@metamask/abi-utils");

      const API_ENDPOINT = 'https://www.4byte.directory/api/v1/signatures/?hex_signature=';

      const getFunctionsBySignature = async signature => {
        const response = await fetch(`${API_ENDPOINT}${signature}`, {
          method: 'get',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Unable to fetch functions for signature "${signature}": ${response.status} ${response.statusText}.`);
        }

        const {
          results
        } = await response.json();
        return results.sort((a, b) => b.created_at.localeCompare(a.created_at)).map(result => result.text_signature);
      };

      exports.getFunctionsBySignature = getFunctionsBySignature;

      const normalizeValue = value => {
        if (Array.isArray(value)) {
          return value.map(normalizeValue);
        }

        if (value instanceof Uint8Array) {
          return (0, _utils.bytesToHex)(value);
        }

        if (typeof value === 'bigint') {
          return value.toString();
        }

        return value;
      };

      const getInsights = async transaction => {
        try {
          if (!(0, _utils.isObject)(transaction) || !(0, _utils.hasProperty)(transaction, 'data') || typeof transaction.data !== 'string') {
            return {
              type: 'Unknown transaction'
            };
          }

          const data = (0, _utils.remove0x)(transaction.data);
          const signature = data.slice(0, 8);
          const functions = await getFunctionsBySignature((0, _utils.add0x)(signature));

          if (functions.length === 0) {
            return {
              type: 'Unknown transaction'
            };
          }

          const fn = functions[0];
          const types = fn.slice(fn.indexOf('(') + 1, fn.indexOf(')')).split(',');
          const decoded = (0, _abiUtils.decode)(types, (0, _utils.add0x)(data.slice(8)));
          return {
            type: fn,
            args: decoded.map(normalizeValue)
          };
        } catch (error) {
          console.error(error);
          return {
            type: 'Unknown transaction'
          };
        }
      };

      exports.getInsights = getInsights;
    }, {
      "@metamask/abi-utils": 3,
      "@metamask/utils": 26
    }]
  }, {}, [40])(40);
});