import type { RestrictedControllerMessenger } from '@metamask/base-controller';
import { BaseControllerV2 as BaseController } from '@metamask/base-controller';
import type { SnapsRegistryDatabase } from '@metamask/snaps-registry';
import { verify } from '@metamask/snaps-registry';
import type { SnapId } from '@metamask/snaps-utils';
import type { Hex } from '@metamask/utils';
import {
  assert,
  Duration,
  inMilliseconds,
  satisfiesVersionRange,
} from '@metamask/utils';

import type {
  SnapsRegistry,
  SnapsRegistryInfo,
  SnapsRegistryMetadata,
  SnapsRegistryRequest,
  SnapsRegistryResult,
} from './registry';
import { SnapsRegistryStatus } from './registry';

// TODO: Replace with a Codefi URL
const SNAP_REGISTRY_URL =
  'https://cdn.jsdelivr.net/gh/MetaMask/snaps-registry@gh-pages/latest/registry.json';

const SNAP_REGISTRY_SIGNATURE_URL =
  'https://cdn.jsdelivr.net/gh/MetaMask/snaps-registry@gh-pages/latest/signature.json';

type JsonSnapsRegistryUrl = {
  registry: string;
  signature: string;
};

export type JsonSnapsRegistryArgs = {
  messenger: SnapsRegistryMessenger;
  state?: SnapsRegistryState;
  fetchFunction?: typeof fetch;
  url?: JsonSnapsRegistryUrl;
  recentFetchThreshold?: number;
  refetchOnAllowlistMiss?: boolean;
  failOnUnavailableRegistry?: boolean;
  publicKey?: Hex;
};

export type GetResult = {
  type: `${typeof controllerName}:get`;
  handler: SnapsRegistry['get'];
};

export type GetMetadata = {
  type: `${typeof controllerName}:getMetadata`;
  handler: SnapsRegistry['getMetadata'];
};

export type Update = {
  type: `${typeof controllerName}:update`;
  handler: SnapsRegistry['update'];
};

export type SnapsRegistryActions = GetResult | GetMetadata | Update;

export type SnapsRegistryEvents = never;

export type SnapsRegistryMessenger = RestrictedControllerMessenger<
  'SnapsRegistry',
  SnapsRegistryActions,
  SnapsRegistryEvents,
  SnapsRegistryActions['type'],
  SnapsRegistryEvents['type']
>;

export type SnapsRegistryState = {
  database: SnapsRegistryDatabase | null;
  lastUpdated: number | null;
};

const controllerName = 'SnapsRegistry';

const defaultState = {
  database: null,
  lastUpdated: null,
};

export class JsonSnapsRegistry extends BaseController<
  typeof controllerName,
  SnapsRegistryState,
  SnapsRegistryMessenger
