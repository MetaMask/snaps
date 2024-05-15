// src/namespace.ts
import {
  array,
  define,
  is,
  object,
  optional,
  pattern,
  size,
  string
} from "superstruct";
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
var LimitedString = size(string(), 1, 40);
var ChainIdStringStruct = define(
  "Chain ID",
  string().validator
);
var ChainIdStruct = pattern(
  ChainIdStringStruct,
  CHAIN_ID_REGEX
);
var AccountIdStruct = pattern(string(), ACCOUNT_ID_REGEX);
var AccountIdArrayStruct = array(AccountIdStruct);
var AccountAddressStruct = pattern(string(), ACCOUNT_ADDRESS_REGEX);
var ChainStruct = object({
  id: ChainIdStruct,
  name: LimitedString
});
var NamespaceStruct = object({
  /**
   * A list of supported chains in the namespace.
   */
  chains: array(ChainStruct),
  /**
   * A list of supported RPC methods on the namespace, that a DApp can call.
   */
  methods: optional(array(LimitedString)),
  /**
   * A list of supported RPC events on the namespace, that a DApp can listen to.
   */
  events: optional(array(LimitedString))
});
var NamespaceIdStruct = pattern(string(), /^[-a-z0-9]{3,8}$/u);
function isNamespaceId(value) {
  return is(value, NamespaceIdStruct);
}
function isChainId(value) {
  return is(value, ChainIdStruct);
}
function isAccountId(value) {
  return is(value, AccountIdStruct);
}
function isAccountIdArray(value) {
  return is(value, AccountIdArrayStruct);
}
function isNamespace(value) {
  return is(value, NamespaceStruct);
}

export {
  CHAIN_ID_REGEX,
  ACCOUNT_ID_REGEX,
  ACCOUNT_ADDRESS_REGEX,
  parseChainId,
  parseAccountId,
  LimitedString,
  ChainIdStringStruct,
  ChainIdStruct,
  AccountIdStruct,
  AccountIdArrayStruct,
  AccountAddressStruct,
  ChainStruct,
  NamespaceStruct,
  NamespaceIdStruct,
  isNamespaceId,
  isChainId,
  isAccountId,
  isAccountIdArray,
  isNamespace
};
//# sourceMappingURL=chunk-EXUEHPZ4.mjs.map