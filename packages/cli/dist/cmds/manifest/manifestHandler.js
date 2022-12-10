"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manifestHandler = void 0;
const snap_utils_1 = require("@metamask/snap-utils");
const ERROR_PREFIX = 'Manifest Error: ';
/**
 * Validates a snap.manifest.json file. Attempts to fix the manifest and write
 * the fixed version to disk if `writeManifest` is true. Throws if validation
 * fails.
 *
 * @param argv - The Yargs `argv` object.
 * @param argv.writeManifest - Whether to write the fixed manifest to disk.
 */
async function manifestHandler({ writeManifest }) {
    try {
        const { warnings, errors } = await (0, snap_utils_1.checkManifest)(process.cwd(), Boolean(writeManifest));
        if (!writeManifest && errors.length > 0) {
            console.error(`${ERROR_PREFIX}The manifest is invalid.`);
            errors.forEach(logManifestError);
            process.exit(1);
        }
        if (warnings.length > 0) {
            console.log('Manifest Warning: Validation of snap.manifest.json completed with warnings.');
            warnings.forEach(logManifestWarning);
        }
    }
    catch (error) {
        throw new Error(`${ERROR_PREFIX}${error}`);
    }
}
exports.manifestHandler = manifestHandler;
/**
 * Logs a manifest warning, if `suppressWarnings` is not enabled.
 *
 * @param message - The message to log.
 */
function logManifestWarning(message) {
    if (!global.snaps.suppressWarnings) {
        console.log(`Manifest Warning: ${message}`);
    }
}
/**
 * Logs a manifest error.
 *
 * @param message - The message to log.
 */
function logManifestError(message) {
    console.error(`${ERROR_PREFIX}${message}`);
}
//# sourceMappingURL=manifestHandler.js.map