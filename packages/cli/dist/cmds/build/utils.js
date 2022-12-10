"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processInvalidTranspilation = exports.sanitizeDependencyPaths = exports.getDependencyRegExp = exports.processDependencies = exports.writeBundleFile = void 0;
const fs_1 = require("fs");
const misc_1 = require("../../utils/misc");
const builders_1 = require("../../builders");
/**
 * Performs postprocessing on the bundle contents and writes them to disk.
 * Intended to be used in the callback passed to the Browserify `.bundle()`
 * call.
 *
 * @param options - Options bag.
 * @param options.bundleError - Any error received from Browserify.
 * @param options.bundleBuffer - The {@link Buffer} with the bundle contents
 * from Browserify.
 * @param options.src - The source file path.
 * @param options.dest - The destination file path.
 * @param options.resolve - A {@link Promise} resolution function, so that we
 * can use promises and `async`/`await` even though Browserify uses callbacks.
 */
async function writeBundleFile({ bundleError, bundleBuffer, src, dest, resolve, }) {
    if (bundleError) {
        await (0, misc_1.writeError)('Build error:', bundleError.message, bundleError);
    }
    try {
        await fs_1.promises.writeFile(dest, bundleBuffer === null || bundleBuffer === void 0 ? void 0 : bundleBuffer.toString());
        console.log(`Build success: '${src}' bundled as '${dest}'!`);
        resolve(true);
    }
    catch (error) {
        await (0, misc_1.writeError)('Write error:', error.message, error, dest);
    }
}
exports.writeBundleFile = writeBundleFile;
/**
 * Processes dependencies and updates `argv` with an options object.
 *
 * @param argv - The Yargs arguments object.
 * @returns An object with options that can be passed to Babelify.
 */
function processDependencies(argv) {
    const { depsToTranspile, transpilationMode } = argv;
    const babelifyOptions = {};
    if (transpilationMode === builders_1.TranspilationModes.localAndDeps) {
        const regexpStr = getDependencyRegExp(depsToTranspile);
        if (regexpStr !== null) {
            babelifyOptions.ignore = [regexpStr];
        }
    }
    return babelifyOptions;
}
exports.processDependencies = processDependencies;
/**
 * Processes a string of space delimited dependencies into one RegExp string.
 *
 * @param dependencies - An array of dependencies to add to the RegExp.
 * @returns A RegExp object.
 */
function getDependencyRegExp(dependencies) {
    let regexp = null;
    if (!dependencies || dependencies.includes('.') || !dependencies.length) {
        return regexp;
    }
    const paths = sanitizeDependencyPaths(dependencies);
    regexp = `/node_modules/(?!${paths.shift()}`;
    paths.forEach((path) => (regexp += `|${path}`));
    regexp += '/)';
    return RegExp(regexp, 'u');
}
exports.getDependencyRegExp = getDependencyRegExp;
/**
 * Helper function remove any leading and trailing slashes from dependency list.
 *
 * @param dependencies - An array of dependencies to sanitize.
 * @returns An array of sanitized paths.
 */
function sanitizeDependencyPaths(dependencies) {
    return dependencies.map((dependency) => {
        return dependency.replace(/^[/\\]+/u, '').replace(/[/\\]+$/u, '');
    });
}
exports.sanitizeDependencyPaths = sanitizeDependencyPaths;
/**
 * Check the Yargs argv object, to see if the provided options are valid. The
 * options are invalid if both `depsToTranspile` are provided, and
 * `transpilationMode` is not set to `localAndDeps`.
 *
 * @param argv - The Yargs arguments object.
 * @throws If the `depsToTranspile` is set, and `transpilationMode` is not set
 * to `localAndDeps`.
 */
function processInvalidTranspilation(argv) {
    if (argv.depsToTranspile &&
        argv.transpilationMode !== builders_1.TranspilationModes.localAndDeps) {
        throw new Error('"depsToTranspile" can only be specified if "transpilationMode" is set to "localAndDeps" .');
    }
}
exports.processInvalidTranspilation = processInvalidTranspilation;
//# sourceMappingURL=utils.js.map