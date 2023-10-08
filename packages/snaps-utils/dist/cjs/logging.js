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
    snapsLogger: function() {
        return snapsLogger;
    },
    logInfo: function() {
        return logInfo;
    },
    logError: function() {
        return logError;
    },
    logWarning: function() {
        return logWarning;
    }
});
const _utils = require("@metamask/utils");
const snapsLogger = (0, _utils.createProjectLogger)('snaps');
function logInfo(message, ...optionalParams) {
    // eslint-disable-next-line no-console
    console.log(message, ...optionalParams);
}
function logError(error, ...optionalParams) {
    // eslint-disable-next-line no-console
    console.error(error, ...optionalParams);
}
function logWarning(message, ...optionalParams) {
    // eslint-disable-next-line no-console
    console.warn(message, ...optionalParams);
}

//# sourceMappingURL=logging.js.map