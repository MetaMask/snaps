"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRunnableSnaps = void 0;
const getRunnableSnaps = (snaps) => snaps.filter((snap) => snap.enabled && !snap.blocked);
exports.getRunnableSnaps = getRunnableSnaps;
//# sourceMappingURL=selectors.js.map