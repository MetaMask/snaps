import {
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet
} from "./chunk-YRZVIDCF.mjs";

// src/snaps/registry/json.ts
import { BaseController } from "@metamask/base-controller";
import { verify } from "@metamask/snaps-registry";
import { getTargetVersion } from "@metamask/snaps-utils";
import {
  assert,
  assertIsSemVerRange,
  Duration,
  inMilliseconds,
  satisfiesVersionRange
} from "@metamask/utils";
var SNAP_REGISTRY_URL = "https://acl.execution.metamask.io/latest/registry.json";
var SNAP_REGISTRY_SIGNATURE_URL = "https://acl.execution.metamask.io/latest/signature.json";
var DEFAULT_PUBLIC_KEY = "0x025b65308f0f0fb8bc7f7ff87bfc296e0330eee5d3c1d1ee4a048b2fd6a86fa0a6";
var controllerName = "SnapsRegistry";
var defaultState = {
  database: null,
  lastUpdated: null,
  databaseUnavailable: false
};
var _url, _publicKey, _fetchFunction, _recentFetchThreshold, _refetchOnAllowlistMiss, _currentUpdate, _wasRecentlyFetched, wasRecentlyFetched_fn, _triggerUpdate, triggerUpdate_fn, _update, update_fn, _getDatabase, getDatabase_fn, _getSingle, getSingle_fn, _get, get_fn, _resolveVersion, resolveVersion_fn, _getMetadata, getMetadata_fn, _verifySignature, verifySignature_fn, _safeFetch, safeFetch_fn;
var JsonSnapsRegistry = class extends BaseController {
  constructor({
    messenger,
    state,
    url = {
      registry: SNAP_REGISTRY_URL,
      signature: SNAP_REGISTRY_SIGNATURE_URL
    },
    publicKey = DEFAULT_PUBLIC_KEY,
    fetchFunction = globalThis.fetch.bind(globalThis),
    recentFetchThreshold = inMilliseconds(5, Duration.Minute),
    refetchOnAllowlistMiss = true
  }) {
    super({
      messenger,
      metadata: {
        database: { persist: true, anonymous: false },
        lastUpdated: { persist: true, anonymous: false },
        databaseUnavailable: { persist: true, anonymous: false }
      },
      name: controllerName,
      state: {
        ...defaultState,
        ...state
      }
    });
    __privateAdd(this, _wasRecentlyFetched);
    /**
     * Triggers an update of the registry database.
     *
     * If an existing update is in progress this function will await that update.
     */
    __privateAdd(this, _triggerUpdate);
    /**
     * Updates the registry database if the registry hasn't been updated recently.
     *
     * NOTE: SHOULD NOT be called directly, instead `triggerUpdate` should be used.
     */
    __privateAdd(this, _update);
    __privateAdd(this, _getDatabase);
    __privateAdd(this, _getSingle);
    __privateAdd(this, _get);
    /**
     * Find an allowlisted version within a specified version range. Otherwise return the version range itself.
     *
     * @param snapId - The ID of the snap we are trying to resolve a version for.
     * @param versionRange - The version range.
     * @param refetch - An optional flag used to determine if we are refetching the registry.
     * @returns An allowlisted version within the specified version range if available otherwise returns the input version range.
     */
    __privateAdd(this, _resolveVersion);
    /**
     * Get metadata for the given snap ID.
     *
     * @param snapId - The ID of the snap to get metadata for.
     * @returns The metadata for the given snap ID, or `null` if the snap is not
     * verified.
     */
    __privateAdd(this, _getMetadata);
    /**
     * Verify the signature of the registry.
     *
     * @param database - The registry database.
     * @param signature - The signature of the registry.
     * @throws If the signature is invalid.
     * @private
     */
    __privateAdd(this, _verifySignature);
    /**
     * Fetch the given URL, throwing if the response is not OK.
     *
     * @param url - The URL to fetch.
     * @returns The response body.
     * @private
     */
    __privateAdd(this, _safeFetch);
    __privateAdd(this, _url, void 0);
    __privateAdd(this, _publicKey, void 0);
    __privateAdd(this, _fetchFunction, void 0);
    __privateAdd(this, _recentFetchThreshold, void 0);
    __privateAdd(this, _refetchOnAllowlistMiss, void 0);
    __privateAdd(this, _currentUpdate, void 0);
    __privateSet(this, _url, url);
    __privateSet(this, _publicKey, publicKey);
    __privateSet(this, _fetchFunction, fetchFunction);
    __privateSet(this, _recentFetchThreshold, recentFetchThreshold);
    __privateSet(this, _refetchOnAllowlistMiss, refetchOnAllowlistMiss);
    __privateSet(this, _currentUpdate, null);
    this.messagingSystem.registerActionHandler(
      "SnapsRegistry:get",
      async (...args) => __privateMethod(this, _get, get_fn).call(this, ...args)
    );
    this.messagingSystem.registerActionHandler(
      "SnapsRegistry:getMetadata",
      async (...args) => __privateMethod(this, _getMetadata, getMetadata_fn).call(this, ...args)
    );
    this.messagingSystem.registerActionHandler(
      "SnapsRegistry:resolveVersion",
      async (...args) => __privateMethod(this, _resolveVersion, resolveVersion_fn).call(this, ...args)
    );
    this.messagingSystem.registerActionHandler(
      "SnapsRegistry:update",
      async () => __privateMethod(this, _triggerUpdate, triggerUpdate_fn).call(this)
    );
  }
};
_url = new WeakMap();
_publicKey = new WeakMap();
_fetchFunction = new WeakMap();
_recentFetchThreshold = new WeakMap();
_refetchOnAllowlistMiss = new WeakMap();
_currentUpdate = new WeakMap();
_wasRecentlyFetched = new WeakSet();
wasRecentlyFetched_fn = function() {
  return this.state.lastUpdated && Date.now() - this.state.lastUpdated < __privateGet(this, _recentFetchThreshold);
};
_triggerUpdate = new WeakSet();
triggerUpdate_fn = async function() {
  if (__privateGet(this, _currentUpdate)) {
    await __privateGet(this, _currentUpdate);
    return;
  }
  if (__privateGet(this, _currentUpdate) === null) {
    __privateSet(this, _currentUpdate, __privateMethod(this, _update, update_fn).call(this));
  }
  await __privateGet(this, _currentUpdate);
  __privateSet(this, _currentUpdate, null);
};
_update = new WeakSet();
update_fn = async function() {
  if (__privateMethod(this, _wasRecentlyFetched, wasRecentlyFetched_fn).call(this)) {
    return;
  }
  try {
    const database = await __privateMethod(this, _safeFetch, safeFetch_fn).call(this, __privateGet(this, _url).registry);
    const signature = await __privateMethod(this, _safeFetch, safeFetch_fn).call(this, __privateGet(this, _url).signature);
    __privateMethod(this, _verifySignature, verifySignature_fn).call(this, database, signature);
    this.update((state) => {
      state.database = JSON.parse(database);
      state.lastUpdated = Date.now();
      state.databaseUnavailable = false;
    });
  } catch {
    this.update((state) => {
      state.databaseUnavailable = true;
    });
  }
};
_getDatabase = new WeakSet();
getDatabase_fn = async function() {
  if (this.state.database === null) {
    await __privateMethod(this, _triggerUpdate, triggerUpdate_fn).call(this);
  }
  return this.state.database;
};
_getSingle = new WeakSet();
getSingle_fn = async function(snapId, snapInfo, refetch = false) {
  const database = await __privateMethod(this, _getDatabase, getDatabase_fn).call(this);
  const blockedEntry = database?.blockedSnaps.find((blocked) => {
    if ("id" in blocked) {
      return blocked.id === snapId && satisfiesVersionRange(snapInfo.version, blocked.versionRange);
    }
    return blocked.checksum === snapInfo.checksum;
  });
  if (blockedEntry) {
    return {
      status: 1 /* Blocked */,
      reason: blockedEntry.reason
    };
  }
  const verified = database?.verifiedSnaps[snapId];
  const version = verified?.versions?.[snapInfo.version];
  if (version && version.checksum === snapInfo.checksum) {
    return { status: 2 /* Verified */ };
  }
  if (__privateGet(this, _refetchOnAllowlistMiss) && !refetch) {
    await __privateMethod(this, _triggerUpdate, triggerUpdate_fn).call(this);
    return __privateMethod(this, _getSingle, getSingle_fn).call(this, snapId, snapInfo, true);
  }
  return {
    status: this.state.databaseUnavailable ? 3 /* Unavailable */ : 0 /* Unverified */
  };
};
_get = new WeakSet();
get_fn = async function(snaps) {
  return Object.entries(snaps).reduce(async (previousPromise, [snapId, snapInfo]) => {
    const result = await __privateMethod(this, _getSingle, getSingle_fn).call(this, snapId, snapInfo);
    const acc = await previousPromise;
    acc[snapId] = result;
    return acc;
  }, Promise.resolve({}));
};
_resolveVersion = new WeakSet();
resolveVersion_fn = async function(snapId, versionRange, refetch = false) {
  const database = await __privateMethod(this, _getDatabase, getDatabase_fn).call(this);
  const versions = database?.verifiedSnaps[snapId]?.versions ?? null;
  if (!versions && __privateGet(this, _refetchOnAllowlistMiss) && !refetch) {
    await __privateMethod(this, _triggerUpdate, triggerUpdate_fn).call(this);
    return __privateMethod(this, _resolveVersion, resolveVersion_fn).call(this, snapId, versionRange, true);
  }
  if (!versions) {
    return versionRange;
  }
  const targetVersion = getTargetVersion(
    Object.keys(versions),
    versionRange
  );
  if (!targetVersion && __privateGet(this, _refetchOnAllowlistMiss) && !refetch) {
    await __privateMethod(this, _triggerUpdate, triggerUpdate_fn).call(this);
    return __privateMethod(this, _resolveVersion, resolveVersion_fn).call(this, snapId, versionRange, true);
  }
  if (!targetVersion) {
    return versionRange;
  }
  assertIsSemVerRange(targetVersion);
  return targetVersion;
};
_getMetadata = new WeakSet();
getMetadata_fn = async function(snapId) {
  const database = await __privateMethod(this, _getDatabase, getDatabase_fn).call(this);
  return database?.verifiedSnaps[snapId]?.metadata ?? null;
};
_verifySignature = new WeakSet();
verifySignature_fn = function(database, signature) {
  assert(__privateGet(this, _publicKey), "No public key provided.");
  const valid = verify({
    registry: database,
    signature: JSON.parse(signature),
    publicKey: __privateGet(this, _publicKey)
  });
  assert(valid, "Invalid registry signature.");
};
_safeFetch = new WeakSet();
safeFetch_fn = async function(url) {
  const response = await __privateGet(this, _fetchFunction).call(this, url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}.`);
  }
  return await response.text();
};

export {
  JsonSnapsRegistry
};
//# sourceMappingURL=chunk-6M4XK4PN.mjs.map