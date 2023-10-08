"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _postmessagestream = require("@metamask/post-message-stream");
const _lockdownevents = require("../common/lockdown/lockdown-events");
const _lockdownmore = require("../common/lockdown/lockdown-more");
const _OffscreenSnapExecutor = require("./OffscreenSnapExecutor");
// Lockdown is already applied in LavaMoat
(0, _lockdownmore.executeLockdownMore)();
(0, _lockdownevents.executeLockdownEvents)();
// The stream from the offscreen document to the execution service.
const parentStream = new _postmessagestream.BrowserRuntimePostMessageStream({
    name: 'child',
    target: 'parent'
});
_OffscreenSnapExecutor.OffscreenSnapExecutor.initialize(parentStream);

//# sourceMappingURL=index.js.map