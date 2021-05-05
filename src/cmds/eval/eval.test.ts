import pathUtils from 'path';
import EventEmitter from 'events';
import * as fsUtils from '../../utils/validate-fs';
import * as workerEvalModule from './workerEval';
import { snapEval } from '.';

interface MockWorker extends EventEmitter {
  postMessage: () => void;
}

function getMockWorker(): MockWorker {
  const worker: MockWorker = new EventEmitter() as any;
  worker.postMessage = () => undefined;
  jest.spyOn(worker, 'on');
  jest.spyOn(worker, 'postMessage');
  return worker;
}

describe('eval', () => {
  describe('snapEval', () => {
    const mockArgv = {
      bundle: 'dist/bundle.js',
    };

    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => undefined);
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      jest
        .spyOn(fsUtils, 'validateFilePath')
        .mockImplementation(async () => true);
    });

    afterEach(() => {
      global.snaps = {};
    });

    it('snapEval successfully executes and logs to console', async () => {
      global.snaps = {
        verboseErrors: false,
      };
      jest
        .spyOn(workerEvalModule, 'workerEval')
        .mockImplementation(async () => null);

      await snapEval(mockArgv as any);
      expect(global.console.log).toHaveBeenCalledTimes(1);
    });

    it('snapEval handles error when workerEval throws', async () => {
      global.snaps = {
        verboseErrors: false,
      };
      jest
        .spyOn(workerEvalModule, 'workerEval')
        .mockImplementation(async () => {
          throw new Error();
        });
      (process.exit as any).mockImplementationOnce(() => {
        throw new Error('process exited');
      });
      await expect(async () => {
        await snapEval(mockArgv as any);
      }).rejects.toThrow('process exited');

      expect(console.log).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(process.exit).toHaveBeenCalledTimes(1);
    });
  });

  describe('workerEval', () => {
    const { workerEval } = workerEvalModule;
    const mockBundlePath = './snap.js';
    let mockWorker: MockWorker;

    beforeEach(() => {
      jest.spyOn(pathUtils, 'join');
      mockWorker = getMockWorker();
    });

    afterEach(() => {
      global.snaps = {};
    });

    it('worker eval handles 0 exit code', async () => {
      const getWorker = jest.fn(() => mockWorker);
      const evalPromise = workerEval(mockBundlePath, getWorker as any);
      mockWorker.emit('exit', 0);
      const result = await evalPromise;

      expect(result).toBeNull();
      expect(getWorker).toHaveBeenCalledWith(
        expect.stringMatching(/evalWorker\.js/u),
      );
      expect(mockWorker.on).toHaveBeenCalledTimes(1);
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        pluginFilePath: mockBundlePath,
      });
    });

    it('worker eval handles non-0 exit code', async () => {
      const getWorker = jest.fn(() => mockWorker);
      const exitCode = 1;
      await expect(async () => {
        const evalPromise = workerEval(mockBundlePath, getWorker as any);
        mockWorker.emit('exit', exitCode);
        await evalPromise;
      }).rejects.toThrow(`Worker exited abnormally! Code: ${exitCode}`);

      expect(getWorker).toHaveBeenCalledWith(
        expect.stringMatching(/evalWorker\.js/u),
      );
      expect(mockWorker.on).toHaveBeenCalledTimes(1);
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        pluginFilePath: mockBundlePath,
      });
    });
  });
});
