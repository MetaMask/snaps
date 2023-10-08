// eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment
/// <reference path="../../../../../node_modules/ses/types.d.ts" />
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "executeLockdown", {
    enumerable: true,
    get: function() {
        return executeLockdown;
    }
});
const _snapsutils = require("@metamask/snaps-utils");
function executeLockdown() {
    try {
        lockdown({
            consoleTaming: 'unsafe',
            errorTaming: 'unsafe',
            mathTaming: 'unsafe',
            dateTaming: 'unsafe',
            overrideTaming: 'severe'
        });
    } catch (error) {
        // If the `lockdown` call throws an exception, it should not be able to continue
        (0, _snapsutils.logError)('Lockdown failed:', error);
        throw error;
    }
}

//# sourceMappingURL=lockdown.js.map