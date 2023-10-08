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
    createCrypto: function() {
        return createCrypto;
    },
    default: function() {
        return _default;
    }
});
const _globalObject = require("../globalObject");
const createCrypto = ()=>{
    if ('crypto' in _globalObject.rootRealmGlobal && typeof _globalObject.rootRealmGlobal.crypto === 'object' && 'SubtleCrypto' in _globalObject.rootRealmGlobal && typeof _globalObject.rootRealmGlobal.SubtleCrypto === 'function') {
        return {
            crypto: harden(_globalObject.rootRealmGlobal.crypto),
            SubtleCrypto: harden(_globalObject.rootRealmGlobal.SubtleCrypto)
        };
    }
    // For now, we expose the experimental webcrypto API for Node.js execution environments
    // TODO: Figure out if this is enough long-term or if we should use a polyfill.
    /* eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, n/global-require */ const crypto = require('crypto').webcrypto;
    return {
        crypto: harden(crypto),
        SubtleCrypto: harden(crypto.subtle.constructor)
    };
};
const endowmentModule = {
    names: [
        'crypto',
        'SubtleCrypto'
    ],
    factory: createCrypto
};
const _default = endowmentModule;

//# sourceMappingURL=crypto.js.map