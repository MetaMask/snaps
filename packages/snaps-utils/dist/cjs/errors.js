"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getErrorMessage", {
    enumerable: true,
    get: function() {
        return getErrorMessage;
    }
});
const _utils = require("@metamask/utils");
function getErrorMessage(error) {
    if ((0, _utils.isObject)(error) && (0, _utils.hasProperty)(error, 'message') && typeof error.message === 'string') {
        return error.message;
    }
    return String(error);
}

//# sourceMappingURL=errors.js.map