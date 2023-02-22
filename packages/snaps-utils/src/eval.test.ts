import childProcess from 'child_process';
import { join } from 'path';

import { evalBundle } from './eval';
import { DEFAULT_SNAP_BUNDLE } from './test-utils';

const WORKER_PATH = join(__dirname, 'eval-worker.ts');

// This test takes a long time to run in CI.
jest.setTimeout(30000);

jest.mock('child_process');

describe('evalBundle', () => {
  beforeEach(async () => {
    jest.spyOn(childProcess, 'fork').mockImplementation(() => {
      const actualFork = jest.requireActual('child_process').fork;

      return actualFork(WORKER_PATH, [DEFAULT_SNAP_BUNDLE], {
        execArgv: ['-r', 'ts-node/register'],
        stdio: 'ignore',
      });
    });
  });

  it('successfully executes a snap', async () => {
    expect(await evalBundle(DEFAULT_SNAP_BUNDLE)).toBeNull();
  });

  it('throws on a non-zero exit code', async () => {
    await expect(evalBundle('throw new Error("foo");')).rejects.toThrow(
      'Process exited with non-zero exit code: 255',
    );
  });
});
