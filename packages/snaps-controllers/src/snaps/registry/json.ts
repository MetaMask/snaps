import {
  satisfiesVersionRange,
  SemVerRange,
  SemVerVersion,
  SnapId,
  SnapRegistry,
  SnapRegistryBlockReason,
  SnapRegistryInfo,
  SnapRegistryRequest,
  SnapRegistryResult,
  SnapRegistryStatus,
} from '@metamask/snaps-utils';

// TODO: Replace with a Codefi URL
const SNAP_REGISTRY_URL =
  'https://cdn.jsdelivr.net/gh/MetaMask/snaps-registry@main/src/registry.json';

export type JsonSnapRegistryVerifiedEntry = {
  id: SnapId;
  versions: Record<SemVerVersion, JsonSnapRegistryVersion>;
};

export type JsonSnapRegistryVersion = {
  checksum: string;
};

export type JsonSnapRegistryBlockedEntry = {
  reason?: SnapRegistryBlockReason;
} & ({ id: SnapId; versionRange: SemVerRange } | { checksum: string });

export type JsonSnapRegistryDatabase = {
  verifiedSnaps: Record<SnapId, JsonSnapRegistryVerifiedEntry>;
  blockedSnaps: JsonSnapRegistryBlockedEntry[];
};

export class JsonSnapRegistry implements SnapRegistry {
  #db: JsonSnapRegistryDatabase | null = null;

  #fetchFn: typeof fetch;

  constructor(fetchFn: typeof fetch = globalThis.fetch.bind(globalThis)) {
    this.#fetchFn = fetchFn;
  }

  async #getDatabase(): Promise<JsonSnapRegistryDatabase> {
    if (this.#db === null) {
      // TODO: Decide if we should persist this between sessions
      // TODO: Decide what happens if this fails
      const response = await this.#fetchFn(SNAP_REGISTRY_URL);
      this.#db = await response.json();
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.#db!;
  }

  async #getSingle(snapId: SnapId, snapInfo: SnapRegistryInfo) {
    const db = await this.#getDatabase();

    const blockedEntry = db.blockedSnaps.find((blocked) => {
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

    const verified = db.verifiedSnaps[snapId];
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
