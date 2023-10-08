// Subset of exports meant for browser environments, omits Node.js services
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WebWorkerExecutionService", {
    enumerable: true,
    get: function() {
        return _webworker.WebWorkerExecutionService;
    }
});
_export_star(require("./AbstractExecutionService"), exports);
_export_star(require("./ExecutionService"), exports);
_export_star(require("./ProxyPostMessageStream"), exports);
_export_star(require("./iframe"), exports);
_export_star(require("./offscreen"), exports);
const _webworker = require("./webworker");
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}

//# sourceMappingURL=browser.js.map