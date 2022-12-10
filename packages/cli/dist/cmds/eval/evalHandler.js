"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evalHandler = void 0;
const snap_utils_1 = require("@metamask/snap-utils");
const utils_1 = require("../../utils");
/**
 * Runs the snap in a worker, to ensure SES compatibility.
 *
 * @param argv - The Yargs arguments object.
 * @returns A promise that resolves once the eval has finished.
 * @throws If the eval failed.
 */
async function evalHandler(argv) {
    const { bundle: bundlePath } = argv;
    try {
        await (0, snap_utils_1.evalBundle)(bundlePath);
        console.log(`Eval Success: evaluated '${bundlePath}' in SES!`);
    }
    catch (error) {
        (0, utils_1.logError)(`Snap evaluation error: ${error.message}`, error);
        throw error;
    }
}
exports.evalHandler = evalHandler;
//# sourceMappingURL=evalHandler.js.map