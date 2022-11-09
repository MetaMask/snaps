import { join } from 'path';
import { promises as fs } from 'fs';
import childProcess from 'child_process';
import { DEFAULT_SNAP_BUNDLE } from './test-utils';
import { evalBundle } from './eval';

const WORKER_PATH = join(__dirname, 'eval-worker.ts');
const TEMPORARY_FOLDER = join(__dirname, '__test__/temporary');
const BUNDLE_PATH = join(TEMPORARY_FOLDER, 'bundle.js');

// This test takes a long time to run in CI.
jest.setTimeout(30000);

jest.mock('child_process');

describe('evalBundle', () => {
  beforeEach(async () => {
    // Since the eval is run in a separate process, Jest cannot mock the file
    // system. Therefore, we need to create a temporary folder to store the
    // bundle.
    await fs.mkdir(TEMPORARY_FOLDER, { recursive: true });
    await fs.writeFile(BUNDLE_PATH, DEFAULT_SNAP_BUNDLE);

    jest.spyOn(childProcess, 'fork').mockImplementation(() => {
      const actualFork = jest.requireActual('child_process').fork;

      return actualFork(WORKER_PATH, [BUNDLE_PATH], {
        execArgv: ['-r', 'ts-node/register'],
        stdio: 'ignore',
      });
    });
  });

  afterAll(async () => {
    await fs.rm(TEMPORARY_FOLDER, { recursive: true });
  });

  it('successfully executes a snap', async () => {
    expect(await evalBundle(BUNDLE_PATH)).toBeNull();
  });

  it('throws on a non-zero exit code', async () => {
    await fs.writeFile(BUNDLE_PATH, 'throw new Error("foo");');

    await expect(evalBundle(BUNDLE_PATH)).rejects.toThrow(
      'Process exited with non-zero exit code: 255',
    );
  });

  it('throws if the bundle does not exist', async () => {
    await expect(evalBundle('foo')).rejects.toThrow(
      "Invalid params: 'foo' is not a file or does not exist.",
    );
  });
});
