"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/namespace.ts









var _superstruct = require('superstruct');
var CHAIN_ID_REGEX = /^(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-a-zA-Z0-9]{1,32})$/u;
var ACCOUNT_ID_REGEX = /^(?<chainId>(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-a-zA-Z0-9]{1,32})):(?<accountAddress>[a-zA-Z0-9]{1,64})$/u;
var ACCOUNT_ADDRESS_REGEX = /^(?<accountAddress>[a-zA-Z0-9]{1,64})$/u;
function parseChainId(chainId) {
  const match = CHAIN_ID_REGEX.exec(chainId);
  if (!match?.groups) {
    throw new Error("Invalid chain ID.");
  }
  return {
    namespace: match.groups.namespace,
    reference: match.groups.reference
  };
}
function parseAccountId(accountId) {
  const match = ACCOUNT_ID_REGEX.exec(accountId);
  if (!match?.groups) {
    throw new Error("Invalid account ID.");
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
var LimitedString = _superstruct.size.call(void 0, _superstruct.string.call(void 0, ), 1, 40);
var ChainIdStringStruct = _superstruct.define.call(void 0, 
  "Chain ID",
  _superstruct.string.call(void 0, ).validator
);
var ChainIdStruct = _superstruct.pattern.call(void 0, 
  ChainIdStringStruct,
  CHAIN_ID_REGEX
);
var AccountIdStruct = _superstruct.pattern.call(void 0, _superstruct.string.call(void 0, ), ACCOUNT_ID_REGEX);
var AccountIdArrayStruct = _superstruct.array.call(void 0, AccountIdStruct);
var AccountAddressStruct = _superstruct.pattern.call(void 0, _superstruct.string.call(void 0, ), ACCOUNT_ADDRESS_REGEX);
var ChainStruct = _superstruct.object.call(void 0, {
  id: ChainIdStruct,
  name: LimitedString
});
var NamespaceStruct = _superstruct.object.call(void 0, {
  /**
   * A list of supported chains in the namespace.
   */
  chains: _superstruct.array.call(void 0, ChainStruct),
  /**
   * A list of supported RPC methods on the namespace, that a DApp can call.
   */
  methods: _superstruct.optional.call(void 0, _superstruct.array.call(void 0, LimitedString)),
  /**
   * A list of supported RPC events on the namespace, that a DApp can listen to.
   */
  events: _superstruct.optional.call(void 0, _superstruct.array.call(void 0, LimitedString))
});
var NamespaceIdStruct = _superstruct.pattern.call(void 0, _superstruct.string.call(void 0, ), /^[-a-z0-9]{3,8}$/u);
function isNamespaceId(value) {
  return _superstruct.is.call(void 0, value, NamespaceIdStruct);
}
function isChainId(value) {
  return _superstruct.is.call(void 0, value, ChainIdStruct);
}
function isAccountId(value) {
  return _superstruct.is.call(void 0, value, AccountIdStruct);
}
function isAccountIdArray(value) {
  return _superstruct.is.call(void 0, value, AccountIdArrayStruct);
}
function isNamespace(value) {
  return _superstruct.is.call(void 0, value, NamespaceStruct);
}





















exports.CHAIN_ID_REGEX = CHAIN_ID_REGEX; exports.ACCOUNT_ID_REGEX = ACCOUNT_ID_REGEX; exports.ACCOUNT_ADDRESS_REGEX = ACCOUNT_ADDRESS_REGEX; exports.parseChainId = parseChainId; exports.parseAccountId = parseAccountId; exports.LimitedString = LimitedString; exports.ChainIdStringStruct = ChainIdStringStruct; exports.ChainIdStruct = ChainIdStruct; exports.AccountIdStruct = AccountIdStruct; exports.AccountIdArrayStruct = AccountIdArrayStruct; exports.AccountAddressStruct = AccountAddressStruct; exports.ChainStruct = ChainStruct; exports.NamespaceStruct = NamespaceStruct; exports.NamespaceIdStruct = NamespaceIdStruct; exports.isNamespaceId = isNamespaceId; exports.isChainId = isChainId; exports.isAccountId = isAccountId; exports.isAccountIdArray = isAccountIdArray; exports.isNamespace = isNamespace;
//# sourceMappingURL=chunk-6LOYTBS3.js.map