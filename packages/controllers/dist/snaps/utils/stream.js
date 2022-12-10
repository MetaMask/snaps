"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTarballExtractionStream = exports.getNodeStream = exports.stripDotSlash = void 0;
const readable_web_to_node_stream_1 = require("readable-web-to-node-stream");
const tar_stream_1 = require("tar-stream");
const concat_stream_1 = __importDefault(require("concat-stream"));
const utils_1 = require("@metamask/utils");
const snap_utils_1 = require("@metamask/snap-utils");
// The paths of files within npm tarballs appear to always be prefixed with
// "package/".
const NPM_TARBALL_PATH_PREFIX = /^package\//u;
/**
 * Strips the leading `./` from a string, or does nothing if no string is
 * provided.
 *
 * @param pathString - The path string to normalize.
 * @returns The specified path without a `./` prefix, or `undefined` if no
 * string was provided.
 */
function stripDotSlash(pathString) {
    return pathString === null || pathString === void 0 ? void 0 : pathString.replace(/^\.\//u, '');
}
exports.stripDotSlash = stripDotSlash;
/**
 * Converts a {@link ReadableStream} to a Node.js {@link Readable}
 * stream. Returns the stream directly if it is already a Node.js stream.
 * We can't use the native Web {@link ReadableStream} directly because the
 * other stream libraries we use expect Node.js streams.
 *
 * @param stream - The stream to convert.
 * @returns The given stream as a Node.js Readable stream.
 */
function getNodeStream(stream) {
    if (typeof stream.getReader !== 'function') {
        return stream;
    }
    return new readable_web_to_node_stream_1.ReadableWebToNodeStream(stream);
}
exports.getNodeStream = getNodeStream;
/**
 * Creates a `tar-stream` that will get the necessary files from an npm Snap
 * package tarball (`.tgz` file).
 *
 * @param snapFiles - An object to write target file contents to.
 * @returns The {@link Writable} tarball extraction stream.
 */
function createTarballExtractionStream(snapFiles) {
    // `tar-stream` is pretty old-school, so we create it first and then
    // instrument it by adding event listeners.
    const extractStream = (0, tar_stream_1.extract)();
    // `tar-stream` reads every file in the tarball serially. We already know
    // where to look for package.json and the Snap manifest, but we don't know
    // where the source code is. Therefore, we cache the contents of each .js
    // file in the tarball and pick out the correct one when the stream has ended.
    const jsFileCache = new Map();
    // "entry" is fired for every discreet entity in the tarball. This includes
    // files and folders.
    extractStream.on('entry', (header, entryStream, next) => {
        const { name: headerName, type: headerType } = header;
        if (headerType === 'file') {
            // The name is a path if the header type is "file".
            const filePath = headerName.replace(NPM_TARBALL_PATH_PREFIX, '');
            // Note the use of `concat-stream` since the data for each file may be
            // chunked.
            if (filePath === snap_utils_1.NpmSnapFileNames.PackageJson) {
                return entryStream.pipe((0, concat_stream_1.default)((data) => {
                    try {
                        snapFiles.packageJson = JSON.parse(data.toString());
                    }
                    catch (_error) {
                        return extractStream.destroy(new Error(`Failed to parse "${snap_utils_1.NpmSnapFileNames.PackageJson}".`));
                    }
                    return next();
                }));
            }
            else if (filePath === snap_utils_1.NpmSnapFileNames.Manifest) {
                return entryStream.pipe((0, concat_stream_1.default)((data) => {
                    try {
                        snapFiles.manifest = JSON.parse(data.toString());
                    }
                    catch (_error) {
                        return extractStream.destroy(new Error(`Failed to parse "${snap_utils_1.NpmSnapFileNames.Manifest}".`));
                    }
                    return next();
                }));
            }
            else if (/\w+\.(?:js|svg)$/u.test(filePath)) {
                return entryStream.pipe((0, concat_stream_1.default)((data) => {
                    jsFileCache.set(filePath, data);
                    return next();
                }));
            }
        }
        // If we get here, the entry is not a file, and we want to ignore. The entry
        // stream must be drained, or the extractStream will stop reading. This is
        // effectively a no-op for the current entry.
        entryStream.on('end', () => next());
        return entryStream.resume();
    });
    // Once we've read the entire tarball, attempt to grab the bundle file
    // contents from the .js file cache.
    extractStream.once('finish', () => {
        var _a, _b, _c, _d, _e;
        if ((0, utils_1.isObject)(snapFiles.manifest)) {
            /* istanbul ignore next: optional chaining */
            const { filePath: _bundlePath, iconPath: _iconPath } = (_c = (_b = (_a = snapFiles.manifest.source) === null || _a === void 0 ? void 0 : _a.location) === null || _b === void 0 ? void 0 : _b.npm) !== null && _c !== void 0 ? _c : {};
            const bundlePath = stripDotSlash(_bundlePath);
            const iconPath = stripDotSlash(_iconPath);
            if (bundlePath) {
                snapFiles.sourceCode = (_d = jsFileCache.get(bundlePath)) === null || _d === void 0 ? void 0 : _d.toString('utf8');
            }
            if (typeof iconPath === 'string' && iconPath.endsWith('.svg')) {
                snapFiles.svgIcon = (_e = jsFileCache.get(iconPath)) === null || _e === void 0 ? void 0 : _e.toString('utf8');
            }
        }
        jsFileCache.clear();
    });
    return extractStream;
}
exports.createTarballExtractionStream = createTarballExtractionStream;
//# sourceMappingURL=stream.js.map