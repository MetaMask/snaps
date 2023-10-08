"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _globalObject = require("../globalObject");
/**
 * Creates a {@link Date} constructor, with most of the same properties as the global object.
 * The Date.now() function has added noise as to limit its precision and prevent potential timing attacks.
 * The Date constructor uses this now() function to seed itself if no arguments are given to the constructor.
 *
 * @returns A modified {@link Date} constructor with limited precision.
 */ function createDate() {
    const keys = Object.getOwnPropertyNames(_globalObject.rootRealmGlobal.Date);
    let currentTime = 0;
    const now = ()=>{
        const actual = _globalObject.rootRealmGlobal.Date.now();
        const newTime = Math.round(actual + Math.random());
        if (newTime > currentTime) {
            currentTime = newTime;
        }
        return currentTime;
    };
    const NewDate = function(...args) {
        return Reflect.construct(_globalObject.rootRealmGlobal.Date, args.length === 0 ? [
            now()
        ] : args, new.target);
    };
    keys.forEach((key)=>{
        Reflect.defineProperty(NewDate, key, {
            configurable: false,
            writable: false,
            value: key === 'now' ? now : _globalObject.rootRealmGlobal.Date[key]
        });
    });
    return {
        Date: harden(NewDate)
    };
}
const endowmentModule = {
    names: [
        'Date'
    ],
    factory: createDate
};
const _default = endowmentModule;

//# sourceMappingURL=date.js.map