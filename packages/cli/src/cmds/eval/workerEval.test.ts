import { fork } from 'child_process';
import pathUtils from 'path';
import { workerEval } from './workerEval';

jest.mock('child_process');

describe('workerEval', () => {
  const mockBundlePath = './snap.js';
  const workerPathRegex = /eval-worker\.js$/u;
  const forkMock = fork as jest.MockedFunction<typeof fork>;

  beforeEach(() => {
    jest.spyOn(pathUtils, 'join');
  });

  afterEach(() => {
    global.snaps = {};
  });

  it('worker eval handles 0 exit code', async () => {
    const onFn = jest
      .fn()
      .mockImplementation((_event: string, cb: (exitCode: number) => void) =>
        cb(0),
      );
    forkMock.mockReturnValue({ on: onFn } as any);
    const evalPromise = workerEval(mockBundlePath);
    const result = await evalPromise;

    expect(result).toBeNull();
    expect(forkMock).toHaveBeenCalledWith(
      expect.stringMatching(workerPathRegex),
      [mockBundlePath],
    );
    expect(onFn).toHaveBeenCalledTimes(1);
  });

  it('worker eval handles non-0 exit code', async () => {
    const exitCode = 1;
    const onFn = jest
      .fn()
      .mockImplementation((_event: string, cb: (exitCode: number) => void) =>
        cb(exitCode),
      );
    forkMock.mockReturnValue({ on: onFn } as any);

    await expect(workerEval(mockBundlePath)).rejects.toThrow(
      `Worker exited abnormally! Code: ${exitCode}`,
    );

    expect(forkMock).toHaveBeenCalledWith(
      expect.stringMatching(workerPathRegex),
      [mockBundlePath],
    );
    expect(onFn).toHaveBeenCalledTimes(1);
  });
});
