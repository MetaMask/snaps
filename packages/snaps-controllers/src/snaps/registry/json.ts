import { SnapsRegistryDatabase } from '@metamask/snaps-registry';
import { SnapId } from '@metamask/snaps-utils';
import { satisfiesVersionRange } from '@metamask/utils';

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
  fetchFunction?: typeof fetch;
  url?: string;
  failOnUnavailableRegistry?: boolean;
};

export class JsonSnapsRegistry implements SnapsRegistry {
  #url: string;

  #database: SnapsRegistryDatabase | null = null;

  #fetchFunction: typeof fetch;

  #failOnUnavailableRegistry: boolean;

  constructor({
    url = SNAP_REGISTRY_URL,
    fetchFunction = globalThis.fetch.bind(globalThis),
    failOnUnavailableRegistry = true,
  }: JsonSnapsRegistryArgs = {}) {
    this.#url = url;
    this.#fetchFunction = fetchFunction;
    this.#failOnUnavailableRegistry = failOnUnavailableRegistry;
  }

  async #getDatabase(): Promise<SnapsRegistryDatabase | null> {
    if (this.#database === null) {
      // TODO: Decide if we should persist this between sessions
      try {
        const response = await this.#fetchFunction(this.#url);
        if (!response.ok) {
          throw new Error('Failed to fetch Snaps registry.');
        }
        this.#database = await response.json();
      } catch {
        // Ignore
      }
    }
    // If the database is still null and we require it, throw.
    if (this.#failOnUnavailableRegistry && this.#database === null) {
      throw new Error('Snaps registry is unavailable, installation blocked.');
    }
    return this.#database;
  }

  async #getSingle(snapId: SnapId, snapInfo: SnapsRegistryInfo) {
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
    return { status: SnapsRegistryStatus.Unverified };
  }

  public async get(
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
  public async getMetadata(
    snapId: SnapId,
  ): Promise<SnapsRegistryMetadata | null> {
    const database = await this.#getDatabase();
    return database?.verifiedSnaps[snapId]?.metadata ?? null;
  }
}
