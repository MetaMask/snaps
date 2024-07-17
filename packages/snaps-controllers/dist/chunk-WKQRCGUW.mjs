import {
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet
} from "./chunk-YRZVIDCF.mjs";

// src/snaps/location/npm.ts
import {
  createSnapManifest,
  DEFAULT_REQUESTED_SNAP_VERSION,
  getTargetVersion,
  isValidUrl,
  NpmSnapIdStruct,
  VirtualFile,
  normalizeRelative,
  parseJson
} from "@metamask/snaps-utils";
import {
  assert,
  assertIsSemVerVersion,
  assertStruct,
  isObject,
  isValidSemVerVersion
} from "@metamask/utils";
import { createGunzip } from "browserify-zlib";
import concat from "concat-stream";
import getNpmTarballUrl from "get-npm-tarball-url";
import { pipeline } from "readable-stream";
import { ReadableWebToNodeStream } from "readable-web-to-node-stream";
import { extract as tarExtract } from "tar-stream";
var DEFAULT_NPM_REGISTRY = new URL("https://registry.npmjs.org");
var _validatedManifest, _files, _lazyInit, lazyInit_fn;
var BaseNpmLocation = class {
  constructor(url, opts = {}) {
    __privateAdd(this, _lazyInit);
    __privateAdd(this, _validatedManifest, void 0);
    __privateAdd(this, _files, void 0);
    const allowCustomRegistries = opts.allowCustomRegistries ?? false;
    const fetchFunction = opts.fetch ?? globalThis.fetch.bind(globalThis);
    const requestedRange = opts.versionRange ?? DEFAULT_REQUESTED_SNAP_VERSION;
    const defaultResolve = async (range) => range;
    const resolveVersion = opts.resolveVersion ?? defaultResolve;
    assertStruct(url.toString(), NpmSnapIdStruct, "Invalid Snap Id: ");
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
      assert(
        allowCustomRegistries,
        new TypeError(
          `Custom NPM registries are disabled, tried to use "${registry.toString()}".`
        )
      );
    }
    assert(
      registry.pathname === "/" && registry.search === "" && registry.hash === ""
    );
    assert(
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
    if (__privateGet(this, _validatedManifest)) {
      return __privateGet(this, _validatedManifest).clone();
    }
    const vfile = await this.fetch("snap.manifest.json");
    const result = parseJson(vfile.toString());
    vfile.result = createSnapManifest(result);
    __privateSet(this, _validatedManifest, vfile);
    return this.manifest();
  }
  async fetch(path) {
    const relativePath = normalizeRelative(path);
    if (!__privateGet(this, _files)) {
      await __privateMethod(this, _lazyInit, lazyInit_fn).call(this);
      assert(__privateGet(this, _files) !== void 0);
    }
    const vfile = __privateGet(this, _files).get(relativePath);
    assert(
      vfile !== void 0,
      new TypeError(`File "${path}" not found in package.`)
    );
    return vfile.clone();
  }
  get packageName() {
    return this.meta.packageName;
  }
  get version() {
    assert(
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
  assert(__privateGet(this, _files) === void 0);
  const resolvedVersion = await this.meta.resolveVersion(
    this.meta.requestedRange
  );
  const { tarballURL, targetVersion } = await resolveNpmVersion(
    this.meta.packageName,
    resolvedVersion,
    this.meta.registry,
    this.meta.fetch
  );
  if (!isValidUrl(tarballURL) || !tarballURL.toString().endsWith(".tgz")) {
    throw new Error(
      `Failed to find valid tarball URL in NPM metadata for package "${this.meta.packageName}".`
    );
  }
  const newTarballUrl = new URL(tarballURL);
  newTarballUrl.hostname = this.meta.registry.hostname;
  newTarballUrl.protocol = this.meta.registry.protocol;
  const files = await this.fetchNpmTarball(newTarballUrl);
  __privateSet(this, _files, files);
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
    assert(tarballSizeString, "Snap tarball has invalid content-length");
    const tarballSize = parseInt(tarballSizeString, 10);
    assert(
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
        pipeline(
          getNodeStream(decompressedStream),
          tarballStream,
          (error) => {
            error ? reject(error) : resolve(files);
          }
        );
        return;
      }
      pipeline(
        getNodeStream(body),
        createGunzip(),
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
  if (!isObject(packageMetadata)) {
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
  if (isNPM(registryUrl) && isValidSemVerVersion(versionRange)) {
    return {
      tarballURL: getNpmTarballUrl(packageName, versionRange),
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
      assertIsSemVerVersion(version);
      return version;
    }
  );
  const targetVersion = getTargetVersion(versions, versionRange);
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
  return new ReadableWebToNodeStream(stream);
}
function createTarballStream(canonicalBase, files) {
  assert(
    canonicalBase.endsWith("/"),
    "Base needs to end with '/' for relative paths to be added as children instead of siblings."
  );
  assert(
    canonicalBase.startsWith("npm:"),
    'Protocol mismatch, expected "npm:".'
  );
  const extractStream = tarExtract();
  let totalSize = 0;
  extractStream.on("entry", (header, entryStream, next) => {
    const { name: headerName, type: headerType } = header;
    if (headerType === "file") {
      const path = headerName.replace(NPM_TARBALL_PATH_PREFIX, "");
      return entryStream.pipe(
        concat({ encoding: "uint8array" }, (data) => {
          try {
            totalSize += data.byteLength;
            assert(
              totalSize < TARBALL_SIZE_SAFETY_LIMIT,
              `Snap tarball exceeds limit of ${TARBALL_SIZE_SAFETY_LIMIT} bytes.`
            );
            const vfile = new VirtualFile({
              value: data,
              path,
              data: {
                canonicalPath: new URL(path, canonicalBase).toString()
              }
            });
            assert(
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

export {
  DEFAULT_NPM_REGISTRY,
  BaseNpmLocation,
  TARBALL_SIZE_SAFETY_LIMIT,
  NpmLocation,
  fetchNpmMetadata,
  getNpmCanonicalBasePath
};
//# sourceMappingURL=chunk-WKQRCGUW.mjs.map