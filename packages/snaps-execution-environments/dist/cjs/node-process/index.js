"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _lockdownmore = require("../common/lockdown/lockdown-more");
const _ChildProcessSnapExecutor = require("./ChildProcessSnapExecutor");
// Lockdown is already applied in LavaMoat
(0, _lockdownmore.executeLockdownMore)();
_ChildProcessSnapExecutor.ChildProcessSnapExecutor.initialize();

//# sourceMappingURL=index.js.map