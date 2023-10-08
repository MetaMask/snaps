"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _lockdownevents = require("../common/lockdown/lockdown-events");
const _lockdownmore = require("../common/lockdown/lockdown-more");
const _IFrameSnapExecutor = require("./IFrameSnapExecutor");
// Lockdown is already applied in LavaMoat
(0, _lockdownmore.executeLockdownMore)();
(0, _lockdownevents.executeLockdownEvents)();
_IFrameSnapExecutor.IFrameSnapExecutor.initialize();

//# sourceMappingURL=index.js.map