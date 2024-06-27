"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }




var _chunkEXN2TFDJjs = require('./chunk-EXN2TFDJ.js');

// src/snaps/location/npm.ts









var _snapsutils = require('@metamask/snaps-utils');






var _utils = require('@metamask/utils');
var _browserifyzlib = require('browserify-zlib');
var _concatstream = require('concat-stream'); var _concatstream2 = _interopRequireDefault(_concatstream);
var _getnpmtarballurl = require('get-npm-tarball-url'); var _getnpmtarballurl2 = _interopRequireDefault(_getnpmtarballurl);
var _readablestream = require('readable-stream');
var _readablewebtonodestream = require('readable-web-to-node-stream');
var _tarstream = require('tar-stream');
var DEFAULT_NPM_REGISTRY = new URL("https://registry.npmjs.org");
var _validatedManifest, _files, _lazyInit, lazyInit_fn;
var BaseNpmLocation = class {
  constructor(url, opts = {}) {
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _lazyInit);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _validatedManifest, void 0);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _files, void 0);
    const allowCustomRegistries = opts.allowCustomRegistries ?? false;
    const fetchFunction = opts.fetch ?? globalThis.fetch.bind(globalThis);
    const requestedRange = opts.versionRange ?? _snapsutils.DEFAULT_REQUESTED_SNAP_VERSION;
    const defaultResolve = async (range) => range;
    const resolveVersion = opts.resolveVersion ?? defaultResolve;
    _utils.assertStruct.call(void 0, url.toString(), _snapsutils.NpmSnapIdStruct, "Invalid Snap Id: ");
    let registry;
    if (url.host === "" && url.port === "" && url.username === "" && url.password === "") {
      registry = DEFAULT_NPM_REGISTRY;
    } else {
      registry = "https://";
      if (url.username) {
        registry += url.username;
        if (url.password) {
          registry += `:${url.password}`;
        }
        registry += "@";
      }
      registry += url.host;
      registry = new URL(registry);
      _utils.assert.call(void 0, 
        allowCustomRegistries,
        new TypeError(
          `Custom NPM registries are disabled, tried to use "${registry.toString()}".`
        )
      );
    }
    _utils.assert.call(void 0, 
      registry.pathname === "/" && registry.search === "" && registry.hash === ""
    );
    _utils.assert.call(void 0, 
      url.pathname !== "" && url.pathname !== "/",
      new TypeError("The package name in NPM location is empty.")
    );
    let packageName = url.pathname;
    if (packageName.startsWith("/")) {
      packageName = packageName.slice(1);
    }
    this.meta = {
      requestedRange,
      registry,
      packageName,
      fetch: fetchFunction,
      resolveVersion
    };
  }
  async manifest() {
    if (_chunkEXN2TFDJjs.__privateGet.call(void 0, this, _validatedManifest)) {
      return _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _validatedManifest).clone();
    }
    const vfile = await this.fetch("snap.manifest.json");
    const result = _snapsutils.parseJson.call(void 0, vfile.toString());
    vfile.result = _snapsutils.createSnapManifest.call(void 0, result);
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _validatedManifest, vfile);
    return this.manifest();
  }
  async fetch(path) {
    const relativePath = _snapsutils.normalizeRelative.call(void 0, path);
    if (!_chunkEXN2TFDJjs.__privateGet.call(void 0, this, _files)) {
      await _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _lazyInit, lazyInit_fn).call(this);
      _utils.assert.call(void 0, _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _files) !== void 0);
    }
    const vfile = _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _files).get(relativePath);
    _utils.assert.call(void 0, 
      vfile !== void 0,
      new TypeError(`File "${path}" not found in package.`)
    );
    return vfile.clone();
  }
  get packageName() {
    return this.meta.packageName;
  }
  get version() {
    _utils.assert.call(void 0, 
      this.meta.version !== void 0,
      "Tried to access version without first fetching NPM package."
    );
    return this.meta.version;
  }
  get registry() {
    return this.meta.registry;
  }
  get versionRange() {
    return this.meta.requestedRange;
  }
};
_validatedManifest = new WeakMap();
_files = new WeakMap();
_lazyInit = new WeakSet();
lazyInit_fn = async function() {
  _utils.assert.call(void 0, _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _files) === void 0);
  const resolvedVersion = await this.meta.resolveVersion(
    this.meta.requestedRange
  );
  const { tarballURL, targetVersion } = await resolveNpmVersion(
    this.meta.packageName,
    resolvedVersion,
    this.meta.registry,
    this.meta.fetch
  );
  if (!_snapsutils.isValidUrl.call(void 0, tarballURL) || !tarballURL.toString().endsWith(".tgz")) {
    throw new Error(
      `Failed to find valid tarball URL in NPM metadata for package "${this.meta.packageName}".`
    );
  }
  const newTarballUrl = new URL(tarballURL);
  newTarballUrl.hostname = this.meta.registry.hostname;
  newTarballUrl.protocol = this.meta.registry.protocol;
  const files = await this.fetchNpmTarball(newTarballUrl);
  _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _files, files);
  this.meta.version = targetVersion;
};
var TARBALL_SIZE_SAFETY_LIMIT = 262144e3;
var NpmLocation = class extends BaseNpmLocation {
  /**
   * Fetches and unpacks the tarball (`.tgz` file) from the specified URL.
   *
   * @param tarballUrl - The tarball URL to fetch and unpack.
   * @returns A the files for the package tarball.
   * @throws If fetching the tarball fails.
   */
  async fetchNpmTarball(tarballUrl) {
    const tarballResponse = await this.meta.fetch(tarballUrl.toString());
    if (!tarballResponse.ok || !tarballResponse.body) {
      throw new Error(
        `Failed to fetch tarball for package "${this.meta.packageName}".`
      );
    }
    const tarballSizeString = tarballResponse.headers.get("content-length");
    _utils.assert.call(void 0, tarballSizeString, "Snap tarball has invalid content-length");
    const tarballSize = parseInt(tarballSizeString, 10);
    _utils.assert.call(void 0, 
      tarballSize <= TARBALL_SIZE_SAFETY_LIMIT,
      "Snap tarball exceeds size limit"
    );
    return new Promise((resolve, reject) => {
      const files = /* @__PURE__ */ new Map();
      const tarballStream = createTarballStream(
        getNpmCanonicalBasePath(this.meta.registry, this.meta.packageName),
        files
      );
      const body = tarballResponse.body;
      if ("pipeThrough" in body && "DecompressionStream" in globalThis) {
        const decompressionStream = new DecompressionStream("gzip");
        const decompressedStream = body.pipeThrough(decompressionStream);
        _readablestream.pipeline.call(void 0, 
          getNodeStream(decompressedStream),
          tarballStream,
          (error) => {
            error ? reject(error) : resolve(files);
          }
        );
        return;
      }
      _readablestream.pipeline.call(void 0, 
        getNodeStream(body),
        _browserifyzlib.createGunzip.call(void 0, ),
        tarballStream,
        (error) => {
          error ? reject(error) : resolve(files);
        }
      );
    });
  }
};
async function fetchNpmMetadata(packageName, registryUrl, fetchFunction) {
  const packageResponse = await fetchFunction(
    new URL(packageName, registryUrl).toString(),
    {
      headers: {
        // Corgi format is slightly smaller: https://github.com/npm/pacote/blob/main/lib/registry.js#L71
        accept: isNPM(registryUrl) ? "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*" : "application/json"
      }
    }
  );
  if (!packageResponse.ok) {
    throw new Error(
      `Failed to fetch NPM registry entry. Status code: ${packageResponse.status}.`
    );
  }
  const packageMetadata = await packageResponse.json();
  if (!_utils.isObject.call(void 0, packageMetadata)) {
    throw new Error(
      `Failed to fetch package "${packageName}" metadata from npm.`
    );
  }
  return packageMetadata;
}
function getNpmCanonicalBasePath(registryUrl, packageName) {
  let canonicalBase = "npm://";
  if (registryUrl.username !== "") {
    canonicalBase += registryUrl.username;
    if (registryUrl.password !== "") {
      canonicalBase += `:${registryUrl.password}`;
    }
    canonicalBase += "@";
  }
  return `${canonicalBase}${registryUrl.host}/${packageName}/`;
}
function isNPM(registryUrl) {
  return registryUrl.toString() === DEFAULT_NPM_REGISTRY.toString();
}
async function resolveNpmVersion(packageName, versionRange, registryUrl, fetchFunction) {
  if (isNPM(registryUrl) && _utils.isValidSemVerVersion.call(void 0, versionRange)) {
    return {
      tarballURL: _getnpmtarballurl2.default.call(void 0, packageName, versionRange),
      targetVersion: versionRange
    };
  }
  const packageMetadata = await fetchNpmMetadata(
    packageName,
    registryUrl,
    fetchFunction
  );
  const versions = Object.keys(packageMetadata?.versions ?? {}).map(
    (version) => {
      _utils.assertIsSemVerVersion.call(void 0, version);
      return version;
    }
  );
  const targetVersion = _snapsutils.getTargetVersion.call(void 0, versions, versionRange);
  if (targetVersion === null) {
    throw new Error(
      `Failed to find a matching version in npm metadata for package "${packageName}" and requested semver range "${versionRange}".`
    );
  }
  const tarballURL = packageMetadata?.versions?.[targetVersion]?.dist?.tarball;
  return { tarballURL, targetVersion };
}
var NPM_TARBALL_PATH_PREFIX = /^package\//u;
function getNodeStream(stream) {
  if (typeof stream.getReader !== "function") {
    return stream;
  }
  return new (0, _readablewebtonodestream.ReadableWebToNodeStream)(stream);
}
function createTarballStream(canonicalBase, files) {
  _utils.assert.call(void 0, 
    canonicalBase.endsWith("/"),
    "Base needs to end with '/' for relative paths to be added as children instead of siblings."
  );
  _utils.assert.call(void 0, 
    canonicalBase.startsWith("npm:"),
    'Protocol mismatch, expected "npm:".'
  );
  const extractStream = _tarstream.extract.call(void 0, );
  let totalSize = 0;
  extractStream.on("entry", (header, entryStream, next) => {
    const { name: headerName, type: headerType } = header;
    if (headerType === "file") {
      const path = headerName.replace(NPM_TARBALL_PATH_PREFIX, "");
      return entryStream.pipe(
        _concatstream2.default.call(void 0, { encoding: "uint8array" }, (data) => {
          try {
            totalSize += data.byteLength;
            _utils.assert.call(void 0, 
              totalSize < TARBALL_SIZE_SAFETY_LIMIT,
              `Snap tarball exceeds limit of ${TARBALL_SIZE_SAFETY_LIMIT} bytes.`
            );
            const vfile = new (0, _snapsutils.VirtualFile)({
              value: data,
              path,
              data: {
                canonicalPath: new URL(path, canonicalBase).toString()
              }
            });
            _utils.assert.call(void 0, 
              !files.has(path),
              "Malformed tarball, multiple files with the same path."
            );
            files.set(path, vfile);
            return next();
          } catch (error) {
            return extractStream.destroy(error);
          }
        })
      );
    }
    entryStream.on("end", () => next());
    return entryStream.resume();
  });
  return extractStream;
}








exports.DEFAULT_NPM_REGISTRY = DEFAULT_NPM_REGISTRY; exports.BaseNpmLocation = BaseNpmLocation; exports.TARBALL_SIZE_SAFETY_LIMIT = TARBALL_SIZE_SAFETY_LIMIT; exports.NpmLocation = NpmLocation; exports.fetchNpmMetadata = fetchNpmMetadata; exports.getNpmCanonicalBasePath = getNpmCanonicalBasePath;
//# sourceMappingURL=chunk-XWDEGRM5.js.map