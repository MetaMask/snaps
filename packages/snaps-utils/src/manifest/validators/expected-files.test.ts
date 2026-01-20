import assert from 'assert';

import { expectedFiles } from './expected-files';
import { getMockExtendableSnapFiles } from '../../test-utils';
import type { UnvalidatedSnapFiles } from '../../types';

describe('expectedFiles', () => {
  it('does nothing if files exist', async () => {
    const report = jest.fn();
    assert(expectedFiles.structureCheck);
    await expectedFiles.structureCheck(getMockExtendableSnapFiles(), {
      report,
    });

    expect(report).toHaveBeenCalledTimes(0);
  });

  it.each(['manifest', 'packageJson', 'sourceCode'] as const)(
    'reports if %s is missing',
    async (missingFile) => {
      const files: UnvalidatedSnapFiles = getMockExtendableSnapFiles();
      delete files[missingFile];

      const report = jest.fn();
      assert(expectedFiles.structureCheck);
      await expectedFiles.structureCheck(files, { report });

      expect(report).toHaveBeenCalledTimes(1);
      expect(report).toHaveBeenCalledWith(
        `expected-files-${missingFile}`,
        expect.stringContaining('Missing file'),
      );
    },
  );
});
