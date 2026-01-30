import type { MockControllerMessenger } from '@metamask/snaps-utils/test-utils';

import type { SnapsRegistry } from '../snaps';
import { SnapsRegistryStatus } from '../snaps';

export class MockSnapsRegistry implements SnapsRegistry {
  readonly #messenger;

  constructor(messenger: MockControllerMessenger<any, any>) {
    this.#messenger = messenger;

    this.#messenger.registerActionHandler(
      'SnapsRegistry:get',
      this.get.bind(this),
    );

    this.#messenger.registerActionHandler(
      'SnapsRegistry:getMetadata',
      this.getMetadata.bind(this),
    );

    this.#messenger.registerActionHandler(
      'SnapsRegistry:resolveVersion',
      this.resolveVersion.bind(this),
    );

    this.#messenger.registerActionHandler(
      'SnapsRegistry:update',
      this.update.bind(this),
    );
  }

  get = jest.fn().mockImplementation(async (snaps) => {
    return Promise.resolve(
      Object.keys(snaps).reduce(
        (acc, snapId) => ({
          ...acc,
          [snapId]: { status: SnapsRegistryStatus.Unverified },
        }),
        {},
      ),
    );
  });

  resolveVersion = jest.fn().mockImplementation(() => {
    throw new Error('The snap is not on the allowlist.');
  });

  getMetadata = jest.fn().mockReturnValue(null);

  update = jest.fn().mockImplementation(() => {
    this.#messenger.publish(
      'SnapsRegistry:stateChange',
      {
        database: { verifiedSnaps: {}, blockedSnaps: [] },
        lastUpdated: Date.now(),
        signature: null,
        databaseUnavailable: false,
      },
      [],
    );
  });
}
