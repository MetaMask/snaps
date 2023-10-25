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

  resolveVersion = jest.fn().mockImplementation(() => {
    throw new Error('The snap is not on the allowlist.');
  });

  getMetadata = jest.fn().mockResolvedValue(null);

  update = jest.fn();
}
