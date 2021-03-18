const EventEmitter = require('events');
const chokidar = require('chokidar');
const watch = require('../../../dist/src/cmds/watch');
const build = require('../../../dist/src/cmds/build/bundle');
const fsUtils = require('../../../dist/src/utils/validate-fs');
const miscUtils = require('../../../dist/src/utils/misc');

describe('watch', () => {
  describe('Watch a directory and its subdirectories for changes, and build when files are added or changed.', () => {
    let watcherEmitter;

    const mockSrc = 'index.js';
    const mockDist = 'dist';
    const mockOutfileName = 'bundle.js';

    const getMockArgv = () => {
      return {
        src: mockSrc,
        dist: mockDist,
        outfileName: mockOutfileName,
      };
    };

    beforeEach(() => {
      jest.spyOn(chokidar, 'watch').mockImplementation(() => {
        watcherEmitter = new EventEmitter();
        watcherEmitter.add = () => undefined;
        jest.spyOn(watcherEmitter, 'on');
        jest.spyOn(watcherEmitter, 'add');
        return watcherEmitter;
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
      watcherEmitter = undefined;
    });

    it('successfully processes arguments from yargs', async () => {
      const chokidarMock = jest
        .spyOn(chokidar, 'watch')
        .mockImplementation(() => {
          watcherEmitter = new EventEmitter();
          watcherEmitter.add = () => undefined;
          jest.spyOn(watcherEmitter, 'on');
          jest.spyOn(watcherEmitter, 'add');
          return watcherEmitter;
        });
      jest.spyOn(console, 'log').mockImplementation();
      const validateDirPathMock = jest
        .spyOn(fsUtils, 'validateDirPath')
        .mockImplementation(() => true);
      const validateFilePathMock = jest
        .spyOn(fsUtils, 'validateFilePath')
        .mockImplementation(() => true);
      const validateOutfileNameMock = jest
        .spyOn(fsUtils, 'validateOutfileName')
        .mockImplementation(() => true);
      jest
        .spyOn(fsUtils, 'getOutfilePath')
        .mockImplementation(() => 'dist/bundle.js');
      await watch.handler(getMockArgv());
      expect(validateDirPathMock).toHaveBeenCalledWith(mockDist, true);
      expect(validateFilePathMock).toHaveBeenCalledWith(mockSrc);
      expect(validateOutfileNameMock).toHaveBeenCalledWith(mockOutfileName);
      expect(chokidarMock.mock.calls[0][0]).toBe('.');
    });

    it('watcher handles "changed" event correctly', async () => {
      jest.spyOn(console, 'log').mockImplementation();
      const bundleMock = jest.spyOn(build, 'bundle').mockImplementation();
      jest.spyOn(fsUtils, 'validateFilePath').mockImplementation(() => true);

      await watch.handler(getMockArgv());
      const finishPromise = new Promise((resolve, _) => {
        watcherEmitter.on('change', () => {
          expect(bundleMock).toHaveBeenCalledWith(
            mockSrc,
            `${mockDist}/${mockOutfileName}`,
            getMockArgv(),
          );
          resolve();
        });
      });
      watcherEmitter.emit('change');
      await finishPromise;
      expect(global.console.log).toHaveBeenCalledTimes(2);
    });

    it('watcher handles "ready" event correctly', async () => {
      jest.spyOn(console, 'log').mockImplementation();
      const bundleMock = jest.spyOn(build, 'bundle').mockImplementation();
      jest.spyOn(fsUtils, 'validateFilePath').mockImplementation(() => true);

      await watch.handler(getMockArgv());
      const finishPromise = new Promise((resolve, _) => {
        watcherEmitter.on('ready', () => {
          expect(bundleMock).toHaveBeenCalledWith(
            mockSrc,
            `${mockDist}/${mockOutfileName}`,
            getMockArgv(),
          );
          resolve();
        });
      });
      watcherEmitter.emit('ready');
      await finishPromise;
      expect(global.console.log).toHaveBeenCalledTimes(1);
    });

    it('watcher handles "add" event correctly', async () => {
      jest.spyOn(console, 'log').mockImplementation();
      const bundleMock = jest.spyOn(build, 'bundle').mockImplementation();
      jest.spyOn(fsUtils, 'validateFilePath').mockImplementation(() => true);

      await watch.handler(getMockArgv());
      const finishPromise = new Promise((resolve, _) => {
        watcherEmitter.on('add', () => {
          expect(bundleMock).toHaveBeenCalledWith(
            mockSrc,
            `${mockDist}/${mockOutfileName}`,
            getMockArgv(),
          );
          resolve();
        });
      });
      watcherEmitter.emit('add');
      await finishPromise;
      expect(global.console.log).toHaveBeenCalledTimes(2);
    });

    it('watcher handles "unlink" event correctly', async () => {
      jest.spyOn(console, 'log').mockImplementation();
      const bundleMock = jest.spyOn(build, 'bundle').mockImplementation();
      jest.spyOn(fsUtils, 'validateFilePath').mockImplementation(() => true);

      await watch.handler(getMockArgv());
      const finishPromise = new Promise((resolve, _) => {
        watcherEmitter.on('unlink', () => {
          expect(bundleMock).not.toHaveBeenCalled();
          resolve();
        });
      });
      watcherEmitter.emit('unlink');
      await finishPromise;
      expect(global.console.log).toHaveBeenCalledTimes(2);
    });

    it('watcher handles "error" event correctly', async () => {
      const mockError = new Error('error message');
      mockError.message = 'this is a message';
      jest.spyOn(console, 'log').mockImplementation();
      const logErrorMock = jest
        .spyOn(miscUtils, 'logError')
        .mockImplementation();
      const bundleMock = jest.spyOn(build, 'bundle').mockImplementation();
      jest.spyOn(fsUtils, 'validateFilePath').mockImplementation(() => true);

      await watch.handler(getMockArgv());
      const finishPromise = new Promise((resolve, _) => {
        watcherEmitter.on('error', () => {
          expect(bundleMock).not.toHaveBeenCalled();
          expect(logErrorMock).toHaveBeenCalled();
          resolve();
        });
      });
      watcherEmitter.emit('error', mockError);
      await finishPromise;
      expect(global.console.log).toHaveBeenCalledTimes(1);
    });
  });
});
