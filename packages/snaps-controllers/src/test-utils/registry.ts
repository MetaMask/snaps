import type { SnapsRegistry } from '../snaps';
import { SnapsRegistryStatus } from '../snaps';

export class MockSnapsRegistry implements SnapsRegistry {
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

  resolveVersion = jest.fn().mockImplementation((snapId, versionRange) => {
    throw new Error(
      `Cannot install version "${versionRange}" of snap "${snapId}": The snap is not on the allow list.`,
    );
  });

  getMetadata = jest.fn().mockResolvedValue(null);

  update = jest.fn();
}
