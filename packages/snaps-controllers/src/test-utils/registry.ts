import type { RootMessenger } from './controller';
import { SnapRegistryStatus } from '../snaps';

export class MockSnapsRegistry {
  readonly #messenger;

  constructor(messenger: RootMessenger) {
    this.#messenger = messenger;

    this.#messenger.registerActionHandler(
      'SnapRegistryController:get',
      this.get.bind(this),
    );

    this.#messenger.registerActionHandler(
      'SnapRegistryController:getMetadata',
      this.getMetadata.bind(this),
    );

    this.#messenger.registerActionHandler(
      'SnapRegistryController:resolveVersion',
      this.resolveVersion.bind(this),
    );

    this.#messenger.registerActionHandler(
      'SnapRegistryController:requestUpdate',
      this.update.bind(this),
    );
  }

  get = jest.fn().mockImplementation(async (snaps) => {
    return Promise.resolve(
      Object.keys(snaps).reduce(
        (acc, snapId) => ({
          ...acc,
          [snapId]: { status: SnapRegistryStatus.Unverified },
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
      'SnapRegistryController:stateChange',
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
