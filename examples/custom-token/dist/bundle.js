() => (
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const { errors: rpcErrors } = require('eth-json-rpc-errors')

let userBalance = 0
let created = false

let asset = {
  symbol: 'CUSTOM',
  balance: userBalance.toString(),
  identifier: 'this-plugins-only-asset',
  image: 'https://placekitten.com/200/200',
  decimals: 0,
  customViewUrl: 'http://localhost:8085/index.html'
}

updateUi()

wallet.registerRpcMessageHandler(async (_originString, requestObject) => {
  switch (requestObject.method) {
    case 'getBalance':
      return userBalance
    case 'mint':
      userBalance += (requestObject.params[0] || 1)
      updateUi()
      return userBalance
    case 'burn':
      userBalance -= (requestObject.params[0] || userBalance)
      updateUi()
      return userBalance
    default:
      throw rpcErrors.methodNotFound(requestObject)
  }
})

function updateUi () {
  asset.balance = String(userBalance)
  let method = created ? 'updateAsset' : 'addAsset'

  // addAsset will update if identifier matches.
  wallet.send({
    method: 'wallet_manageAssets',
    params: [ method, asset ],
  })

  created = true
}


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9jdXN0b20tdG9rZW4vaW5kZXguanMiLCJleGFtcGxlcy9jdXN0b20tdG9rZW4vbm9kZV9tb2R1bGVzL2V0aC1qc29uLXJwYy1lcnJvcnMvaW5kZXguanMiLCJleGFtcGxlcy9jdXN0b20tdG9rZW4vbm9kZV9tb2R1bGVzL2V0aC1qc29uLXJwYy1lcnJvcnMvc3JjL2NsYXNzZXMuanMiLCJleGFtcGxlcy9jdXN0b20tdG9rZW4vbm9kZV9tb2R1bGVzL2V0aC1qc29uLXJwYy1lcnJvcnMvc3JjL2Vycm9yQ29kZXMuanNvbiIsImV4YW1wbGVzL2N1c3RvbS10b2tlbi9ub2RlX21vZHVsZXMvZXRoLWpzb24tcnBjLWVycm9ycy9zcmMvZXJyb3JWYWx1ZXMuanNvbiIsImV4YW1wbGVzL2N1c3RvbS10b2tlbi9ub2RlX21vZHVsZXMvZXRoLWpzb24tcnBjLWVycm9ycy9zcmMvZXJyb3JzLmpzIiwiZXhhbXBsZXMvY3VzdG9tLXRva2VuL25vZGVfbW9kdWxlcy9ldGgtanNvbi1ycGMtZXJyb3JzL3NyYy91dGlscy5qcyIsImV4YW1wbGVzL2N1c3RvbS10b2tlbi9ub2RlX21vZHVsZXMvZmFzdC1zYWZlLXN0cmluZ2lmeS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCB7IGVycm9yczogcnBjRXJyb3JzIH0gPSByZXF1aXJlKCdldGgtanNvbi1ycGMtZXJyb3JzJylcblxubGV0IHVzZXJCYWxhbmNlID0gMFxubGV0IGNyZWF0ZWQgPSBmYWxzZVxuXG5sZXQgYXNzZXQgPSB7XG4gIHN5bWJvbDogJ0NVU1RPTScsXG4gIGJhbGFuY2U6IHVzZXJCYWxhbmNlLnRvU3RyaW5nKCksXG4gIGlkZW50aWZpZXI6ICd0aGlzLXBsdWdpbnMtb25seS1hc3NldCcsXG4gIGltYWdlOiAnaHR0cHM6Ly9wbGFjZWtpdHRlbi5jb20vMjAwLzIwMCcsXG4gIGRlY2ltYWxzOiAwLFxuICBjdXN0b21WaWV3VXJsOiAnaHR0cDovL2xvY2FsaG9zdDo4MDg1L2luZGV4Lmh0bWwnXG59XG5cbnVwZGF0ZVVpKClcblxud2FsbGV0LnJlZ2lzdGVyUnBjTWVzc2FnZUhhbmRsZXIoYXN5bmMgKF9vcmlnaW5TdHJpbmcsIHJlcXVlc3RPYmplY3QpID0+IHtcbiAgc3dpdGNoIChyZXF1ZXN0T2JqZWN0Lm1ldGhvZCkge1xuICAgIGNhc2UgJ2dldEJhbGFuY2UnOlxuICAgICAgcmV0dXJuIHVzZXJCYWxhbmNlXG4gICAgY2FzZSAnbWludCc6XG4gICAgICB1c2VyQmFsYW5jZSArPSAocmVxdWVzdE9iamVjdC5wYXJhbXNbMF0gfHwgMSlcbiAgICAgIHVwZGF0ZVVpKClcbiAgICAgIHJldHVybiB1c2VyQmFsYW5jZVxuICAgIGNhc2UgJ2J1cm4nOlxuICAgICAgdXNlckJhbGFuY2UgLT0gKHJlcXVlc3RPYmplY3QucGFyYW1zWzBdIHx8IHVzZXJCYWxhbmNlKVxuICAgICAgdXBkYXRlVWkoKVxuICAgICAgcmV0dXJuIHVzZXJCYWxhbmNlXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IHJwY0Vycm9ycy5tZXRob2ROb3RGb3VuZChyZXF1ZXN0T2JqZWN0KVxuICB9XG59KVxuXG5mdW5jdGlvbiB1cGRhdGVVaSAoKSB7XG4gIGFzc2V0LmJhbGFuY2UgPSBTdHJpbmcodXNlckJhbGFuY2UpXG4gIGxldCBtZXRob2QgPSBjcmVhdGVkID8gJ3VwZGF0ZUFzc2V0JyA6ICdhZGRBc3NldCdcblxuICAvLyBhZGRBc3NldCB3aWxsIHVwZGF0ZSBpZiBpZGVudGlmaWVyIG1hdGNoZXMuXG4gIHdhbGxldC5zZW5kKHtcbiAgICBtZXRob2Q6ICd3YWxsZXRfbWFuYWdlQXNzZXRzJyxcbiAgICBwYXJhbXM6IFsgbWV0aG9kLCBhc3NldCBdLFxuICB9KVxuXG4gIGNyZWF0ZWQgPSB0cnVlXG59XG5cbiIsIlxuY29uc3QgeyBKc29uUnBjRXJyb3IsIEV0aEpzb25ScGNFcnJvciB9ID0gcmVxdWlyZSgnLi9zcmMvY2xhc3NlcycpXG5jb25zdCB7XG4gIHNlcmlhbGl6ZUVycm9yLCBnZXRNZXNzYWdlRnJvbUNvZGUsXG59ID0gcmVxdWlyZSgnLi9zcmMvdXRpbHMnKVxuY29uc3QgZXJyb3JzID0gcmVxdWlyZSgnLi9zcmMvZXJyb3JzJylcbmNvbnN0IEVSUk9SX0NPREVTID0gcmVxdWlyZSgnLi9zcmMvZXJyb3JDb2Rlcy5qc29uJylcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGVycm9ycyxcbiAgSnNvblJwY0Vycm9yLFxuICBFdGhKc29uUnBjRXJyb3IsXG4gIHNlcmlhbGl6ZUVycm9yLFxuICBnZXRNZXNzYWdlRnJvbUNvZGUsXG4gIC8qKiBAdHlwZSBFcnJvckNvZGVzICovXG4gIEVSUk9SX0NPREVTLFxufVxuXG4vLyBUeXBlc1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IEV0aEpzb25ScGNFcnJvckNvZGVzXG4gKiBAcHJvcGVydHkge251bWJlcn0gdXNlclJlamVjdGVkUmVxdWVzdFxuICogQHByb3BlcnR5IHtudW1iZXJ9IHVuYXV0aG9yaXplZFxuICogQHByb3BlcnR5IHtudW1iZXJ9IHVuc3VwcG9ydGVkTWV0aG9kXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBKc29uUnBjRXJyb3JDb2Rlc1xuICogQHByb3BlcnR5IHtudW1iZXJ9IHBhcnNlXG4gKiBAcHJvcGVydHkge251bWJlcn0gaW52YWxpZFJlcXVlc3RcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBpbnZhbGlkUGFyYW1zXG4gKiBAcHJvcGVydHkge251bWJlcn0gbWV0aG9kTm90Rm91bmRcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBpbnRlcm5hbFxuICovXG5cbi8qKlxuICogQHR5cGVkZWYgRXJyb3JDb2Rlc1xuICogQHByb3BlcnR5IHtKc29uUnBjRXJyb3JDb2Rlc30ganNvblJwY1xuICogQHByb3BlcnR5IHtFdGhKc29uUnBjRXJyb3JDb2Rlc30gZXRoXG4gKi9cbiIsIlxuY29uc3Qgc2FmZVN0cmluZ2lmeSA9IHJlcXVpcmUoJ2Zhc3Qtc2FmZS1zdHJpbmdpZnknKVxuXG4vKipcbiAqIEBjbGFzcyBKc29uUnBjRXJyb3JcbiAqIEVycm9yIHN1YmNsYXNzIGltcGxlbWVudGluZyBKU09OIFJQQyAyLjAgZXJyb3JzLlxuICogUGVybWl0cyBhbnkgaW50ZWdlciBlcnJvciBjb2RlLlxuICovXG5jbGFzcyBKc29uUnBjRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIEpTT04gUlBDIGVycm9yLlxuICAgKiBAcGFyYW0ge251bWJlcn0gY29kZSAtIFRoZSBpbnRlZ2VyIGVycm9yIGNvZGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gVGhlIHN0cmluZyBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge2FueX0gW2RhdGFdIC0gVGhlIGVycm9yIGRhdGEuXG4gICAqL1xuICBjb25zdHJ1Y3RvciAoY29kZSwgbWVzc2FnZSwgZGF0YSkge1xuXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGNvZGUpKSB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnXCJjb2RlXCIgbXVzdCBiZSBhbiBpbnRlZ2VyLidcbiAgICApXG4gICAgaWYgKCFtZXNzYWdlIHx8IHR5cGVvZiBtZXNzYWdlICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ1wibWVzc2FnZVwiIG11c3QgYmUgYSBub25lbXB0eSBzdHJpbmcuJ1xuICAgIClcblxuICAgIHN1cGVyKG1lc3NhZ2UpXG4gICAgdGhpcy5jb2RlID0gY29kZVxuICAgIGlmIChkYXRhICE9PSB1bmRlZmluZWQpIHRoaXMuZGF0YSA9IGRhdGFcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcGxhaW4gb2JqZWN0IHdpdGggYWxsIHB1YmxpYyBjbGFzcyBwcm9wZXJ0aWVzLlxuICAgKiBAcmV0dXJucyB7b2JqZWN0fSBUaGUgc2VyaWFsaXplZCBlcnJvci4gXG4gICAqL1xuICBzZXJpYWxpemUoKSB7XG4gICAgY29uc3Qgc2VyaWFsaXplZCA9IHtcbiAgICAgIGNvZGU6IHRoaXMuY29kZSxcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICB9XG4gICAgaWYgKHRoaXMuZGF0YSAhPT0gdW5kZWZpbmVkKSBzZXJpYWxpemVkLmRhdGEgPSB0aGlzLmRhdGFcbiAgICBpZiAodGhpcy5zdGFjaykgc2VyaWFsaXplZC5zdGFjayA9IHRoaXMuc3RhY2tcbiAgICByZXR1cm4gc2VyaWFsaXplZFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgc2VyaWFsaXplZCBlcnJvciwgb21pdHRpbmdcbiAgICogYW55IGNpcmN1bGFyIHJlZmVyZW5jZXMuXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzZXJpYWxpemVkIGVycm9yIGFzIGEgc3RyaW5nLlxuICAgKi9cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHNhZmVTdHJpbmdpZnkoXG4gICAgICB0aGlzLnNlcmlhbGl6ZSgpLFxuICAgICAgc3RyaW5naWZ5UmVwbGFjZXIsXG4gICAgICAyXG4gICAgKVxuICB9XG59XG5cbi8qKlxuICogQGNsYXNzIEV0aEpzb25ScGNFcnJvclxuICogRXJyb3Igc3ViY2xhc3MgaW1wbGVtZW50aW5nIEV0aGVyZXVtIEpTT04gUlBDIGVycm9ycy5cbiAqIFBlcm1pdHMgaW50ZWdlciBlcnJvciBjb2RlcyBpbiB0aGUgWyAxMDAwIDw9IDQ5OTkgXSByYW5nZS5cbiAqL1xuY2xhc3MgRXRoSnNvblJwY0Vycm9yIGV4dGVuZHMgSnNvblJwY0Vycm9yIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhbiBFdGhlcmV1bSBKU09OIFJQQyBlcnJvci5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvZGUgLSBUaGUgaW50ZWdlciBlcnJvciBjb2RlLCBpbiB0aGUgWyAxMDAwIDw9IDQ5OTkgXSByYW5nZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBUaGUgc3RyaW5nIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7YW55fSBbZGF0YV0gLSBUaGUgZXJyb3IgZGF0YS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGNvZGUsIG1lc3NhZ2UsIGRhdGEpIHtcbiAgICBpZiAoIWlzVmFsaWRFdGhDb2RlKGNvZGUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdcImNvZGVcIiBtdXN0IGJlIGFuIGludGVnZXIgc3VjaCB0aGF0OiAxMDAwIDw9IGNvZGUgPD0gNDk5OSdcbiAgICAgIClcbiAgICB9XG4gICAgc3VwZXIoY29kZSwgbWVzc2FnZSwgZGF0YSlcbiAgfVxufVxuXG4vLyBJbnRlcm5hbFxuXG5mdW5jdGlvbiBpc1ZhbGlkRXRoQ29kZShjb2RlKSB7XG4gIHJldHVybiBOdW1iZXIuaXNJbnRlZ2VyKGNvZGUpICYmIGNvZGUgPj0gMTAwMCAmJiBjb2RlIDw9IDQ5OTlcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5UmVwbGFjZXIoXywgdmFsdWUpIHtcbiAgaWYgKHZhbHVlID09PSAnW0NpcmN1bGFyXScpIHtcbiAgICByZXR1cm5cbiAgfVxuICByZXR1cm4gdmFsdWVcbn1cblxuLy8gRXhwb3J0c1xuXG5tb2R1bGUuZXhwb3J0cyA9ICB7XG4gIEpzb25ScGNFcnJvcixcbiAgRXRoSnNvblJwY0Vycm9yLFxufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcImpzb25ScGNcIjoge1xuICAgICAgXCJwYXJzZVwiOiAtMzI3MDAsXG4gICAgICBcImludmFsaWRSZXF1ZXN0XCI6IC0zMjYwMCxcbiAgICAgIFwibWV0aG9kTm90Rm91bmRcIjogLTMyNjAxLFxuICAgICAgXCJpbnZhbGlkUGFyYW1zXCI6IC0zMjYwMixcbiAgICAgIFwiaW50ZXJuYWxcIjogLTMyNjAzXG4gIH0sXG4gIFwiZXRoXCI6IHtcbiAgICBcInVzZXJSZWplY3RlZFJlcXVlc3RcIjogNDAwMSxcbiAgICBcInVuYXV0aG9yaXplZFwiOiA0MTAwLFxuICAgIFwidW5zdXBwb3J0ZWRNZXRob2RcIjogNDIwMFxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiLTMyNzAwXCI6IHtcbiAgICBcInN0YW5kYXJkXCI6IFwiSlNPTiBSUEMgMi4wXCIsXG4gICAgXCJtZXNzYWdlXCI6IFwiSW52YWxpZCBKU09OIHdhcyByZWNlaXZlZCBieSB0aGUgc2VydmVyLiBBbiBlcnJvciBvY2N1cnJlZCBvbiB0aGUgc2VydmVyIHdoaWxlIHBhcnNpbmcgdGhlIEpTT04gdGV4dC5cIlxuICB9LFxuICBcIi0zMjYwMFwiOiB7XG4gICAgXCJzdGFuZGFyZFwiOiBcIkpTT04gUlBDIDIuMFwiLFxuICAgIFwibWVzc2FnZVwiOiBcIlRoZSBKU09OIHNlbnQgaXMgbm90IGEgdmFsaWQgUmVxdWVzdCBvYmplY3QuXCJcbiAgfSxcbiAgXCItMzI2MDFcIjoge1xuICAgIFwic3RhbmRhcmRcIjogXCJKU09OIFJQQyAyLjBcIixcbiAgICBcIm1lc3NhZ2VcIjogXCJUaGUgbWV0aG9kIGRvZXMgbm90IGV4aXN0IC8gaXMgbm90IGF2YWlsYWJsZS5cIlxuICB9LFxuICBcIi0zMjYwMlwiOiB7XG4gICAgXCJzdGFuZGFyZFwiOiBcIkpTT04gUlBDIDIuMFwiLFxuICAgIFwibWVzc2FnZVwiOiBcIkludmFsaWQgbWV0aG9kIHBhcmFtZXRlcihzKS5cIlxuICB9LFxuICBcIi0zMjYwM1wiOiB7XG4gICAgXCJzdGFuZGFyZFwiOiBcIkpTT04gUlBDIDIuMFwiLFxuICAgIFwibWVzc2FnZVwiOiBcIkludGVybmFsIEpTT04tUlBDIGVycm9yLlwiXG4gIH0sXG4gIFwiNDAwMVwiOiB7XG4gICAgXCJzdGFuZGFyZFwiOiBcIkVJUCAxMTkzXCIsXG4gICAgXCJtZXNzYWdlXCI6IFwiVXNlciByZWplY3RlZCB0aGUgcmVxdWVzdC5cIlxuICB9LFxuICBcIjQxMDBcIjoge1xuICAgIFwic3RhbmRhcmRcIjogXCJFSVAgMTE5M1wiLFxuICAgIFwibWVzc2FnZVwiOiBcIlRoZSByZXF1ZXN0ZWQgYWNjb3VudCBhbmQvb3IgbWV0aG9kIGhhcyBub3QgYmVlbiBhdXRob3JpemVkIGJ5IHRoZSB1c2VyLlwiXG4gIH0sXG4gIFwiNDIwMFwiOiB7XG4gICAgXCJzdGFuZGFyZFwiOiBcIkVJUCAxMTkzXCIsXG4gICAgXCJtZXNzYWdlXCI6IFwiVGhlIHJlcXVlc3RlZCBtZXRob2QgaXMgbm90IHN1cHBvcnRlZCBieSB0aGlzIEV0aGVyZXVtIHByb3ZpZGVyLlwiXG4gIH1cbn1cbiIsIlxuY29uc3QgeyBKc29uUnBjRXJyb3IsIEV0aEpzb25ScGNFcnJvciB9ID0gcmVxdWlyZSgnLi9jbGFzc2VzJylcbmNvbnN0IHsgZ2V0TWVzc2FnZUZyb21Db2RlIH0gPSByZXF1aXJlKCcuL3V0aWxzJylcbmNvbnN0IEVSUk9SX0NPREVTID0gcmVxdWlyZSgnLi9lcnJvckNvZGVzLmpzb24nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgLyoqXG4gICAqIEdldCBhIEpTT04gUlBDIDIuMCBQYXJzZSBlcnJvci5cbiAgICogQHBhcmFtIHtzdHJpbmd9IFttZXNzYWdlXSAtIEEgY3VzdG9tIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7YW55fSBbZGF0YV0gLSBFcnJvciBkYXRhLlxuICAgKiBAcmV0dXJuIHtKc29uUnBjRXJyb3J9IFRoZSBlcnJvci5cbiAgICovXG4gIHBhcnNlOiAobWVzc2FnZSwgZGF0YSkgPT4gZ2V0SnNvblJwY0Vycm9yKFxuICAgIEVSUk9SX0NPREVTLmpzb25ScGMucGFyc2UsIG1lc3NhZ2UsIGRhdGFcbiAgKSxcblxuICAvKipcbiAgICogR2V0IGEgSlNPTiBSUEMgMi4wIEludmFsaWQgUmVxdWVzdCBlcnJvci5cbiAgICogQHBhcmFtIHtzdHJpbmd9IFttZXNzYWdlXSAtIEEgY3VzdG9tIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7YW55fSBbZGF0YV0gLSBFcnJvciBkYXRhLlxuICAgKiBAcmV0dXJuIHtKc29uUnBjRXJyb3J9IFRoZSBlcnJvci5cbiAgICovXG4gIGludmFsaWRSZXF1ZXN0OiAobWVzc2FnZSwgZGF0YSkgPT4gZ2V0SnNvblJwY0Vycm9yKFxuICAgIEVSUk9SX0NPREVTLmpzb25ScGMuaW52YWxpZFJlcXVlc3QsIG1lc3NhZ2UsIGRhdGFcbiAgKSxcblxuICAvKipcbiAgICogR2V0IGEgSlNPTiBSUEMgMi4wIEludmFsaWQgUGFyYW1zIGVycm9yLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gW21lc3NhZ2VdIC0gQSBjdXN0b20gbWVzc2FnZS5cbiAgICogQHBhcmFtIHthbnl9IFtkYXRhXSAtIEVycm9yIGRhdGEuXG4gICAqIEByZXR1cm4ge0pzb25ScGNFcnJvcn0gVGhlIGVycm9yLlxuICAgKi9cbiAgaW52YWxpZFBhcmFtczogKG1lc3NhZ2UsIGRhdGEpID0+IGdldEpzb25ScGNFcnJvcihcbiAgICBFUlJPUl9DT0RFUy5qc29uUnBjLmludmFsaWRQYXJhbXMsIG1lc3NhZ2UsIGRhdGFcbiAgKSxcblxuICAvKipcbiAgICogR2V0IGEgSlNPTiBSUEMgMi4wIE1ldGhvZCBOb3QgRm91bmQgZXJyb3IuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbbWVzc2FnZV0gLSBBIGN1c3RvbSBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge2FueX0gW2RhdGFdIC0gRXJyb3IgZGF0YS5cbiAgICogQHJldHVybiB7SnNvblJwY0Vycm9yfSBUaGUgZXJyb3IuXG4gICAqL1xuICBtZXRob2ROb3RGb3VuZDogKG1lc3NhZ2UsIGRhdGEpID0+IGdldEpzb25ScGNFcnJvcihcbiAgICBFUlJPUl9DT0RFUy5qc29uUnBjLm1ldGhvZE5vdEZvdW5kLCBtZXNzYWdlLCBkYXRhXG4gICksXG5cbiAgLyoqXG4gICAqIEdldCBhIEpTT04gUlBDIDIuMCBJbnRlcm5hbCBlcnJvci5cbiAgICogQHBhcmFtIHtzdHJpbmd9IFttZXNzYWdlXSAtIEEgY3VzdG9tIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7YW55fSBbZGF0YV0gLSBFcnJvciBkYXRhLlxuICAgKiBAcmV0dXJuIHtKc29uUnBjRXJyb3J9IFRoZSBlcnJvci5cbiAgICovXG4gIGludGVybmFsOiAobWVzc2FnZSwgZGF0YSkgPT4gZ2V0SnNvblJwY0Vycm9yKFxuICAgIEVSUk9SX0NPREVTLmpzb25ScGMuaW50ZXJuYWwsIG1lc3NhZ2UsIGRhdGFcbiAgKSxcblxuICAvKipcbiAgICogR2V0IGEgSlNPTiBSUEMgMi4wIFNlcnZlciBlcnJvci5cbiAgICogUGVybWl0cyBpbnRlZ2VyIGVycm9yIGNvZGVzIGluIHRoZSBbIC0zMjA5OSA8PSAtMzIwMDAgXSByYW5nZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvZGUgLSBUaGUgaW50ZWdlciBlcnJvciBjb2RlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gW21lc3NhZ2VdIC0gQSBjdXN0b20gbWVzc2FnZS5cbiAgICogQHBhcmFtIHthbnl9IFtkYXRhXSAtIEVycm9yIGRhdGEuXG4gICAqIEByZXR1cm4ge0pzb25ScGNFcnJvcn0gVGhlIGVycm9yLlxuICAgKi9cbiAgc2VydmVyOiAoY29kZSwgbWVzc2FnZSwgZGF0YSkgPT4ge1xuICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihjb2RlKSB8fCBjb2RlID4gLTMyMDAwIHx8IGNvZGUgPCAtMzIwOTkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ1wiY29kZVwiIG11c3QgYmUgYW4gaW50ZWdlciBzdWNoIHRoYXQ6IC0zMjA5OSA8PSBjb2RlIDw9IC0zMjAwMCdcbiAgICAgIClcbiAgICB9XG4gICAgcmV0dXJuIGdldEpzb25ScGNFcnJvcihjb2RlLCBtZXNzYWdlLCBkYXRhKVxuICB9LFxuICBldGg6IHtcbiAgICAvKipcbiAgICAgKiBHZXQgYW4gRXRoZXJldW0gSlNPTiBSUEMgVXNlciBSZWplY3RlZCBSZXF1ZXN0IGVycm9yLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbbWVzc2FnZV0gLSBBIGN1c3RvbSBtZXNzYWdlLlxuICAgICAqIEBwYXJhbSB7YW55fSBbZGF0YV0gLSBFcnJvciBkYXRhLlxuICAgICAqIEByZXR1cm4ge0V0aEpzb25ScGNFcnJvcn0gVGhlIGVycm9yLlxuICAgICAqL1xuICAgIHVzZXJSZWplY3RlZFJlcXVlc3Q6IChtZXNzYWdlLCBkYXRhKSA9PiB7XG4gICAgICByZXR1cm4gZ2V0RXRoSnNvblJwY0Vycm9yKFxuICAgICAgICBFUlJPUl9DT0RFUy5ldGgudXNlclJlamVjdGVkUmVxdWVzdCwgbWVzc2FnZSwgZGF0YVxuICAgICAgKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYW4gRXRoZXJldW0gSlNPTiBSUEMgVW5hdXRob3JpemVkIGVycm9yLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbbWVzc2FnZV0gLSBBIGN1c3RvbSBtZXNzYWdlLlxuICAgICAqIEBwYXJhbSB7YW55fSBbZGF0YV0gLSBFcnJvciBkYXRhLlxuICAgICAqIEByZXR1cm4ge0V0aEpzb25ScGNFcnJvcn0gVGhlIGVycm9yLlxuICAgICAqL1xuICAgIHVuYXV0aG9yaXplZDogKG1lc3NhZ2UsIGRhdGEpID0+IHtcbiAgICAgIHJldHVybiBnZXRFdGhKc29uUnBjRXJyb3IoXG4gICAgICAgIEVSUk9SX0NPREVTLmV0aC51bmF1dGhvcml6ZWQsIG1lc3NhZ2UsIGRhdGFcbiAgICAgIClcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGFuIEV0aGVyZXVtIEpTT04gUlBDIFVuc3VwcG9ydGVkIE1ldGhvZCBlcnJvci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW21lc3NhZ2VdIC0gQSBjdXN0b20gbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0ge2FueX0gW2RhdGFdIC0gRXJyb3IgZGF0YS5cbiAgICAgKiBAcmV0dXJuIHtFdGhKc29uUnBjRXJyb3J9IFRoZSBlcnJvci5cbiAgICAgKi9cbiAgICB1bnN1cHBvcnRlZE1ldGhvZDogKG1lc3NhZ2UsIGRhdGEpID0+IHtcbiAgICAgIHJldHVybiBnZXRFdGhKc29uUnBjRXJyb3IoXG4gICAgICAgIEVSUk9SX0NPREVTLmV0aC51bnN1cHBvcnRlZE1ldGhvZCwgbWVzc2FnZSwgZGF0YVxuICAgICAgKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYSBjdXN0b20gRXRoZXJldW0gSlNPTiBSUEMgZXJyb3IuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvZGUgLSBUaGUgZXJyb3IgY29kZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIFRoZSBlcnJvciBtZXNzYWdlLlxuICAgICAqIEBwYXJhbSB7YW55fSBbZGF0YV0gLSBFcnJvciBkYXRhLlxuICAgICAqIEByZXR1cm4ge0V0aEpzb25ScGNFcnJvcn0gVGhlIGVycm9yLlxuICAgICAqL1xuICAgIGN1c3RvbTogKGNvZGUsIG1lc3NhZ2UsIGRhdGEpID0+IHtcbiAgICAgIGlmICghbWVzc2FnZSB8fCB0eXBlb2YgbWVzc2FnZSAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ1wibWVzc2FnZVwiIG11c3QgYmUgYSBub25lbXB0eSBzdHJpbmcnXG4gICAgICApXG4gICAgICByZXR1cm4gbmV3IEV0aEpzb25ScGNFcnJvcihjb2RlLCBtZXNzYWdlLCBkYXRhKVxuICAgIH0sXG4gIH0sXG59XG5cbi8vIEludGVybmFsXG5cbmZ1bmN0aW9uIGdldEpzb25ScGNFcnJvcihjb2RlLCBtZXNzYWdlLCBkYXRhKSB7XG4gIHJldHVybiBuZXcgSnNvblJwY0Vycm9yKFxuICAgIGNvZGUsXG4gICAgbWVzc2FnZSB8fCBnZXRNZXNzYWdlRnJvbUNvZGUoY29kZSksXG4gICAgZGF0YVxuICApXG59XG5cbmZ1bmN0aW9uIGdldEV0aEpzb25ScGNFcnJvcihjb2RlLCBtZXNzYWdlLCBkYXRhKSB7XG4gIHJldHVybiBuZXcgRXRoSnNvblJwY0Vycm9yKFxuICAgIGNvZGUsXG4gICAgbWVzc2FnZSB8fCBnZXRNZXNzYWdlRnJvbUNvZGUoY29kZSksXG4gICAgZGF0YVxuICApXG59XG4iLCJcbmNvbnN0IGVycm9yVmFsdWVzID0gcmVxdWlyZSgnLi9lcnJvclZhbHVlcy5qc29uJylcbmNvbnN0IEZBTExCQUNLX0VSUk9SX0NPREUgPSByZXF1aXJlKCcuL2Vycm9yQ29kZXMuanNvbicpLmpzb25ScGMuaW50ZXJuYWxcbmNvbnN0IHsgSnNvblJwY0Vycm9yIH0gPSByZXF1aXJlKCcuL2NsYXNzZXMnKVxuXG5jb25zdCBKU09OX1JQQ19TRVJWRVJfRVJST1JfTUVTU0FHRSA9ICdVbnNwZWNpZmllZCBzZXJ2ZXIgZXJyb3IuJ1xuXG5jb25zdCBGQUxMQkFDS19NRVNTQUdFID0gJ1Vuc3BlY2lmaWVkIGVycm9yIG1lc3NhZ2UuIFRoaXMgaXMgIGJ1ZywgcGxlYXNlIHJlcG9ydCBpdC4nXG5cbmNvbnN0IEZBTExCQUNLX0VSUk9SID0ge1xuICBjb2RlOiBGQUxMQkFDS19FUlJPUl9DT0RFLFxuICBtZXNzYWdlOiBnZXRNZXNzYWdlRnJvbUNvZGUoRkFMTEJBQ0tfRVJST1JfQ09ERSlcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBtZXNzYWdlIGZvciBhIGdpdmVuIGNvZGUsIG9yIGEgZmFsbGJhY2sgbWVzc2FnZSBpZiB0aGUgY29kZSBoYXNcbiAqIG5vIGNvcnJlc3BvbmRpbmcgbWVzc2FnZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBjb2RlIC0gVGhlIGludGVnZXIgZXJyb3IgY29kZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBmYWxsYmFja01lc3NhZ2UgLSBUaGUgZmFsbGJhY2sgbWVzc2FnZS5cbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIGNvcnJlc3BvbmRpbmcgbWVzc2FnZSBvciB0aGUgZmFsbGJhY2sgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gZ2V0TWVzc2FnZUZyb21Db2RlKGNvZGUsIGZhbGxiYWNrTWVzc2FnZSA9IEZBTExCQUNLX01FU1NBR0UpIHtcblxuICBpZiAoTnVtYmVyLmlzSW50ZWdlcihjb2RlKSkge1xuXG4gICAgY29uc3QgY29kZVN0cmluZyA9IGNvZGUudG9TdHJpbmcoKVxuICAgIGlmIChlcnJvclZhbHVlc1tjb2RlU3RyaW5nXSkgcmV0dXJuIGVycm9yVmFsdWVzW2NvZGVTdHJpbmddLm1lc3NhZ2VcblxuICAgIGlmIChpc0pzb25ScGNTZXJ2ZXJFcnJvcihjb2RlKSkgcmV0dXJuIEpTT05fUlBDX1NFUlZFUl9FUlJPUl9NRVNTQUdFXG5cbiAgICAvLyBUT0RPOiBhbGxvdyB2YWxpZCBjb2RlcyBhbmQgbWVzc2FnZXMgdG8gYmUgZXh0ZW5kZWRcbiAgICAvLyAvLyBFSVAgMTE5MyBTdGF0dXMgQ29kZXNcbiAgICAvLyBpZiAoY29kZSA+PSA0MDAwICYmIGNvZGUgPD0gNDk5OSkgcmV0dXJuIFNvbWV0aGluZz9cbiAgfVxuICByZXR1cm4gZmFsbGJhY2tNZXNzYWdlXG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBjb2RlIGlzIHZhbGlkLlxuICogQSBjb2RlIGlzIG9ubHkgdmFsaWQgaWYgaXQgaGFzIGEgbWVzc2FnZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBjb2RlIC0gVGhlIGNvZGUgdG8gY2hlY2tcbiAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIGNvZGUgaXMgdmFsaWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZnVuY3Rpb24gaXNWYWxpZENvZGUoY29kZSkge1xuXG4gIGlmICghTnVtYmVyLmlzSW50ZWdlcihjb2RlKSkgcmV0dXJuIGZhbHNlXG5cbiAgY29uc3QgY29kZVN0cmluZyA9IGNvZGUudG9TdHJpbmcoKVxuICBpZiAoZXJyb3JWYWx1ZXNbY29kZVN0cmluZ10pIHJldHVybiB0cnVlXG5cbiAgaWYgKGlzSnNvblJwY1NlcnZlckVycm9yKGNvZGUpKSByZXR1cm4gdHJ1ZVxuXG4gIC8vIFRPRE86IGFsbG93IHZhbGlkIGNvZGVzIGFuZCBtZXNzYWdlcyB0byBiZSBleHRlbmRlZFxuICAvLyAvLyBFSVAgMTE5MyBTdGF0dXMgQ29kZXNcbiAgLy8gaWYgKGNvZGUgPj0gNDAwMCAmJiBjb2RlIDw9IDQ5OTkpIHJldHVybiB0cnVlXG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8qKlxuICogU2VyaWFsaXplcyB0aGUgZ2l2ZW4gZXJyb3IgdG8gYW4gRVRIIEpTT04gUlBDLWNvbXBhdGlibGUgZXJyb3Igb2JqZWN0LlxuICogTWVyZWx5IGNvcGllcyB0aGUgZ2l2ZW4gZXJyb3IncyB2YWx1ZXMgaWYgaXQgaXMgYWxyZWFkeSBjb21wYXRpYmxlLlxuICogSWYgdGhlIGdpdmVuIGVycm9yIGlzIG5vdCBmdWxseSBjb21wYXRpYmxlLCBpdCB3aWxsIGJlIHByZXNlcnZlZCBvbiB0aGVcbiAqIHJldHVybmVkIG9iamVjdCdzIGRhdGEub3JpZ2luYWxFcnJvciBwcm9wZXJ0eS5cbiAqIEFkZHMgYSAnc3RhY2snIHByb3BlcnR5IGlmIGl0IGV4aXN0cyBvbiB0aGUgZ2l2ZW4gZXJyb3IuXG4gKlxuICogQHBhcmFtIHthbnl9IGVycm9yIC0gVGhlIGVycm9yIHRvIHNlcmlhbGl6ZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSBmYWxsYmFja0Vycm9yIC0gVGhlIGN1c3RvbSBmYWxsYmFjayBlcnJvciB2YWx1ZXMgaWYgdGhlXG4gKiBnaXZlbiBlcnJvciBpcyBpbnZhbGlkLlxuICogQHJldHVybiB7b2JqZWN0fSBBIHN0YW5kYXJkaXplZCBlcnJvciBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIHNlcmlhbGl6ZUVycm9yIChlcnJvciwgZmFsbGJhY2tFcnJvciA9IEZBTExCQUNLX0VSUk9SKSB7XG5cbiAgaWYgKFxuICAgICFmYWxsYmFja0Vycm9yIHx8IFxuICAgICFOdW1iZXIuaXNJbnRlZ2VyKGZhbGxiYWNrRXJyb3IuY29kZSkgfHxcbiAgICB0eXBlb2YgZmFsbGJhY2tFcnJvci5tZXNzYWdlICE9PSAnc3RyaW5nJ1xuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnZmFsbGJhY2tFcnJvciBtdXN0IGNvbnRhaW4gaW50ZWdlciBudW1iZXIgY29kZSBhbmQgc3RyaW5nIG1lc3NhZ2UuJ1xuICAgIClcbiAgfVxuXG4gIGlmICh0eXBlb2YgZXJyb3IgPT09ICdvYmplY3QnICYmIGVycm9yIGluc3RhbmNlb2YgSnNvblJwY0Vycm9yKSB7XG4gICAgcmV0dXJuIGVycm9yLnNlcmlhbGl6ZSgpXG4gIH1cblxuICBjb25zdCBzZXJpYWxpemVkID0ge31cblxuICBpZiAoZXJyb3IgJiYgaXNWYWxpZENvZGUoZXJyb3IuY29kZSkpIHtcblxuICAgIHNlcmlhbGl6ZWQuY29kZSA9IGVycm9yLmNvZGVcblxuICAgIGlmIChlcnJvci5tZXNzYWdlICYmIHR5cGVvZiBlcnJvci5tZXNzYWdlID09PSAnc3RyaW5nJykge1xuICAgICAgc2VyaWFsaXplZC5tZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICAgICAgaWYgKGVycm9yLmhhc093blByb3BlcnR5KCdkYXRhJykpIHNlcmlhbGl6ZWQuZGF0YSA9IGVycm9yLmRhdGFcbiAgICB9IGVsc2Uge1xuICAgICAgc2VyaWFsaXplZC5tZXNzYWdlID0gZ2V0TWVzc2FnZUZyb21Db2RlKHNlcmlhbGl6ZWQuY29kZSlcbiAgICAgIHNlcmlhbGl6ZWQuZGF0YSA9IHsgb3JpZ2luYWxFcnJvcjogYXNzaWduT3JpZ2luYWxFcnJvcihlcnJvcikgfVxuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHNlcmlhbGl6ZWQuY29kZSA9IGZhbGxiYWNrRXJyb3IuY29kZVxuICAgIHNlcmlhbGl6ZWQubWVzc2FnZSA9IChcbiAgICAgIGVycm9yICYmIGVycm9yLm1lc3NhZ2VcbiAgICAgICAgPyBlcnJvci5tZXNzYWdlXG4gICAgICAgIDogZmFsbGJhY2tFcnJvci5tZXNzYWdlXG4gICAgKVxuICAgIHNlcmlhbGl6ZWQuZGF0YSA9IHsgb3JpZ2luYWxFcnJvcjogYXNzaWduT3JpZ2luYWxFcnJvcihlcnJvcikgfVxuICB9XG5cbiAgaWYgKGVycm9yICYmIGVycm9yLnN0YWNrKSBzZXJpYWxpemVkLnN0YWNrID0gZXJyb3Iuc3RhY2tcbiAgcmV0dXJuIHNlcmlhbGl6ZWRcbn1cblxuLy8gSW50ZXJuYWxcblxuZnVuY3Rpb24gaXNKc29uUnBjU2VydmVyRXJyb3IgKGNvZGUpIHtcbiAgcmV0dXJuIGNvZGUgPj0gLTMyMDk5ICYmIGNvZGUgPD0gLTMyMDAwXG59XG5cbmZ1bmN0aW9uIGFzc2lnbk9yaWdpbmFsRXJyb3IgKGVycm9yKSB7XG4gIGlmIChlcnJvciAmJiB0eXBlb2YgZXJyb3IgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KGVycm9yKSkge1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBlcnJvcilcbiAgfVxuICByZXR1cm4gZXJyb3Jcbn1cblxuLy8gRXhwb3J0c1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0TWVzc2FnZUZyb21Db2RlLFxuICBpc1ZhbGlkQ29kZSxcbiAgc2VyaWFsaXplRXJyb3IsXG4gIEpTT05fUlBDX1NFUlZFUl9FUlJPUl9NRVNTQUdFLFxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBzdHJpbmdpZnlcbnN0cmluZ2lmeS5kZWZhdWx0ID0gc3RyaW5naWZ5XG5zdHJpbmdpZnkuc3RhYmxlID0gZGV0ZXJtaW5pc3RpY1N0cmluZ2lmeVxuc3RyaW5naWZ5LnN0YWJsZVN0cmluZ2lmeSA9IGRldGVybWluaXN0aWNTdHJpbmdpZnlcblxudmFyIGFyciA9IFtdXG52YXIgcmVwbGFjZXJTdGFjayA9IFtdXG5cbi8vIFJlZ3VsYXIgc3RyaW5naWZ5XG5mdW5jdGlvbiBzdHJpbmdpZnkgKG9iaiwgcmVwbGFjZXIsIHNwYWNlcikge1xuICBkZWNpcmMob2JqLCAnJywgW10sIHVuZGVmaW5lZClcbiAgdmFyIHJlc1xuICBpZiAocmVwbGFjZXJTdGFjay5sZW5ndGggPT09IDApIHtcbiAgICByZXMgPSBKU09OLnN0cmluZ2lmeShvYmosIHJlcGxhY2VyLCBzcGFjZXIpXG4gIH0gZWxzZSB7XG4gICAgcmVzID0gSlNPTi5zdHJpbmdpZnkob2JqLCByZXBsYWNlR2V0dGVyVmFsdWVzKHJlcGxhY2VyKSwgc3BhY2VyKVxuICB9XG4gIHdoaWxlIChhcnIubGVuZ3RoICE9PSAwKSB7XG4gICAgdmFyIHBhcnQgPSBhcnIucG9wKClcbiAgICBpZiAocGFydC5sZW5ndGggPT09IDQpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwYXJ0WzBdLCBwYXJ0WzFdLCBwYXJ0WzNdKVxuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0WzBdW3BhcnRbMV1dID0gcGFydFsyXVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzXG59XG5mdW5jdGlvbiBkZWNpcmMgKHZhbCwgaywgc3RhY2ssIHBhcmVudCkge1xuICB2YXIgaVxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgJiYgdmFsICE9PSBudWxsKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IHN0YWNrLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoc3RhY2tbaV0gPT09IHZhbCkge1xuICAgICAgICB2YXIgcHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihwYXJlbnQsIGspXG4gICAgICAgIGlmIChwcm9wZXJ0eURlc2NyaXB0b3IuZ2V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAocHJvcGVydHlEZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHBhcmVudCwgaywgeyB2YWx1ZTogJ1tDaXJjdWxhcl0nIH0pXG4gICAgICAgICAgICBhcnIucHVzaChbcGFyZW50LCBrLCB2YWwsIHByb3BlcnR5RGVzY3JpcHRvcl0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcGxhY2VyU3RhY2sucHVzaChbdmFsLCBrXSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGFyZW50W2tdID0gJ1tDaXJjdWxhcl0nXG4gICAgICAgICAgYXJyLnB1c2goW3BhcmVudCwgaywgdmFsXSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICB9XG4gICAgc3RhY2sucHVzaCh2YWwpXG4gICAgLy8gT3B0aW1pemUgZm9yIEFycmF5cy4gQmlnIGFycmF5cyBjb3VsZCBraWxsIHRoZSBwZXJmb3JtYW5jZSBvdGhlcndpc2UhXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgICAgZm9yIChpID0gMDsgaSA8IHZhbC5sZW5ndGg7IGkrKykge1xuICAgICAgICBkZWNpcmModmFsW2ldLCBpLCBzdGFjaywgdmFsKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbClcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzW2ldXG4gICAgICAgIGRlY2lyYyh2YWxba2V5XSwga2V5LCBzdGFjaywgdmFsKVxuICAgICAgfVxuICAgIH1cbiAgICBzdGFjay5wb3AoKVxuICB9XG59XG5cbi8vIFN0YWJsZS1zdHJpbmdpZnlcbmZ1bmN0aW9uIGNvbXBhcmVGdW5jdGlvbiAoYSwgYikge1xuICBpZiAoYSA8IGIpIHtcbiAgICByZXR1cm4gLTFcbiAgfVxuICBpZiAoYSA+IGIpIHtcbiAgICByZXR1cm4gMVxuICB9XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGRldGVybWluaXN0aWNTdHJpbmdpZnkgKG9iaiwgcmVwbGFjZXIsIHNwYWNlcikge1xuICB2YXIgdG1wID0gZGV0ZXJtaW5pc3RpY0RlY2lyYyhvYmosICcnLCBbXSwgdW5kZWZpbmVkKSB8fCBvYmpcbiAgdmFyIHJlc1xuICBpZiAocmVwbGFjZXJTdGFjay5sZW5ndGggPT09IDApIHtcbiAgICByZXMgPSBKU09OLnN0cmluZ2lmeSh0bXAsIHJlcGxhY2VyLCBzcGFjZXIpXG4gIH0gZWxzZSB7XG4gICAgcmVzID0gSlNPTi5zdHJpbmdpZnkodG1wLCByZXBsYWNlR2V0dGVyVmFsdWVzKHJlcGxhY2VyKSwgc3BhY2VyKVxuICB9XG4gIHdoaWxlIChhcnIubGVuZ3RoICE9PSAwKSB7XG4gICAgdmFyIHBhcnQgPSBhcnIucG9wKClcbiAgICBpZiAocGFydC5sZW5ndGggPT09IDQpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwYXJ0WzBdLCBwYXJ0WzFdLCBwYXJ0WzNdKVxuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0WzBdW3BhcnRbMV1dID0gcGFydFsyXVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbmZ1bmN0aW9uIGRldGVybWluaXN0aWNEZWNpcmMgKHZhbCwgaywgc3RhY2ssIHBhcmVudCkge1xuICB2YXIgaVxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgJiYgdmFsICE9PSBudWxsKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IHN0YWNrLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoc3RhY2tbaV0gPT09IHZhbCkge1xuICAgICAgICB2YXIgcHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihwYXJlbnQsIGspXG4gICAgICAgIGlmIChwcm9wZXJ0eURlc2NyaXB0b3IuZ2V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAocHJvcGVydHlEZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHBhcmVudCwgaywgeyB2YWx1ZTogJ1tDaXJjdWxhcl0nIH0pXG4gICAgICAgICAgICBhcnIucHVzaChbcGFyZW50LCBrLCB2YWwsIHByb3BlcnR5RGVzY3JpcHRvcl0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcGxhY2VyU3RhY2sucHVzaChbdmFsLCBrXSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGFyZW50W2tdID0gJ1tDaXJjdWxhcl0nXG4gICAgICAgICAgYXJyLnB1c2goW3BhcmVudCwgaywgdmFsXSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWwudG9KU09OID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgc3RhY2sucHVzaCh2YWwpXG4gICAgLy8gT3B0aW1pemUgZm9yIEFycmF5cy4gQmlnIGFycmF5cyBjb3VsZCBraWxsIHRoZSBwZXJmb3JtYW5jZSBvdGhlcndpc2UhXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgICAgZm9yIChpID0gMDsgaSA8IHZhbC5sZW5ndGg7IGkrKykge1xuICAgICAgICBkZXRlcm1pbmlzdGljRGVjaXJjKHZhbFtpXSwgaSwgc3RhY2ssIHZhbClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQ3JlYXRlIGEgdGVtcG9yYXJ5IG9iamVjdCBpbiB0aGUgcmVxdWlyZWQgd2F5XG4gICAgICB2YXIgdG1wID0ge31cbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModmFsKS5zb3J0KGNvbXBhcmVGdW5jdGlvbilcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzW2ldXG4gICAgICAgIGRldGVybWluaXN0aWNEZWNpcmModmFsW2tleV0sIGtleSwgc3RhY2ssIHZhbClcbiAgICAgICAgdG1wW2tleV0gPSB2YWxba2V5XVxuICAgICAgfVxuICAgICAgaWYgKHBhcmVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGFyci5wdXNoKFtwYXJlbnQsIGssIHZhbF0pXG4gICAgICAgIHBhcmVudFtrXSA9IHRtcFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRtcFxuICAgICAgfVxuICAgIH1cbiAgICBzdGFjay5wb3AoKVxuICB9XG59XG5cbi8vIHdyYXBzIHJlcGxhY2VyIGZ1bmN0aW9uIHRvIGhhbmRsZSB2YWx1ZXMgd2UgY291bGRuJ3QgcmVwbGFjZVxuLy8gYW5kIG1hcmsgdGhlbSBhcyBbQ2lyY3VsYXJdXG5mdW5jdGlvbiByZXBsYWNlR2V0dGVyVmFsdWVzIChyZXBsYWNlcikge1xuICByZXBsYWNlciA9IHJlcGxhY2VyICE9PSB1bmRlZmluZWQgPyByZXBsYWNlciA6IGZ1bmN0aW9uIChrLCB2KSB7IHJldHVybiB2IH1cbiAgcmV0dXJuIGZ1bmN0aW9uIChrZXksIHZhbCkge1xuICAgIGlmIChyZXBsYWNlclN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVwbGFjZXJTdGFjay5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcGFydCA9IHJlcGxhY2VyU3RhY2tbaV1cbiAgICAgICAgaWYgKHBhcnRbMV0gPT09IGtleSAmJiBwYXJ0WzBdID09PSB2YWwpIHtcbiAgICAgICAgICB2YWwgPSAnW0NpcmN1bGFyXSdcbiAgICAgICAgICByZXBsYWNlclN0YWNrLnNwbGljZShpLCAxKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcGxhY2VyLmNhbGwodGhpcywga2V5LCB2YWwpXG4gIH1cbn1cbiJdfQ==
)