> {
  #url: JsonSnapsRegistryUrl;

  #publicKey?: Hex;

  #fetchFunction: typeof fetch;

  #recentFetchThreshold: number;

  #refetchOnAllowlistMiss: boolean;

  #failOnUnavailableRegistry: boolean;

  constructor({
    messenger,
    state,
    url = {
      registry: SNAP_REGISTRY_URL,
      signature: SNAP_REGISTRY_SIGNATURE_URL,
    },
    publicKey,
    fetchFunction = globalThis.fetch.bind(globalThis),
    recentFetchThreshold = inMilliseconds(5, Duration.Minute),
    failOnUnavailableRegistry = true,
    refetchOnAllowlistMiss = true,
  }: JsonSnapsRegistryArgs) {
    super({
      messenger,
      metadata: {
        database: { persist: true, anonymous: false },
        lastUpdated: { persist: true, anonymous: false },
      },
      name: controllerName,
      state: {
        ...defaultState,
        ...state,
      },
    });
    this.#url = url;
    this.#publicKey = publicKey;
    this.#fetchFunction = fetchFunction;
    this.#recentFetchThreshold = recentFetchThreshold;
    this.#refetchOnAllowlistMiss = refetchOnAllowlistMiss;
    this.#failOnUnavailableRegistry = failOnUnavailableRegistry;

    this.messagingSystem.registerActionHandler(
      'SnapsRegistry:get',
      async (...args) => this.#get(...args),
    );
    this.messagingSystem.registerActionHandler(
      'SnapsRegistry:getMetadata',
      async (...args) => this.#getMetadata(...args),
    );

    this.messagingSystem.registerActionHandler(
      'SnapsRegistry:update',
      async () => this.#update(),
    );
  }

  #wasRecentlyFetched() {
    return (
      this.state.lastUpdated &&
      Date.now() - this.state.lastUpdated < this.#recentFetchThreshold
    );
  }

  async #update() {
    // No-op if we recently fetched the registry.
    if (this.#wasRecentlyFetched()) {
      return;
    }

    try {
      const database = await this.#safeFetch(this.#url.registry);

      if (this.#publicKey) {
        const signature = await this.#safeFetch(this.#url.signature);
        await this.#verifySignature(database, signature);
      }

      this.update((state) => {
        state.database = JSON.parse(database);
        state.lastUpdated = Date.now();
      });
    } catch {
      // Ignore
    }
  }

  async #getDatabase(): Promise<SnapsRegistryDatabase | null> {
    if (this.state.database === null) {
      await this.#update();
    }

    // If the database is still null and we require it, throw.
    if (this.#failOnUnavailableRegistry && this.state.database === null) {
      throw new Error('Snaps registry is unavailable, installation blocked.');
    }
    return this.state.database;
  }

  async #getSingle(
    snapId: SnapId,
    snapInfo: SnapsRegistryInfo,
    refetch = false,
  ): Promise<SnapsRegistryResult> {
    const database = await this.#getDatabase();

    const blockedEntry = database?.blockedSnaps.find((blocked) => {
      if ('id' in blocked) {
        return (
          blocked.id === snapId &&
          satisfiesVersionRange(snapInfo.version, blocked.versionRange)
        );
      }

      return blocked.checksum === snapInfo.checksum;
    });

    if (blockedEntry) {
      return {
        status: SnapsRegistryStatus.Blocked,
        reason: blockedEntry.reason,
      };
    }

    const verified = database?.verifiedSnaps[snapId];
    const version = verified?.versions?.[snapInfo.version];
    if (version && version.checksum === snapInfo.checksum) {
      return { status: SnapsRegistryStatus.Verified };
    }
    // For now, if we have an allowlist miss, we can refetch once and try again.
    if (this.#refetchOnAllowlistMiss && !refetch) {
      await this.#update();
      return this.#getSingle(snapId, snapInfo, true);
    }
    return { status: SnapsRegistryStatus.Unverified };
  }

  async #get(
    snaps: SnapsRegistryRequest,
  ): Promise<Record<SnapId, SnapsRegistryResult>> {
    return Object.entries(snaps).reduce<
      Promise<Record<SnapId, SnapsRegistryResult>>
    >(async (previousPromise, [snapId, snapInfo]) => {
      const result = await this.#getSingle(snapId, snapInfo);
      const acc = await previousPromise;
      acc[snapId] = result;
      return acc;
    }, Promise.resolve({}));
  }

  /**
   * Get metadata for the given snap ID.
   *
   * @param snapId - The ID of the snap to get metadata for.
   * @returns The metadata for the given snap ID, or `null` if the snap is not
   * verified.
   */
  async #getMetadata(snapId: SnapId): Promise<SnapsRegistryMetadata | null> {
    const database = await this.#getDatabase();
    return database?.verifiedSnaps[snapId]?.metadata ?? null;
  }

  /**
   * Verify the signature of the registry.
   *
   * @param database - The registry database.
   * @param signature - The signature of the registry.
   * @throws If the signature is invalid.
   * @private
   */
  async #verifySignature(database: string, signature: string) {
    assert(this.#publicKey, 'No public key provided.');

    const valid = await verify({
      registry: database,
      signature: JSON.parse(signature),
      publicKey: this.#publicKey,
    });

    assert(valid, 'Invalid registry signature.');
  }

  /**
   * Fetch the given URL, throwing if the response is not OK.
   *
   * @param url - The URL to fetch.
   * @returns The response body.
   * @private
   */
  async #safeFetch(url: string) {
    const response = await this.#fetchFunction(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}.`);
    }

    return await response.text();
  }
}
