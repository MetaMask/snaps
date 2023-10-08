"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "parseJson", {
    enumerable: true,
    get: function() {
        return parseJson;
    }
});
const _utils = require("@metamask/utils");
function parseJson(json) {
    return (0, _utils.getSafeJson)(JSON.parse(json));
}

//# sourceMappingURL=json.js.map