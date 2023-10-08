"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _lockdownevents = require("../../common/lockdown/lockdown-events");
const _lockdownmore = require("../../common/lockdown/lockdown-more");
const _WebWorkerSnapExecutor = require("./WebWorkerSnapExecutor");
// Lockdown is already applied in LavaMoat
(0, _lockdownmore.executeLockdownMore)();
(0, _lockdownevents.executeLockdownEvents)();
_WebWorkerSnapExecutor.WebWorkerSnapExecutor.initialize();

//# sourceMappingURL=index.js.map