import { SnapsRegistryDatabase } from '@metamask/snaps-registry';
import { SnapId } from '@metamask/snaps-utils';
import { satisfiesVersionRange } from '@metamask/utils';

import {
  SnapRegistry,
  SnapRegistryInfo,
  SnapRegistryRequest,
  SnapRegistryResult,
  SnapRegistryStatus,
} from './registry';

// TODO: Replace with a Codefi URL
const SNAP_REGISTRY_URL =
  'https://cdn.jsdelivr.net/gh/MetaMask/snaps-registry@main/src/registry.json';

export type JsonSnapRegistryArgs = {
  fetchFn?: typeof fetch;
  failOnUnavailableRegistry?: boolean;
};

export class JsonSnapRegistry implements SnapRegistry {
  #db: SnapsRegistryDatabase | null = null;

  #fetchFn: typeof fetch;

  #failOnUnavailableRegistry: boolean;

  constructor({
    fetchFn = globalThis.fetch.bind(globalThis),
    failOnUnavailableRegistry = true,
  }: JsonSnapRegistryArgs) {
    this.#fetchFn = fetchFn;
    this.#failOnUnavailableRegistry = failOnUnavailableRegistry;
  }

  async #getDatabase(): Promise<SnapsRegistryDatabase | null> {
    if (this.#db === null) {
      // TODO: Decide if we should persist this between sessions
      try {
        const response = await this.#fetchFn(SNAP_REGISTRY_URL);
        this.#db = await response.json();
      } catch {
        // Ignore
      }
    }
    return this.#db;
  }

  async #getSingle(snapId: SnapId, snapInfo: SnapRegistryInfo) {
    const db = await this.#getDatabase();

    if (this.#failOnUnavailableRegistry && db === null) {
      throw new Error('Snap Registry is unavailable, installation blocked.');
    }

    const blockedEntry = db?.blockedSnaps.find((blocked) => {
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
        status: SnapRegistryStatus.Blocked,
        reason: blockedEntry.reason,
      };
    }

    const verified = db?.verifiedSnaps[snapId];
    const version = verified?.versions?.[snapInfo.version];
    if (version && version.checksum === snapInfo.checksum) {
      return { status: SnapRegistryStatus.Verified };
    }
    return { status: SnapRegistryStatus.Unverified };
  }

  public async get(
    snaps: SnapRegistryRequest,
  ): Promise<Record<SnapId, SnapRegistryResult>> {
    return Object.entries(snaps).reduce<
      Promise<Record<SnapId, SnapRegistryResult>>
    >(async (previousPromise, [snapId, snapInfo]) => {
      const result = await this.#getSingle(snapId, snapInfo);
      const acc = await previousPromise;
      acc[snapId] = result;
      return acc;
    }, Promise.resolve({}));
  }
}
