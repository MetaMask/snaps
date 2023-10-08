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
    addEventListener: function() {
        return addEventListener;
    },
    removeEventListener: function() {
        return removeEventListener;
    }
});
const _globalObject = require("./globalObject");
function addEventListener(event, listener) {
    if ('addEventListener' in _globalObject.rootRealmGlobal && typeof _globalObject.rootRealmGlobal.addEventListener === 'function') {
        return _globalObject.rootRealmGlobal.addEventListener(event.toLowerCase(), listener);
    }
    if (_globalObject.rootRealmGlobal.process && 'on' in _globalObject.rootRealmGlobal.process && typeof _globalObject.rootRealmGlobal.process.on === 'function') {
        return _globalObject.rootRealmGlobal.process.on(event, listener);
    }
    throw new Error('Platform agnostic addEventListener failed');
}
function removeEventListener(event, listener) {
    if ('removeEventListener' in _globalObject.rootRealmGlobal && typeof _globalObject.rootRealmGlobal.removeEventListener === 'function') {
        return _globalObject.rootRealmGlobal.removeEventListener(event.toLowerCase(), listener);
    }
    if (_globalObject.rootRealmGlobal.process && 'removeListener' in _globalObject.rootRealmGlobal.process && typeof _globalObject.rootRealmGlobal.process.removeListener === 'function') {
        return _globalObject.rootRealmGlobal.process.removeListener(event, listener);
    }
    throw new Error('Platform agnostic removeEventListener failed');
}

//# sourceMappingURL=globalEvents.js.map