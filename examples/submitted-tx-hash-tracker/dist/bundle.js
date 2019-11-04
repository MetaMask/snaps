() => (
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const { errors: rpcErrors } = require('eth-json-rpc-errors')

wallet.updatePluginState({
  successfulTxHashes: [],
})

wallet.onMetaMaskEvent('tx:status-update', (id, status) => {
  if (status === 'submitted') {
    const currentPluginState = wallet.getPluginState()
    const txMeta = wallet.getTxById(id)
    wallet.updatePluginState({
      ...currentPluginState,
      successfulTxHashes: [...currentPluginState.successfulTxHashes, txMeta.hash],
    })
  }
})

wallet.registerRpcMessageHandler(async (_originString, requestObject) => {
  switch (requestObject.method) {
    case 'getSuccessfulTxHashes':
      return wallet.getPluginState().successfulTxHashes
    default:
      throw rpcErrors.eth.methodNotFound(requestObject)
  }
})


},{"eth-json-rpc-errors":2}],2:[function(require,module,exports){

const { JsonRpcError, EthJsonRpcError } = require('./src/classes')
const {
  serializeError, getMessageFromCode,
} = require('./src/utils')
const errors = require('./src/errors')
const ERROR_CODES = require('./src/errorCodes.json')

module.exports = {
  errors,
  JsonRpcError,
  EthJsonRpcError,
  serializeError,
  getMessageFromCode,
  /** @type ErrorCodes */
  ERROR_CODES,
}

// Types

/**
 * @typedef {Object} EthJsonRpcErrorCodes
 * @property {number} userRejectedRequest
 * @property {number} unauthorized
 * @property {number} unsupportedMethod
 */

/**
 * @typedef {Object} JsonRpcErrorCodes
 * @property {number} parse
 * @property {number} invalidRequest
 * @property {number} invalidParams
 * @property {number} methodNotFound
 * @property {number} internal
 */

/**
 * @typedef ErrorCodes
 * @property {JsonRpcErrorCodes} jsonRpc
 * @property {EthJsonRpcErrorCodes} eth
 */

},{"./src/classes":3,"./src/errorCodes.json":4,"./src/errors":6,"./src/utils":7}],3:[function(require,module,exports){

const safeStringify = require('fast-safe-stringify')

/**
 * @class JsonRpcError
 * Error subclass implementing JSON RPC 2.0 errors.
 * Permits any integer error code.
 */
class JsonRpcError extends Error {

  /**
   * Create a JSON RPC error.
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
 * @class EthJsonRpcError
 * Error subclass implementing Ethereum JSON RPC errors.
 * Permits integer error codes in the [ 1000 <= 4999 ] range.
 */
class EthJsonRpcError extends JsonRpcError {
  /**
   * Create an Ethereum JSON RPC error.
   * @param {number} code - The integer error code, in the [ 1000 <= 4999 ] range.
   * @param {string} message - The string message.
   * @param {any} [data] - The error data.
   */
  constructor(code, message, data) {
    if (!isValidEthCode(code)) {
      throw new Error(
        '"code" must be an integer such that: 1000 <= code <= 4999'
      )
    }
    super(code, message, data)
  }
}

// Internal

function isValidEthCode(code) {
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
  JsonRpcError,
  EthJsonRpcError,
}

},{"fast-safe-stringify":8}],4:[function(require,module,exports){
module.exports={
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

const { JsonRpcError, EthJsonRpcError } = require('./classes')
const { getMessageFromCode } = require('./utils')
const ERROR_CODES = require('./errorCodes.json')

module.exports = {
  /**
   * Get a JSON RPC 2.0 Parse error.
   * @param {string} [message] - A custom message.
   * @param {any} [data] - Error data.
   * @return {JsonRpcError} The error.
   */
  parse: (message, data) => getJsonRpcError(
    ERROR_CODES.jsonRpc.parse, message, data
  ),

  /**
   * Get a JSON RPC 2.0 Invalid Request error.
   * @param {string} [message] - A custom message.
   * @param {any} [data] - Error data.
   * @return {JsonRpcError} The error.
   */
  invalidRequest: (message, data) => getJsonRpcError(
    ERROR_CODES.jsonRpc.invalidRequest, message, data
  ),

  /**
   * Get a JSON RPC 2.0 Invalid Params error.
   * @param {string} [message] - A custom message.
   * @param {any} [data] - Error data.
   * @return {JsonRpcError} The error.
   */
  invalidParams: (message, data) => getJsonRpcError(
    ERROR_CODES.jsonRpc.invalidParams, message, data
  ),

  /**
   * Get a JSON RPC 2.0 Method Not Found error.
   * @param {string} [message] - A custom message.
   * @param {any} [data] - Error data.
   * @return {JsonRpcError} The error.
   */
  methodNotFound: (message, data) => getJsonRpcError(
    ERROR_CODES.jsonRpc.methodNotFound, message, data
  ),

  /**
   * Get a JSON RPC 2.0 Internal error.
   * @param {string} [message] - A custom message.
   * @param {any} [data] - Error data.
   * @return {JsonRpcError} The error.
   */
  internal: (message, data) => getJsonRpcError(
    ERROR_CODES.jsonRpc.internal, message, data
  ),

  /**
   * Get a JSON RPC 2.0 Server error.
   * Permits integer error codes in the [ -32099 <= -32000 ] range.
   * @param {number} code - The integer error code.
   * @param {string} [message] - A custom message.
   * @param {any} [data] - Error data.
   * @return {JsonRpcError} The error.
   */
  server: (code, message, data) => {
    if (!Number.isInteger(code) || code > -32000 || code < -32099) {
      throw new Error(
        '"code" must be an integer such that: -32099 <= code <= -32000'
      )
    }
    return getJsonRpcError(code, message, data)
  },
  eth: {
    /**
     * Get an Ethereum JSON RPC User Rejected Request error.
     * @param {string} [message] - A custom message.
     * @param {any} [data] - Error data.
     * @return {EthJsonRpcError} The error.
     */
    userRejectedRequest: (message, data) => {
      return getEthJsonRpcError(
        ERROR_CODES.eth.userRejectedRequest, message, data
      )
    },

    /**
     * Get an Ethereum JSON RPC Unauthorized error.
     * @param {string} [message] - A custom message.
     * @param {any} [data] - Error data.
     * @return {EthJsonRpcError} The error.
     */
    unauthorized: (message, data) => {
      return getEthJsonRpcError(
        ERROR_CODES.eth.unauthorized, message, data
      )
    },

    /**
     * Get an Ethereum JSON RPC Unsupported Method error.
     * @param {string} [message] - A custom message.
     * @param {any} [data] - Error data.
     * @return {EthJsonRpcError} The error.
     */
    unsupportedMethod: (message, data) => {
      return getEthJsonRpcError(
        ERROR_CODES.eth.unsupportedMethod, message, data
      )
    },

    /**
     * Get a custom Ethereum JSON RPC error.
     * @param {string} code - The error code.
     * @param {string} message - The error message.
     * @param {any} [data] - Error data.
     * @return {EthJsonRpcError} The error.
     */
    custom: (code, message, data) => {
      if (!message || typeof message !== 'string') throw new Error(
        '"message" must be a nonempty string'
      )
      return new EthJsonRpcError(code, message, data)
    },
  },
}

// Internal

function getJsonRpcError(code, message, data) {
  return new JsonRpcError(
    code,
    message || getMessageFromCode(code),
    data
  )
}

function getEthJsonRpcError(code, message, data) {
  return new EthJsonRpcError(
    code,
    message || getMessageFromCode(code),
    data
  )
}

},{"./classes":3,"./errorCodes.json":4,"./utils":7}],7:[function(require,module,exports){

const errorValues = require('./errorValues.json')
const FALLBACK_ERROR_CODE = require('./errorCodes.json').jsonRpc.internal
const { JsonRpcError } = require('./classes')

const JSON_RPC_SERVER_ERROR_MESSAGE = 'Unspecified server error.'

const FALLBACK_MESSAGE = 'Unspecified error message. This is  bug, please report it.'

const FALLBACK_ERROR = {
  code: FALLBACK_ERROR_CODE,
  message: getMessageFromCode(FALLBACK_ERROR_CODE)
}

/**
 * Gets the message for a given code, or a fallback message if the code has
 * no corresponding message.
 * @param {number} code - The integer error code.
 * @param {string} fallbackMessage - The fallback message.
 * @return {string} The corresponding message or the fallback message.
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
 * Serializes the given error to an ETH JSON RPC-compatible error object.
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

  if (typeof error === 'object' && error instanceof JsonRpcError) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9zdWJtaXR0ZWQtdHgtaGFzaC10cmFja2VyL2luZGV4LmpzIiwiZXhhbXBsZXMvc3VibWl0dGVkLXR4LWhhc2gtdHJhY2tlci9ub2RlX21vZHVsZXMvZXRoLWpzb24tcnBjLWVycm9ycy9pbmRleC5qcyIsImV4YW1wbGVzL3N1Ym1pdHRlZC10eC1oYXNoLXRyYWNrZXIvbm9kZV9tb2R1bGVzL2V0aC1qc29uLXJwYy1lcnJvcnMvc3JjL2NsYXNzZXMuanMiLCJleGFtcGxlcy9zdWJtaXR0ZWQtdHgtaGFzaC10cmFja2VyL25vZGVfbW9kdWxlcy9ldGgtanNvbi1ycGMtZXJyb3JzL3NyYy9lcnJvckNvZGVzLmpzb24iLCJleGFtcGxlcy9zdWJtaXR0ZWQtdHgtaGFzaC10cmFja2VyL25vZGVfbW9kdWxlcy9ldGgtanNvbi1ycGMtZXJyb3JzL3NyYy9lcnJvclZhbHVlcy5qc29uIiwiZXhhbXBsZXMvc3VibWl0dGVkLXR4LWhhc2gtdHJhY2tlci9ub2RlX21vZHVsZXMvZXRoLWpzb24tcnBjLWVycm9ycy9zcmMvZXJyb3JzLmpzIiwiZXhhbXBsZXMvc3VibWl0dGVkLXR4LWhhc2gtdHJhY2tlci9ub2RlX21vZHVsZXMvZXRoLWpzb24tcnBjLWVycm9ycy9zcmMvdXRpbHMuanMiLCJleGFtcGxlcy9zdWJtaXR0ZWQtdHgtaGFzaC10cmFja2VyL25vZGVfbW9kdWxlcy9mYXN0LXNhZmUtc3RyaW5naWZ5L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgeyBlcnJvcnM6IHJwY0Vycm9ycyB9ID0gcmVxdWlyZSgnZXRoLWpzb24tcnBjLWVycm9ycycpXG5cbndhbGxldC51cGRhdGVQbHVnaW5TdGF0ZSh7XG4gIHN1Y2Nlc3NmdWxUeEhhc2hlczogW10sXG59KVxuXG53YWxsZXQub25NZXRhTWFza0V2ZW50KCd0eDpzdGF0dXMtdXBkYXRlJywgKGlkLCBzdGF0dXMpID0+IHtcbiAgaWYgKHN0YXR1cyA9PT0gJ3N1Ym1pdHRlZCcpIHtcbiAgICBjb25zdCBjdXJyZW50UGx1Z2luU3RhdGUgPSB3YWxsZXQuZ2V0UGx1Z2luU3RhdGUoKVxuICAgIGNvbnN0IHR4TWV0YSA9IHdhbGxldC5nZXRUeEJ5SWQoaWQpXG4gICAgd2FsbGV0LnVwZGF0ZVBsdWdpblN0YXRlKHtcbiAgICAgIC4uLmN1cnJlbnRQbHVnaW5TdGF0ZSxcbiAgICAgIHN1Y2Nlc3NmdWxUeEhhc2hlczogWy4uLmN1cnJlbnRQbHVnaW5TdGF0ZS5zdWNjZXNzZnVsVHhIYXNoZXMsIHR4TWV0YS5oYXNoXSxcbiAgICB9KVxuICB9XG59KVxuXG53YWxsZXQucmVnaXN0ZXJScGNNZXNzYWdlSGFuZGxlcihhc3luYyAoX29yaWdpblN0cmluZywgcmVxdWVzdE9iamVjdCkgPT4ge1xuICBzd2l0Y2ggKHJlcXVlc3RPYmplY3QubWV0aG9kKSB7XG4gICAgY2FzZSAnZ2V0U3VjY2Vzc2Z1bFR4SGFzaGVzJzpcbiAgICAgIHJldHVybiB3YWxsZXQuZ2V0UGx1Z2luU3RhdGUoKS5zdWNjZXNzZnVsVHhIYXNoZXNcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgcnBjRXJyb3JzLmV0aC5tZXRob2ROb3RGb3VuZChyZXF1ZXN0T2JqZWN0KVxuICB9XG59KVxuXG4iLCJcbmNvbnN0IHsgSnNvblJwY0Vycm9yLCBFdGhKc29uUnBjRXJyb3IgfSA9IHJlcXVpcmUoJy4vc3JjL2NsYXNzZXMnKVxuY29uc3Qge1xuICBzZXJpYWxpemVFcnJvciwgZ2V0TWVzc2FnZUZyb21Db2RlLFxufSA9IHJlcXVpcmUoJy4vc3JjL3V0aWxzJylcbmNvbnN0IGVycm9ycyA9IHJlcXVpcmUoJy4vc3JjL2Vycm9ycycpXG5jb25zdCBFUlJPUl9DT0RFUyA9IHJlcXVpcmUoJy4vc3JjL2Vycm9yQ29kZXMuanNvbicpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBlcnJvcnMsXG4gIEpzb25ScGNFcnJvcixcbiAgRXRoSnNvblJwY0Vycm9yLFxuICBzZXJpYWxpemVFcnJvcixcbiAgZ2V0TWVzc2FnZUZyb21Db2RlLFxuICAvKiogQHR5cGUgRXJyb3JDb2RlcyAqL1xuICBFUlJPUl9DT0RFUyxcbn1cblxuLy8gVHlwZXNcblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBFdGhKc29uUnBjRXJyb3JDb2Rlc1xuICogQHByb3BlcnR5IHtudW1iZXJ9IHVzZXJSZWplY3RlZFJlcXVlc3RcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB1bmF1dGhvcml6ZWRcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB1bnN1cHBvcnRlZE1ldGhvZFxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gSnNvblJwY0Vycm9yQ29kZXNcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBwYXJzZVxuICogQHByb3BlcnR5IHtudW1iZXJ9IGludmFsaWRSZXF1ZXN0XG4gKiBAcHJvcGVydHkge251bWJlcn0gaW52YWxpZFBhcmFtc1xuICogQHByb3BlcnR5IHtudW1iZXJ9IG1ldGhvZE5vdEZvdW5kXG4gKiBAcHJvcGVydHkge251bWJlcn0gaW50ZXJuYWxcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIEVycm9yQ29kZXNcbiAqIEBwcm9wZXJ0eSB7SnNvblJwY0Vycm9yQ29kZXN9IGpzb25ScGNcbiAqIEBwcm9wZXJ0eSB7RXRoSnNvblJwY0Vycm9yQ29kZXN9IGV0aFxuICovXG4iLCJcbmNvbnN0IHNhZmVTdHJpbmdpZnkgPSByZXF1aXJlKCdmYXN0LXNhZmUtc3RyaW5naWZ5JylcblxuLyoqXG4gKiBAY2xhc3MgSnNvblJwY0Vycm9yXG4gKiBFcnJvciBzdWJjbGFzcyBpbXBsZW1lbnRpbmcgSlNPTiBSUEMgMi4wIGVycm9ycy5cbiAqIFBlcm1pdHMgYW55IGludGVnZXIgZXJyb3IgY29kZS5cbiAqL1xuY2xhc3MgSnNvblJwY0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBKU09OIFJQQyBlcnJvci5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvZGUgLSBUaGUgaW50ZWdlciBlcnJvciBjb2RlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIFRoZSBzdHJpbmcgbWVzc2FnZS5cbiAgICogQHBhcmFtIHthbnl9IFtkYXRhXSAtIFRoZSBlcnJvciBkYXRhLlxuICAgKi9cbiAgY29uc3RydWN0b3IgKGNvZGUsIG1lc3NhZ2UsIGRhdGEpIHtcblxuICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihjb2RlKSkgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ1wiY29kZVwiIG11c3QgYmUgYW4gaW50ZWdlci4nXG4gICAgKVxuICAgIGlmICghbWVzc2FnZSB8fCB0eXBlb2YgbWVzc2FnZSAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdcIm1lc3NhZ2VcIiBtdXN0IGJlIGEgbm9uZW1wdHkgc3RyaW5nLidcbiAgICApXG5cbiAgICBzdXBlcihtZXNzYWdlKVxuICAgIHRoaXMuY29kZSA9IGNvZGVcbiAgICBpZiAoZGF0YSAhPT0gdW5kZWZpbmVkKSB0aGlzLmRhdGEgPSBkYXRhXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHBsYWluIG9iamVjdCB3aXRoIGFsbCBwdWJsaWMgY2xhc3MgcHJvcGVydGllcy5cbiAgICogQHJldHVybnMge29iamVjdH0gVGhlIHNlcmlhbGl6ZWQgZXJyb3IuIFxuICAgKi9cbiAgc2VyaWFsaXplKCkge1xuICAgIGNvbnN0IHNlcmlhbGl6ZWQgPSB7XG4gICAgICBjb2RlOiB0aGlzLmNvZGUsXG4gICAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgfVxuICAgIGlmICh0aGlzLmRhdGEgIT09IHVuZGVmaW5lZCkgc2VyaWFsaXplZC5kYXRhID0gdGhpcy5kYXRhXG4gICAgaWYgKHRoaXMuc3RhY2spIHNlcmlhbGl6ZWQuc3RhY2sgPSB0aGlzLnN0YWNrXG4gICAgcmV0dXJuIHNlcmlhbGl6ZWRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHNlcmlhbGl6ZWQgZXJyb3IsIG9taXR0aW5nXG4gICAqIGFueSBjaXJjdWxhciByZWZlcmVuY2VzLlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc2VyaWFsaXplZCBlcnJvciBhcyBhIHN0cmluZy5cbiAgICovXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiBzYWZlU3RyaW5naWZ5KFxuICAgICAgdGhpcy5zZXJpYWxpemUoKSxcbiAgICAgIHN0cmluZ2lmeVJlcGxhY2VyLFxuICAgICAgMlxuICAgIClcbiAgfVxufVxuXG4vKipcbiAqIEBjbGFzcyBFdGhKc29uUnBjRXJyb3JcbiAqIEVycm9yIHN1YmNsYXNzIGltcGxlbWVudGluZyBFdGhlcmV1bSBKU09OIFJQQyBlcnJvcnMuXG4gKiBQZXJtaXRzIGludGVnZXIgZXJyb3IgY29kZXMgaW4gdGhlIFsgMTAwMCA8PSA0OTk5IF0gcmFuZ2UuXG4gKi9cbmNsYXNzIEV0aEpzb25ScGNFcnJvciBleHRlbmRzIEpzb25ScGNFcnJvciB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYW4gRXRoZXJldW0gSlNPTiBSUEMgZXJyb3IuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjb2RlIC0gVGhlIGludGVnZXIgZXJyb3IgY29kZSwgaW4gdGhlIFsgMTAwMCA8PSA0OTk5IF0gcmFuZ2UuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gVGhlIHN0cmluZyBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge2FueX0gW2RhdGFdIC0gVGhlIGVycm9yIGRhdGEuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb2RlLCBtZXNzYWdlLCBkYXRhKSB7XG4gICAgaWYgKCFpc1ZhbGlkRXRoQ29kZShjb2RlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnXCJjb2RlXCIgbXVzdCBiZSBhbiBpbnRlZ2VyIHN1Y2ggdGhhdDogMTAwMCA8PSBjb2RlIDw9IDQ5OTknXG4gICAgICApXG4gICAgfVxuICAgIHN1cGVyKGNvZGUsIG1lc3NhZ2UsIGRhdGEpXG4gIH1cbn1cblxuLy8gSW50ZXJuYWxcblxuZnVuY3Rpb24gaXNWYWxpZEV0aENvZGUoY29kZSkge1xuICByZXR1cm4gTnVtYmVyLmlzSW50ZWdlcihjb2RlKSAmJiBjb2RlID49IDEwMDAgJiYgY29kZSA8PSA0OTk5XG59XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeVJlcGxhY2VyKF8sIHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PT0gJ1tDaXJjdWxhcl0nKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgcmV0dXJuIHZhbHVlXG59XG5cbi8vIEV4cG9ydHNcblxubW9kdWxlLmV4cG9ydHMgPSAge1xuICBKc29uUnBjRXJyb3IsXG4gIEV0aEpzb25ScGNFcnJvcixcbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJqc29uUnBjXCI6IHtcbiAgICAgIFwicGFyc2VcIjogLTMyNzAwLFxuICAgICAgXCJpbnZhbGlkUmVxdWVzdFwiOiAtMzI2MDAsXG4gICAgICBcIm1ldGhvZE5vdEZvdW5kXCI6IC0zMjYwMSxcbiAgICAgIFwiaW52YWxpZFBhcmFtc1wiOiAtMzI2MDIsXG4gICAgICBcImludGVybmFsXCI6IC0zMjYwM1xuICB9LFxuICBcImV0aFwiOiB7XG4gICAgXCJ1c2VyUmVqZWN0ZWRSZXF1ZXN0XCI6IDQwMDEsXG4gICAgXCJ1bmF1dGhvcml6ZWRcIjogNDEwMCxcbiAgICBcInVuc3VwcG9ydGVkTWV0aG9kXCI6IDQyMDBcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIi0zMjcwMFwiOiB7XG4gICAgXCJzdGFuZGFyZFwiOiBcIkpTT04gUlBDIDIuMFwiLFxuICAgIFwibWVzc2FnZVwiOiBcIkludmFsaWQgSlNPTiB3YXMgcmVjZWl2ZWQgYnkgdGhlIHNlcnZlci4gQW4gZXJyb3Igb2NjdXJyZWQgb24gdGhlIHNlcnZlciB3aGlsZSBwYXJzaW5nIHRoZSBKU09OIHRleHQuXCJcbiAgfSxcbiAgXCItMzI2MDBcIjoge1xuICAgIFwic3RhbmRhcmRcIjogXCJKU09OIFJQQyAyLjBcIixcbiAgICBcIm1lc3NhZ2VcIjogXCJUaGUgSlNPTiBzZW50IGlzIG5vdCBhIHZhbGlkIFJlcXVlc3Qgb2JqZWN0LlwiXG4gIH0sXG4gIFwiLTMyNjAxXCI6IHtcbiAgICBcInN0YW5kYXJkXCI6IFwiSlNPTiBSUEMgMi4wXCIsXG4gICAgXCJtZXNzYWdlXCI6IFwiVGhlIG1ldGhvZCBkb2VzIG5vdCBleGlzdCAvIGlzIG5vdCBhdmFpbGFibGUuXCJcbiAgfSxcbiAgXCItMzI2MDJcIjoge1xuICAgIFwic3RhbmRhcmRcIjogXCJKU09OIFJQQyAyLjBcIixcbiAgICBcIm1lc3NhZ2VcIjogXCJJbnZhbGlkIG1ldGhvZCBwYXJhbWV0ZXIocykuXCJcbiAgfSxcbiAgXCItMzI2MDNcIjoge1xuICAgIFwic3RhbmRhcmRcIjogXCJKU09OIFJQQyAyLjBcIixcbiAgICBcIm1lc3NhZ2VcIjogXCJJbnRlcm5hbCBKU09OLVJQQyBlcnJvci5cIlxuICB9LFxuICBcIjQwMDFcIjoge1xuICAgIFwic3RhbmRhcmRcIjogXCJFSVAgMTE5M1wiLFxuICAgIFwibWVzc2FnZVwiOiBcIlVzZXIgcmVqZWN0ZWQgdGhlIHJlcXVlc3QuXCJcbiAgfSxcbiAgXCI0MTAwXCI6IHtcbiAgICBcInN0YW5kYXJkXCI6IFwiRUlQIDExOTNcIixcbiAgICBcIm1lc3NhZ2VcIjogXCJUaGUgcmVxdWVzdGVkIGFjY291bnQgYW5kL29yIG1ldGhvZCBoYXMgbm90IGJlZW4gYXV0aG9yaXplZCBieSB0aGUgdXNlci5cIlxuICB9LFxuICBcIjQyMDBcIjoge1xuICAgIFwic3RhbmRhcmRcIjogXCJFSVAgMTE5M1wiLFxuICAgIFwibWVzc2FnZVwiOiBcIlRoZSByZXF1ZXN0ZWQgbWV0aG9kIGlzIG5vdCBzdXBwb3J0ZWQgYnkgdGhpcyBFdGhlcmV1bSBwcm92aWRlci5cIlxuICB9XG59XG4iLCJcbmNvbnN0IHsgSnNvblJwY0Vycm9yLCBFdGhKc29uUnBjRXJyb3IgfSA9IHJlcXVpcmUoJy4vY2xhc3NlcycpXG5jb25zdCB7IGdldE1lc3NhZ2VGcm9tQ29kZSB9ID0gcmVxdWlyZSgnLi91dGlscycpXG5jb25zdCBFUlJPUl9DT0RFUyA9IHJlcXVpcmUoJy4vZXJyb3JDb2Rlcy5qc29uJylcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8qKlxuICAgKiBHZXQgYSBKU09OIFJQQyAyLjAgUGFyc2UgZXJyb3IuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbbWVzc2FnZV0gLSBBIGN1c3RvbSBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge2FueX0gW2RhdGFdIC0gRXJyb3IgZGF0YS5cbiAgICogQHJldHVybiB7SnNvblJwY0Vycm9yfSBUaGUgZXJyb3IuXG4gICAqL1xuICBwYXJzZTogKG1lc3NhZ2UsIGRhdGEpID0+IGdldEpzb25ScGNFcnJvcihcbiAgICBFUlJPUl9DT0RFUy5qc29uUnBjLnBhcnNlLCBtZXNzYWdlLCBkYXRhXG4gICksXG5cbiAgLyoqXG4gICAqIEdldCBhIEpTT04gUlBDIDIuMCBJbnZhbGlkIFJlcXVlc3QgZXJyb3IuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbbWVzc2FnZV0gLSBBIGN1c3RvbSBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge2FueX0gW2RhdGFdIC0gRXJyb3IgZGF0YS5cbiAgICogQHJldHVybiB7SnNvblJwY0Vycm9yfSBUaGUgZXJyb3IuXG4gICAqL1xuICBpbnZhbGlkUmVxdWVzdDogKG1lc3NhZ2UsIGRhdGEpID0+IGdldEpzb25ScGNFcnJvcihcbiAgICBFUlJPUl9DT0RFUy5qc29uUnBjLmludmFsaWRSZXF1ZXN0LCBtZXNzYWdlLCBkYXRhXG4gICksXG5cbiAgLyoqXG4gICAqIEdldCBhIEpTT04gUlBDIDIuMCBJbnZhbGlkIFBhcmFtcyBlcnJvci5cbiAgICogQHBhcmFtIHtzdHJpbmd9IFttZXNzYWdlXSAtIEEgY3VzdG9tIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7YW55fSBbZGF0YV0gLSBFcnJvciBkYXRhLlxuICAgKiBAcmV0dXJuIHtKc29uUnBjRXJyb3J9IFRoZSBlcnJvci5cbiAgICovXG4gIGludmFsaWRQYXJhbXM6IChtZXNzYWdlLCBkYXRhKSA9PiBnZXRKc29uUnBjRXJyb3IoXG4gICAgRVJST1JfQ09ERVMuanNvblJwYy5pbnZhbGlkUGFyYW1zLCBtZXNzYWdlLCBkYXRhXG4gICksXG5cbiAgLyoqXG4gICAqIEdldCBhIEpTT04gUlBDIDIuMCBNZXRob2QgTm90IEZvdW5kIGVycm9yLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gW21lc3NhZ2VdIC0gQSBjdXN0b20gbWVzc2FnZS5cbiAgICogQHBhcmFtIHthbnl9IFtkYXRhXSAtIEVycm9yIGRhdGEuXG4gICAqIEByZXR1cm4ge0pzb25ScGNFcnJvcn0gVGhlIGVycm9yLlxuICAgKi9cbiAgbWV0aG9kTm90Rm91bmQ6IChtZXNzYWdlLCBkYXRhKSA9PiBnZXRKc29uUnBjRXJyb3IoXG4gICAgRVJST1JfQ09ERVMuanNvblJwYy5tZXRob2ROb3RGb3VuZCwgbWVzc2FnZSwgZGF0YVxuICApLFxuXG4gIC8qKlxuICAgKiBHZXQgYSBKU09OIFJQQyAyLjAgSW50ZXJuYWwgZXJyb3IuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbbWVzc2FnZV0gLSBBIGN1c3RvbSBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge2FueX0gW2RhdGFdIC0gRXJyb3IgZGF0YS5cbiAgICogQHJldHVybiB7SnNvblJwY0Vycm9yfSBUaGUgZXJyb3IuXG4gICAqL1xuICBpbnRlcm5hbDogKG1lc3NhZ2UsIGRhdGEpID0+IGdldEpzb25ScGNFcnJvcihcbiAgICBFUlJPUl9DT0RFUy5qc29uUnBjLmludGVybmFsLCBtZXNzYWdlLCBkYXRhXG4gICksXG5cbiAgLyoqXG4gICAqIEdldCBhIEpTT04gUlBDIDIuMCBTZXJ2ZXIgZXJyb3IuXG4gICAqIFBlcm1pdHMgaW50ZWdlciBlcnJvciBjb2RlcyBpbiB0aGUgWyAtMzIwOTkgPD0gLTMyMDAwIF0gcmFuZ2UuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjb2RlIC0gVGhlIGludGVnZXIgZXJyb3IgY29kZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IFttZXNzYWdlXSAtIEEgY3VzdG9tIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7YW55fSBbZGF0YV0gLSBFcnJvciBkYXRhLlxuICAgKiBAcmV0dXJuIHtKc29uUnBjRXJyb3J9IFRoZSBlcnJvci5cbiAgICovXG4gIHNlcnZlcjogKGNvZGUsIG1lc3NhZ2UsIGRhdGEpID0+IHtcbiAgICBpZiAoIU51bWJlci5pc0ludGVnZXIoY29kZSkgfHwgY29kZSA+IC0zMjAwMCB8fCBjb2RlIDwgLTMyMDk5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdcImNvZGVcIiBtdXN0IGJlIGFuIGludGVnZXIgc3VjaCB0aGF0OiAtMzIwOTkgPD0gY29kZSA8PSAtMzIwMDAnXG4gICAgICApXG4gICAgfVxuICAgIHJldHVybiBnZXRKc29uUnBjRXJyb3IoY29kZSwgbWVzc2FnZSwgZGF0YSlcbiAgfSxcbiAgZXRoOiB7XG4gICAgLyoqXG4gICAgICogR2V0IGFuIEV0aGVyZXVtIEpTT04gUlBDIFVzZXIgUmVqZWN0ZWQgUmVxdWVzdCBlcnJvci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW21lc3NhZ2VdIC0gQSBjdXN0b20gbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0ge2FueX0gW2RhdGFdIC0gRXJyb3IgZGF0YS5cbiAgICAgKiBAcmV0dXJuIHtFdGhKc29uUnBjRXJyb3J9IFRoZSBlcnJvci5cbiAgICAgKi9cbiAgICB1c2VyUmVqZWN0ZWRSZXF1ZXN0OiAobWVzc2FnZSwgZGF0YSkgPT4ge1xuICAgICAgcmV0dXJuIGdldEV0aEpzb25ScGNFcnJvcihcbiAgICAgICAgRVJST1JfQ09ERVMuZXRoLnVzZXJSZWplY3RlZFJlcXVlc3QsIG1lc3NhZ2UsIGRhdGFcbiAgICAgIClcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGFuIEV0aGVyZXVtIEpTT04gUlBDIFVuYXV0aG9yaXplZCBlcnJvci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW21lc3NhZ2VdIC0gQSBjdXN0b20gbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0ge2FueX0gW2RhdGFdIC0gRXJyb3IgZGF0YS5cbiAgICAgKiBAcmV0dXJuIHtFdGhKc29uUnBjRXJyb3J9IFRoZSBlcnJvci5cbiAgICAgKi9cbiAgICB1bmF1dGhvcml6ZWQ6IChtZXNzYWdlLCBkYXRhKSA9PiB7XG4gICAgICByZXR1cm4gZ2V0RXRoSnNvblJwY0Vycm9yKFxuICAgICAgICBFUlJPUl9DT0RFUy5ldGgudW5hdXRob3JpemVkLCBtZXNzYWdlLCBkYXRhXG4gICAgICApXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBhbiBFdGhlcmV1bSBKU09OIFJQQyBVbnN1cHBvcnRlZCBNZXRob2QgZXJyb3IuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFttZXNzYWdlXSAtIEEgY3VzdG9tIG1lc3NhZ2UuXG4gICAgICogQHBhcmFtIHthbnl9IFtkYXRhXSAtIEVycm9yIGRhdGEuXG4gICAgICogQHJldHVybiB7RXRoSnNvblJwY0Vycm9yfSBUaGUgZXJyb3IuXG4gICAgICovXG4gICAgdW5zdXBwb3J0ZWRNZXRob2Q6IChtZXNzYWdlLCBkYXRhKSA9PiB7XG4gICAgICByZXR1cm4gZ2V0RXRoSnNvblJwY0Vycm9yKFxuICAgICAgICBFUlJPUl9DT0RFUy5ldGgudW5zdXBwb3J0ZWRNZXRob2QsIG1lc3NhZ2UsIGRhdGFcbiAgICAgIClcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGEgY3VzdG9tIEV0aGVyZXVtIEpTT04gUlBDIGVycm9yLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2RlIC0gVGhlIGVycm9yIGNvZGUuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0ge2FueX0gW2RhdGFdIC0gRXJyb3IgZGF0YS5cbiAgICAgKiBAcmV0dXJuIHtFdGhKc29uUnBjRXJyb3J9IFRoZSBlcnJvci5cbiAgICAgKi9cbiAgICBjdXN0b206IChjb2RlLCBtZXNzYWdlLCBkYXRhKSA9PiB7XG4gICAgICBpZiAoIW1lc3NhZ2UgfHwgdHlwZW9mIG1lc3NhZ2UgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdcIm1lc3NhZ2VcIiBtdXN0IGJlIGEgbm9uZW1wdHkgc3RyaW5nJ1xuICAgICAgKVxuICAgICAgcmV0dXJuIG5ldyBFdGhKc29uUnBjRXJyb3IoY29kZSwgbWVzc2FnZSwgZGF0YSlcbiAgICB9LFxuICB9LFxufVxuXG4vLyBJbnRlcm5hbFxuXG5mdW5jdGlvbiBnZXRKc29uUnBjRXJyb3IoY29kZSwgbWVzc2FnZSwgZGF0YSkge1xuICByZXR1cm4gbmV3IEpzb25ScGNFcnJvcihcbiAgICBjb2RlLFxuICAgIG1lc3NhZ2UgfHwgZ2V0TWVzc2FnZUZyb21Db2RlKGNvZGUpLFxuICAgIGRhdGFcbiAgKVxufVxuXG5mdW5jdGlvbiBnZXRFdGhKc29uUnBjRXJyb3IoY29kZSwgbWVzc2FnZSwgZGF0YSkge1xuICByZXR1cm4gbmV3IEV0aEpzb25ScGNFcnJvcihcbiAgICBjb2RlLFxuICAgIG1lc3NhZ2UgfHwgZ2V0TWVzc2FnZUZyb21Db2RlKGNvZGUpLFxuICAgIGRhdGFcbiAgKVxufVxuIiwiXG5jb25zdCBlcnJvclZhbHVlcyA9IHJlcXVpcmUoJy4vZXJyb3JWYWx1ZXMuanNvbicpXG5jb25zdCBGQUxMQkFDS19FUlJPUl9DT0RFID0gcmVxdWlyZSgnLi9lcnJvckNvZGVzLmpzb24nKS5qc29uUnBjLmludGVybmFsXG5jb25zdCB7IEpzb25ScGNFcnJvciB9ID0gcmVxdWlyZSgnLi9jbGFzc2VzJylcblxuY29uc3QgSlNPTl9SUENfU0VSVkVSX0VSUk9SX01FU1NBR0UgPSAnVW5zcGVjaWZpZWQgc2VydmVyIGVycm9yLidcblxuY29uc3QgRkFMTEJBQ0tfTUVTU0FHRSA9ICdVbnNwZWNpZmllZCBlcnJvciBtZXNzYWdlLiBUaGlzIGlzICBidWcsIHBsZWFzZSByZXBvcnQgaXQuJ1xuXG5jb25zdCBGQUxMQkFDS19FUlJPUiA9IHtcbiAgY29kZTogRkFMTEJBQ0tfRVJST1JfQ09ERSxcbiAgbWVzc2FnZTogZ2V0TWVzc2FnZUZyb21Db2RlKEZBTExCQUNLX0VSUk9SX0NPREUpXG59XG5cbi8qKlxuICogR2V0cyB0aGUgbWVzc2FnZSBmb3IgYSBnaXZlbiBjb2RlLCBvciBhIGZhbGxiYWNrIG1lc3NhZ2UgaWYgdGhlIGNvZGUgaGFzXG4gKiBubyBjb3JyZXNwb25kaW5nIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge251bWJlcn0gY29kZSAtIFRoZSBpbnRlZ2VyIGVycm9yIGNvZGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gZmFsbGJhY2tNZXNzYWdlIC0gVGhlIGZhbGxiYWNrIG1lc3NhZ2UuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBjb3JyZXNwb25kaW5nIG1lc3NhZ2Ugb3IgdGhlIGZhbGxiYWNrIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIGdldE1lc3NhZ2VGcm9tQ29kZShjb2RlLCBmYWxsYmFja01lc3NhZ2UgPSBGQUxMQkFDS19NRVNTQUdFKSB7XG5cbiAgaWYgKE51bWJlci5pc0ludGVnZXIoY29kZSkpIHtcblxuICAgIGNvbnN0IGNvZGVTdHJpbmcgPSBjb2RlLnRvU3RyaW5nKClcbiAgICBpZiAoZXJyb3JWYWx1ZXNbY29kZVN0cmluZ10pIHJldHVybiBlcnJvclZhbHVlc1tjb2RlU3RyaW5nXS5tZXNzYWdlXG5cbiAgICBpZiAoaXNKc29uUnBjU2VydmVyRXJyb3IoY29kZSkpIHJldHVybiBKU09OX1JQQ19TRVJWRVJfRVJST1JfTUVTU0FHRVxuXG4gICAgLy8gVE9ETzogYWxsb3cgdmFsaWQgY29kZXMgYW5kIG1lc3NhZ2VzIHRvIGJlIGV4dGVuZGVkXG4gICAgLy8gLy8gRUlQIDExOTMgU3RhdHVzIENvZGVzXG4gICAgLy8gaWYgKGNvZGUgPj0gNDAwMCAmJiBjb2RlIDw9IDQ5OTkpIHJldHVybiBTb21ldGhpbmc/XG4gIH1cbiAgcmV0dXJuIGZhbGxiYWNrTWVzc2FnZVxufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gY29kZSBpcyB2YWxpZC5cbiAqIEEgY29kZSBpcyBvbmx5IHZhbGlkIGlmIGl0IGhhcyBhIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge251bWJlcn0gY29kZSAtIFRoZSBjb2RlIHRvIGNoZWNrXG4gKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBjb2RlIGlzIHZhbGlkLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmZ1bmN0aW9uIGlzVmFsaWRDb2RlKGNvZGUpIHtcblxuICBpZiAoIU51bWJlci5pc0ludGVnZXIoY29kZSkpIHJldHVybiBmYWxzZVxuXG4gIGNvbnN0IGNvZGVTdHJpbmcgPSBjb2RlLnRvU3RyaW5nKClcbiAgaWYgKGVycm9yVmFsdWVzW2NvZGVTdHJpbmddKSByZXR1cm4gdHJ1ZVxuXG4gIGlmIChpc0pzb25ScGNTZXJ2ZXJFcnJvcihjb2RlKSkgcmV0dXJuIHRydWVcblxuICAvLyBUT0RPOiBhbGxvdyB2YWxpZCBjb2RlcyBhbmQgbWVzc2FnZXMgdG8gYmUgZXh0ZW5kZWRcbiAgLy8gLy8gRUlQIDExOTMgU3RhdHVzIENvZGVzXG4gIC8vIGlmIChjb2RlID49IDQwMDAgJiYgY29kZSA8PSA0OTk5KSByZXR1cm4gdHJ1ZVxuXG4gIHJldHVybiBmYWxzZVxufVxuXG4vKipcbiAqIFNlcmlhbGl6ZXMgdGhlIGdpdmVuIGVycm9yIHRvIGFuIEVUSCBKU09OIFJQQy1jb21wYXRpYmxlIGVycm9yIG9iamVjdC5cbiAqIE1lcmVseSBjb3BpZXMgdGhlIGdpdmVuIGVycm9yJ3MgdmFsdWVzIGlmIGl0IGlzIGFscmVhZHkgY29tcGF0aWJsZS5cbiAqIElmIHRoZSBnaXZlbiBlcnJvciBpcyBub3QgZnVsbHkgY29tcGF0aWJsZSwgaXQgd2lsbCBiZSBwcmVzZXJ2ZWQgb24gdGhlXG4gKiByZXR1cm5lZCBvYmplY3QncyBkYXRhLm9yaWdpbmFsRXJyb3IgcHJvcGVydHkuXG4gKiBBZGRzIGEgJ3N0YWNrJyBwcm9wZXJ0eSBpZiBpdCBleGlzdHMgb24gdGhlIGdpdmVuIGVycm9yLlxuICpcbiAqIEBwYXJhbSB7YW55fSBlcnJvciAtIFRoZSBlcnJvciB0byBzZXJpYWxpemUuXG4gKiBAcGFyYW0ge29iamVjdH0gZmFsbGJhY2tFcnJvciAtIFRoZSBjdXN0b20gZmFsbGJhY2sgZXJyb3IgdmFsdWVzIGlmIHRoZVxuICogZ2l2ZW4gZXJyb3IgaXMgaW52YWxpZC5cbiAqIEByZXR1cm4ge29iamVjdH0gQSBzdGFuZGFyZGl6ZWQgZXJyb3Igb2JqZWN0LlxuICovXG5mdW5jdGlvbiBzZXJpYWxpemVFcnJvciAoZXJyb3IsIGZhbGxiYWNrRXJyb3IgPSBGQUxMQkFDS19FUlJPUikge1xuXG4gIGlmIChcbiAgICAhZmFsbGJhY2tFcnJvciB8fCBcbiAgICAhTnVtYmVyLmlzSW50ZWdlcihmYWxsYmFja0Vycm9yLmNvZGUpIHx8XG4gICAgdHlwZW9mIGZhbGxiYWNrRXJyb3IubWVzc2FnZSAhPT0gJ3N0cmluZydcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ2ZhbGxiYWNrRXJyb3IgbXVzdCBjb250YWluIGludGVnZXIgbnVtYmVyIGNvZGUgYW5kIHN0cmluZyBtZXNzYWdlLidcbiAgICApXG4gIH1cblxuICBpZiAodHlwZW9mIGVycm9yID09PSAnb2JqZWN0JyAmJiBlcnJvciBpbnN0YW5jZW9mIEpzb25ScGNFcnJvcikge1xuICAgIHJldHVybiBlcnJvci5zZXJpYWxpemUoKVxuICB9XG5cbiAgY29uc3Qgc2VyaWFsaXplZCA9IHt9XG5cbiAgaWYgKGVycm9yICYmIGlzVmFsaWRDb2RlKGVycm9yLmNvZGUpKSB7XG5cbiAgICBzZXJpYWxpemVkLmNvZGUgPSBlcnJvci5jb2RlXG5cbiAgICBpZiAoZXJyb3IubWVzc2FnZSAmJiB0eXBlb2YgZXJyb3IubWVzc2FnZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHNlcmlhbGl6ZWQubWVzc2FnZSA9IGVycm9yLm1lc3NhZ2VcbiAgICAgIGlmIChlcnJvci5oYXNPd25Qcm9wZXJ0eSgnZGF0YScpKSBzZXJpYWxpemVkLmRhdGEgPSBlcnJvci5kYXRhXG4gICAgfSBlbHNlIHtcbiAgICAgIHNlcmlhbGl6ZWQubWVzc2FnZSA9IGdldE1lc3NhZ2VGcm9tQ29kZShzZXJpYWxpemVkLmNvZGUpXG4gICAgICBzZXJpYWxpemVkLmRhdGEgPSB7IG9yaWdpbmFsRXJyb3I6IGFzc2lnbk9yaWdpbmFsRXJyb3IoZXJyb3IpIH1cbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICBzZXJpYWxpemVkLmNvZGUgPSBmYWxsYmFja0Vycm9yLmNvZGVcbiAgICBzZXJpYWxpemVkLm1lc3NhZ2UgPSAoXG4gICAgICBlcnJvciAmJiBlcnJvci5tZXNzYWdlXG4gICAgICAgID8gZXJyb3IubWVzc2FnZVxuICAgICAgICA6IGZhbGxiYWNrRXJyb3IubWVzc2FnZVxuICAgIClcbiAgICBzZXJpYWxpemVkLmRhdGEgPSB7IG9yaWdpbmFsRXJyb3I6IGFzc2lnbk9yaWdpbmFsRXJyb3IoZXJyb3IpIH1cbiAgfVxuXG4gIGlmIChlcnJvciAmJiBlcnJvci5zdGFjaykgc2VyaWFsaXplZC5zdGFjayA9IGVycm9yLnN0YWNrXG4gIHJldHVybiBzZXJpYWxpemVkXG59XG5cbi8vIEludGVybmFsXG5cbmZ1bmN0aW9uIGlzSnNvblJwY1NlcnZlckVycm9yIChjb2RlKSB7XG4gIHJldHVybiBjb2RlID49IC0zMjA5OSAmJiBjb2RlIDw9IC0zMjAwMFxufVxuXG5mdW5jdGlvbiBhc3NpZ25PcmlnaW5hbEVycm9yIChlcnJvcikge1xuICBpZiAoZXJyb3IgJiYgdHlwZW9mIGVycm9yID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShlcnJvcikpIHtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgZXJyb3IpXG4gIH1cbiAgcmV0dXJuIGVycm9yXG59XG5cbi8vIEV4cG9ydHNcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldE1lc3NhZ2VGcm9tQ29kZSxcbiAgaXNWYWxpZENvZGUsXG4gIHNlcmlhbGl6ZUVycm9yLFxuICBKU09OX1JQQ19TRVJWRVJfRVJST1JfTUVTU0FHRSxcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gc3RyaW5naWZ5XG5zdHJpbmdpZnkuZGVmYXVsdCA9IHN0cmluZ2lmeVxuc3RyaW5naWZ5LnN0YWJsZSA9IGRldGVybWluaXN0aWNTdHJpbmdpZnlcbnN0cmluZ2lmeS5zdGFibGVTdHJpbmdpZnkgPSBkZXRlcm1pbmlzdGljU3RyaW5naWZ5XG5cbnZhciBhcnIgPSBbXVxudmFyIHJlcGxhY2VyU3RhY2sgPSBbXVxuXG4vLyBSZWd1bGFyIHN0cmluZ2lmeVxuZnVuY3Rpb24gc3RyaW5naWZ5IChvYmosIHJlcGxhY2VyLCBzcGFjZXIpIHtcbiAgZGVjaXJjKG9iaiwgJycsIFtdLCB1bmRlZmluZWQpXG4gIHZhciByZXNcbiAgaWYgKHJlcGxhY2VyU3RhY2subGVuZ3RoID09PSAwKSB7XG4gICAgcmVzID0gSlNPTi5zdHJpbmdpZnkob2JqLCByZXBsYWNlciwgc3BhY2VyKVxuICB9IGVsc2Uge1xuICAgIHJlcyA9IEpTT04uc3RyaW5naWZ5KG9iaiwgcmVwbGFjZUdldHRlclZhbHVlcyhyZXBsYWNlciksIHNwYWNlcilcbiAgfVxuICB3aGlsZSAoYXJyLmxlbmd0aCAhPT0gMCkge1xuICAgIHZhciBwYXJ0ID0gYXJyLnBvcCgpXG4gICAgaWYgKHBhcnQubGVuZ3RoID09PSA0KSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocGFydFswXSwgcGFydFsxXSwgcGFydFszXSlcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydFswXVtwYXJ0WzFdXSA9IHBhcnRbMl1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuZnVuY3Rpb24gZGVjaXJjICh2YWwsIGssIHN0YWNrLCBwYXJlbnQpIHtcbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnICYmIHZhbCAhPT0gbnVsbCkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBzdGFjay5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHN0YWNrW2ldID09PSB2YWwpIHtcbiAgICAgICAgdmFyIHByb3BlcnR5RGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocGFyZW50LCBrKVxuICAgICAgICBpZiAocHJvcGVydHlEZXNjcmlwdG9yLmdldCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKHByb3BlcnR5RGVzY3JpcHRvci5jb25maWd1cmFibGUpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwYXJlbnQsIGssIHsgdmFsdWU6ICdbQ2lyY3VsYXJdJyB9KVxuICAgICAgICAgICAgYXJyLnB1c2goW3BhcmVudCwgaywgdmFsLCBwcm9wZXJ0eURlc2NyaXB0b3JdKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXBsYWNlclN0YWNrLnB1c2goW3ZhbCwga10pXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhcmVudFtrXSA9ICdbQ2lyY3VsYXJdJ1xuICAgICAgICAgIGFyci5wdXNoKFtwYXJlbnQsIGssIHZhbF0pXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuICAgIHN0YWNrLnB1c2godmFsKVxuICAgIC8vIE9wdGltaXplIGZvciBBcnJheXMuIEJpZyBhcnJheXMgY291bGQga2lsbCB0aGUgcGVyZm9ybWFuY2Ugb3RoZXJ3aXNlIVxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCB2YWwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGVjaXJjKHZhbFtpXSwgaSwgc3RhY2ssIHZhbClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWwpXG4gICAgICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXVxuICAgICAgICBkZWNpcmModmFsW2tleV0sIGtleSwgc3RhY2ssIHZhbClcbiAgICAgIH1cbiAgICB9XG4gICAgc3RhY2sucG9wKClcbiAgfVxufVxuXG4vLyBTdGFibGUtc3RyaW5naWZ5XG5mdW5jdGlvbiBjb21wYXJlRnVuY3Rpb24gKGEsIGIpIHtcbiAgaWYgKGEgPCBiKSB7XG4gICAgcmV0dXJuIC0xXG4gIH1cbiAgaWYgKGEgPiBiKSB7XG4gICAgcmV0dXJuIDFcbiAgfVxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBkZXRlcm1pbmlzdGljU3RyaW5naWZ5IChvYmosIHJlcGxhY2VyLCBzcGFjZXIpIHtcbiAgdmFyIHRtcCA9IGRldGVybWluaXN0aWNEZWNpcmMob2JqLCAnJywgW10sIHVuZGVmaW5lZCkgfHwgb2JqXG4gIHZhciByZXNcbiAgaWYgKHJlcGxhY2VyU3RhY2subGVuZ3RoID09PSAwKSB7XG4gICAgcmVzID0gSlNPTi5zdHJpbmdpZnkodG1wLCByZXBsYWNlciwgc3BhY2VyKVxuICB9IGVsc2Uge1xuICAgIHJlcyA9IEpTT04uc3RyaW5naWZ5KHRtcCwgcmVwbGFjZUdldHRlclZhbHVlcyhyZXBsYWNlciksIHNwYWNlcilcbiAgfVxuICB3aGlsZSAoYXJyLmxlbmd0aCAhPT0gMCkge1xuICAgIHZhciBwYXJ0ID0gYXJyLnBvcCgpXG4gICAgaWYgKHBhcnQubGVuZ3RoID09PSA0KSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocGFydFswXSwgcGFydFsxXSwgcGFydFszXSlcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydFswXVtwYXJ0WzFdXSA9IHBhcnRbMl1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5mdW5jdGlvbiBkZXRlcm1pbmlzdGljRGVjaXJjICh2YWwsIGssIHN0YWNrLCBwYXJlbnQpIHtcbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnICYmIHZhbCAhPT0gbnVsbCkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBzdGFjay5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHN0YWNrW2ldID09PSB2YWwpIHtcbiAgICAgICAgdmFyIHByb3BlcnR5RGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocGFyZW50LCBrKVxuICAgICAgICBpZiAocHJvcGVydHlEZXNjcmlwdG9yLmdldCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKHByb3BlcnR5RGVzY3JpcHRvci5jb25maWd1cmFibGUpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwYXJlbnQsIGssIHsgdmFsdWU6ICdbQ2lyY3VsYXJdJyB9KVxuICAgICAgICAgICAgYXJyLnB1c2goW3BhcmVudCwgaywgdmFsLCBwcm9wZXJ0eURlc2NyaXB0b3JdKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXBsYWNlclN0YWNrLnB1c2goW3ZhbCwga10pXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhcmVudFtrXSA9ICdbQ2lyY3VsYXJdJ1xuICAgICAgICAgIGFyci5wdXNoKFtwYXJlbnQsIGssIHZhbF0pXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdmFsLnRvSlNPTiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHN0YWNrLnB1c2godmFsKVxuICAgIC8vIE9wdGltaXplIGZvciBBcnJheXMuIEJpZyBhcnJheXMgY291bGQga2lsbCB0aGUgcGVyZm9ybWFuY2Ugb3RoZXJ3aXNlIVxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCB2YWwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGV0ZXJtaW5pc3RpY0RlY2lyYyh2YWxbaV0sIGksIHN0YWNrLCB2YWwpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIENyZWF0ZSBhIHRlbXBvcmFyeSBvYmplY3QgaW4gdGhlIHJlcXVpcmVkIHdheVxuICAgICAgdmFyIHRtcCA9IHt9XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbCkuc29ydChjb21wYXJlRnVuY3Rpb24pXG4gICAgICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXVxuICAgICAgICBkZXRlcm1pbmlzdGljRGVjaXJjKHZhbFtrZXldLCBrZXksIHN0YWNrLCB2YWwpXG4gICAgICAgIHRtcFtrZXldID0gdmFsW2tleV1cbiAgICAgIH1cbiAgICAgIGlmIChwYXJlbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhcnIucHVzaChbcGFyZW50LCBrLCB2YWxdKVxuICAgICAgICBwYXJlbnRba10gPSB0bXBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0bXBcbiAgICAgIH1cbiAgICB9XG4gICAgc3RhY2sucG9wKClcbiAgfVxufVxuXG4vLyB3cmFwcyByZXBsYWNlciBmdW5jdGlvbiB0byBoYW5kbGUgdmFsdWVzIHdlIGNvdWxkbid0IHJlcGxhY2Vcbi8vIGFuZCBtYXJrIHRoZW0gYXMgW0NpcmN1bGFyXVxuZnVuY3Rpb24gcmVwbGFjZUdldHRlclZhbHVlcyAocmVwbGFjZXIpIHtcbiAgcmVwbGFjZXIgPSByZXBsYWNlciAhPT0gdW5kZWZpbmVkID8gcmVwbGFjZXIgOiBmdW5jdGlvbiAoaywgdikgeyByZXR1cm4gdiB9XG4gIHJldHVybiBmdW5jdGlvbiAoa2V5LCB2YWwpIHtcbiAgICBpZiAocmVwbGFjZXJTdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlcGxhY2VyU3RhY2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHBhcnQgPSByZXBsYWNlclN0YWNrW2ldXG4gICAgICAgIGlmIChwYXJ0WzFdID09PSBrZXkgJiYgcGFydFswXSA9PT0gdmFsKSB7XG4gICAgICAgICAgdmFsID0gJ1tDaXJjdWxhcl0nXG4gICAgICAgICAgcmVwbGFjZXJTdGFjay5zcGxpY2UoaSwgMSlcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXBsYWNlci5jYWxsKHRoaXMsIGtleSwgdmFsKVxuICB9XG59XG4iXX0=
)