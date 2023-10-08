/**
 * Creates TextEncoder function hardened by SES.
 *
 * @returns An object with the attenuated `TextEncoder` function.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const createTextEncoder = ()=>{
    return {
        TextEncoder: harden(TextEncoder)
    };
};
const endowmentModule = {
    names: [
        'TextEncoder'
    ],
    factory: createTextEncoder
};
const _default = endowmentModule;

//# sourceMappingURL=textEncoder.js.map