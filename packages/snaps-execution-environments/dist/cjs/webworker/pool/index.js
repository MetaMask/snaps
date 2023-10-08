"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _lockdownevents = require("../../common/lockdown/lockdown-events");
const _lockdownmore = require("../../common/lockdown/lockdown-more");
const _WebWorkerPool = require("./WebWorkerPool");
// Lockdown is already applied in LavaMoat
(0, _lockdownmore.executeLockdownMore)();
(0, _lockdownevents.executeLockdownEvents)();
_WebWorkerPool.WebWorkerPool.initialize();

//# sourceMappingURL=index.js.map