import type { RootMessenger } from './controller';
import type { SnapsRegistry } from '../snaps';
import { SnapsRegistryStatus } from '../snaps';

export class MockSnapsRegistry implements SnapsRegistry {
  readonly #messenger;

  constructor(messenger: RootMessenger) {
    this.#messenger = messenger;

    this.#messenger.registerActionHandler(
      'SnapsRegistryController:getSnap',
      this.get.bind(this),
    );

    this.#messenger.registerActionHandler(
      'SnapsRegistryController:getSnapMetadata',
      this.getMetadata.bind(this),
    );

    this.#messenger.registerActionHandler(
      'SnapsRegistryController:resolveSnapVersion',
      this.resolveVersion.bind(this),
    );

    this.#messenger.registerActionHandler(
      'SnapsRegistryController:requestUpdate',
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
      'SnapsRegistryController:stateChange',
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
