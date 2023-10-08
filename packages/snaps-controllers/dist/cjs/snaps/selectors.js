"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getRunnableSnaps", {
    enumerable: true,
    get: function() {
        return getRunnableSnaps;
    }
});
const getRunnableSnaps = (snaps)=>snaps.filter((snap)=>snap.enabled && !snap.blocked);

//# sourceMappingURL=selectors.js.map