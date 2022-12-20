import { SnapId } from '@metamask/snaps-utils';

import {
  SnapRegistry,
  SnapRegistryRequest,
  SnapRegistryResult,
} from './registry';

// TODO
export const SNAP_REGISTRY_URL = 'foo.json';

export class JsonSnapRegistry implements SnapRegistry {
  #db = null;

  async #getDatabase() {
    if (this.#db === null) {
      this.#db = await fetch(SNAP_REGISTRY_URL).then(async (result) =>
        result.json(),
      );
    }
    return this.#db;
  }

  public async get(
    _snaps: SnapRegistryRequest,
  ): Promise<Record<SnapId, SnapRegistryResult>> {
    // const _db = await this.#getDatabase();
    throw new Error('Not implemented');
  }
}
