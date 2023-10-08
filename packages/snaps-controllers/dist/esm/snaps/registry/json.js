function _check_private_redeclaration(obj, privateCollection) {
    if (privateCollection.has(obj)) {
        throw new TypeError("Cannot initialize the same private elements twice on an object");
    }
}
function _class_apply_descriptor_get(receiver, descriptor) {
    if (descriptor.get) {
        return descriptor.get.call(receiver);
    }
    return descriptor.value;
}
function _class_apply_descriptor_set(receiver, descriptor, value) {
    if (descriptor.set) {
        descriptor.set.call(receiver, value);
    } else {
        if (!descriptor.writable) {
            throw new TypeError("attempted to set read only private field");
        }
        descriptor.value = value;
    }
}
function _class_extract_field_descriptor(receiver, privateMap, action) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to " + action + " private field on non-instance");
    }
    return privateMap.get(receiver);
}
function _class_private_field_get(receiver, privateMap) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "get");
    return _class_apply_descriptor_get(receiver, descriptor);
}
function _class_private_field_init(obj, privateMap, value) {
    _check_private_redeclaration(obj, privateMap);
    privateMap.set(obj, value);
}
function _class_private_field_set(receiver, privateMap, value) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "set");
    _class_apply_descriptor_set(receiver, descriptor, value);
    return value;
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
import { BaseControllerV2 as BaseController } from '@metamask/base-controller';
import { verify } from '@metamask/snaps-registry';
import { assert, Duration, inMilliseconds, satisfiesVersionRange } from '@metamask/utils';
import { SnapsRegistryStatus } from './registry';
// TODO: Replace with a Codefi URL
const SNAP_REGISTRY_URL = 'https://cdn.jsdelivr.net/gh/MetaMask/snaps-registry@gh-pages/latest/registry.json';
const SNAP_REGISTRY_SIGNATURE_URL = 'https://cdn.jsdelivr.net/gh/MetaMask/snaps-registry@gh-pages/latest/signature.json';
const controllerName = 'SnapsRegistry';
const defaultState = {
    database: null,
    lastUpdated: null
};
var _url = /*#__PURE__*/ new WeakMap(), _publicKey = /*#__PURE__*/ new WeakMap(), _fetchFunction = /*#__PURE__*/ new WeakMap(), _recentFetchThreshold = /*#__PURE__*/ new WeakMap(), _refetchOnAllowlistMiss = /*#__PURE__*/ new WeakMap(), _failOnUnavailableRegistry = /*#__PURE__*/ new WeakMap(), _currentUpdate = /*#__PURE__*/ new WeakMap(), _wasRecentlyFetched = /*#__PURE__*/ new WeakSet(), _triggerUpdate = /*#__PURE__*/ new WeakSet(), _update = /*#__PURE__*/ new WeakSet(), _getDatabase = /*#__PURE__*/ new WeakSet(), _getSingle = /*#__PURE__*/ new WeakSet(), _get = /*#__PURE__*/ new WeakSet(), _getMetadata = /*#__PURE__*/ new WeakSet(), _verifySignature = /*#__PURE__*/ new WeakSet(), _safeFetch = /*#__PURE__*/ new WeakSet();
export class JsonSnapsRegistry extends BaseController {
    constructor({ messenger, state, url = {
        registry: SNAP_REGISTRY_URL,
        signature: SNAP_REGISTRY_SIGNATURE_URL
    }, publicKey, fetchFunction = globalThis.fetch.bind(globalThis), recentFetchThreshold = inMilliseconds(5, Duration.Minute), failOnUnavailableRegistry = true, refetchOnAllowlistMiss = true }){
        super({
            messenger,
            metadata: {
                database: {
                    persist: true,
                    anonymous: false
                },
                lastUpdated: {
                    persist: true,
                    anonymous: false
                }
            },
            name: controllerName,
            state: {
                ...defaultState,
                ...state
            }
        });
        _class_private_method_init(this, _wasRecentlyFetched);
        /**
   * Triggers an update of the registry database.
   *
   * If an existing update is in progress this function will await that update.
   */ _class_private_method_init(this, _triggerUpdate);
        /**
   * Updates the registry database if the registry hasn't been updated recently.
   *
   * NOTE: SHOULD NOT be called directly, instead `triggerUpdate` should be used.
   */ _class_private_method_init(this, _update);
        _class_private_method_init(this, _getDatabase);
        _class_private_method_init(this, _getSingle);
        _class_private_method_init(this, _get);
        /**
   * Get metadata for the given snap ID.
   *
   * @param snapId - The ID of the snap to get metadata for.
   * @returns The metadata for the given snap ID, or `null` if the snap is not
   * verified.
   */ _class_private_method_init(this, _getMetadata);
        /**
   * Verify the signature of the registry.
   *
   * @param database - The registry database.
   * @param signature - The signature of the registry.
   * @throws If the signature is invalid.
   * @private
   */ _class_private_method_init(this, _verifySignature);
        /**
   * Fetch the given URL, throwing if the response is not OK.
   *
   * @param url - The URL to fetch.
   * @returns The response body.
   * @private
   */ _class_private_method_init(this, _safeFetch);
        _class_private_field_init(this, _url, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _publicKey, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _fetchFunction, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _recentFetchThreshold, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _refetchOnAllowlistMiss, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _failOnUnavailableRegistry, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _currentUpdate, {
            writable: true,
            value: void 0
        });
        _class_private_field_set(this, _url, url);
        _class_private_field_set(this, _publicKey, publicKey);
        _class_private_field_set(this, _fetchFunction, fetchFunction);
        _class_private_field_set(this, _recentFetchThreshold, recentFetchThreshold);
        _class_private_field_set(this, _refetchOnAllowlistMiss, refetchOnAllowlistMiss);
        _class_private_field_set(this, _failOnUnavailableRegistry, failOnUnavailableRegistry);
        _class_private_field_set(this, _currentUpdate, null);
        this.messagingSystem.registerActionHandler('SnapsRegistry:get', async (...args)=>_class_private_method_get(this, _get, get).call(this, ...args));
        this.messagingSystem.registerActionHandler('SnapsRegistry:getMetadata', async (...args)=>_class_private_method_get(this, _getMetadata, getMetadata).call(this, ...args));
        this.messagingSystem.registerActionHandler('SnapsRegistry:update', async ()=>_class_private_method_get(this, _triggerUpdate, triggerUpdate).call(this));
    }
}
function wasRecentlyFetched() {
    return this.state.lastUpdated && Date.now() - this.state.lastUpdated < _class_private_field_get(this, _recentFetchThreshold);
}
async function triggerUpdate() {
    // If an update is ongoing, wait for that.
    if (_class_private_field_get(this, _currentUpdate)) {
        await _class_private_field_get(this, _currentUpdate);
        return;
    }
    // If no update exists, create promise and store globally.
    if (_class_private_field_get(this, _currentUpdate) === null) {
        _class_private_field_set(this, _currentUpdate, _class_private_method_get(this, _update, update).call(this));
    }
    await _class_private_field_get(this, _currentUpdate);
    _class_private_field_set(this, _currentUpdate, null);
}
async function update() {
    // No-op if we recently fetched the registry.
    if (_class_private_method_get(this, _wasRecentlyFetched, wasRecentlyFetched).call(this)) {
        return;
    }
    try {
        const database = await _class_private_method_get(this, _safeFetch, safeFetch).call(this, _class_private_field_get(this, _url).registry);
        if (_class_private_field_get(this, _publicKey)) {
            const signature = await _class_private_method_get(this, _safeFetch, safeFetch).call(this, _class_private_field_get(this, _url).signature);
            await _class_private_method_get(this, _verifySignature, verifySignature).call(this, database, signature);
        }
        this.update((state)=>{
            state.database = JSON.parse(database);
            state.lastUpdated = Date.now();
        });
    } catch  {
    // Ignore
    }
}
async function getDatabase() {
    if (this.state.database === null) {
        await _class_private_method_get(this, _triggerUpdate, triggerUpdate).call(this);
    }
    // If the database is still null and we require it, throw.
    if (_class_private_field_get(this, _failOnUnavailableRegistry) && this.state.database === null) {
        throw new Error('Snaps registry is unavailable, installation blocked.');
    }
    return this.state.database;
}
async function getSingle(snapId, snapInfo, refetch = false) {
    const database = await _class_private_method_get(this, _getDatabase, getDatabase).call(this);
    const blockedEntry = database?.blockedSnaps.find((blocked)=>{
        if ('id' in blocked) {
            return blocked.id === snapId && satisfiesVersionRange(snapInfo.version, blocked.versionRange);
        }
        return blocked.checksum === snapInfo.checksum;
    });
    if (blockedEntry) {
        return {
            status: SnapsRegistryStatus.Blocked,
            reason: blockedEntry.reason
        };
    }
    const verified = database?.verifiedSnaps[snapId];
    const version = verified?.versions?.[snapInfo.version];
    if (version && version.checksum === snapInfo.checksum) {
        return {
            status: SnapsRegistryStatus.Verified
        };
    }
    // For now, if we have an allowlist miss, we can refetch once and try again.
    if (_class_private_field_get(this, _refetchOnAllowlistMiss) && !refetch) {
        await _class_private_method_get(this, _triggerUpdate, triggerUpdate).call(this);
        return _class_private_method_get(this, _getSingle, getSingle).call(this, snapId, snapInfo, true);
    }
    return {
        status: SnapsRegistryStatus.Unverified
    };
}
async function get(snaps) {
    return Object.entries(snaps).reduce(async (previousPromise, [snapId, snapInfo])=>{
        const result = await _class_private_method_get(this, _getSingle, getSingle).call(this, snapId, snapInfo);
        const acc = await previousPromise;
        acc[snapId] = result;
        return acc;
    }, Promise.resolve({}));
}
async function getMetadata(snapId) {
    const database = await _class_private_method_get(this, _getDatabase, getDatabase).call(this);
    return database?.verifiedSnaps[snapId]?.metadata ?? null;
}
async function verifySignature(database, signature) {
    assert(_class_private_field_get(this, _publicKey), 'No public key provided.');
    const valid = await verify({
        registry: database,
        signature: JSON.parse(signature),
        publicKey: _class_private_field_get(this, _publicKey)
    });
    assert(valid, 'Invalid registry signature.');
}
async function safeFetch(url) {
    const response = await _class_private_field_get(this, _fetchFunction).call(this, url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}.`);
    }
    return await response.text();
}

//# sourceMappingURL=json.js.map