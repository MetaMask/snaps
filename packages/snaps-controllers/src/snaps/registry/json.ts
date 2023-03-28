import {
  BaseControllerV2 as BaseController,
  RestrictedControllerMessenger,
} from '@metamask/base-controller';
import { SnapsRegistryDatabase } from '@metamask/snaps-registry';
import { SnapId } from '@metamask/snaps-utils';
import {
  Duration,
  inMilliseconds,
  satisfiesVersionRange,
} from '@metamask/utils';

import {
  SnapsRegistry,
  SnapsRegistryInfo,
  SnapsRegistryMetadata,
  SnapsRegistryRequest,
  SnapsRegistryResult,
  SnapsRegistryStatus,
} from './registry';

// TODO: Replace with a Codefi URL
const SNAP_REGISTRY_URL =
  'https://cdn.jsdelivr.net/gh/MetaMask/snaps-registry@main/src/registry.json';

export type JsonSnapsRegistryArgs = {
  messenger: SnapsRegistryMessenger;
  state?: SnapsRegistryState;
  fetchFunction?: typeof fetch;
  url?: string;
  recentFetchThreshold?: number;
  refetchOnAllowlistMiss?: boolean;
  failOnUnavailableRegistry?: boolean;
};

export type GetResult = {
  type: `${typeof controllerName}:get`;
  handler: SnapsRegistry['get'];
};

export type GetMetadata = {
  type: `${typeof controllerName}:getMetadata`;
  handler: SnapsRegistry['getMetadata'];
};

export type SnapsRegistryActions = GetResult | GetMetadata;

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
  #url: string;

  #fetchFunction: typeof fetch;

  #recentFetchThreshold: number;

  #refetchOnAllowlistMiss: boolean;

  #failOnUnavailableRegistry: boolean;

  constructor({
    messenger,
    state,
    url = SNAP_REGISTRY_URL,
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
  }

  #wasRecentlyFetched() {
    return (
      this.state.lastUpdated &&
      Date.now() - this.state.lastUpdated < this.#recentFetchThreshold
    );
  }

  async #updateDatabase() {
    // No-op if we recently fetched the registry
    if (this.#wasRecentlyFetched()) {
      return;
    }
    try {
      const response = await this.#fetchFunction(this.#url);
      if (!response.ok) {
        throw new Error('Failed to fetch Snaps registry.');
      }
      const db = await response.json();
      this.update((state) => {
        state.database = db;
        state.lastUpdated = Date.now();
      });
    } catch {
      // Ignore
    }
  }

  async #getDatabase(): Promise<SnapsRegistryDatabase | null> {
    if (this.state.database === null) {
      await this.#updateDatabase();
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
      await this.#updateDatabase();
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
}
