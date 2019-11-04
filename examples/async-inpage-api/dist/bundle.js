() => (
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const { errors: rpcErrors } = require('eth-json-rpc-errors')

const pingListeners = [];
let pingCount = 0;

wallet.registerApiRequestHandler(async (origin) => {

  return {

    ping: () => {
      trackPings(origin);
      return 'pong'
    },

    // We're going to create an event for notifying the listener
    // Whenever a ping is initiated!
    on: (eventName, callback) => {
      switch (eventName) {
        case 'ping':
          pingListeners.push(callback);
          return true
        default:
          throw rpcErrors.methodNotFound(requestObject)
      }
    }
  }

})

function trackPings (origin) {
  pingCount++
  const notice = {
    origin,
    pingCount,
  }
  pingListeners.forEach((listener) => {
    listener(notice)
    .catch((err) => {
      console.error('Unable to deliver ping notice', err)
    })
  })
}

},{"eth-json-rpc-errors":2}],2:[function(require,module,exports){

const { EthereumRpcError, EthereumProviderError } = require('./src/classes')
const {
  serializeError, getMessageFromCode,
} = require('./src/utils')
const ethErrors = require('./src/errors')
const ERROR_CODES = require('./src/errorCodes.json')

module.exports = {
  ethErrors,
  EthereumRpcError,
  EthereumProviderError,
  serializeError,
  getMessageFromCode,
  /** @type ErrorCodes */
  ERROR_CODES,
}

// Types

/**
 * @typedef {Object} EthereumProviderErrorCodes
 * @property {number} userRejectedRequest
 * @property {number} unauthorized
 * @property {number} unsupportedMethod
 */

/**
 * @typedef {Object} EthereumRpcErrorCodes
 * @property {number} parse
 * @property {number} invalidRequest
 * @property {number} invalidParams
 * @property {number} methodNotFound
 * @property {number} internal
 * @property {number} invalidInput
 * @property {number} resourceNotFound
 * @property {number} resourceUnavailable
 * @property {number} transactionRejected
 * @property {number} methodNotSupported
 */

/**
 * @typedef ErrorCodes
 * @property {EthereumRpcErrorCodes} rpc
 * @property {EthereumProviderErrorCodes} provider
 */

},{"./src/classes":3,"./src/errorCodes.json":4,"./src/errors":6,"./src/utils":7}],3:[function(require,module,exports){

const safeStringify = require('fast-safe-stringify')

/**
 * @class JsonRpcError
 * Error subclass implementing JSON RPC 2.0 errors and Ethereum RPC errors
 * per EIP 1474.
 * Permits any integer error code.
 */
class EthereumRpcError extends Error {

  /**
   * Create an Ethereum JSON RPC error.
   * 
   * @param {number} code - The integer error code.
   * @param {string} message - The string message.
   * @param {any} [data] - The error data.
   */
  constructor (code, message, data) {

    if (!Number.isInteger(code)) throw new Error(
      '"code" must be an integer.'
    )
    if (!message || typeof message !== 'string') throw new Error(
      '"message" must be a nonempty string.'
    )

    super(message)
    this.code = code
    if (data !== undefined) this.data = data
  }

  /**
   * Returns a plain object with all public class properties.
   * 
   * @returns {object} The serialized error. 
   */
  serialize() {
    const serialized = {
      code: this.code,
      message: this.message,
    }
    if (this.data !== undefined) serialized.data = this.data
    if (this.stack) serialized.stack = this.stack
    return serialized
  }

  /**
   * Return a string representation of the serialized error, omitting
   * any circular references.
   * 
   * @returns {string} The serialized error as a string.
   */
  toString() {
    return safeStringify(
      this.serialize(),
      stringifyReplacer,
      2
    )
  }
}

/**
 * @class EthereumRpcError
 * Error subclass implementing Ethereum Provider errors per EIP 1193.
 * Permits integer error codes in the [ 1000 <= 4999 ] range.
 */
class EthereumProviderError extends EthereumRpcError {
  /**
   * Create an Ethereum JSON RPC error.
   * 
   * @param {number} code - The integer error code, in the [ 1000 <= 4999 ] range.
   * @param {string} message - The string message.
   * @param {any} [data] - The error data.
   */
  constructor(code, message, data) {
    if (!isValidEthProviderCode(code)) {
      throw new Error(
        '"code" must be an integer such that: 1000 <= code <= 4999'
      )
    }
    super(code, message, data)
  }
}

// Internal

function isValidEthProviderCode(code) {
  return Number.isInteger(code) && code >= 1000 && code <= 4999
}

function stringifyReplacer(_, value) {
  if (value === '[Circular]') {
    return
  }
  return value
}

// Exports

module.exports =  {
  EthereumRpcError,
  EthereumProviderError
}

},{"fast-safe-stringify":8}],4:[function(require,module,exports){
module.exports={
  "rpc": {
    "invalidInput": -32000,
    "resourceNotFound": -32001,
    "resourceUnavailable": -32002,
    "transactionRejected": -32003,
    "methodNotSupported": -32004,
    "parse": -32700,
    "invalidRequest": -32600,
    "methodNotFound": -32601,
    "invalidParams": -32602,
    "internal": -32603
  },
  "provider": {
    "userRejectedRequest": 4001,
    "unauthorized": 4100,
    "unsupportedMethod": 4200
  }
}

},{}],5:[function(require,module,exports){
module.exports={
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
  "-32000": {
    "standard": "EIP 1474",
    "message": "Invalid input."
  },
  "-32001": {
    "standard": "EIP 1474",
    "message": "Resource not found."
  },
  "-32002": {
    "standard": "EIP 1474",
    "message": "Resource unavailable."
  },
  "-32003": {
    "standard": "EIP 1474",
    "message": "Transaction rejected."
  },
  "-32004": {
    "standard": "EIP 1474",
    "message": "Method not supported."
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
}

},{}],6:[function(require,module,exports){

const { EthereumRpcError, EthereumProviderError } = require('./classes')
const { getMessageFromCode } = require('./utils')
const ERROR_CODES = require('./errorCodes.json')

module.exports = {
  rpc: {
    /**
     * Get a JSON RPC 2.0 Parse error.
     * 
     * @param {Object|string} [opts] - Options object or error message string
     * @param {string} [opts.message] - The error message
     * @param {any} [opts.data] - Error data
     * @returns {EthereumRpcError} - The error
     */
    parse: (opts) => getEthJsonRpcError(
      ERROR_CODES.rpc.parse, opts
    ),

    /**
     * Get a JSON RPC 2.0 Invalid Request error.
     * 
     * @param {Object|string} [opts] - Options object or error message string
     * @param {string} [opts.message] - The error message
     * @param {any} [opts.data] - Error data
     * @returns {EthereumRpcError} - The error
     */
    invalidRequest: (opts) => getEthJsonRpcError(
      ERROR_CODES.rpc.invalidRequest, opts
    ),

    /**
     * Get a JSON RPC 2.0 Invalid Params error.
     * 
     * @param {Object|string} [opts] - Options object or error message string
     * @param {string} [opts.message] - The error message
     * @param {any} [opts.data] - Error data
     * @returns {EthereumRpcError} - The error
     */
    invalidParams: (opts) => getEthJsonRpcError(
      ERROR_CODES.rpc.invalidParams, opts
    ),

    /**
     * Get a JSON RPC 2.0 Method Not Found error.
     * 
     * @param {Object|string} [opts] - Options object or error message string
     * @param {string} [opts.message] - The error message
     * @param {any} [opts.data] - Error data
     * @returns {EthereumRpcError} - The error
     */
    methodNotFound: (opts) => getEthJsonRpcError(
      ERROR_CODES.rpc.methodNotFound, opts
    ),

    /**
     * Get a JSON RPC 2.0 Internal error.
     * 
     * @param {Object|string} [opts] - Options object or error message string
     * @param {string} [opts.message] - The error message
     * @param {any} [opts.data] - Error data
     * @returns {EthereumRpcError} - The error
     */
    internal: (opts) => getEthJsonRpcError(
      ERROR_CODES.rpc.internal, opts
    ),

    /**
     * Get a JSON RPC 2.0 Server error.
     * Permits integer error codes in the [ -32099 <= -32005 ] range.
     * Codes -32000 through -32004 are reserved by EIP 1474.
     * 
     * @param {Object|string} opts - Options object
     * @param {number} opts.code - The error code
     * @param {string} [opts.message] - The error message
     * @param {any} [opts.data] - Error data
     * @returns {EthereumRpcError} - The error
     */
    server: (opts) => {
      if (typeof opts !== 'object' || Array.isArray(opts)) {
        throw new Error('Ethereum RPC Server errors must provide single object argument.')
      }
      const { code } = opts
      if (!Number.isInteger(code) || code > -32005 || code < -32099) {
        throw new Error(
          '"code" must be an integer such that: -32099 <= code <= -32005'
        )
      }
      return getEthJsonRpcError(code, opts)
    },

    /**
     * Get an Ethereum JSON RPC Invalid Input error.
     * 
     * @param {Object|string} [opts] - Options object or error message string
     * @param {string} [opts.message] - The error message
     * @param {any} [opts.data] - Error data
     * @returns {EthereumRpcError} - The error
     */
    invalidInput: (opts) => getEthJsonRpcError(
      ERROR_CODES.rpc.invalidInput, opts
    ),

    /**
     * Get an Ethereum JSON RPC Resource Not Found error.
     * 
     * @param {Object|string} [opts] - Options object or error message string
     * @param {string} [opts.message] - The error message
     * @param {any} [opts.data] - Error data
     * @returns {EthereumRpcError} - The error
     */
    resourceNotFound: (opts) => getEthJsonRpcError(
      ERROR_CODES.rpc.resourceNotFound, opts
    ),

    /**
     * Get an Ethereum JSON RPC Resource Unavailable error.
     * 
     * @param {Object|string} [opts] - Options object or error message string
     * @param {string} [opts.message] - The error message
     * @param {any} [opts.data] - Error data
     * @returns {EthereumRpcError} - The error
     */
    resourceUnavailable: (opts) => getEthJsonRpcError(
      ERROR_CODES.rpc.resourceUnavailable, opts
    ),

    /**
     * Get an Ethereum JSON RPC Transaction Rejected error.
     * 
     * @param {Object|string} [opts] - Options object or error message string
     * @param {string} [opts.message] - The error message
     * @param {any} [opts.data] - Error data
     * @returns {EthereumRpcError} - The error
     */
    transactionRejected: (opts) => getEthJsonRpcError(
      ERROR_CODES.rpc.transactionRejected, opts
    ),

    /**
     * Get an Ethereum JSON RPC Method Not Supported error.
     * 
     * @param {Object|string} [opts] - Options object or error message string
     * @param {string} [opts.message] - The error message
     * @param {any} [opts.data] - Error data
     * @returns {EthereumRpcError} - The error
     */
    methodNotSupported: (opts) => getEthJsonRpcError(
      ERROR_CODES.rpc.methodNotSupported, opts
    ),
  },

  provider: {
    /**
     * Get an Ethereum Provider User Rejected Request error.
     * 
     * @param {Object|string} [opts] - Options object or error message string
     * @param {string} [opts.message] - The error message
     * @param {any} [opts.data] - Error data
     * @returns {EthereumProviderError} - The error
     */
    userRejectedRequest: (opts) => {
      return getEthProviderError(
        ERROR_CODES.provider.userRejectedRequest, opts
      )
    },

    /**
     * Get an Ethereum Provider Unauthorized error.
     * 
     * @param {Object|string} [opts] - Options object or error message string
     * @param {string} [opts.message] - The error message
     * @param {any} [opts.data] - Error data
     * @returns {EthereumProviderError} - The error
     */
    unauthorized: (opts) => {
      return getEthProviderError(
        ERROR_CODES.provider.unauthorized, opts
      )
    },

    /**
     * Get an Ethereum Provider Unsupported Method error.
     * 
     * @param {Object|string} [opts] - Options object or error message string
     * @param {string} [opts.message] - The error message
     * @param {any} [opts.data] - Error data
     * @returns {EthereumProviderError} - The error
     */
    unsupportedMethod: (opts) => {
      return getEthProviderError(
        ERROR_CODES.provider.unsupportedMethod, opts
      )
    },

    /**
     * Get a custom Ethereum Provider error.
     * 
     * @param {Object|string} opts - Options object
     * @param {number} opts.code - The error code
     * @param {string} opts.message - The error message
     * @param {any} [opts.data] - Error data
     * @returns {EthereumProviderError} - The error
     */
    custom: (opts) => {
      if (typeof opts !== 'object' || Array.isArray(opts)) {
        throw new Error('Ethereum Provider custom errors must provide single object argument.')
      }
      const { code, message, data } = opts
      if (!message || typeof message !== 'string') throw new Error(
        '"message" must be a nonempty string'
      )
      return new EthereumProviderError(code, message, data)
    },
  },
}

// Internal

function getEthJsonRpcError(code, opts) {
  const [ message, data ] = validateOpts(opts)
  return new EthereumRpcError(
    code,
    message || getMessageFromCode(code),
    data
  )
}

function getEthProviderError(code, opts) {
  const [ message, data ] = validateOpts(opts)
  return new EthereumProviderError(
    code,
    message || getMessageFromCode(code),
    data
  )
}

function validateOpts (opts) {
  let message, data
  if (opts) {
    if (typeof opts === 'string') {
      message = opts
    } else if (opts && typeof opts === 'object' && !Array.isArray(opts)) {
      message = opts.message
      data = opts.data
    }
  }
  return [ message, data ]
}

},{"./classes":3,"./errorCodes.json":4,"./utils":7}],7:[function(require,module,exports){

const errorValues = require('./errorValues.json')
const FALLBACK_ERROR_CODE = require('./errorCodes.json').rpc.internal
const { EthereumRpcError } = require('./classes')

const JSON_RPC_SERVER_ERROR_MESSAGE = 'Unspecified server error.'

const FALLBACK_MESSAGE = 'Unspecified error message. This is a bug, please report it.'

const FALLBACK_ERROR = {
  code: FALLBACK_ERROR_CODE,
  message: getMessageFromCode(FALLBACK_ERROR_CODE)
}

/**
 * Gets the message for a given code, or a fallback message if the code has
 * no corresponding message.
 * 
 * @param {number} code - The integer error code
 * @param {string} fallbackMessage - The fallback message
 * @return {string} - The corresponding message or the fallback message
 */
function getMessageFromCode(code, fallbackMessage = FALLBACK_MESSAGE) {

  if (Number.isInteger(code)) {

    const codeString = code.toString()
    if (errorValues[codeString]) return errorValues[codeString].message

    if (isJsonRpcServerError(code)) return JSON_RPC_SERVER_ERROR_MESSAGE

    // TODO: allow valid codes and messages to be extended
    // // EIP 1193 Status Codes
    // if (code >= 4000 && code <= 4999) return Something?
  }
  return fallbackMessage
}

/**
 * Returns whether the given code is valid.
 * A code is only valid if it has a message.
 * 
 * @param {number} code - The code to check
 * @return {boolean} true if the code is valid, false otherwise.
 */
function isValidCode(code) {

  if (!Number.isInteger(code)) return false

  const codeString = code.toString()
  if (errorValues[codeString]) return true

  if (isJsonRpcServerError(code)) return true

  // TODO: allow valid codes and messages to be extended
  // // EIP 1193 Status Codes
  // if (code >= 4000 && code <= 4999) return true

  return false
}

/**
 * Serializes the given error to an Ethereum JSON RPC-compatible error object.
 * Merely copies the given error's values if it is already compatible.
 * If the given error is not fully compatible, it will be preserved on the
 * returned object's data.originalError property.
 * Adds a 'stack' property if it exists on the given error.
 *
 * @param {any} error - The error to serialize.
 * @param {object} fallbackError - The custom fallback error values if the
 * given error is invalid.
 * @return {object} A standardized error object.
 */
function serializeError (error, fallbackError = FALLBACK_ERROR) {

  if (
    !fallbackError || 
    !Number.isInteger(fallbackError.code) ||
    typeof fallbackError.message !== 'string'
  ) {
    throw new Error(
      'fallbackError must contain integer number code and string message.'
    )
  }

  if (typeof error === 'object' && error instanceof EthereumRpcError) {
    return error.serialize()
  }

  const serialized = {}

  if (error && isValidCode(error.code)) {

    serialized.code = error.code

    if (error.message && typeof error.message === 'string') {
      serialized.message = error.message
      if (error.hasOwnProperty('data')) serialized.data = error.data
    } else {
      serialized.message = getMessageFromCode(serialized.code)
      serialized.data = { originalError: assignOriginalError(error) }
    }

  } else {
    serialized.code = fallbackError.code
    serialized.message = (
      error && error.message
        ? error.message
        : fallbackError.message
    )
    serialized.data = { originalError: assignOriginalError(error) }
  }

  if (error && error.stack) serialized.stack = error.stack
  return serialized
}

// Internal

function isJsonRpcServerError (code) {
  return code >= -32099 && code <= -32000
}

function assignOriginalError (error) {
  if (error && typeof error === 'object' && !Array.isArray(error)) {
    return Object.assign({}, error)
  }
  return error
}

// Exports

module.exports = {
  getMessageFromCode,
  isValidCode,
  serializeError,
  JSON_RPC_SERVER_ERROR_MESSAGE,
}

},{"./classes":3,"./errorCodes.json":4,"./errorValues.json":5}],8:[function(require,module,exports){
module.exports = stringify
stringify.default = stringify
stringify.stable = deterministicStringify
stringify.stableStringify = deterministicStringify

var arr = []
var replacerStack = []

// Regular stringify
function stringify (obj, replacer, spacer) {
  decirc(obj, '', [], undefined)
  var res
  if (replacerStack.length === 0) {
    res = JSON.stringify(obj, replacer, spacer)
  } else {
    res = JSON.stringify(obj, replaceGetterValues(replacer), spacer)
  }
  while (arr.length !== 0) {
    var part = arr.pop()
    if (part.length === 4) {
      Object.defineProperty(part[0], part[1], part[3])
    } else {
      part[0][part[1]] = part[2]
    }
  }
  return res
}
function decirc (val, k, stack, parent) {
  var i
  if (typeof val === 'object' && val !== null) {
    for (i = 0; i < stack.length; i++) {
      if (stack[i] === val) {
        var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k)
        if (propertyDescriptor.get !== undefined) {
          if (propertyDescriptor.configurable) {
            Object.defineProperty(parent, k, { value: '[Circular]' })
            arr.push([parent, k, val, propertyDescriptor])
          } else {
            replacerStack.push([val, k])
          }
        } else {
          parent[k] = '[Circular]'
          arr.push([parent, k, val])
        }
        return
      }
    }
    stack.push(val)
    // Optimize for Arrays. Big arrays could kill the performance otherwise!
    if (Array.isArray(val)) {
      for (i = 0; i < val.length; i++) {
        decirc(val[i], i, stack, val)
      }
    } else {
      var keys = Object.keys(val)
      for (i = 0; i < keys.length; i++) {
        var key = keys[i]
        decirc(val[key], key, stack, val)
      }
    }
    stack.pop()
  }
}

// Stable-stringify
function compareFunction (a, b) {
  if (a < b) {
    return -1
  }
  if (a > b) {
    return 1
  }
  return 0
}

function deterministicStringify (obj, replacer, spacer) {
  var tmp = deterministicDecirc(obj, '', [], undefined) || obj
  var res
  if (replacerStack.length === 0) {
    res = JSON.stringify(tmp, replacer, spacer)
  } else {
    res = JSON.stringify(tmp, replaceGetterValues(replacer), spacer)
  }
  while (arr.length !== 0) {
    var part = arr.pop()
    if (part.length === 4) {
      Object.defineProperty(part[0], part[1], part[3])
    } else {
      part[0][part[1]] = part[2]
    }
  }
  return res
}

function deterministicDecirc (val, k, stack, parent) {
  var i
  if (typeof val === 'object' && val !== null) {
    for (i = 0; i < stack.length; i++) {
      if (stack[i] === val) {
        var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k)
        if (propertyDescriptor.get !== undefined) {
          if (propertyDescriptor.configurable) {
            Object.defineProperty(parent, k, { value: '[Circular]' })
            arr.push([parent, k, val, propertyDescriptor])
          } else {
            replacerStack.push([val, k])
          }
        } else {
          parent[k] = '[Circular]'
          arr.push([parent, k, val])
        }
        return
      }
    }
    if (typeof val.toJSON === 'function') {
      return
    }
    stack.push(val)
    // Optimize for Arrays. Big arrays could kill the performance otherwise!
    if (Array.isArray(val)) {
      for (i = 0; i < val.length; i++) {
        deterministicDecirc(val[i], i, stack, val)
      }
    } else {
      // Create a temporary object in the required way
      var tmp = {}
      var keys = Object.keys(val).sort(compareFunction)
      for (i = 0; i < keys.length; i++) {
        var key = keys[i]
        deterministicDecirc(val[key], key, stack, val)
        tmp[key] = val[key]
      }
      if (parent !== undefined) {
        arr.push([parent, k, val])
        parent[k] = tmp
      } else {
        return tmp
      }
    }
    stack.pop()
  }
}

// wraps replacer function to handle values we couldn't replace
// and mark them as [Circular]
function replaceGetterValues (replacer) {
  replacer = replacer !== undefined ? replacer : function (k, v) { return v }
  return function (key, val) {
    if (replacerStack.length > 0) {
      for (var i = 0; i < replacerStack.length; i++) {
        var part = replacerStack[i]
        if (part[1] === key && part[0] === val) {
          val = '[Circular]'
          replacerStack.splice(i, 1)
          break
        }
      }
    }
    return replacer.call(this, key, val)
  }
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9hc3luYy1pbnBhZ2UtYXBpL2luZGV4LmpzIiwiZXhhbXBsZXMvYXN5bmMtaW5wYWdlLWFwaS9ub2RlX21vZHVsZXMvZXRoLWpzb24tcnBjLWVycm9ycy9pbmRleC5qcyIsImV4YW1wbGVzL2FzeW5jLWlucGFnZS1hcGkvbm9kZV9tb2R1bGVzL2V0aC1qc29uLXJwYy1lcnJvcnMvc3JjL2NsYXNzZXMuanMiLCJleGFtcGxlcy9hc3luYy1pbnBhZ2UtYXBpL25vZGVfbW9kdWxlcy9ldGgtanNvbi1ycGMtZXJyb3JzL3NyYy9lcnJvckNvZGVzLmpzb24iLCJleGFtcGxlcy9hc3luYy1pbnBhZ2UtYXBpL25vZGVfbW9kdWxlcy9ldGgtanNvbi1ycGMtZXJyb3JzL3NyYy9lcnJvclZhbHVlcy5qc29uIiwiZXhhbXBsZXMvYXN5bmMtaW5wYWdlLWFwaS9ub2RlX21vZHVsZXMvZXRoLWpzb24tcnBjLWVycm9ycy9zcmMvZXJyb3JzLmpzIiwiZXhhbXBsZXMvYXN5bmMtaW5wYWdlLWFwaS9ub2RlX21vZHVsZXMvZXRoLWpzb24tcnBjLWVycm9ycy9zcmMvdXRpbHMuanMiLCJleGFtcGxlcy9hc3luYy1pbnBhZ2UtYXBpL25vZGVfbW9kdWxlcy9mYXN0LXNhZmUtc3RyaW5naWZ5L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgeyBlcnJvcnM6IHJwY0Vycm9ycyB9ID0gcmVxdWlyZSgnZXRoLWpzb24tcnBjLWVycm9ycycpXG5cbmNvbnN0IHBpbmdMaXN0ZW5lcnMgPSBbXTtcbmxldCBwaW5nQ291bnQgPSAwO1xuXG53YWxsZXQucmVnaXN0ZXJBcGlSZXF1ZXN0SGFuZGxlcihhc3luYyAob3JpZ2luKSA9PiB7XG5cbiAgcmV0dXJuIHtcblxuICAgIHBpbmc6ICgpID0+IHtcbiAgICAgIHRyYWNrUGluZ3Mob3JpZ2luKTtcbiAgICAgIHJldHVybiAncG9uZydcbiAgICB9LFxuXG4gICAgLy8gV2UncmUgZ29pbmcgdG8gY3JlYXRlIGFuIGV2ZW50IGZvciBub3RpZnlpbmcgdGhlIGxpc3RlbmVyXG4gICAgLy8gV2hlbmV2ZXIgYSBwaW5nIGlzIGluaXRpYXRlZCFcbiAgICBvbjogKGV2ZW50TmFtZSwgY2FsbGJhY2spID0+IHtcbiAgICAgIHN3aXRjaCAoZXZlbnROYW1lKSB7XG4gICAgICAgIGNhc2UgJ3BpbmcnOlxuICAgICAgICAgIHBpbmdMaXN0ZW5lcnMucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBycGNFcnJvcnMubWV0aG9kTm90Rm91bmQocmVxdWVzdE9iamVjdClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxufSlcblxuZnVuY3Rpb24gdHJhY2tQaW5ncyAob3JpZ2luKSB7XG4gIHBpbmdDb3VudCsrXG4gIGNvbnN0IG5vdGljZSA9IHtcbiAgICBvcmlnaW4sXG4gICAgcGluZ0NvdW50LFxuICB9XG4gIHBpbmdMaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICBsaXN0ZW5lcihub3RpY2UpXG4gICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1VuYWJsZSB0byBkZWxpdmVyIHBpbmcgbm90aWNlJywgZXJyKVxuICAgIH0pXG4gIH0pXG59XG4iLCJcbmNvbnN0IHsgRXRoZXJldW1ScGNFcnJvciwgRXRoZXJldW1Qcm92aWRlckVycm9yIH0gPSByZXF1aXJlKCcuL3NyYy9jbGFzc2VzJylcbmNvbnN0IHtcbiAgc2VyaWFsaXplRXJyb3IsIGdldE1lc3NhZ2VGcm9tQ29kZSxcbn0gPSByZXF1aXJlKCcuL3NyYy91dGlscycpXG5jb25zdCBldGhFcnJvcnMgPSByZXF1aXJlKCcuL3NyYy9lcnJvcnMnKVxuY29uc3QgRVJST1JfQ09ERVMgPSByZXF1aXJlKCcuL3NyYy9lcnJvckNvZGVzLmpzb24nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZXRoRXJyb3JzLFxuICBFdGhlcmV1bVJwY0Vycm9yLFxuICBFdGhlcmV1bVByb3ZpZGVyRXJyb3IsXG4gIHNlcmlhbGl6ZUVycm9yLFxuICBnZXRNZXNzYWdlRnJvbUNvZGUsXG4gIC8qKiBAdHlwZSBFcnJvckNvZGVzICovXG4gIEVSUk9SX0NPREVTLFxufVxuXG4vLyBUeXBlc1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IEV0aGVyZXVtUHJvdmlkZXJFcnJvckNvZGVzXG4gKiBAcHJvcGVydHkge251bWJlcn0gdXNlclJlamVjdGVkUmVxdWVzdFxuICogQHByb3BlcnR5IHtudW1iZXJ9IHVuYXV0aG9yaXplZFxuICogQHByb3BlcnR5IHtudW1iZXJ9IHVuc3VwcG9ydGVkTWV0aG9kXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBFdGhlcmV1bVJwY0Vycm9yQ29kZXNcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBwYXJzZVxuICogQHByb3BlcnR5IHtudW1iZXJ9IGludmFsaWRSZXF1ZXN0XG4gKiBAcHJvcGVydHkge251bWJlcn0gaW52YWxpZFBhcmFtc1xuICogQHByb3BlcnR5IHtudW1iZXJ9IG1ldGhvZE5vdEZvdW5kXG4gKiBAcHJvcGVydHkge251bWJlcn0gaW50ZXJuYWxcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBpbnZhbGlkSW5wdXRcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSByZXNvdXJjZU5vdEZvdW5kXG4gKiBAcHJvcGVydHkge251bWJlcn0gcmVzb3VyY2VVbmF2YWlsYWJsZVxuICogQHByb3BlcnR5IHtudW1iZXJ9IHRyYW5zYWN0aW9uUmVqZWN0ZWRcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBtZXRob2ROb3RTdXBwb3J0ZWRcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIEVycm9yQ29kZXNcbiAqIEBwcm9wZXJ0eSB7RXRoZXJldW1ScGNFcnJvckNvZGVzfSBycGNcbiAqIEBwcm9wZXJ0eSB7RXRoZXJldW1Qcm92aWRlckVycm9yQ29kZXN9IHByb3ZpZGVyXG4gKi9cbiIsIlxuY29uc3Qgc2FmZVN0cmluZ2lmeSA9IHJlcXVpcmUoJ2Zhc3Qtc2FmZS1zdHJpbmdpZnknKVxuXG4vKipcbiAqIEBjbGFzcyBKc29uUnBjRXJyb3JcbiAqIEVycm9yIHN1YmNsYXNzIGltcGxlbWVudGluZyBKU09OIFJQQyAyLjAgZXJyb3JzIGFuZCBFdGhlcmV1bSBSUEMgZXJyb3JzXG4gKiBwZXIgRUlQIDE0NzQuXG4gKiBQZXJtaXRzIGFueSBpbnRlZ2VyIGVycm9yIGNvZGUuXG4gKi9cbmNsYXNzIEV0aGVyZXVtUnBjRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbiBFdGhlcmV1bSBKU09OIFJQQyBlcnJvci5cbiAgICogXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjb2RlIC0gVGhlIGludGVnZXIgZXJyb3IgY29kZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBUaGUgc3RyaW5nIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7YW55fSBbZGF0YV0gLSBUaGUgZXJyb3IgZGF0YS5cbiAgICovXG4gIGNvbnN0cnVjdG9yIChjb2RlLCBtZXNzYWdlLCBkYXRhKSB7XG5cbiAgICBpZiAoIU51bWJlci5pc0ludGVnZXIoY29kZSkpIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdcImNvZGVcIiBtdXN0IGJlIGFuIGludGVnZXIuJ1xuICAgIClcbiAgICBpZiAoIW1lc3NhZ2UgfHwgdHlwZW9mIG1lc3NhZ2UgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnXCJtZXNzYWdlXCIgbXVzdCBiZSBhIG5vbmVtcHR5IHN0cmluZy4nXG4gICAgKVxuXG4gICAgc3VwZXIobWVzc2FnZSlcbiAgICB0aGlzLmNvZGUgPSBjb2RlXG4gICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkgdGhpcy5kYXRhID0gZGF0YVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwbGFpbiBvYmplY3Qgd2l0aCBhbGwgcHVibGljIGNsYXNzIHByb3BlcnRpZXMuXG4gICAqIFxuICAgKiBAcmV0dXJucyB7b2JqZWN0fSBUaGUgc2VyaWFsaXplZCBlcnJvci4gXG4gICAqL1xuICBzZXJpYWxpemUoKSB7XG4gICAgY29uc3Qgc2VyaWFsaXplZCA9IHtcbiAgICAgIGNvZGU6IHRoaXMuY29kZSxcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICB9XG4gICAgaWYgKHRoaXMuZGF0YSAhPT0gdW5kZWZpbmVkKSBzZXJpYWxpemVkLmRhdGEgPSB0aGlzLmRhdGFcbiAgICBpZiAodGhpcy5zdGFjaykgc2VyaWFsaXplZC5zdGFjayA9IHRoaXMuc3RhY2tcbiAgICByZXR1cm4gc2VyaWFsaXplZFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgc2VyaWFsaXplZCBlcnJvciwgb21pdHRpbmdcbiAgICogYW55IGNpcmN1bGFyIHJlZmVyZW5jZXMuXG4gICAqIFxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc2VyaWFsaXplZCBlcnJvciBhcyBhIHN0cmluZy5cbiAgICovXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiBzYWZlU3RyaW5naWZ5KFxuICAgICAgdGhpcy5zZXJpYWxpemUoKSxcbiAgICAgIHN0cmluZ2lmeVJlcGxhY2VyLFxuICAgICAgMlxuICAgIClcbiAgfVxufVxuXG4vKipcbiAqIEBjbGFzcyBFdGhlcmV1bVJwY0Vycm9yXG4gKiBFcnJvciBzdWJjbGFzcyBpbXBsZW1lbnRpbmcgRXRoZXJldW0gUHJvdmlkZXIgZXJyb3JzIHBlciBFSVAgMTE5My5cbiAqIFBlcm1pdHMgaW50ZWdlciBlcnJvciBjb2RlcyBpbiB0aGUgWyAxMDAwIDw9IDQ5OTkgXSByYW5nZS5cbiAqL1xuY2xhc3MgRXRoZXJldW1Qcm92aWRlckVycm9yIGV4dGVuZHMgRXRoZXJldW1ScGNFcnJvciB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYW4gRXRoZXJldW0gSlNPTiBSUEMgZXJyb3IuXG4gICAqIFxuICAgKiBAcGFyYW0ge251bWJlcn0gY29kZSAtIFRoZSBpbnRlZ2VyIGVycm9yIGNvZGUsIGluIHRoZSBbIDEwMDAgPD0gNDk5OSBdIHJhbmdlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIFRoZSBzdHJpbmcgbWVzc2FnZS5cbiAgICogQHBhcmFtIHthbnl9IFtkYXRhXSAtIFRoZSBlcnJvciBkYXRhLlxuICAgKi9cbiAgY29uc3RydWN0b3IoY29kZSwgbWVzc2FnZSwgZGF0YSkge1xuICAgIGlmICghaXNWYWxpZEV0aFByb3ZpZGVyQ29kZShjb2RlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnXCJjb2RlXCIgbXVzdCBiZSBhbiBpbnRlZ2VyIHN1Y2ggdGhhdDogMTAwMCA8PSBjb2RlIDw9IDQ5OTknXG4gICAgICApXG4gICAgfVxuICAgIHN1cGVyKGNvZGUsIG1lc3NhZ2UsIGRhdGEpXG4gIH1cbn1cblxuLy8gSW50ZXJuYWxcblxuZnVuY3Rpb24gaXNWYWxpZEV0aFByb3ZpZGVyQ29kZShjb2RlKSB7XG4gIHJldHVybiBOdW1iZXIuaXNJbnRlZ2VyKGNvZGUpICYmIGNvZGUgPj0gMTAwMCAmJiBjb2RlIDw9IDQ5OTlcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5UmVwbGFjZXIoXywgdmFsdWUpIHtcbiAgaWYgKHZhbHVlID09PSAnW0NpcmN1bGFyXScpIHtcbiAgICByZXR1cm5cbiAgfVxuICByZXR1cm4gdmFsdWVcbn1cblxuLy8gRXhwb3J0c1xuXG5tb2R1bGUuZXhwb3J0cyA9ICB7XG4gIEV0aGVyZXVtUnBjRXJyb3IsXG4gIEV0aGVyZXVtUHJvdmlkZXJFcnJvclxufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcInJwY1wiOiB7XG4gICAgXCJpbnZhbGlkSW5wdXRcIjogLTMyMDAwLFxuICAgIFwicmVzb3VyY2VOb3RGb3VuZFwiOiAtMzIwMDEsXG4gICAgXCJyZXNvdXJjZVVuYXZhaWxhYmxlXCI6IC0zMjAwMixcbiAgICBcInRyYW5zYWN0aW9uUmVqZWN0ZWRcIjogLTMyMDAzLFxuICAgIFwibWV0aG9kTm90U3VwcG9ydGVkXCI6IC0zMjAwNCxcbiAgICBcInBhcnNlXCI6IC0zMjcwMCxcbiAgICBcImludmFsaWRSZXF1ZXN0XCI6IC0zMjYwMCxcbiAgICBcIm1ldGhvZE5vdEZvdW5kXCI6IC0zMjYwMSxcbiAgICBcImludmFsaWRQYXJhbXNcIjogLTMyNjAyLFxuICAgIFwiaW50ZXJuYWxcIjogLTMyNjAzXG4gIH0sXG4gIFwicHJvdmlkZXJcIjoge1xuICAgIFwidXNlclJlamVjdGVkUmVxdWVzdFwiOiA0MDAxLFxuICAgIFwidW5hdXRob3JpemVkXCI6IDQxMDAsXG4gICAgXCJ1bnN1cHBvcnRlZE1ldGhvZFwiOiA0MjAwXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCItMzI3MDBcIjoge1xuICAgIFwic3RhbmRhcmRcIjogXCJKU09OIFJQQyAyLjBcIixcbiAgICBcIm1lc3NhZ2VcIjogXCJJbnZhbGlkIEpTT04gd2FzIHJlY2VpdmVkIGJ5IHRoZSBzZXJ2ZXIuIEFuIGVycm9yIG9jY3VycmVkIG9uIHRoZSBzZXJ2ZXIgd2hpbGUgcGFyc2luZyB0aGUgSlNPTiB0ZXh0LlwiXG4gIH0sXG4gIFwiLTMyNjAwXCI6IHtcbiAgICBcInN0YW5kYXJkXCI6IFwiSlNPTiBSUEMgMi4wXCIsXG4gICAgXCJtZXNzYWdlXCI6IFwiVGhlIEpTT04gc2VudCBpcyBub3QgYSB2YWxpZCBSZXF1ZXN0IG9iamVjdC5cIlxuICB9LFxuICBcIi0zMjYwMVwiOiB7XG4gICAgXCJzdGFuZGFyZFwiOiBcIkpTT04gUlBDIDIuMFwiLFxuICAgIFwibWVzc2FnZVwiOiBcIlRoZSBtZXRob2QgZG9lcyBub3QgZXhpc3QgLyBpcyBub3QgYXZhaWxhYmxlLlwiXG4gIH0sXG4gIFwiLTMyNjAyXCI6IHtcbiAgICBcInN0YW5kYXJkXCI6IFwiSlNPTiBSUEMgMi4wXCIsXG4gICAgXCJtZXNzYWdlXCI6IFwiSW52YWxpZCBtZXRob2QgcGFyYW1ldGVyKHMpLlwiXG4gIH0sXG4gIFwiLTMyNjAzXCI6IHtcbiAgICBcInN0YW5kYXJkXCI6IFwiSlNPTiBSUEMgMi4wXCIsXG4gICAgXCJtZXNzYWdlXCI6IFwiSW50ZXJuYWwgSlNPTi1SUEMgZXJyb3IuXCJcbiAgfSxcbiAgXCItMzIwMDBcIjoge1xuICAgIFwic3RhbmRhcmRcIjogXCJFSVAgMTQ3NFwiLFxuICAgIFwibWVzc2FnZVwiOiBcIkludmFsaWQgaW5wdXQuXCJcbiAgfSxcbiAgXCItMzIwMDFcIjoge1xuICAgIFwic3RhbmRhcmRcIjogXCJFSVAgMTQ3NFwiLFxuICAgIFwibWVzc2FnZVwiOiBcIlJlc291cmNlIG5vdCBmb3VuZC5cIlxuICB9LFxuICBcIi0zMjAwMlwiOiB7XG4gICAgXCJzdGFuZGFyZFwiOiBcIkVJUCAxNDc0XCIsXG4gICAgXCJtZXNzYWdlXCI6IFwiUmVzb3VyY2UgdW5hdmFpbGFibGUuXCJcbiAgfSxcbiAgXCItMzIwMDNcIjoge1xuICAgIFwic3RhbmRhcmRcIjogXCJFSVAgMTQ3NFwiLFxuICAgIFwibWVzc2FnZVwiOiBcIlRyYW5zYWN0aW9uIHJlamVjdGVkLlwiXG4gIH0sXG4gIFwiLTMyMDA0XCI6IHtcbiAgICBcInN0YW5kYXJkXCI6IFwiRUlQIDE0NzRcIixcbiAgICBcIm1lc3NhZ2VcIjogXCJNZXRob2Qgbm90IHN1cHBvcnRlZC5cIlxuICB9LFxuICBcIjQwMDFcIjoge1xuICAgIFwic3RhbmRhcmRcIjogXCJFSVAgMTE5M1wiLFxuICAgIFwibWVzc2FnZVwiOiBcIlVzZXIgcmVqZWN0ZWQgdGhlIHJlcXVlc3QuXCJcbiAgfSxcbiAgXCI0MTAwXCI6IHtcbiAgICBcInN0YW5kYXJkXCI6IFwiRUlQIDExOTNcIixcbiAgICBcIm1lc3NhZ2VcIjogXCJUaGUgcmVxdWVzdGVkIGFjY291bnQgYW5kL29yIG1ldGhvZCBoYXMgbm90IGJlZW4gYXV0aG9yaXplZCBieSB0aGUgdXNlci5cIlxuICB9LFxuICBcIjQyMDBcIjoge1xuICAgIFwic3RhbmRhcmRcIjogXCJFSVAgMTE5M1wiLFxuICAgIFwibWVzc2FnZVwiOiBcIlRoZSByZXF1ZXN0ZWQgbWV0aG9kIGlzIG5vdCBzdXBwb3J0ZWQgYnkgdGhpcyBFdGhlcmV1bSBwcm92aWRlci5cIlxuICB9XG59XG4iLCJcbmNvbnN0IHsgRXRoZXJldW1ScGNFcnJvciwgRXRoZXJldW1Qcm92aWRlckVycm9yIH0gPSByZXF1aXJlKCcuL2NsYXNzZXMnKVxuY29uc3QgeyBnZXRNZXNzYWdlRnJvbUNvZGUgfSA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuY29uc3QgRVJST1JfQ09ERVMgPSByZXF1aXJlKCcuL2Vycm9yQ29kZXMuanNvbicpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBycGM6IHtcbiAgICAvKipcbiAgICAgKiBHZXQgYSBKU09OIFJQQyAyLjAgUGFyc2UgZXJyb3IuXG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R8c3RyaW5nfSBbb3B0c10gLSBPcHRpb25zIG9iamVjdCBvciBlcnJvciBtZXNzYWdlIHN0cmluZ1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0cy5tZXNzYWdlXSAtIFRoZSBlcnJvciBtZXNzYWdlXG4gICAgICogQHBhcmFtIHthbnl9IFtvcHRzLmRhdGFdIC0gRXJyb3IgZGF0YVxuICAgICAqIEByZXR1cm5zIHtFdGhlcmV1bVJwY0Vycm9yfSAtIFRoZSBlcnJvclxuICAgICAqL1xuICAgIHBhcnNlOiAob3B0cykgPT4gZ2V0RXRoSnNvblJwY0Vycm9yKFxuICAgICAgRVJST1JfQ09ERVMucnBjLnBhcnNlLCBvcHRzXG4gICAgKSxcblxuICAgIC8qKlxuICAgICAqIEdldCBhIEpTT04gUlBDIDIuMCBJbnZhbGlkIFJlcXVlc3QgZXJyb3IuXG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R8c3RyaW5nfSBbb3B0c10gLSBPcHRpb25zIG9iamVjdCBvciBlcnJvciBtZXNzYWdlIHN0cmluZ1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0cy5tZXNzYWdlXSAtIFRoZSBlcnJvciBtZXNzYWdlXG4gICAgICogQHBhcmFtIHthbnl9IFtvcHRzLmRhdGFdIC0gRXJyb3IgZGF0YVxuICAgICAqIEByZXR1cm5zIHtFdGhlcmV1bVJwY0Vycm9yfSAtIFRoZSBlcnJvclxuICAgICAqL1xuICAgIGludmFsaWRSZXF1ZXN0OiAob3B0cykgPT4gZ2V0RXRoSnNvblJwY0Vycm9yKFxuICAgICAgRVJST1JfQ09ERVMucnBjLmludmFsaWRSZXF1ZXN0LCBvcHRzXG4gICAgKSxcblxuICAgIC8qKlxuICAgICAqIEdldCBhIEpTT04gUlBDIDIuMCBJbnZhbGlkIFBhcmFtcyBlcnJvci5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge09iamVjdHxzdHJpbmd9IFtvcHRzXSAtIE9wdGlvbnMgb2JqZWN0IG9yIGVycm9yIG1lc3NhZ2Ugc3RyaW5nXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRzLm1lc3NhZ2VdIC0gVGhlIGVycm9yIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0ge2FueX0gW29wdHMuZGF0YV0gLSBFcnJvciBkYXRhXG4gICAgICogQHJldHVybnMge0V0aGVyZXVtUnBjRXJyb3J9IC0gVGhlIGVycm9yXG4gICAgICovXG4gICAgaW52YWxpZFBhcmFtczogKG9wdHMpID0+IGdldEV0aEpzb25ScGNFcnJvcihcbiAgICAgIEVSUk9SX0NPREVTLnJwYy5pbnZhbGlkUGFyYW1zLCBvcHRzXG4gICAgKSxcblxuICAgIC8qKlxuICAgICAqIEdldCBhIEpTT04gUlBDIDIuMCBNZXRob2QgTm90IEZvdW5kIGVycm9yLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fHN0cmluZ30gW29wdHNdIC0gT3B0aW9ucyBvYmplY3Qgb3IgZXJyb3IgbWVzc2FnZSBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdHMubWVzc2FnZV0gLSBUaGUgZXJyb3IgbWVzc2FnZVxuICAgICAqIEBwYXJhbSB7YW55fSBbb3B0cy5kYXRhXSAtIEVycm9yIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7RXRoZXJldW1ScGNFcnJvcn0gLSBUaGUgZXJyb3JcbiAgICAgKi9cbiAgICBtZXRob2ROb3RGb3VuZDogKG9wdHMpID0+IGdldEV0aEpzb25ScGNFcnJvcihcbiAgICAgIEVSUk9SX0NPREVTLnJwYy5tZXRob2ROb3RGb3VuZCwgb3B0c1xuICAgICksXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYSBKU09OIFJQQyAyLjAgSW50ZXJuYWwgZXJyb3IuXG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R8c3RyaW5nfSBbb3B0c10gLSBPcHRpb25zIG9iamVjdCBvciBlcnJvciBtZXNzYWdlIHN0cmluZ1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0cy5tZXNzYWdlXSAtIFRoZSBlcnJvciBtZXNzYWdlXG4gICAgICogQHBhcmFtIHthbnl9IFtvcHRzLmRhdGFdIC0gRXJyb3IgZGF0YVxuICAgICAqIEByZXR1cm5zIHtFdGhlcmV1bVJwY0Vycm9yfSAtIFRoZSBlcnJvclxuICAgICAqL1xuICAgIGludGVybmFsOiAob3B0cykgPT4gZ2V0RXRoSnNvblJwY0Vycm9yKFxuICAgICAgRVJST1JfQ09ERVMucnBjLmludGVybmFsLCBvcHRzXG4gICAgKSxcblxuICAgIC8qKlxuICAgICAqIEdldCBhIEpTT04gUlBDIDIuMCBTZXJ2ZXIgZXJyb3IuXG4gICAgICogUGVybWl0cyBpbnRlZ2VyIGVycm9yIGNvZGVzIGluIHRoZSBbIC0zMjA5OSA8PSAtMzIwMDUgXSByYW5nZS5cbiAgICAgKiBDb2RlcyAtMzIwMDAgdGhyb3VnaCAtMzIwMDQgYXJlIHJlc2VydmVkIGJ5IEVJUCAxNDc0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fHN0cmluZ30gb3B0cyAtIE9wdGlvbnMgb2JqZWN0XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9wdHMuY29kZSAtIFRoZSBlcnJvciBjb2RlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRzLm1lc3NhZ2VdIC0gVGhlIGVycm9yIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0ge2FueX0gW29wdHMuZGF0YV0gLSBFcnJvciBkYXRhXG4gICAgICogQHJldHVybnMge0V0aGVyZXVtUnBjRXJyb3J9IC0gVGhlIGVycm9yXG4gICAgICovXG4gICAgc2VydmVyOiAob3B0cykgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBvcHRzICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KG9wdHMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRXRoZXJldW0gUlBDIFNlcnZlciBlcnJvcnMgbXVzdCBwcm92aWRlIHNpbmdsZSBvYmplY3QgYXJndW1lbnQuJylcbiAgICAgIH1cbiAgICAgIGNvbnN0IHsgY29kZSB9ID0gb3B0c1xuICAgICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGNvZGUpIHx8IGNvZGUgPiAtMzIwMDUgfHwgY29kZSA8IC0zMjA5OSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ1wiY29kZVwiIG11c3QgYmUgYW4gaW50ZWdlciBzdWNoIHRoYXQ6IC0zMjA5OSA8PSBjb2RlIDw9IC0zMjAwNSdcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGdldEV0aEpzb25ScGNFcnJvcihjb2RlLCBvcHRzKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYW4gRXRoZXJldW0gSlNPTiBSUEMgSW52YWxpZCBJbnB1dCBlcnJvci5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge09iamVjdHxzdHJpbmd9IFtvcHRzXSAtIE9wdGlvbnMgb2JqZWN0IG9yIGVycm9yIG1lc3NhZ2Ugc3RyaW5nXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRzLm1lc3NhZ2VdIC0gVGhlIGVycm9yIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0ge2FueX0gW29wdHMuZGF0YV0gLSBFcnJvciBkYXRhXG4gICAgICogQHJldHVybnMge0V0aGVyZXVtUnBjRXJyb3J9IC0gVGhlIGVycm9yXG4gICAgICovXG4gICAgaW52YWxpZElucHV0OiAob3B0cykgPT4gZ2V0RXRoSnNvblJwY0Vycm9yKFxuICAgICAgRVJST1JfQ09ERVMucnBjLmludmFsaWRJbnB1dCwgb3B0c1xuICAgICksXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYW4gRXRoZXJldW0gSlNPTiBSUEMgUmVzb3VyY2UgTm90IEZvdW5kIGVycm9yLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fHN0cmluZ30gW29wdHNdIC0gT3B0aW9ucyBvYmplY3Qgb3IgZXJyb3IgbWVzc2FnZSBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdHMubWVzc2FnZV0gLSBUaGUgZXJyb3IgbWVzc2FnZVxuICAgICAqIEBwYXJhbSB7YW55fSBbb3B0cy5kYXRhXSAtIEVycm9yIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7RXRoZXJldW1ScGNFcnJvcn0gLSBUaGUgZXJyb3JcbiAgICAgKi9cbiAgICByZXNvdXJjZU5vdEZvdW5kOiAob3B0cykgPT4gZ2V0RXRoSnNvblJwY0Vycm9yKFxuICAgICAgRVJST1JfQ09ERVMucnBjLnJlc291cmNlTm90Rm91bmQsIG9wdHNcbiAgICApLFxuXG4gICAgLyoqXG4gICAgICogR2V0IGFuIEV0aGVyZXVtIEpTT04gUlBDIFJlc291cmNlIFVuYXZhaWxhYmxlIGVycm9yLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fHN0cmluZ30gW29wdHNdIC0gT3B0aW9ucyBvYmplY3Qgb3IgZXJyb3IgbWVzc2FnZSBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdHMubWVzc2FnZV0gLSBUaGUgZXJyb3IgbWVzc2FnZVxuICAgICAqIEBwYXJhbSB7YW55fSBbb3B0cy5kYXRhXSAtIEVycm9yIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7RXRoZXJldW1ScGNFcnJvcn0gLSBUaGUgZXJyb3JcbiAgICAgKi9cbiAgICByZXNvdXJjZVVuYXZhaWxhYmxlOiAob3B0cykgPT4gZ2V0RXRoSnNvblJwY0Vycm9yKFxuICAgICAgRVJST1JfQ09ERVMucnBjLnJlc291cmNlVW5hdmFpbGFibGUsIG9wdHNcbiAgICApLFxuXG4gICAgLyoqXG4gICAgICogR2V0IGFuIEV0aGVyZXVtIEpTT04gUlBDIFRyYW5zYWN0aW9uIFJlamVjdGVkIGVycm9yLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fHN0cmluZ30gW29wdHNdIC0gT3B0aW9ucyBvYmplY3Qgb3IgZXJyb3IgbWVzc2FnZSBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdHMubWVzc2FnZV0gLSBUaGUgZXJyb3IgbWVzc2FnZVxuICAgICAqIEBwYXJhbSB7YW55fSBbb3B0cy5kYXRhXSAtIEVycm9yIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7RXRoZXJldW1ScGNFcnJvcn0gLSBUaGUgZXJyb3JcbiAgICAgKi9cbiAgICB0cmFuc2FjdGlvblJlamVjdGVkOiAob3B0cykgPT4gZ2V0RXRoSnNvblJwY0Vycm9yKFxuICAgICAgRVJST1JfQ09ERVMucnBjLnRyYW5zYWN0aW9uUmVqZWN0ZWQsIG9wdHNcbiAgICApLFxuXG4gICAgLyoqXG4gICAgICogR2V0IGFuIEV0aGVyZXVtIEpTT04gUlBDIE1ldGhvZCBOb3QgU3VwcG9ydGVkIGVycm9yLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fHN0cmluZ30gW29wdHNdIC0gT3B0aW9ucyBvYmplY3Qgb3IgZXJyb3IgbWVzc2FnZSBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdHMubWVzc2FnZV0gLSBUaGUgZXJyb3IgbWVzc2FnZVxuICAgICAqIEBwYXJhbSB7YW55fSBbb3B0cy5kYXRhXSAtIEVycm9yIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7RXRoZXJldW1ScGNFcnJvcn0gLSBUaGUgZXJyb3JcbiAgICAgKi9cbiAgICBtZXRob2ROb3RTdXBwb3J0ZWQ6IChvcHRzKSA9PiBnZXRFdGhKc29uUnBjRXJyb3IoXG4gICAgICBFUlJPUl9DT0RFUy5ycGMubWV0aG9kTm90U3VwcG9ydGVkLCBvcHRzXG4gICAgKSxcbiAgfSxcblxuICBwcm92aWRlcjoge1xuICAgIC8qKlxuICAgICAqIEdldCBhbiBFdGhlcmV1bSBQcm92aWRlciBVc2VyIFJlamVjdGVkIFJlcXVlc3QgZXJyb3IuXG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R8c3RyaW5nfSBbb3B0c10gLSBPcHRpb25zIG9iamVjdCBvciBlcnJvciBtZXNzYWdlIHN0cmluZ1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0cy5tZXNzYWdlXSAtIFRoZSBlcnJvciBtZXNzYWdlXG4gICAgICogQHBhcmFtIHthbnl9IFtvcHRzLmRhdGFdIC0gRXJyb3IgZGF0YVxuICAgICAqIEByZXR1cm5zIHtFdGhlcmV1bVByb3ZpZGVyRXJyb3J9IC0gVGhlIGVycm9yXG4gICAgICovXG4gICAgdXNlclJlamVjdGVkUmVxdWVzdDogKG9wdHMpID0+IHtcbiAgICAgIHJldHVybiBnZXRFdGhQcm92aWRlckVycm9yKFxuICAgICAgICBFUlJPUl9DT0RFUy5wcm92aWRlci51c2VyUmVqZWN0ZWRSZXF1ZXN0LCBvcHRzXG4gICAgICApXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBhbiBFdGhlcmV1bSBQcm92aWRlciBVbmF1dGhvcml6ZWQgZXJyb3IuXG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R8c3RyaW5nfSBbb3B0c10gLSBPcHRpb25zIG9iamVjdCBvciBlcnJvciBtZXNzYWdlIHN0cmluZ1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0cy5tZXNzYWdlXSAtIFRoZSBlcnJvciBtZXNzYWdlXG4gICAgICogQHBhcmFtIHthbnl9IFtvcHRzLmRhdGFdIC0gRXJyb3IgZGF0YVxuICAgICAqIEByZXR1cm5zIHtFdGhlcmV1bVByb3ZpZGVyRXJyb3J9IC0gVGhlIGVycm9yXG4gICAgICovXG4gICAgdW5hdXRob3JpemVkOiAob3B0cykgPT4ge1xuICAgICAgcmV0dXJuIGdldEV0aFByb3ZpZGVyRXJyb3IoXG4gICAgICAgIEVSUk9SX0NPREVTLnByb3ZpZGVyLnVuYXV0aG9yaXplZCwgb3B0c1xuICAgICAgKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYW4gRXRoZXJldW0gUHJvdmlkZXIgVW5zdXBwb3J0ZWQgTWV0aG9kIGVycm9yLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fHN0cmluZ30gW29wdHNdIC0gT3B0aW9ucyBvYmplY3Qgb3IgZXJyb3IgbWVzc2FnZSBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdHMubWVzc2FnZV0gLSBUaGUgZXJyb3IgbWVzc2FnZVxuICAgICAqIEBwYXJhbSB7YW55fSBbb3B0cy5kYXRhXSAtIEVycm9yIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7RXRoZXJldW1Qcm92aWRlckVycm9yfSAtIFRoZSBlcnJvclxuICAgICAqL1xuICAgIHVuc3VwcG9ydGVkTWV0aG9kOiAob3B0cykgPT4ge1xuICAgICAgcmV0dXJuIGdldEV0aFByb3ZpZGVyRXJyb3IoXG4gICAgICAgIEVSUk9SX0NPREVTLnByb3ZpZGVyLnVuc3VwcG9ydGVkTWV0aG9kLCBvcHRzXG4gICAgICApXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBhIGN1c3RvbSBFdGhlcmV1bSBQcm92aWRlciBlcnJvci5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge09iamVjdHxzdHJpbmd9IG9wdHMgLSBPcHRpb25zIG9iamVjdFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvcHRzLmNvZGUgLSBUaGUgZXJyb3IgY29kZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRzLm1lc3NhZ2UgLSBUaGUgZXJyb3IgbWVzc2FnZVxuICAgICAqIEBwYXJhbSB7YW55fSBbb3B0cy5kYXRhXSAtIEVycm9yIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7RXRoZXJldW1Qcm92aWRlckVycm9yfSAtIFRoZSBlcnJvclxuICAgICAqL1xuICAgIGN1c3RvbTogKG9wdHMpID0+IHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0cyAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShvcHRzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V0aGVyZXVtIFByb3ZpZGVyIGN1c3RvbSBlcnJvcnMgbXVzdCBwcm92aWRlIHNpbmdsZSBvYmplY3QgYXJndW1lbnQuJylcbiAgICAgIH1cbiAgICAgIGNvbnN0IHsgY29kZSwgbWVzc2FnZSwgZGF0YSB9ID0gb3B0c1xuICAgICAgaWYgKCFtZXNzYWdlIHx8IHR5cGVvZiBtZXNzYWdlICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnXCJtZXNzYWdlXCIgbXVzdCBiZSBhIG5vbmVtcHR5IHN0cmluZydcbiAgICAgIClcbiAgICAgIHJldHVybiBuZXcgRXRoZXJldW1Qcm92aWRlckVycm9yKGNvZGUsIG1lc3NhZ2UsIGRhdGEpXG4gICAgfSxcbiAgfSxcbn1cblxuLy8gSW50ZXJuYWxcblxuZnVuY3Rpb24gZ2V0RXRoSnNvblJwY0Vycm9yKGNvZGUsIG9wdHMpIHtcbiAgY29uc3QgWyBtZXNzYWdlLCBkYXRhIF0gPSB2YWxpZGF0ZU9wdHMob3B0cylcbiAgcmV0dXJuIG5ldyBFdGhlcmV1bVJwY0Vycm9yKFxuICAgIGNvZGUsXG4gICAgbWVzc2FnZSB8fCBnZXRNZXNzYWdlRnJvbUNvZGUoY29kZSksXG4gICAgZGF0YVxuICApXG59XG5cbmZ1bmN0aW9uIGdldEV0aFByb3ZpZGVyRXJyb3IoY29kZSwgb3B0cykge1xuICBjb25zdCBbIG1lc3NhZ2UsIGRhdGEgXSA9IHZhbGlkYXRlT3B0cyhvcHRzKVxuICByZXR1cm4gbmV3IEV0aGVyZXVtUHJvdmlkZXJFcnJvcihcbiAgICBjb2RlLFxuICAgIG1lc3NhZ2UgfHwgZ2V0TWVzc2FnZUZyb21Db2RlKGNvZGUpLFxuICAgIGRhdGFcbiAgKVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZU9wdHMgKG9wdHMpIHtcbiAgbGV0IG1lc3NhZ2UsIGRhdGFcbiAgaWYgKG9wdHMpIHtcbiAgICBpZiAodHlwZW9mIG9wdHMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBtZXNzYWdlID0gb3B0c1xuICAgIH0gZWxzZSBpZiAob3B0cyAmJiB0eXBlb2Ygb3B0cyA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkob3B0cykpIHtcbiAgICAgIG1lc3NhZ2UgPSBvcHRzLm1lc3NhZ2VcbiAgICAgIGRhdGEgPSBvcHRzLmRhdGFcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFsgbWVzc2FnZSwgZGF0YSBdXG59XG4iLCJcbmNvbnN0IGVycm9yVmFsdWVzID0gcmVxdWlyZSgnLi9lcnJvclZhbHVlcy5qc29uJylcbmNvbnN0IEZBTExCQUNLX0VSUk9SX0NPREUgPSByZXF1aXJlKCcuL2Vycm9yQ29kZXMuanNvbicpLnJwYy5pbnRlcm5hbFxuY29uc3QgeyBFdGhlcmV1bVJwY0Vycm9yIH0gPSByZXF1aXJlKCcuL2NsYXNzZXMnKVxuXG5jb25zdCBKU09OX1JQQ19TRVJWRVJfRVJST1JfTUVTU0FHRSA9ICdVbnNwZWNpZmllZCBzZXJ2ZXIgZXJyb3IuJ1xuXG5jb25zdCBGQUxMQkFDS19NRVNTQUdFID0gJ1Vuc3BlY2lmaWVkIGVycm9yIG1lc3NhZ2UuIFRoaXMgaXMgYSBidWcsIHBsZWFzZSByZXBvcnQgaXQuJ1xuXG5jb25zdCBGQUxMQkFDS19FUlJPUiA9IHtcbiAgY29kZTogRkFMTEJBQ0tfRVJST1JfQ09ERSxcbiAgbWVzc2FnZTogZ2V0TWVzc2FnZUZyb21Db2RlKEZBTExCQUNLX0VSUk9SX0NPREUpXG59XG5cbi8qKlxuICogR2V0cyB0aGUgbWVzc2FnZSBmb3IgYSBnaXZlbiBjb2RlLCBvciBhIGZhbGxiYWNrIG1lc3NhZ2UgaWYgdGhlIGNvZGUgaGFzXG4gKiBubyBjb3JyZXNwb25kaW5nIG1lc3NhZ2UuXG4gKiBcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb2RlIC0gVGhlIGludGVnZXIgZXJyb3IgY29kZVxuICogQHBhcmFtIHtzdHJpbmd9IGZhbGxiYWNrTWVzc2FnZSAtIFRoZSBmYWxsYmFjayBtZXNzYWdlXG4gKiBAcmV0dXJuIHtzdHJpbmd9IC0gVGhlIGNvcnJlc3BvbmRpbmcgbWVzc2FnZSBvciB0aGUgZmFsbGJhY2sgbWVzc2FnZVxuICovXG5mdW5jdGlvbiBnZXRNZXNzYWdlRnJvbUNvZGUoY29kZSwgZmFsbGJhY2tNZXNzYWdlID0gRkFMTEJBQ0tfTUVTU0FHRSkge1xuXG4gIGlmIChOdW1iZXIuaXNJbnRlZ2VyKGNvZGUpKSB7XG5cbiAgICBjb25zdCBjb2RlU3RyaW5nID0gY29kZS50b1N0cmluZygpXG4gICAgaWYgKGVycm9yVmFsdWVzW2NvZGVTdHJpbmddKSByZXR1cm4gZXJyb3JWYWx1ZXNbY29kZVN0cmluZ10ubWVzc2FnZVxuXG4gICAgaWYgKGlzSnNvblJwY1NlcnZlckVycm9yKGNvZGUpKSByZXR1cm4gSlNPTl9SUENfU0VSVkVSX0VSUk9SX01FU1NBR0VcblxuICAgIC8vIFRPRE86IGFsbG93IHZhbGlkIGNvZGVzIGFuZCBtZXNzYWdlcyB0byBiZSBleHRlbmRlZFxuICAgIC8vIC8vIEVJUCAxMTkzIFN0YXR1cyBDb2Rlc1xuICAgIC8vIGlmIChjb2RlID49IDQwMDAgJiYgY29kZSA8PSA0OTk5KSByZXR1cm4gU29tZXRoaW5nP1xuICB9XG4gIHJldHVybiBmYWxsYmFja01lc3NhZ2Vcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIGNvZGUgaXMgdmFsaWQuXG4gKiBBIGNvZGUgaXMgb25seSB2YWxpZCBpZiBpdCBoYXMgYSBtZXNzYWdlLlxuICogXG4gKiBAcGFyYW0ge251bWJlcn0gY29kZSAtIFRoZSBjb2RlIHRvIGNoZWNrXG4gKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBjb2RlIGlzIHZhbGlkLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmZ1bmN0aW9uIGlzVmFsaWRDb2RlKGNvZGUpIHtcblxuICBpZiAoIU51bWJlci5pc0ludGVnZXIoY29kZSkpIHJldHVybiBmYWxzZVxuXG4gIGNvbnN0IGNvZGVTdHJpbmcgPSBjb2RlLnRvU3RyaW5nKClcbiAgaWYgKGVycm9yVmFsdWVzW2NvZGVTdHJpbmddKSByZXR1cm4gdHJ1ZVxuXG4gIGlmIChpc0pzb25ScGNTZXJ2ZXJFcnJvcihjb2RlKSkgcmV0dXJuIHRydWVcblxuICAvLyBUT0RPOiBhbGxvdyB2YWxpZCBjb2RlcyBhbmQgbWVzc2FnZXMgdG8gYmUgZXh0ZW5kZWRcbiAgLy8gLy8gRUlQIDExOTMgU3RhdHVzIENvZGVzXG4gIC8vIGlmIChjb2RlID49IDQwMDAgJiYgY29kZSA8PSA0OTk5KSByZXR1cm4gdHJ1ZVxuXG4gIHJldHVybiBmYWxzZVxufVxuXG4vKipcbiAqIFNlcmlhbGl6ZXMgdGhlIGdpdmVuIGVycm9yIHRvIGFuIEV0aGVyZXVtIEpTT04gUlBDLWNvbXBhdGlibGUgZXJyb3Igb2JqZWN0LlxuICogTWVyZWx5IGNvcGllcyB0aGUgZ2l2ZW4gZXJyb3IncyB2YWx1ZXMgaWYgaXQgaXMgYWxyZWFkeSBjb21wYXRpYmxlLlxuICogSWYgdGhlIGdpdmVuIGVycm9yIGlzIG5vdCBmdWxseSBjb21wYXRpYmxlLCBpdCB3aWxsIGJlIHByZXNlcnZlZCBvbiB0aGVcbiAqIHJldHVybmVkIG9iamVjdCdzIGRhdGEub3JpZ2luYWxFcnJvciBwcm9wZXJ0eS5cbiAqIEFkZHMgYSAnc3RhY2snIHByb3BlcnR5IGlmIGl0IGV4aXN0cyBvbiB0aGUgZ2l2ZW4gZXJyb3IuXG4gKlxuICogQHBhcmFtIHthbnl9IGVycm9yIC0gVGhlIGVycm9yIHRvIHNlcmlhbGl6ZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSBmYWxsYmFja0Vycm9yIC0gVGhlIGN1c3RvbSBmYWxsYmFjayBlcnJvciB2YWx1ZXMgaWYgdGhlXG4gKiBnaXZlbiBlcnJvciBpcyBpbnZhbGlkLlxuICogQHJldHVybiB7b2JqZWN0fSBBIHN0YW5kYXJkaXplZCBlcnJvciBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIHNlcmlhbGl6ZUVycm9yIChlcnJvciwgZmFsbGJhY2tFcnJvciA9IEZBTExCQUNLX0VSUk9SKSB7XG5cbiAgaWYgKFxuICAgICFmYWxsYmFja0Vycm9yIHx8IFxuICAgICFOdW1iZXIuaXNJbnRlZ2VyKGZhbGxiYWNrRXJyb3IuY29kZSkgfHxcbiAgICB0eXBlb2YgZmFsbGJhY2tFcnJvci5tZXNzYWdlICE9PSAnc3RyaW5nJ1xuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnZmFsbGJhY2tFcnJvciBtdXN0IGNvbnRhaW4gaW50ZWdlciBudW1iZXIgY29kZSBhbmQgc3RyaW5nIG1lc3NhZ2UuJ1xuICAgIClcbiAgfVxuXG4gIGlmICh0eXBlb2YgZXJyb3IgPT09ICdvYmplY3QnICYmIGVycm9yIGluc3RhbmNlb2YgRXRoZXJldW1ScGNFcnJvcikge1xuICAgIHJldHVybiBlcnJvci5zZXJpYWxpemUoKVxuICB9XG5cbiAgY29uc3Qgc2VyaWFsaXplZCA9IHt9XG5cbiAgaWYgKGVycm9yICYmIGlzVmFsaWRDb2RlKGVycm9yLmNvZGUpKSB7XG5cbiAgICBzZXJpYWxpemVkLmNvZGUgPSBlcnJvci5jb2RlXG5cbiAgICBpZiAoZXJyb3IubWVzc2FnZSAmJiB0eXBlb2YgZXJyb3IubWVzc2FnZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHNlcmlhbGl6ZWQubWVzc2FnZSA9IGVycm9yLm1lc3NhZ2VcbiAgICAgIGlmIChlcnJvci5oYXNPd25Qcm9wZXJ0eSgnZGF0YScpKSBzZXJpYWxpemVkLmRhdGEgPSBlcnJvci5kYXRhXG4gICAgfSBlbHNlIHtcbiAgICAgIHNlcmlhbGl6ZWQubWVzc2FnZSA9IGdldE1lc3NhZ2VGcm9tQ29kZShzZXJpYWxpemVkLmNvZGUpXG4gICAgICBzZXJpYWxpemVkLmRhdGEgPSB7IG9yaWdpbmFsRXJyb3I6IGFzc2lnbk9yaWdpbmFsRXJyb3IoZXJyb3IpIH1cbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICBzZXJpYWxpemVkLmNvZGUgPSBmYWxsYmFja0Vycm9yLmNvZGVcbiAgICBzZXJpYWxpemVkLm1lc3NhZ2UgPSAoXG4gICAgICBlcnJvciAmJiBlcnJvci5tZXNzYWdlXG4gICAgICAgID8gZXJyb3IubWVzc2FnZVxuICAgICAgICA6IGZhbGxiYWNrRXJyb3IubWVzc2FnZVxuICAgIClcbiAgICBzZXJpYWxpemVkLmRhdGEgPSB7IG9yaWdpbmFsRXJyb3I6IGFzc2lnbk9yaWdpbmFsRXJyb3IoZXJyb3IpIH1cbiAgfVxuXG4gIGlmIChlcnJvciAmJiBlcnJvci5zdGFjaykgc2VyaWFsaXplZC5zdGFjayA9IGVycm9yLnN0YWNrXG4gIHJldHVybiBzZXJpYWxpemVkXG59XG5cbi8vIEludGVybmFsXG5cbmZ1bmN0aW9uIGlzSnNvblJwY1NlcnZlckVycm9yIChjb2RlKSB7XG4gIHJldHVybiBjb2RlID49IC0zMjA5OSAmJiBjb2RlIDw9IC0zMjAwMFxufVxuXG5mdW5jdGlvbiBhc3NpZ25PcmlnaW5hbEVycm9yIChlcnJvcikge1xuICBpZiAoZXJyb3IgJiYgdHlwZW9mIGVycm9yID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShlcnJvcikpIHtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgZXJyb3IpXG4gIH1cbiAgcmV0dXJuIGVycm9yXG59XG5cbi8vIEV4cG9ydHNcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldE1lc3NhZ2VGcm9tQ29kZSxcbiAgaXNWYWxpZENvZGUsXG4gIHNlcmlhbGl6ZUVycm9yLFxuICBKU09OX1JQQ19TRVJWRVJfRVJST1JfTUVTU0FHRSxcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gc3RyaW5naWZ5XG5zdHJpbmdpZnkuZGVmYXVsdCA9IHN0cmluZ2lmeVxuc3RyaW5naWZ5LnN0YWJsZSA9IGRldGVybWluaXN0aWNTdHJpbmdpZnlcbnN0cmluZ2lmeS5zdGFibGVTdHJpbmdpZnkgPSBkZXRlcm1pbmlzdGljU3RyaW5naWZ5XG5cbnZhciBhcnIgPSBbXVxudmFyIHJlcGxhY2VyU3RhY2sgPSBbXVxuXG4vLyBSZWd1bGFyIHN0cmluZ2lmeVxuZnVuY3Rpb24gc3RyaW5naWZ5IChvYmosIHJlcGxhY2VyLCBzcGFjZXIpIHtcbiAgZGVjaXJjKG9iaiwgJycsIFtdLCB1bmRlZmluZWQpXG4gIHZhciByZXNcbiAgaWYgKHJlcGxhY2VyU3RhY2subGVuZ3RoID09PSAwKSB7XG4gICAgcmVzID0gSlNPTi5zdHJpbmdpZnkob2JqLCByZXBsYWNlciwgc3BhY2VyKVxuICB9IGVsc2Uge1xuICAgIHJlcyA9IEpTT04uc3RyaW5naWZ5KG9iaiwgcmVwbGFjZUdldHRlclZhbHVlcyhyZXBsYWNlciksIHNwYWNlcilcbiAgfVxuICB3aGlsZSAoYXJyLmxlbmd0aCAhPT0gMCkge1xuICAgIHZhciBwYXJ0ID0gYXJyLnBvcCgpXG4gICAgaWYgKHBhcnQubGVuZ3RoID09PSA0KSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocGFydFswXSwgcGFydFsxXSwgcGFydFszXSlcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydFswXVtwYXJ0WzFdXSA9IHBhcnRbMl1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuZnVuY3Rpb24gZGVjaXJjICh2YWwsIGssIHN0YWNrLCBwYXJlbnQpIHtcbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnICYmIHZhbCAhPT0gbnVsbCkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBzdGFjay5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHN0YWNrW2ldID09PSB2YWwpIHtcbiAgICAgICAgdmFyIHByb3BlcnR5RGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocGFyZW50LCBrKVxuICAgICAgICBpZiAocHJvcGVydHlEZXNjcmlwdG9yLmdldCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKHByb3BlcnR5RGVzY3JpcHRvci5jb25maWd1cmFibGUpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwYXJlbnQsIGssIHsgdmFsdWU6ICdbQ2lyY3VsYXJdJyB9KVxuICAgICAgICAgICAgYXJyLnB1c2goW3BhcmVudCwgaywgdmFsLCBwcm9wZXJ0eURlc2NyaXB0b3JdKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXBsYWNlclN0YWNrLnB1c2goW3ZhbCwga10pXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhcmVudFtrXSA9ICdbQ2lyY3VsYXJdJ1xuICAgICAgICAgIGFyci5wdXNoKFtwYXJlbnQsIGssIHZhbF0pXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuICAgIHN0YWNrLnB1c2godmFsKVxuICAgIC8vIE9wdGltaXplIGZvciBBcnJheXMuIEJpZyBhcnJheXMgY291bGQga2lsbCB0aGUgcGVyZm9ybWFuY2Ugb3RoZXJ3aXNlIVxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCB2YWwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGVjaXJjKHZhbFtpXSwgaSwgc3RhY2ssIHZhbClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWwpXG4gICAgICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXVxuICAgICAgICBkZWNpcmModmFsW2tleV0sIGtleSwgc3RhY2ssIHZhbClcbiAgICAgIH1cbiAgICB9XG4gICAgc3RhY2sucG9wKClcbiAgfVxufVxuXG4vLyBTdGFibGUtc3RyaW5naWZ5XG5mdW5jdGlvbiBjb21wYXJlRnVuY3Rpb24gKGEsIGIpIHtcbiAgaWYgKGEgPCBiKSB7XG4gICAgcmV0dXJuIC0xXG4gIH1cbiAgaWYgKGEgPiBiKSB7XG4gICAgcmV0dXJuIDFcbiAgfVxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBkZXRlcm1pbmlzdGljU3RyaW5naWZ5IChvYmosIHJlcGxhY2VyLCBzcGFjZXIpIHtcbiAgdmFyIHRtcCA9IGRldGVybWluaXN0aWNEZWNpcmMob2JqLCAnJywgW10sIHVuZGVmaW5lZCkgfHwgb2JqXG4gIHZhciByZXNcbiAgaWYgKHJlcGxhY2VyU3RhY2subGVuZ3RoID09PSAwKSB7XG4gICAgcmVzID0gSlNPTi5zdHJpbmdpZnkodG1wLCByZXBsYWNlciwgc3BhY2VyKVxuICB9IGVsc2Uge1xuICAgIHJlcyA9IEpTT04uc3RyaW5naWZ5KHRtcCwgcmVwbGFjZUdldHRlclZhbHVlcyhyZXBsYWNlciksIHNwYWNlcilcbiAgfVxuICB3aGlsZSAoYXJyLmxlbmd0aCAhPT0gMCkge1xuICAgIHZhciBwYXJ0ID0gYXJyLnBvcCgpXG4gICAgaWYgKHBhcnQubGVuZ3RoID09PSA0KSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocGFydFswXSwgcGFydFsxXSwgcGFydFszXSlcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydFswXVtwYXJ0WzFdXSA9IHBhcnRbMl1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5mdW5jdGlvbiBkZXRlcm1pbmlzdGljRGVjaXJjICh2YWwsIGssIHN0YWNrLCBwYXJlbnQpIHtcbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnICYmIHZhbCAhPT0gbnVsbCkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBzdGFjay5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHN0YWNrW2ldID09PSB2YWwpIHtcbiAgICAgICAgdmFyIHByb3BlcnR5RGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocGFyZW50LCBrKVxuICAgICAgICBpZiAocHJvcGVydHlEZXNjcmlwdG9yLmdldCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKHByb3BlcnR5RGVzY3JpcHRvci5jb25maWd1cmFibGUpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwYXJlbnQsIGssIHsgdmFsdWU6ICdbQ2lyY3VsYXJdJyB9KVxuICAgICAgICAgICAgYXJyLnB1c2goW3BhcmVudCwgaywgdmFsLCBwcm9wZXJ0eURlc2NyaXB0b3JdKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXBsYWNlclN0YWNrLnB1c2goW3ZhbCwga10pXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhcmVudFtrXSA9ICdbQ2lyY3VsYXJdJ1xuICAgICAgICAgIGFyci5wdXNoKFtwYXJlbnQsIGssIHZhbF0pXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdmFsLnRvSlNPTiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHN0YWNrLnB1c2godmFsKVxuICAgIC8vIE9wdGltaXplIGZvciBBcnJheXMuIEJpZyBhcnJheXMgY291bGQga2lsbCB0aGUgcGVyZm9ybWFuY2Ugb3RoZXJ3aXNlIVxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCB2YWwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGV0ZXJtaW5pc3RpY0RlY2lyYyh2YWxbaV0sIGksIHN0YWNrLCB2YWwpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIENyZWF0ZSBhIHRlbXBvcmFyeSBvYmplY3QgaW4gdGhlIHJlcXVpcmVkIHdheVxuICAgICAgdmFyIHRtcCA9IHt9XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbCkuc29ydChjb21wYXJlRnVuY3Rpb24pXG4gICAgICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXVxuICAgICAgICBkZXRlcm1pbmlzdGljRGVjaXJjKHZhbFtrZXldLCBrZXksIHN0YWNrLCB2YWwpXG4gICAgICAgIHRtcFtrZXldID0gdmFsW2tleV1cbiAgICAgIH1cbiAgICAgIGlmIChwYXJlbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhcnIucHVzaChbcGFyZW50LCBrLCB2YWxdKVxuICAgICAgICBwYXJlbnRba10gPSB0bXBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0bXBcbiAgICAgIH1cbiAgICB9XG4gICAgc3RhY2sucG9wKClcbiAgfVxufVxuXG4vLyB3cmFwcyByZXBsYWNlciBmdW5jdGlvbiB0byBoYW5kbGUgdmFsdWVzIHdlIGNvdWxkbid0IHJlcGxhY2Vcbi8vIGFuZCBtYXJrIHRoZW0gYXMgW0NpcmN1bGFyXVxuZnVuY3Rpb24gcmVwbGFjZUdldHRlclZhbHVlcyAocmVwbGFjZXIpIHtcbiAgcmVwbGFjZXIgPSByZXBsYWNlciAhPT0gdW5kZWZpbmVkID8gcmVwbGFjZXIgOiBmdW5jdGlvbiAoaywgdikgeyByZXR1cm4gdiB9XG4gIHJldHVybiBmdW5jdGlvbiAoa2V5LCB2YWwpIHtcbiAgICBpZiAocmVwbGFjZXJTdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlcGxhY2VyU3RhY2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHBhcnQgPSByZXBsYWNlclN0YWNrW2ldXG4gICAgICAgIGlmIChwYXJ0WzFdID09PSBrZXkgJiYgcGFydFswXSA9PT0gdmFsKSB7XG4gICAgICAgICAgdmFsID0gJ1tDaXJjdWxhcl0nXG4gICAgICAgICAgcmVwbGFjZXJTdGFjay5zcGxpY2UoaSwgMSlcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXBsYWNlci5jYWxsKHRoaXMsIGtleSwgdmFsKVxuICB9XG59XG4iXX0=
)