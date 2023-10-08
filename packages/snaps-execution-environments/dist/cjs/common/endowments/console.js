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
    consoleAttenuatedMethods: function() {
        return consoleAttenuatedMethods;
    },
    consoleMethods: function() {
        return consoleMethods;
    },
    default: function() {
        return _default;
    }
});
const _utils = require("@metamask/utils");
const _globalObject = require("../globalObject");
const consoleAttenuatedMethods = new Set([
    'log',
    'assert',
    'error',
    'debug',
    'info',
    'warn'
]);
const consoleMethods = new Set([
    'debug',
    'error',
    'info',
    'log',
    'warn',
    'dir',
    'dirxml',
    'table',
    'trace',
    'group',
    'groupCollapsed',
    'groupEnd',
    'clear',
    'count',
    'countReset',
    'assert',
    'profile',
    'profileEnd',
    'time',
    'timeLog',
    'timeEnd',
    'timeStamp',
    'context'
]);
const consoleFunctions = [
    'log',
    'error',
    'debug',
    'info',
    'warn'
];
/**
 * Gets the appropriate (prepended) message to pass to one of the attenuated
 * method calls.
 *
 * @param snapId - Id of the snap that we're getting a message for.
 * @param message - The id of the snap that will interact with the endowment.
 * @param args - The array of additional arguments.
 * @returns An array of arguments to be passed into an attenuated console method call.
 */ function getMessage(snapId, message, ...args) {
    const prefix = `[Snap: ${snapId}]`;
    // If the first argument is a string, prepend the prefix to the message, and keep the
    // rest of the arguments as-is.
    if (typeof message === 'string') {
        return [
            `${prefix} ${message}`,
            ...args
        ];
    }
    // Otherwise, the `message` is an object, array, etc., so add the prefix as a separate
    // message to the arguments.
    return [
        prefix,
        message,
        ...args
    ];
}
/**
 * Create a a {@link console} object, with the same properties as the global
 * {@link console} object, but with some methods replaced.
 *
 * @param options - Factory options used in construction of the endowment.
 * @param options.snapId - The id of the snap that will interact with the endowment.
 * @returns The {@link console} object with the replaced methods.
 */ function createConsole({ snapId } = {}) {
    (0, _utils.assert)(snapId !== undefined);
    const keys = Object.getOwnPropertyNames(_globalObject.rootRealmGlobal.console);
    const attenuatedConsole = keys.reduce((target, key)=>{
        if (consoleMethods.has(key) && !consoleAttenuatedMethods.has(key)) {
            return {
                ...target,
                [key]: _globalObject.rootRealmGlobal.console[key]
            };
        }
        return target;
    }, {});
    return harden({
        console: {
            ...attenuatedConsole,
            assert: (value, message, ...optionalParams)=>{
                _globalObject.rootRealmGlobal.console.assert(value, ...getMessage(snapId, message, ...optionalParams));
            },
            ...consoleFunctions.reduce((target, key)=>{
                return {
                    ...target,
                    [key]: (message, ...optionalParams)=>{
                        _globalObject.rootRealmGlobal.console[key](...getMessage(snapId, message, ...optionalParams));
                    }
                };
            }, {})
        }
    });
}
const endowmentModule = {
    names: [
        'console'
    ],
    factory: createConsole
};
const _default = endowmentModule;

//# sourceMappingURL=console.js.map