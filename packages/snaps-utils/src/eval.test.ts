import childProcess from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';

import { evalBundle, SnapEvalError } from './eval';

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
    await fs.writeFile(BUNDLE_PATH, `console.log('Hello, world!');`);

    jest.spyOn(childProcess, 'fork').mockImplementation(() => {
      const actualFork = jest.requireActual('child_process').fork;

      return actualFork(WORKER_PATH, [BUNDLE_PATH], {
        execArgv: ['-r', 'ts-node/register'],
        stdio: 'pipe',
      });
    });
  });

  afterAll(async () => {
    await fs.rm(TEMPORARY_FOLDER, { recursive: true });
  });

  it('successfully executes a snap and captures the stdout', async () => {
    expect(await evalBundle(BUNDLE_PATH)).toStrictEqual({
      stdout: 'Hello, world!\n',
      stderr: '',
    });
  });

  it('throws on a non-zero exit code', async () => {
    await fs.writeFile(BUNDLE_PATH, 'throw new Error("foo");');

    const error: SnapEvalError = await evalBundle(BUNDLE_PATH).catch(
      (caughtError) => caughtError,
    );

    expect(error.message).toMatch(
      /Process exited with non-zero exit code: \d+\./u,
    );
    expect(error).toBeInstanceOf(SnapEvalError);
  });

  it('throws if the bundle does not exist', async () => {
    await expect(evalBundle('foo')).rejects.toThrow(
      "Invalid params: 'foo' is not a file or does not exist.",
    );
  });
});
