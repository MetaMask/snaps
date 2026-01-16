import assert from 'assert';

import { repositoryMatch } from './repository-match';
import { deepClone } from '../../deep-clone';
import { getMockExtendableSnapFiles, getSnapManifest } from '../../test-utils';

describe('repositoryMatch', () => {
  it('does nothing if repositories match', async () => {
    const files = getMockExtendableSnapFiles();

    const report = jest.fn();

    assert(repositoryMatch.semanticCheck);
    await repositoryMatch.semanticCheck(files, { report });

    expect(report).toHaveBeenCalledTimes(0);
  });

  it('reports if manifest is missing repository', async () => {
    const manifest = getSnapManifest();
    delete manifest.repository;
    const files = getMockExtendableSnapFiles({ manifest });

    const report = jest.fn();

    assert(repositoryMatch.semanticCheck);
    await repositoryMatch.semanticCheck(files, { report });

    expect(report).toHaveBeenLastCalledWith(
      'repository-match',
      '"snap.manifest.json" "repository" field does not match the "package.json" "repository" field.',
      expect.any(Function),
    );

    const { manifest: newManifest } = await report.mock.calls[0][2]({
      manifest: deepClone(files.manifest),
    });
    expect(manifest.repository).toBeUndefined();
    expect(newManifest.baseManifest.result.repository).toStrictEqual({
      type: 'git',
      url: 'https://github.com/MetaMask/example-snap.git',
    });
  });
});
