"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DEFAULT_NPM_REGISTRY: function() {
        return DEFAULT_NPM_REGISTRY;
    },
    NpmLocation: function() {
        return NpmLocation;
    },
    fetchNpmMetadata: function() {
        return fetchNpmMetadata;
    }
});
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _concatstream = /*#__PURE__*/ _interop_require_default(require("concat-stream"));
const _gunzipmaybe = /*#__PURE__*/ _interop_require_default(require("gunzip-maybe"));
const _readablewebtonodestream = require("readable-web-to-node-stream");
const _stream = require("stream");
const _tarstream = require("tar-stream");
function _check_private_redeclaration(obj, privateCollection) {
    if (privateCollection.has(obj)) {
        throw new TypeError("Cannot initialize the same private elements twice on an object");
    }
}
function _class_private_method_get(receiver, privateSet, fn) {
    if (!privateSet.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return fn;
}
function _class_private_method_init(obj, privateSet) {
    _check_private_redeclaration(obj, privateSet);
    privateSet.add(obj);
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const DEFAULT_NPM_REGISTRY = 'https://registry.npmjs.org';
var _lazyInit = /*#__PURE__*/ new WeakSet();
class NpmLocation {
    async manifest() {
        if (this.validatedManifest) {
            return this.validatedManifest.clone();
        }
        const vfile = await this.fetch('snap.manifest.json');
        const result = (0, _snapsutils.parseJson)(vfile.toString());
        vfile.result = (0, _snapsutils.createSnapManifest)(result);
        this.validatedManifest = vfile;
        return this.manifest();
    }
    async fetch(path) {
        const relativePath = (0, _snapsutils.normalizeRelative)(path);
        if (!this.files) {
            await _class_private_method_get(this, _lazyInit, lazyInit).call(this);
            (0, _utils.assert)(this.files !== undefined);
        }
        const vfile = this.files.get(relativePath);
        (0, _utils.assert)(vfile !== undefined, new TypeError(`File "${path}" not found in package.`));
        return vfile.clone();
    }
    get packageName() {
        return this.meta.packageName;
    }
    get version() {
        (0, _utils.assert)(this.meta.version !== undefined, 'Tried to access version without first fetching NPM package.');
        return this.meta.version;
    }
    get registry() {
        return this.meta.registry;
    }
    get versionRange() {
        return this.meta.requestedRange;
    }
    constructor(url, opts = {}){
        _class_private_method_init(this, _lazyInit);
        _define_property(this, "meta", void 0);
        _define_property(this, "validatedManifest", void 0);
        _define_property(this, "files", void 0);
        const allowCustomRegistries = opts.allowCustomRegistries ?? false;
        const fetchFunction = opts.fetch ?? globalThis.fetch.bind(globalThis);
        const requestedRange = opts.versionRange ?? _snapsutils.DEFAULT_REQUESTED_SNAP_VERSION;
        (0, _utils.assertStruct)(url.toString(), _snapsutils.NpmSnapIdStruct, 'Invalid Snap Id: ');
        let registry;
        if (url.host === '' && url.port === '' && url.username === '' && url.password === '') {
            registry = new URL(DEFAULT_NPM_REGISTRY);
        } else {
            registry = 'https://';
            if (url.username) {
                registry += url.username;
                if (url.password) {
                    registry += `:${url.password}`;
                }
                registry += '@';
            }
            registry += url.host;
            registry = new URL(registry);
            (0, _utils.assert)(allowCustomRegistries, new TypeError(`Custom NPM registries are disabled, tried to use "${registry.toString()}".`));
        }
        (0, _utils.assert)(registry.pathname === '/' && registry.search === '' && registry.hash === '');
        (0, _utils.assert)(url.pathname !== '' && url.pathname !== '/', new TypeError('The package name in NPM location is empty.'));
        let packageName = url.pathname;
        if (packageName.startsWith('/')) {
            packageName = packageName.slice(1);
        }
        this.meta = {
            requestedRange,
            registry,
            packageName,
            fetch: fetchFunction
        };
    }
}
async function lazyInit() {
    (0, _utils.assert)(this.files === undefined);
    const [tarballResponse, actualVersion] = await fetchNpmTarball(this.meta.packageName, this.meta.requestedRange, this.meta.registry, this.meta.fetch);
    this.meta.version = actualVersion;
    let canonicalBase = 'npm://';
    if (this.meta.registry.username !== '') {
        canonicalBase += this.meta.registry.username;
        if (this.meta.registry.password !== '') {
            canonicalBase += `:${this.meta.registry.password}`;
        }
        canonicalBase += '@';
    }
    canonicalBase += this.meta.registry.host;
    // TODO(ritave): Lazily extract files instead of up-front extracting all of them
    //               We would need to replace tar-stream package because it requires immediate consumption of streams.
    await new Promise((resolve, reject)=>{
        this.files = new Map();
        (0, _stream.pipeline)(getNodeStream(tarballResponse), // The "gz" in "tgz" stands for "gzip". The tarball needs to be decompressed
        // before we can actually grab any files from it.
        // To prevent recursion-based zip bombs, we set a maximum recursion depth of 1.
        (0, _gunzipmaybe.default)(1), createTarballStream(`${canonicalBase}/${this.meta.packageName}/`, this.files), (error)=>{
            error ? reject(error) : resolve();
        });
    });
}
// Safety limit for tarballs, 250 MB in bytes
const TARBALL_SIZE_SAFETY_LIMIT = 262144000;
async function fetchNpmMetadata(packageName, registryUrl, fetchFunction) {
    const packageResponse = await fetchFunction(new URL(packageName, registryUrl).toString());
    if (!packageResponse.ok) {
        throw new Error(`Failed to fetch NPM registry entry. Status code: ${packageResponse.status}.`);
    }
    const packageMetadata = await packageResponse.json();
    if (!(0, _utils.isObject)(packageMetadata)) {
        throw new Error(`Failed to fetch package "${packageName}" metadata from npm.`);
    }
    return packageMetadata;
}
/**
 * Fetches the tarball (`.tgz` file) of the specified package and version from
 * the public npm registry.
 *
 * @param packageName - The name of the package whose tarball to fetch.
 * @param versionRange - The SemVer range of the package to fetch. The highest
 * version satisfying the range will be fetched.
 * @param registryUrl - The URL of the npm registry to fetch the tarball from.
 * @param fetchFunction - The fetch function to use. Defaults to the global
 * {@link fetch}. Useful for Node.js compatibility.
 * @returns A tuple of the {@link Response} for the package tarball and the
 * actual version of the package.
 * @throws If fetching the tarball fails.
 */ async function fetchNpmTarball(packageName, versionRange, registryUrl, fetchFunction) {
    const packageMetadata = await fetchNpmMetadata(packageName, registryUrl, fetchFunction);
    const versions = Object.keys(packageMetadata?.versions ?? {}).map((version)=>{
        (0, _utils.assertIsSemVerVersion)(version);
        return version;
    });
    const targetVersion = (0, _snapsutils.getTargetVersion)(versions, versionRange);
    if (targetVersion === null) {
        throw new Error(`Failed to find a matching version in npm metadata for package "${packageName}" and requested semver range "${versionRange}".`);
    }
    const tarballUrlString = packageMetadata?.versions?.[targetVersion]?.dist?.tarball;
    if (!(0, _snapsutils.isValidUrl)(tarballUrlString) || !tarballUrlString.toString().endsWith('.tgz')) {
        throw new Error(`Failed to find valid tarball URL in NPM metadata for package "${packageName}".`);
    }
    // Override the tarball hostname/protocol with registryUrl hostname/protocol
    const newRegistryUrl = new URL(registryUrl);
    const newTarballUrl = new URL(tarballUrlString);
    newTarballUrl.hostname = newRegistryUrl.hostname;
    newTarballUrl.protocol = newRegistryUrl.protocol;
    // Perform a raw fetch because we want the Response object itself.
    const tarballResponse = await fetchFunction(newTarballUrl.toString());
    if (!tarballResponse.ok || !tarballResponse.body) {
        throw new Error(`Failed to fetch tarball for package "${packageName}".`);
    }
    // We assume that NPM is a good actor and provides us with a valid `content-length` header.
    const tarballSizeString = tarballResponse.headers.get('content-length');
    (0, _utils.assert)(tarballSizeString, 'Snap tarball has invalid content-length');
    const tarballSize = parseInt(tarballSizeString, 10);
    (0, _utils.assert)(tarballSize <= TARBALL_SIZE_SAFETY_LIMIT, 'Snap tarball exceeds size limit');
    return [
        tarballResponse.body,
        targetVersion
    ];
}
/**
 * The paths of files within npm tarballs appear to always be prefixed with
 * "package/".
 */ const NPM_TARBALL_PATH_PREFIX = /^package\//u;
/**
 * Converts a {@link ReadableStream} to a Node.js {@link Readable}
 * stream. Returns the stream directly if it is already a Node.js stream.
 * We can't use the native Web {@link ReadableStream} directly because the
 * other stream libraries we use expect Node.js streams.
 *
 * @param stream - The stream to convert.
 * @returns The given stream as a Node.js Readable stream.
 */ function getNodeStream(stream) {
    if (typeof stream.getReader !== 'function') {
        return stream;
    }
    return new _readablewebtonodestream.ReadableWebToNodeStream(stream);
}
/**
 * Creates a `tar-stream` that will get the necessary files from an npm Snap
 * package tarball (`.tgz` file).
 *
 * @param canonicalBase - A base URI as specified in {@link https://github.com/MetaMask/SIPs/blob/main/SIPS/sip-8.md SIP-8}. Starting with 'npm:'. Will be used for canonicalPath vfile argument.
 * @param files - An object to write target file contents to.
 * @returns The {@link Writable} tarball extraction stream.
 */ function createTarballStream(canonicalBase, files) {
    (0, _utils.assert)(canonicalBase.endsWith('/'), "Base needs to end with '/' for relative paths to be added as children instead of siblings.");
    (0, _utils.assert)(canonicalBase.startsWith('npm:'), 'Protocol mismatch, expected "npm:".');
    // `tar-stream` is pretty old-school, so we create it first and then
    // instrument it by adding event listeners.
    const extractStream = (0, _tarstream.extract)();
    let totalSize = 0;
    // "entry" is fired for every discreet entity in the tarball. This includes
    // files and folders.
    extractStream.on('entry', (header, entryStream, next)=>{
        const { name: headerName, type: headerType } = header;
        if (headerType === 'file') {
            // The name is a path if the header type is "file".
            const path = headerName.replace(NPM_TARBALL_PATH_PREFIX, '');
            return entryStream.pipe((0, _concatstream.default)({
                encoding: 'uint8array'
            }, (data)=>{
                try {
                    totalSize += data.byteLength;
                    // To prevent zip bombs, we set a safety limit for the total size of tarballs.
                    (0, _utils.assert)(totalSize < TARBALL_SIZE_SAFETY_LIMIT, `Snap tarball exceeds limit of ${TARBALL_SIZE_SAFETY_LIMIT} bytes.`);
                    const vfile = new _snapsutils.VirtualFile({
                        value: data,
                        path,
                        data: {
                            canonicalPath: new URL(path, canonicalBase).toString()
                        }
                    });
                    // We disallow files having identical paths as it may confuse our checksum calculations.
                    (0, _utils.assert)(!files.has(path), 'Malformed tarball, multiple files with the same path.');
                    files.set(path, vfile);
                    return next();
                } catch (error) {
                    return extractStream.destroy(error);
                }
            }));
        }
        // If we get here, the entry is not a file, and we want to ignore. The entry
        // stream must be drained, or the extractStream will stop reading. This is
        // effectively a no-op for the current entry.
        entryStream.on('end', ()=>next());
        return entryStream.resume();
    });
    return extractStream;
}

//# sourceMappingURL=npm.js.map