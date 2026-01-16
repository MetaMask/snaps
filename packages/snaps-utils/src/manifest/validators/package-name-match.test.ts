import assert from 'assert';

import { packageNameMatch } from './package-name-match';
import { deepClone } from '../../deep-clone';
import { getMockExtendableSnapFiles, getSnapManifest } from '../../test-utils';

describe('packageNameMatch', () => {
  it('does nothing if name matches', async () => {
    const files = getMockExtendableSnapFiles();

    const report = jest.fn();

    assert(packageNameMatch.semanticCheck);
    await packageNameMatch.semanticCheck(files, { report });

    expect(report).toHaveBeenCalledTimes(0);
  });

  it('reports if name mismatches', async () => {
    const manifest = getSnapManifest({ packageName: 'foobar' });
    const files = getMockExtendableSnapFiles({ manifest });

    const report = jest.fn();

    assert(packageNameMatch.semanticCheck);
    await packageNameMatch.semanticCheck(files, { report });

    expect(report).toHaveBeenCalledWith(
      'package-name-match',
      '"snap.manifest.json" npm package name ("foobar") does not match the "package.json" "name" field ("@metamask/example-snap").',
      expect.any(Function),
    );

    const { manifest: newManifest } = await report.mock.calls[0][2]({
      manifest: deepClone(files.manifest),
    });
    expect(manifest.source.location.npm.packageName).toBe('foobar');
    expect(
      newManifest.baseManifest.result.source.location.npm.packageName,
    ).toBe('@metamask/example-snap');
  });
});
