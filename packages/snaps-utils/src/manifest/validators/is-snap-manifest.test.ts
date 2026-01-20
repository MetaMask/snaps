import assert from 'assert';

import { isSnapManifest } from './is-snap-manifest';
import { getMockExtendableSnapFiles } from '../../test-utils';
import { VirtualFile } from '../../virtual-file';

describe('isSnapManifest', () => {
  it("does nothing if there's not manifest", async () => {
    const report = jest.fn();

    assert(isSnapManifest.structureCheck);
    await isSnapManifest.structureCheck(
      { localizationFiles: [], auxiliaryFiles: [] },
      { report },
    );

    expect(report).toHaveBeenCalledTimes(0);
  });

  it('does nothing on valid snap.manifest.json', async () => {
    const files = getMockExtendableSnapFiles();
    const report = jest.fn();

    assert(isSnapManifest.structureCheck);
    await isSnapManifest.structureCheck(files, { report });

    expect(report).toHaveBeenCalledTimes(0);
  });

  it('reports on invalid snap.manifest.json', async () => {
    const manifest = new VirtualFile({
      value: 'foo',
      result: 'foo',
      path: './snap.manifest.json',
    });

    const report = jest.fn();

    assert(isSnapManifest.structureCheck);
    await isSnapManifest.structureCheck(
      {
        manifest: {
          mainManifest: manifest,
          mergedManifest: manifest.result,
        },
        localizationFiles: [],
        auxiliaryFiles: [],
      },
      { report },
    );

    expect(report).toHaveBeenCalledWith(
      'is-snap-manifest-object-',
      '"snap.manifest.json" is invalid: Expected a value of type object, but received: "foo".',
    );
  });
});
