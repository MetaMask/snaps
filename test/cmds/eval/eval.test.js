const pathUtils = require('path');
const EventEmitter = require('events');
const { snapEval } = require('../../../dist/src/cmds/eval');
const workerEvalModule = require('../../../dist/src/cmds/eval/workerEval');
const fsUtils = require('../../../dist/src/utils/validate-fs');

describe('eval', () => {
  describe('snapEval', () => {
    const mockArgv = {
      bundle: 'dist/bundle.js',
    };

    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => undefined);
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      jest.spyOn(process, 'exit').mockImplementation(() => undefined);
      jest.spyOn(fsUtils, 'validateFilePath')
        .mockImplementation(async () => true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
      delete global.snaps;
    });

    it('snapEval successfully executes and logs to console', async () => {
      global.snaps = {
        verboseErrors: false,
      };
      jest.spyOn(workerEvalModule, 'workerEval').mockImplementation(async () => undefined);
      await snapEval(mockArgv);
      expect(global.console.log).toHaveBeenCalledTimes(1);
    });

    it('snapEval handles error when workerEval throws', async () => {
      global.snaps = {
        verboseErrors: false,
      };
      jest.spyOn(workerEvalModule, 'workerEval').mockImplementation(async () => {
        throw new Error();
      });
      process.exit.mockImplementationOnce(() => {
        throw new Error('process exited');
      });
      await expect(async () => {
        await snapEval(mockArgv);
      }).rejects.toThrow('process exited');
      expect(console.log).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(process.exit).toHaveBeenCalledTimes(1);
    });
  });

  describe('workerEval', () => {
    const { workerEval } = workerEvalModule;
    const mockBundlePath = './snap.js';
    let mockWorker;

    beforeEach(() => {
      jest.spyOn(pathUtils, 'join');
      mockWorker = new EventEmitter();
      mockWorker.postMessage = () => undefined;
      jest.spyOn(mockWorker, 'on');
      jest.spyOn(mockWorker, 'postMessage').mockImplementation(() => undefined);
    });

    afterEach(() => {
      jest.restoreAllMocks();
      mockWorker = undefined;
      delete global.snaps;
    });

    it('worker eval handles 0 exit code', async () => {
      const getWorker = jest.fn(() => mockWorker);
      const evalPromise = workerEval(mockBundlePath, getWorker);
      mockWorker.emit('exit', 0);
      const result = await evalPromise;
      expect(result).toBeNull();
      expect(getWorker).toHaveBeenCalledWith(expect.stringMatching(/evalWorker\.js/u));
      expect(mockWorker.on).toHaveBeenCalledTimes(1);
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        pluginFilePath: mockBundlePath,
      });
    });

    it('worker eval handles non-0 exit code', async () => {
      const getWorker = jest.fn(() => mockWorker);
      const exitCode = 1;
      await expect(async () => {
        const evalPromise = workerEval(mockBundlePath, getWorker);
        mockWorker.emit('exit', exitCode);
        await evalPromise;
      }).rejects.toThrow(`Worker exited abnormally! Code: ${exitCode}`);
      expect(getWorker).toHaveBeenCalledWith(expect.stringMatching(/evalWorker\.js/u));
      expect(mockWorker.on).toHaveBeenCalledTimes(1);
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        pluginFilePath: mockBundlePath,
      });
    });
  });
});
