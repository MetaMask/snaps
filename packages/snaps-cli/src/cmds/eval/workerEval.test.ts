import EventEmitter from 'events';
import pathUtils from 'path';
import { workerEval } from './workerEval';

interface MockWorkerInterface extends EventEmitter {
  constructorArgs: unknown[];
  postMessage: () => void;
}

let mockWorkerRef: MockWorkerInterface;

jest.mock('worker_threads', () => ({
  Worker: class MockWorker extends EventEmitter implements MockWorkerInterface {
    public constructorArgs: unknown[];

    postMessage: () => void;

    constructor(...args: unknown[]) {
      super();
      if (mockWorkerRef) {
        throw new Error('Mock worker ref already assigned!');
      }

      // eslint-disable-next-line consistent-this
      mockWorkerRef = this;
      this.constructorArgs = args;
      this.on = jest.spyOn(this as any, 'on') as any;
      // eslint-disable-next-line jest/prefer-spy-on
      this.postMessage = jest.fn();
    }
  },
}));

describe('workerEval', () => {
  const mockBundlePath = './snap.js';
  const workerPathRegex = /eval-worker\.js$/u;

  beforeEach(() => {
    jest.spyOn(pathUtils, 'join');
    (mockWorkerRef as any) = undefined;
  });

  afterEach(() => {
    global.snaps = {};
  });

  it('worker eval handles 0 exit code', async () => {
    const evalPromise = workerEval(mockBundlePath);
    mockWorkerRef.emit('exit', 0);
    const result = await evalPromise;

    expect(result).toBeNull();
    expect(mockWorkerRef.constructorArgs).toStrictEqual([
      expect.stringMatching(workerPathRegex),
    ]);
    expect(mockWorkerRef.on).toHaveBeenCalledTimes(1);
    expect(mockWorkerRef.postMessage).toHaveBeenCalledWith({
      pluginFilePath: mockBundlePath,
    });
  });

  it('worker eval handles non-0 exit code', async () => {
    const exitCode = 1;
    await expect(async () => {
      const evalPromise = workerEval(mockBundlePath);
      mockWorkerRef.emit('exit', exitCode);
      await evalPromise;
    }).rejects.toThrow(`Worker exited abnormally! Code: ${exitCode}`);

    expect(mockWorkerRef.constructorArgs).toStrictEqual([
      expect.stringMatching(workerPathRegex),
    ]);
    expect(mockWorkerRef.on).toHaveBeenCalledTimes(1);
    expect(mockWorkerRef.postMessage).toHaveBeenCalledWith({
      pluginFilePath: mockBundlePath,
    });
  });
});
