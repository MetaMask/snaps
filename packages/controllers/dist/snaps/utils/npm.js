"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchNpmSnapOther = exports.fetchNpmSnap = exports.DEFAULT_NPM_REGISTRY = void 0;
const utils_1 = require("@metamask/utils");
const pump_1 = __importDefault(require("pump"));
const gunzip_maybe_1 = __importDefault(require("gunzip-maybe"));
const snap_utils_1 = require("@metamask/snap-utils");
const stream_1 = require("./stream");
exports.DEFAULT_NPM_REGISTRY = 'https://registry.npmjs.org';
/**
 * Fetches a Snap from the public npm registry.
 *
 * @param packageName - The name of the package whose tarball to fetch.
 * @param versionRange - The SemVer range of the package to fetch. The highest
 * version satisfying the range will be fetched.
 * @param registryUrl - The URL of the npm registry to fetch from.
 * @param fetchFunction - The fetch function to use. Defaults to the global
 * {@link fetch}. Useful for Node.js compatibility.
 * @returns A tuple of the Snap manifest object and the Snap source code.
 */
async function fetchNpmSnap(packageName, versionRange, registryUrl = exports.DEFAULT_NPM_REGISTRY, fetchFunction = fetch) {
    const [tarballResponse, actualVersion] = await fetchNpmTarball(packageName, versionRange, registryUrl, fetchFunction);
    // Extract the tarball and get the necessary files from it.
    const snapFiles = {};
    await new Promise((resolve, reject) => {
        (0, pump_1.default)((0, stream_1.getNodeStream)(tarballResponse), 
        // The "gz" in "tgz" stands for "gzip". The tarball needs to be decompressed
        // before we can actually grab any files from it.
        (0, gunzip_maybe_1.default)(), (0, stream_1.createTarballExtractionStream)(snapFiles), (error) => {
            error ? reject(error) : resolve();
        });
    });
    // At this point, the necessary files will have been added to the snapFiles
    // object if they exist.
    return (0, snap_utils_1.validateNpmSnap)(snapFiles, `npm Snap "${packageName}@${actualVersion}" validation error: `);
}
exports.fetchNpmSnap = fetchNpmSnap;
/**
 * Fetches the tarball (`.tgz` file) of the specified package and version from
 * the public npm registry. Throws an error if fetching fails.
 *
 * @param packageName - The name of the package whose tarball to fetch.
 * @param versionRange - The SemVer range of the package to fetch. The highest
 * version satisfying the range will be fetched.
 * @param registryUrl - The URL of the npm registry to fetch the tarball from.
 * @param fetchFunction - The fetch function to use. Defaults to the global
 * {@link fetch}. Useful for Node.js compatibility.
 * @returns A tuple of the {@link Response} for the package tarball and the
 * actual version of the package.
 */
async function fetchNpmTarball(packageName, versionRange, registryUrl = exports.DEFAULT_NPM_REGISTRY, fetchFunction = fetch) {
    var _a, _b, _c, _d;
    const packageMetadata = await (await fetchFunction(new URL(packageName, registryUrl).toString())).json();
    if (!(0, utils_1.isObject)(packageMetadata)) {
        throw new Error(`Failed to fetch package "${packageName}" metadata from npm.`);
    }
    const targetVersion = (0, snap_utils_1.getTargetVersion)(Object.keys((_a = packageMetadata === null || packageMetadata === void 0 ? void 0 : packageMetadata.versions) !== null && _a !== void 0 ? _a : {}), versionRange);
    if (targetVersion === null) {
        throw new Error(`Failed to find a matching version in npm metadata for package "${packageName}" and requested semver range "${versionRange}"`);
    }
    const tarballUrlString = (_d = (_c = (_b = packageMetadata.versions) === null || _b === void 0 ? void 0 : _b[targetVersion]) === null || _c === void 0 ? void 0 : _c.dist) === null || _d === void 0 ? void 0 : _d.tarball;
    if (!(0, snap_utils_1.isValidUrl)(tarballUrlString) || !tarballUrlString.endsWith('.tgz')) {
        throw new Error(`Failed to find valid tarball URL in npm metadata for package "${packageName}".`);
    }
    // Override the tarball hostname/protocol with registryUrl hostname/protocol
    const newRegistryUrl = new URL(registryUrl);
    const newTarballUrl = new URL(tarballUrlString);
    newTarballUrl.hostname = newRegistryUrl.hostname;
    newTarballUrl.protocol = newRegistryUrl.protocol;
    // Perform a raw fetch because we want the Response object itself.
    const tarballResponse = await fetchFunction(newTarballUrl.toString());
    if (!tarballResponse.ok) {
        throw new Error(`Failed to fetch tarball for package "${packageName}".`);
    }
    const stream = await tarballResponse.blob().then((blob) => blob.stream());
    return [stream, targetVersion];
}
/**
 * Fetches a Snap from the public npm registry.
 *
 * @param packageName - The name of the package whose tarball to fetch.
 * @param versionRange - The SemVer range of the package to fetch. The highest
 * version satisfying the range will be fetched.
 * @param registryUrl - The URL of the npm registry to fetch from.
 * @param fetchFunction - The fetch function to use. Defaults to the global
 * {@link fetch}. Useful for Node.js compatibility.
 * @returns A tuple of the Snap manifest object and the Snap source code.
 */
async function fetchNpmSnapOther(stream) {
    // Extract the tarball and get the necessary files from it.
    const snapFiles = {};
    await new Promise((resolve, reject) => {
        (0, pump_1.default)((0, stream_1.getNodeStream)(stream), 
        // The "gz" in "tgz" stands for "gzip". The tarball needs to be decompressed
        // before we can actually grab any files from it.
        (0, gunzip_maybe_1.default)(), (0, stream_1.createTarballExtractionStream)(snapFiles), (error) => {
            error ? reject(error) : resolve();
        });
    });
    // At this point, the necessary files will have been added to the snapFiles
    // object if they exist.
    return (0, snap_utils_1.validateNpmSnap)(snapFiles, `npm Snap validation error: `);
}
exports.fetchNpmSnapOther = fetchNpmSnapOther;
//# sourceMappingURL=npm.js.map