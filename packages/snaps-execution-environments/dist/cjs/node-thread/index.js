"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _lockdownmore = require("../common/lockdown/lockdown-more");
const _ThreadSnapExecutor = require("./ThreadSnapExecutor");
// Lockdown is already applied in LavaMoat
(0, _lockdownmore.executeLockdownMore)();
_ThreadSnapExecutor.ThreadSnapExecutor.initialize();

//# sourceMappingURL=index.js.map