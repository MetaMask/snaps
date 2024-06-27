"use strict";Object.defineProperty(exports, "__esModule", {value: true});




var _chunkEXN2TFDJjs = require('./chunk-EXN2TFDJ.js');

// src/snaps/registry/json.ts
var _basecontroller = require('@metamask/base-controller');
var _snapsregistry = require('@metamask/snaps-registry');
var _snapsutils = require('@metamask/snaps-utils');






var _utils = require('@metamask/utils');
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
var JsonSnapsRegistry = class extends _basecontroller.BaseController {
  constructor({
    messenger,
    state,
    url = {
      registry: SNAP_REGISTRY_URL,
      signature: SNAP_REGISTRY_SIGNATURE_URL
    },
    publicKey = DEFAULT_PUBLIC_KEY,
    fetchFunction = globalThis.fetch.bind(globalThis),
    recentFetchThreshold = _utils.inMilliseconds.call(void 0, 5, _utils.Duration.Minute),
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
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _wasRecentlyFetched);
    /**
     * Triggers an update of the registry database.
     *
     * If an existing update is in progress this function will await that update.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _triggerUpdate);
    /**
     * Updates the registry database if the registry hasn't been updated recently.
     *
     * NOTE: SHOULD NOT be called directly, instead `triggerUpdate` should be used.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _update);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _getDatabase);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _getSingle);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _get);
    /**
     * Find an allowlisted version within a specified version range. Otherwise return the version range itself.
     *
     * @param snapId - The ID of the snap we are trying to resolve a version for.
     * @param versionRange - The version range.
     * @param refetch - An optional flag used to determine if we are refetching the registry.
     * @returns An allowlisted version within the specified version range if available otherwise returns the input version range.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _resolveVersion);
    /**
     * Get metadata for the given snap ID.
     *
     * @param snapId - The ID of the snap to get metadata for.
     * @returns The metadata for the given snap ID, or `null` if the snap is not
     * verified.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _getMetadata);
    /**
     * Verify the signature of the registry.
     *
     * @param database - The registry database.
     * @param signature - The signature of the registry.
     * @throws If the signature is invalid.
     * @private
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _verifySignature);
    /**
     * Fetch the given URL, throwing if the response is not OK.
     *
     * @param url - The URL to fetch.
     * @returns The response body.
     * @private
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _safeFetch);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _url, void 0);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _publicKey, void 0);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _fetchFunction, void 0);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _recentFetchThreshold, void 0);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _refetchOnAllowlistMiss, void 0);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _currentUpdate, void 0);
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _url, url);
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _publicKey, publicKey);
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _fetchFunction, fetchFunction);
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _recentFetchThreshold, recentFetchThreshold);
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _refetchOnAllowlistMiss, refetchOnAllowlistMiss);
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _currentUpdate, null);
    this.messagingSystem.registerActionHandler(
      "SnapsRegistry:get",
      async (...args) => _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _get, get_fn).call(this, ...args)
    );
    this.messagingSystem.registerActionHandler(
      "SnapsRegistry:getMetadata",
      async (...args) => _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _getMetadata, getMetadata_fn).call(this, ...args)
    );
    this.messagingSystem.registerActionHandler(
      "SnapsRegistry:resolveVersion",
      async (...args) => _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _resolveVersion, resolveVersion_fn).call(this, ...args)
    );
    this.messagingSystem.registerActionHandler(
      "SnapsRegistry:update",
      async () => _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _triggerUpdate, triggerUpdate_fn).call(this)
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
  return this.state.lastUpdated && Date.now() - this.state.lastUpdated < _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _recentFetchThreshold);
};
_triggerUpdate = new WeakSet();
triggerUpdate_fn = async function() {
  if (_chunkEXN2TFDJjs.__privateGet.call(void 0, this, _currentUpdate)) {
    await _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _currentUpdate);
    return;
  }
  if (_chunkEXN2TFDJjs.__privateGet.call(void 0, this, _currentUpdate) === null) {
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _currentUpdate, _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _update, update_fn).call(this));
  }
  await _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _currentUpdate);
  _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _currentUpdate, null);
};
_update = new WeakSet();
update_fn = async function() {
  if (_chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _wasRecentlyFetched, wasRecentlyFetched_fn).call(this)) {
    return;
  }
  try {
    const database = await _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _safeFetch, safeFetch_fn).call(this, _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _url).registry);
    const signature = await _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _safeFetch, safeFetch_fn).call(this, _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _url).signature);
    _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _verifySignature, verifySignature_fn).call(this, database, signature);
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
    await _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _triggerUpdate, triggerUpdate_fn).call(this);
  }
  return this.state.database;
};
_getSingle = new WeakSet();
getSingle_fn = async function(snapId, snapInfo, refetch = false) {
  const database = await _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _getDatabase, getDatabase_fn).call(this);
  const blockedEntry = database?.blockedSnaps.find((blocked) => {
    if ("id" in blocked) {
      return blocked.id === snapId && _utils.satisfiesVersionRange.call(void 0, snapInfo.version, blocked.versionRange);
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
  if (_chunkEXN2TFDJjs.__privateGet.call(void 0, this, _refetchOnAllowlistMiss) && !refetch) {
    await _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _triggerUpdate, triggerUpdate_fn).call(this);
    return _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _getSingle, getSingle_fn).call(this, snapId, snapInfo, true);
  }
  return {
    status: this.state.databaseUnavailable ? 3 /* Unavailable */ : 0 /* Unverified */
  };
};
_get = new WeakSet();
get_fn = async function(snaps) {
  return Object.entries(snaps).reduce(async (previousPromise, [snapId, snapInfo]) => {
    const result = await _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _getSingle, getSingle_fn).call(this, snapId, snapInfo);
    const acc = await previousPromise;
    acc[snapId] = result;
    return acc;
  }, Promise.resolve({}));
};
_resolveVersion = new WeakSet();
resolveVersion_fn = async function(snapId, versionRange, refetch = false) {
  const database = await _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _getDatabase, getDatabase_fn).call(this);
  const versions = database?.verifiedSnaps[snapId]?.versions ?? null;
  if (!versions && _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _refetchOnAllowlistMiss) && !refetch) {
    await _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _triggerUpdate, triggerUpdate_fn).call(this);
    return _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _resolveVersion, resolveVersion_fn).call(this, snapId, versionRange, true);
  }
  if (!versions) {
    return versionRange;
  }
  const targetVersion = _snapsutils.getTargetVersion.call(void 0, 
    Object.keys(versions),
    versionRange
  );
  if (!targetVersion && _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _refetchOnAllowlistMiss) && !refetch) {
    await _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _triggerUpdate, triggerUpdate_fn).call(this);
    return _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _resolveVersion, resolveVersion_fn).call(this, snapId, versionRange, true);
  }
  if (!targetVersion) {
    return versionRange;
  }
  _utils.assertIsSemVerRange.call(void 0, targetVersion);
  return targetVersion;
};
_getMetadata = new WeakSet();
getMetadata_fn = async function(snapId) {
  const database = await _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _getDatabase, getDatabase_fn).call(this);
  return database?.verifiedSnaps[snapId]?.metadata ?? null;
};
_verifySignature = new WeakSet();
verifySignature_fn = function(database, signature) {
  _utils.assert.call(void 0, _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _publicKey), "No public key provided.");
  const valid = _snapsregistry.verify.call(void 0, {
    registry: database,
    signature: JSON.parse(signature),
    publicKey: _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _publicKey)
  });
  _utils.assert.call(void 0, valid, "Invalid registry signature.");
};
_safeFetch = new WeakSet();
safeFetch_fn = async function(url) {
  const response = await _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _fetchFunction).call(this, url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}.`);
  }
  return await response.text();
};



exports.JsonSnapsRegistry = JsonSnapsRegistry;
//# sourceMappingURL=chunk-CPUUURMT.js.map