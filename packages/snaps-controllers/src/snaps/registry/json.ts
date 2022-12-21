import { SemVerVersion, SnapId } from '@metamask/snaps-utils';

import {
  SnapRegistry,
  SnapRegistryInfo,
  SnapRegistryRequest,
  SnapRegistryResult,
  SnapRegistryStatus,
} from './registry';

// TODO
const SNAP_REGISTRY_URL = 'foo.json';

const SNAP_NOT_FOUND = { status: SnapRegistryStatus.Unverified };

export type JsonSnapRegistryEntry = {
  id: SnapId;
  versions: Record<SemVerVersion, JsonSnapRegistryVersion>;
};

export type JsonSnapRegistryVersion = {
  checksum: string;
  status: SnapRegistryStatus;
};

export type JsonSnapRegistryDatabase = Record<SnapId, JsonSnapRegistryEntry>;

export class JsonSnapRegistry implements SnapRegistry {
  #db: JsonSnapRegistryDatabase | null = null;

  #fetchFn: typeof fetch;

  constructor(fetchFn?: typeof fetch) {
    this.#fetchFn = fetchFn ?? globalThis.fetch.bind(globalThis);
  }

  async #getDatabase(): Promise<JsonSnapRegistryDatabase> {
    if (this.#db === null) {
      // TODO: Decide what happens if this fails
      this.#db = await this.#fetchFn(SNAP_REGISTRY_URL).then(async (result) =>
        result.json(),
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.#db!;
  }

  async #getSingle(snapId: SnapId, snapInfo: SnapRegistryInfo) {
    const db = await this.#getDatabase();
    const result = db?.[snapId];
    const version = result?.versions?.[snapInfo.version];
    if (!version) {
      return SNAP_NOT_FOUND;
    } else if (version.checksum !== snapInfo.shasum) {
      // TODO: Decide what this should return
      return SNAP_NOT_FOUND;
    }

    return { status: version.status };
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
