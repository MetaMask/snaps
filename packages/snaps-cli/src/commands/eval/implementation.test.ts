import * as utils from '@metamask/snaps-utils';
import { SnapEvalError } from '@metamask/snaps-utils';
import { DEFAULT_SNAP_BUNDLE } from '@metamask/snaps-utils/test-utils';
import normalFs from 'fs';
import { dirname, join } from 'path';

import { evaluate } from './implementation';

const { promises: fs } = normalFs;

jest.mock('fs');

jest.mock('@metamask/snaps-utils', () => ({
  ...jest.requireActual('@metamask/snaps-utils'),
  evalBundle: jest
    .fn()
    .mockImplementation(jest.requireActual('@metamask/snaps-utils').evalBundle),
}));

describe('evaluate', () => {
  const BUNDLE_PATH = join(__dirname, '__test__', 'webpack', 'good', 'eval.js');

  beforeAll(async () => {
    // `snaps-utils` uses the fake `fs` module, so we need to create the
    // directory and file.
    await fs.mkdir(dirname(BUNDLE_PATH), { recursive: true });
    await fs.writeFile(BUNDLE_PATH, DEFAULT_SNAP_BUNDLE);
  });

  it('evaluates the bundle', async () => {
    // Since the eval runs in a separate process, we can't mock the file system
    // and need to use an actual file.
    const output = await evaluate(BUNDLE_PATH);

    expect(output.stdout).toBe('');
    expect(output.stderr).toBe('');
  });

  it('rejects if the bundle has an error', async () => {
    jest.spyOn(utils, 'evalBundle').mockImplementation(() => {
      throw new SnapEvalError('Eval error.', {
        stdout: 'foo',
        stderr: 'Error from SES.',
      });
    });

    await expect(evaluate(BUNDLE_PATH)).rejects.toThrow(
      'Failed to evaluate snap bundle in SES. This is likely due to an incompatibility with the SES environment in your snap.',
    );
  });

  it('rejects if the bundle has an unknown error', async () => {
    const error = new Error('Unknown error.');
    jest.spyOn(utils, 'evalBundle').mockImplementation(() => {
      throw error;
    });

    await expect(evaluate(BUNDLE_PATH)).rejects.toThrow(error);
  });
});
