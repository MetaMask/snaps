"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    CHAIN_ID_REGEX: function() {
        return CHAIN_ID_REGEX;
    },
    ACCOUNT_ID_REGEX: function() {
        return ACCOUNT_ID_REGEX;
    },
    ACCOUNT_ADDRESS_REGEX: function() {
        return ACCOUNT_ADDRESS_REGEX;
    },
    parseChainId: function() {
        return parseChainId;
    },
    parseAccountId: function() {
        return parseAccountId;
    },
    LimitedString: function() {
        return LimitedString;
    },
    ChainIdStruct: function() {
        return ChainIdStruct;
    },
    AccountIdStruct: function() {
        return AccountIdStruct;
    },
    AccountIdArrayStruct: function() {
        return AccountIdArrayStruct;
    },
    AccountAddressStruct: function() {
        return AccountAddressStruct;
    },
    ChainStruct: function() {
        return ChainStruct;
    },
    NamespaceStruct: function() {
        return NamespaceStruct;
    },
    NamespaceIdStruct: function() {
        return NamespaceIdStruct;
    },
    isNamespaceId: function() {
        return isNamespaceId;
    },
    isChainId: function() {
        return isChainId;
    },
    isAccountId: function() {
        return isAccountId;
    },
    isAccountIdArray: function() {
        return isAccountIdArray;
    },
    isNamespace: function() {
        return isNamespace;
    }
});
const _superstruct = require("superstruct");
const CHAIN_ID_REGEX = RegExp("^(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-a-zA-Z0-9]{1,32})$", "u");
const ACCOUNT_ID_REGEX = RegExp("^(?<chainId>(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-a-zA-Z0-9]{1,32})):(?<accountAddress>[a-zA-Z0-9]{1,64})$", "u");
const ACCOUNT_ADDRESS_REGEX = RegExp("^(?<accountAddress>[a-zA-Z0-9]{1,64})$", "u");
function parseChainId(chainId) {
    const match = CHAIN_ID_REGEX.exec(chainId);
    if (!match?.groups) {
        throw new Error('Invalid chain ID.');
    }
    return {
        namespace: match.groups.namespace,
        reference: match.groups.reference
    };
}
function parseAccountId(accountId) {
    const match = ACCOUNT_ID_REGEX.exec(accountId);
    if (!match?.groups) {
        throw new Error('Invalid account ID.');
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
const LimitedString = (0, _superstruct.size)((0, _superstruct.string)(), 1, 40);
const ChainIdStruct = (0, _superstruct.pattern)((0, _superstruct.string)(), CHAIN_ID_REGEX);
const AccountIdStruct = (0, _superstruct.pattern)((0, _superstruct.string)(), ACCOUNT_ID_REGEX);
const AccountIdArrayStruct = (0, _superstruct.array)(AccountIdStruct);
const AccountAddressStruct = (0, _superstruct.pattern)((0, _superstruct.string)(), ACCOUNT_ADDRESS_REGEX);
const ChainStruct = (0, _superstruct.object)({
    id: ChainIdStruct,
    name: LimitedString
});
const NamespaceStruct = (0, _superstruct.object)({
    /**
   * A list of supported chains in the namespace.
   */ chains: (0, _superstruct.array)(ChainStruct),
    /**
   * A list of supported RPC methods on the namespace, that a DApp can call.
   */ methods: (0, _superstruct.optional)((0, _superstruct.array)(LimitedString)),
    /**
   * A list of supported RPC events on the namespace, that a DApp can listen to.
   */ events: (0, _superstruct.optional)((0, _superstruct.array)(LimitedString))
});
const NamespaceIdStruct = (0, _superstruct.pattern)((0, _superstruct.string)(), /^[-a-z0-9]{3,8}$/u);
function isNamespaceId(value) {
    return (0, _superstruct.is)(value, NamespaceIdStruct);
}
function isChainId(value) {
    return (0, _superstruct.is)(value, ChainIdStruct);
}
function isAccountId(value) {
    return (0, _superstruct.is)(value, AccountIdStruct);
}
function isAccountIdArray(value) {
    return (0, _superstruct.is)(value, AccountIdArrayStruct);
}
function isNamespace(value) {
    return (0, _superstruct.is)(value, NamespaceStruct);
}

//# sourceMappingURL=namespace.js.map