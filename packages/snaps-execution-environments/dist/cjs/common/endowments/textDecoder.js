/**
 * Creates TextDecoder function hardened by SES.
 *
 * @returns An object with the attenuated `TextDecoder` function.
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
const createTextDecoder = ()=>{
    return {
        TextDecoder: harden(TextDecoder)
    };
};
const endowmentModule = {
    names: [
        'TextDecoder'
    ],
    factory: createTextDecoder
};
const _default = endowmentModule;

//# sourceMappingURL=textDecoder.js.map