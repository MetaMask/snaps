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
    2: [function (require, module, exports) {
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
      "base64-js": 1,
      "buffer": 2,
      "ieee754": 9
    }],
    3: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.EthereumProviderError = exports.EthereumRpcError = void 0;

      const fast_safe_stringify_1 = require("fast-safe-stringify");

      class EthereumRpcError extends Error {
        constructor(code, message, data) {
          if (!Number.isInteger(code)) {
            throw new Error('"code" must be an integer.');
          }

          if (!message || typeof message !== 'string') {
            throw new Error('"message" must be a nonempty string.');
          }

          super(message);
          this.code = code;

          if (data !== undefined) {
            this.data = data;
          }
        }

        serialize() {
          const serialized = {
            code: this.code,
            message: this.message
          };

          if (this.data !== undefined) {
            serialized.data = this.data;
          }

          if (this.stack) {
            serialized.stack = this.stack;
          }

          return serialized;
        }

        toString() {
          return fast_safe_stringify_1.default(this.serialize(), stringifyReplacer, 2);
        }

      }

      exports.EthereumRpcError = EthereumRpcError;

      class EthereumProviderError extends EthereumRpcError {
        constructor(code, message, data) {
          if (!isValidEthProviderCode(code)) {
            throw new Error('"code" must be an integer such that: 1000 <= code <= 4999');
          }

          super(code, message, data);
        }

      }

      exports.EthereumProviderError = EthereumProviderError;

      function isValidEthProviderCode(code) {
        return Number.isInteger(code) && code >= 1000 && code <= 4999;
      }

      function stringifyReplacer(_, value) {
        if (value === '[Circular]') {
          return undefined;
        }

        return value;
      }
    }, {
      "fast-safe-stringify": 8
    }],
    4: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.errorValues = exports.errorCodes = void 0;
      exports.errorCodes = {
        rpc: {
          invalidInput: -32000,
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
      exports.errorValues = {
        '-32700': {
          standard: 'JSON RPC 2.0',
          message: 'Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.'
        },
        '-32600': {
          standard: 'JSON RPC 2.0',
          message: 'The JSON sent is not a valid Request object.'
        },
        '-32601': {
          standard: 'JSON RPC 2.0',
          message: 'The method does not exist / is not available.'
        },
        '-32602': {
          standard: 'JSON RPC 2.0',
          message: 'Invalid method parameter(s).'
        },
        '-32603': {
          standard: 'JSON RPC 2.0',
          message: 'Internal JSON-RPC error.'
        },
        '-32000': {
          standard: 'EIP-1474',
          message: 'Invalid input.'
        },
        '-32001': {
          standard: 'EIP-1474',
          message: 'Resource not found.'
        },
        '-32002': {
          standard: 'EIP-1474',
          message: 'Resource unavailable.'
        },
        '-32003': {
          standard: 'EIP-1474',
          message: 'Transaction rejected.'
        },
        '-32004': {
          standard: 'EIP-1474',
          message: 'Method not supported.'
        },
        '-32005': {
          standard: 'EIP-1474',
          message: 'Request limit exceeded.'
        },
        '4001': {
          standard: 'EIP-1193',
          message: 'User rejected the request.'
        },
        '4100': {
          standard: 'EIP-1193',
          message: 'The requested account and/or method has not been authorized by the user.'
        },
        '4200': {
          standard: 'EIP-1193',
          message: 'The requested method is not supported by this Ethereum provider.'
        },
        '4900': {
          standard: 'EIP-1193',
          message: 'The provider is disconnected from all chains.'
        },
        '4901': {
          standard: 'EIP-1193',
          message: 'The provider is disconnected from the specified chain.'
        }
      };
    }, {}],
    5: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.ethErrors = void 0;

      const classes_1 = require("./classes");

      const utils_1 = require("./utils");

      const error_constants_1 = require("./error-constants");

      exports.ethErrors = {
        rpc: {
          parse: arg => getEthJsonRpcError(error_constants_1.errorCodes.rpc.parse, arg),
          invalidRequest: arg => getEthJsonRpcError(error_constants_1.errorCodes.rpc.invalidRequest, arg),
          invalidParams: arg => getEthJsonRpcError(error_constants_1.errorCodes.rpc.invalidParams, arg),
          methodNotFound: arg => getEthJsonRpcError(error_constants_1.errorCodes.rpc.methodNotFound, arg),
          internal: arg => getEthJsonRpcError(error_constants_1.errorCodes.rpc.internal, arg),
          server: opts => {
            if (!opts || typeof opts !== 'object' || Array.isArray(opts)) {
              throw new Error('Ethereum RPC Server errors must provide single object argument.');
            }

            const {
              code
            } = opts;

            if (!Number.isInteger(code) || code > -32005 || code < -32099) {
              throw new Error('"code" must be an integer such that: -32099 <= code <= -32005');
            }

            return getEthJsonRpcError(code, opts);
          },
          invalidInput: arg => getEthJsonRpcError(error_constants_1.errorCodes.rpc.invalidInput, arg),
          resourceNotFound: arg => getEthJsonRpcError(error_constants_1.errorCodes.rpc.resourceNotFound, arg),
          resourceUnavailable: arg => getEthJsonRpcError(error_constants_1.errorCodes.rpc.resourceUnavailable, arg),
          transactionRejected: arg => getEthJsonRpcError(error_constants_1.errorCodes.rpc.transactionRejected, arg),
          methodNotSupported: arg => getEthJsonRpcError(error_constants_1.errorCodes.rpc.methodNotSupported, arg),
          limitExceeded: arg => getEthJsonRpcError(error_constants_1.errorCodes.rpc.limitExceeded, arg)
        },
        provider: {
          userRejectedRequest: arg => {
            return getEthProviderError(error_constants_1.errorCodes.provider.userRejectedRequest, arg);
          },
          unauthorized: arg => {
            return getEthProviderError(error_constants_1.errorCodes.provider.unauthorized, arg);
          },
          unsupportedMethod: arg => {
            return getEthProviderError(error_constants_1.errorCodes.provider.unsupportedMethod, arg);
          },
          disconnected: arg => {
            return getEthProviderError(error_constants_1.errorCodes.provider.disconnected, arg);
          },
          chainDisconnected: arg => {
            return getEthProviderError(error_constants_1.errorCodes.provider.chainDisconnected, arg);
          },
          custom: opts => {
            if (!opts || typeof opts !== 'object' || Array.isArray(opts)) {
              throw new Error('Ethereum Provider custom errors must provide single object argument.');
            }

            const {
              code,
              message,
              data
            } = opts;

            if (!message || typeof message !== 'string') {
              throw new Error('"message" must be a nonempty string');
            }

            return new classes_1.EthereumProviderError(code, message, data);
          }
        }
      };

      function getEthJsonRpcError(code, arg) {
        const [message, data] = parseOpts(arg);
        return new classes_1.EthereumRpcError(code, message || utils_1.getMessageFromCode(code), data);
      }

      function getEthProviderError(code, arg) {
        const [message, data] = parseOpts(arg);
        return new classes_1.EthereumProviderError(code, message || utils_1.getMessageFromCode(code), data);
      }

      function parseOpts(arg) {
        if (arg) {
          if (typeof arg === 'string') {
            return [arg];
          } else if (typeof arg === 'object' && !Array.isArray(arg)) {
            const {
              message,
              data
            } = arg;

            if (message && typeof message !== 'string') {
              throw new Error('Must specify string message.');
            }

            return [message || undefined, data];
          }
        }

        return [];
      }
    }, {
      "./classes": 3,
      "./error-constants": 4,
      "./utils": 7
    }],
    6: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.getMessageFromCode = exports.serializeError = exports.EthereumProviderError = exports.EthereumRpcError = exports.ethErrors = exports.errorCodes = void 0;

      const classes_1 = require("./classes");

      Object.defineProperty(exports, "EthereumRpcError", {
        enumerable: true,
        get: function () {
          return classes_1.EthereumRpcError;
        }
      });
      Object.defineProperty(exports, "EthereumProviderError", {
        enumerable: true,
        get: function () {
          return classes_1.EthereumProviderError;
        }
      });

      const utils_1 = require("./utils");

      Object.defineProperty(exports, "serializeError", {
        enumerable: true,
        get: function () {
          return utils_1.serializeError;
        }
      });
      Object.defineProperty(exports, "getMessageFromCode", {
        enumerable: true,
        get: function () {
          return utils_1.getMessageFromCode;
        }
      });

      const errors_1 = require("./errors");

      Object.defineProperty(exports, "ethErrors", {
        enumerable: true,
        get: function () {
          return errors_1.ethErrors;
        }
      });

      const error_constants_1 = require("./error-constants");

      Object.defineProperty(exports, "errorCodes", {
        enumerable: true,
        get: function () {
          return error_constants_1.errorCodes;
        }
      });
    }, {
      "./classes": 3,
      "./error-constants": 4,
      "./errors": 5,
      "./utils": 7
    }],
    7: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.serializeError = exports.isValidCode = exports.getMessageFromCode = exports.JSON_RPC_SERVER_ERROR_MESSAGE = void 0;

      const error_constants_1 = require("./error-constants");

      const classes_1 = require("./classes");

      const FALLBACK_ERROR_CODE = error_constants_1.errorCodes.rpc.internal;
      const FALLBACK_MESSAGE = 'Unspecified error message. This is a bug, please report it.';
      const FALLBACK_ERROR = {
        code: FALLBACK_ERROR_CODE,
        message: getMessageFromCode(FALLBACK_ERROR_CODE)
      };
      exports.JSON_RPC_SERVER_ERROR_MESSAGE = 'Unspecified server error.';

      function getMessageFromCode(code, fallbackMessage = FALLBACK_MESSAGE) {
        if (Number.isInteger(code)) {
          const codeString = code.toString();

          if (hasKey(error_constants_1.errorValues, codeString)) {
            return error_constants_1.errorValues[codeString].message;
          }

          if (isJsonRpcServerError(code)) {
            return exports.JSON_RPC_SERVER_ERROR_MESSAGE;
          }
        }

        return fallbackMessage;
      }

      exports.getMessageFromCode = getMessageFromCode;

      function isValidCode(code) {
        if (!Number.isInteger(code)) {
          return false;
        }

        const codeString = code.toString();

        if (error_constants_1.errorValues[codeString]) {
          return true;
        }

        if (isJsonRpcServerError(code)) {
          return true;
        }

        return false;
      }

      exports.isValidCode = isValidCode;

      function serializeError(error, {
        fallbackError = FALLBACK_ERROR,
        shouldIncludeStack = false
      } = {}) {
        var _a, _b;

        if (!fallbackError || !Number.isInteger(fallbackError.code) || typeof fallbackError.message !== 'string') {
          throw new Error('Must provide fallback error with integer number code and string message.');
        }

        if (error instanceof classes_1.EthereumRpcError) {
          return error.serialize();
        }

        const serialized = {};

        if (error && typeof error === 'object' && !Array.isArray(error) && hasKey(error, 'code') && isValidCode(error.code)) {
          const _error = error;
          serialized.code = _error.code;

          if (_error.message && typeof _error.message === 'string') {
            serialized.message = _error.message;

            if (hasKey(_error, 'data')) {
              serialized.data = _error.data;
            }
          } else {
            serialized.message = getMessageFromCode(serialized.code);
            serialized.data = {
              originalError: assignOriginalError(error)
            };
          }
        } else {
          serialized.code = fallbackError.code;
          const message = (_a = error) === null || _a === void 0 ? void 0 : _a.message;
          serialized.message = message && typeof message === 'string' ? message : fallbackError.message;
          serialized.data = {
            originalError: assignOriginalError(error)
          };
        }

        const stack = (_b = error) === null || _b === void 0 ? void 0 : _b.stack;

        if (shouldIncludeStack && error && stack && typeof stack === 'string') {
          serialized.stack = stack;
        }

        return serialized;
      }

      exports.serializeError = serializeError;

      function isJsonRpcServerError(code) {
        return code >= -32099 && code <= -32000;
      }

      function assignOriginalError(error) {
        if (error && typeof error === 'object' && !Array.isArray(error)) {
          return Object.assign({}, error);
        }

        return error;
      }

      function hasKey(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
      }
    }, {
      "./classes": 3,
      "./error-constants": 4
    }],
    8: [function (require, module, exports) {
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
    9: [function (require, module, exports) {
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
    10: [function (require, module, exports) {
      (function () {
        (function () {
          "use strict";

          const {
            ethErrors
          } = require('eth-rpc-errors');

          let wasm;

          const initializeWasm = async () => {
            try {
              const wasmBuffer = Buffer("AGFzbQEAAAABBgFgAX8BfwMCAQAEBAFwAAEFAwEAAAYUA38AQQgLfwFBiIABC38AQYiAAQsHEAIDZmliAAAGbWVtb3J5AgAJBgEAQQELAApAAT4BBH9BACEBQQEhAiAAQQBKBEACQANAIABBAWsiACEDIAMEQCABIAJqIQQgAiEBIAQhAgwBCwsLIAIPCyABCw==", "base64");
              wasm = await WebAssembly.instantiate(wasmBuffer);
            } catch (error) {
              console.error('Failed to initialize WebAssembly module.', error);
              throw error;
            }
          };

          module.exports.onRpcRequest = async ({
            request
          }) => {
            if (!wasm) {
              await initializeWasm();
            }

            if (wasm.instance.exports[request.method]) {
              return wasm.instance.exports[request.method](...request.params);
            }

            throw ethErrors.rpc.methodNotFound({
              data: {
                request
              }
            });
          };
        }).call(this);
      }).call(this, require("buffer").Buffer);
    }, {
      "buffer": 2,
      "eth-rpc-errors": 6
    }]
  }, {}, [10])(10);
});