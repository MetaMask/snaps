"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const snap_utils_1 = require("@metamask/snap-utils");
const utils_1 = require("../../utils");
const manifestHandler_1 = require("../manifest/manifestHandler");
const evalHandler_1 = require("../eval/evalHandler");
const bundle_1 = require("./bundle");
/**
 * Builds all files in the given source directory to the given destination
 * directory.
 *
 * Creates destination directory if it doesn't exist.
 *
 * @param argv - Argv from Yargs.
 * @param argv.src - The source file path.
 * @param argv.dist - The output directory path.
 * @param argv.outfileName - The output file name.
 */
async function build(argv) {
    const { src, dist, outfileName } = argv;
    if (outfileName) {
        (0, snap_utils_1.validateOutfileName)(outfileName);
    }
    await (0, snap_utils_1.validateFilePath)(src);
    await (0, snap_utils_1.validateDirPath)(dist, true);
    const outfilePath = (0, snap_utils_1.getOutfilePath)(dist, outfileName);
    const result = await (0, bundle_1.bundle)(src, outfilePath, argv, (0, utils_1.loadConfig)().bundlerCustomizer);
    if (result && argv.eval) {
        await (0, evalHandler_1.evalHandler)(Object.assign(Object.assign({}, argv), { bundle: outfilePath }));
    }
    if (argv.manifest) {
        await (0, manifestHandler_1.manifestHandler)(argv);
    }
}
exports.build = build;
//# sourceMappingURL=buildHandler.js.map