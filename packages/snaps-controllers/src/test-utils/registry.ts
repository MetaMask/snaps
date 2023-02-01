import { SnapsRegistry, SnapsRegistryStatus } from '../snaps';

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

  getMetadata = jest.fn().mockResolvedValue(null);
}
