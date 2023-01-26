import * as snapUtils from '@metamask/snaps-utils';
import { logError, logInfo } from '@metamask/snaps-utils';
import chokidar from 'chokidar';
import EventEmitter from 'events';
import http from 'http';
import path from 'path';

import watch from '.';
import * as build from '../build/bundle';
import * as evalModule from '../eval/evalHandler';
import * as manifest from '../manifest/manifestHandler';

jest.mock('@metamask/snaps-utils', () => ({
  ...jest.requireActual('@metamask/snaps-utils'),
  validateDirPath: jest.fn(),
  validateFilePath: jest.fn(),
  validateOutfileName: jest.fn(),
  getOutfilePath: () => path.normalize('dist/bundle.js'),
  isFile: () => true,
  isDirectory: () => true,
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

type MockWatcher = {
  add: () => void;
} & EventEmitter;

/**
 * Get a mocked chokidar watcher, with Jest spies attached to some of its
 * methods.
 *
 * @returns The mocked watcher.
 */
function getMockWatcher(): MockWatcher {
  const watcher: MockWatcher = new EventEmitter() as any;
  watcher.add = () => undefined;
  jest.spyOn(watcher, 'on');
  jest.spyOn(watcher, 'add');
  return watcher;
}

describe('watch', () => {
  describe('Watch a directory and its subdirectories for changes, and build when files are added or changed.', () => {
    let watcherEmitter: MockWatcher;

    const mockSrc = 'src/index.js';
    const mockDist = 'dist';
    const mockOutfileName = 'bundle.js';

    const getMockArgv = (args: Record<string, unknown> = {}) => {
      return {
        src: mockSrc,
        dist: mockDist,
        outfileName: mockOutfileName,
        ...args,
      } as any;
    };

    beforeEach(() => {
      jest.spyOn(chokidar, 'watch').mockImplementation(() => {
        watcherEmitter = getMockWatcher();
        return watcherEmitter as any;
      });
    });

    it('successfully processes arguments from yargs', async () => {
      const chokidarMock = jest
        .spyOn(chokidar, 'watch')
        .mockImplementation(() => {
          watcherEmitter = getMockWatcher();
          return watcherEmitter as any;
        });
      jest.spyOn(console, 'log').mockImplementation();
      const validateDirPathMock = jest
        .spyOn(snapUtils, 'validateDirPath')
        .mockImplementation(async () => Promise.resolve(true));
      const validateFilePathMock = jest
        .spyOn(snapUtils, 'validateFilePath')
        .mockImplementation(async () => Promise.resolve(true));
      const validateOutfileNameMock = jest
        .spyOn(snapUtils, 'validateOutfileName')
        .mockImplementation(() => true);

      await watch.handler(getMockArgv());
      expect(validateDirPathMock).toHaveBeenCalledWith(mockDist, true);
      expect(validateFilePathMock).toHaveBeenCalledWith(mockSrc);
      expect(validateOutfileNameMock).toHaveBeenCalledWith(mockOutfileName);
      expect(chokidarMock.mock.calls[0][0]).toBe('src/');
    });

    it('successfully processes arguments from yargs: nested src path', async () => {
      const chokidarMock = jest
        .spyOn(chokidar, 'watch')
        .mockImplementation(() => {
          watcherEmitter = getMockWatcher();
          return watcherEmitter as any;
        });
      jest.spyOn(console, 'log').mockImplementation();
      const validateDirPathMock = jest
        .spyOn(snapUtils, 'validateDirPath')
        .mockImplementation(async () => Promise.resolve(true));
      const validateFilePathMock = jest
        .spyOn(snapUtils, 'validateFilePath')
        .mockImplementation(async () => Promise.resolve(true));
      const validateOutfileNameMock = jest
        .spyOn(snapUtils, 'validateOutfileName')
        .mockImplementation(() => true);

      await watch.handler({ ...getMockArgv(), src: 'foo/index.js' });
      expect(validateDirPathMock).toHaveBeenCalledWith(mockDist, true);
      expect(validateFilePathMock).toHaveBeenCalledWith('foo/index.js');
      expect(validateOutfileNameMock).toHaveBeenCalledWith(mockOutfileName);
      expect(chokidarMock.mock.calls[0][0]).toBe('foo/');
    });

    it('successfully handles when an outfileName is not provided', async () => {
      jest.spyOn(console, 'log').mockImplementation();
      jest
        .spyOn(snapUtils, 'validateFilePath')
        .mockImplementation(async () => Promise.resolve(true));
      const mockArgs = getMockArgv();
      delete mockArgs.outfileName;
      await watch.handler(mockArgs);
      expect(logInfo).toHaveBeenCalledTimes(1);
    });

    it('successfully handles when only a filename is provided for src', async () => {
      // the idea here is that the file name should pass the file path validation
      // so that we can reach where the ternary resolves to the first expression
      jest.spyOn(console, 'log').mockImplementation();
      jest
        .spyOn(snapUtils, 'validateFilePath')
        .mockImplementation(async () => Promise.resolve(true));
      const mockArgs = getMockArgv();
      mockArgs.src = 'index.js';
      await watch.handler(mockArgs);
      expect(logInfo).toHaveBeenCalledTimes(1);
    });

    it('successfully serves a snap when the serve flag is provided', async () => {
      jest
        .spyOn(http, 'createServer')
        .mockImplementation(
          () => ({ listen: jest.fn(), on: jest.fn() } as any),
        );
      jest.spyOn(console, 'log').mockImplementation();
      jest
        .spyOn(snapUtils, 'validateFilePath')
        .mockImplementation(async () => Promise.resolve(true));
      const bundleMock = jest.spyOn(build, 'bundle').mockImplementation();

      const argv = getMockArgv({ serve: true });
      await watch.handler(argv);
      const mockPath = path.normalize(`${mockDist}/${mockOutfileName}`);
      const readyPromise = new Promise<void>((resolve, _) => {
        watcherEmitter.on('ready', () => {
          expect(bundleMock).toHaveBeenCalledWith(
            mockSrc,
            mockPath,
            argv,
            undefined,
          );
          resolve();
        });
      });

      watcherEmitter.emit('ready');
      await readyPromise;
      // Wait for other promises to resolve
      await new Promise(process.nextTick);
      expect(logInfo).toHaveBeenCalledWith(`\nStarting server...`);
    });

    it('handles "changed" event correctly', async () => {
      jest.spyOn(console, 'log').mockImplementation();
      const bundleMock = jest.spyOn(build, 'bundle').mockImplementation();
      jest
        .spyOn(snapUtils, 'validateFilePath')
        .mockImplementation(async () => Promise.resolve(true));

      await watch.handler(getMockArgv());
      const mockPath = path.normalize(`${mockDist}/${mockOutfileName}`);
      const finishPromise = new Promise<void>((resolve, _) => {
        watcherEmitter.on('change', () => {
          expect(bundleMock).toHaveBeenCalledWith(
            mockSrc,
            mockPath,
            getMockArgv(),
            undefined,
          );
          resolve();
        });
      });
      watcherEmitter.emit('change');

      await finishPromise;
      expect(logInfo).toHaveBeenCalledTimes(2);
    });

    it('handles "ready" event correctly', async () => {
      jest.spyOn(console, 'log').mockImplementation();
      const bundleMock = jest.spyOn(build, 'bundle').mockImplementation();
      jest
        .spyOn(snapUtils, 'validateFilePath')
        .mockImplementation(async () => Promise.resolve(true));

      await watch.handler(getMockArgv());
      const mockPath = path.normalize(`${mockDist}/${mockOutfileName}`);
      const finishPromise = new Promise<void>((resolve, _) => {
        watcherEmitter.on('ready', () => {
          expect(bundleMock).toHaveBeenCalledWith(
            mockSrc,
            mockPath,
            getMockArgv(),
            undefined,
          );
          resolve();
        });
      });
      watcherEmitter.emit('ready');

      await finishPromise;
      expect(logInfo).toHaveBeenCalledTimes(1);
    });

    it('handles "add" event correctly', async () => {
      jest.spyOn(console, 'log').mockImplementation();
      const bundleMock = jest.spyOn(build, 'bundle').mockImplementation();
      jest
        .spyOn(snapUtils, 'validateFilePath')
        .mockImplementation(async () => Promise.resolve(true));

      await watch.handler(getMockArgv());
      const mockPath = path.normalize(`${mockDist}/${mockOutfileName}`);
      const finishPromise = new Promise<void>((resolve, _) => {
        watcherEmitter.on('add', () => {
          expect(bundleMock).toHaveBeenCalledWith(
            mockSrc,
            mockPath,
            getMockArgv(),
            undefined,
          );
          resolve();
        });
      });
      watcherEmitter.emit('add');

      await finishPromise;
      expect(logInfo).toHaveBeenCalledTimes(2);
    });

    it('calls the manifest handler if commanded', async () => {
      jest.spyOn(console, 'log').mockImplementation();
      const bundleMock = jest.spyOn(build, 'bundle').mockImplementation();

      let resolveEvalPromise: (value?: unknown) => void;

      // The manifest and eval handlers are called
      const deferredEvalPromise = new Promise(
        (resolve) => (resolveEvalPromise = resolve),
      );
      const manifestMock = jest
        .spyOn(manifest, 'manifestHandler')
        .mockImplementation();
      const evalMock = jest
        .spyOn(evalModule, 'evalHandler')
        .mockImplementation((() => {
          resolveEvalPromise();
        }) as any);
      jest
        .spyOn(snapUtils, 'validateFilePath')
        .mockImplementation(async () => Promise.resolve(true));

      await watch.handler(getMockArgv({ eval: true, manifest: true }));
      const mockPath = path.normalize(`${mockDist}/${mockOutfileName}`);
      watcherEmitter.emit('add');

      await deferredEvalPromise;
      expect(bundleMock).toHaveBeenCalledTimes(1);
      expect(bundleMock).toHaveBeenCalledWith(
        mockSrc,
        mockPath,
        getMockArgv({ eval: true, manifest: true }),
        undefined,
      );
      expect(manifestMock).toHaveBeenCalledTimes(1);
      expect(manifestMock).toHaveBeenCalledWith(
        expect.objectContaining(getMockArgv({ eval: true, manifest: true })),
      );
      expect(evalMock).toHaveBeenCalledTimes(1);
      expect(evalMock).toHaveBeenCalledWith(
        expect.objectContaining(
          getMockArgv({
            eval: true,
            manifest: true,
            bundle: path.normalize('dist/bundle.js'),
          }),
        ),
      );
      expect(logInfo).toHaveBeenCalledTimes(2);
    });

    it('handles "unlink" event correctly', async () => {
      jest.spyOn(console, 'log').mockImplementation();
      const bundleMock = jest.spyOn(build, 'bundle').mockImplementation();
      jest
        .spyOn(snapUtils, 'validateFilePath')
        .mockImplementation(async () => Promise.resolve(true));

      await watch.handler(getMockArgv());
      const finishPromise = new Promise<void>((resolve, _) => {
        watcherEmitter.on('unlink', () => {
          expect(bundleMock).not.toHaveBeenCalled();
          resolve();
        });
      });
      watcherEmitter.emit('unlink');

      await finishPromise;
      expect(logInfo).toHaveBeenCalledTimes(2);
    });

    it('handles "error" event correctly', async () => {
      const mockError = new Error('error message');
      mockError.message = 'this is a message';
      jest.spyOn(console, 'log').mockImplementation();
      const bundleMock = jest.spyOn(build, 'bundle').mockImplementation();
      jest
        .spyOn(snapUtils, 'validateFilePath')
        .mockImplementation(async () => Promise.resolve(true));

      await watch.handler(getMockArgv());
      const finishPromise = new Promise<void>((resolve, _) => {
        watcherEmitter.on('error', () => {
          expect(bundleMock).not.toHaveBeenCalled();
          expect(logError).toHaveBeenCalled();
          resolve();
        });
      });
      watcherEmitter.emit('error', mockError);

      await finishPromise;
      expect(logInfo).toHaveBeenCalledTimes(1);
    });

    it('handles errors thrown during rebuilding', async () => {
      jest.spyOn(console, 'log').mockImplementation();
      const bundleMock = jest.spyOn(build, 'bundle').mockImplementation(() => {
        throw new Error('build failure');
      });
      jest
        .spyOn(snapUtils, 'validateFilePath')
        .mockImplementation(async () => Promise.resolve(true));

      await watch.handler(getMockArgv());
      const finishPromise = new Promise<void>((resolve, _) => {
        watcherEmitter.on('add', () => {
          expect(bundleMock).toHaveBeenCalledTimes(1);
          expect(logError).toHaveBeenCalledTimes(1);
          expect(logError).toHaveBeenCalledWith(
            'Error while processing "foo/bar.js".',
            expect.objectContaining({ message: 'build failure' }),
          );
          resolve();
        });
      });
      watcherEmitter.emit('add', 'foo/bar.js');

      await finishPromise;
      expect(logInfo).toHaveBeenCalledTimes(2);
    });

    it('logs the proper message for errors during initial build', async () => {
      jest.spyOn(console, 'log').mockImplementation();
      const bundleMock = jest.spyOn(build, 'bundle').mockImplementation(() => {
        throw new Error('build failure');
      });
      jest
        .spyOn(snapUtils, 'validateFilePath')
        .mockImplementation(async () => Promise.resolve(true));
      await watch.handler(getMockArgv());
      const finishPromise = new Promise<void>((resolve, _) => {
        watcherEmitter.on('ready', () => {
          expect(bundleMock).toHaveBeenCalledTimes(1);
          expect(logError).toHaveBeenCalledTimes(1);
          expect(logError).toHaveBeenCalledWith(
            'Error during initial build.',
            expect.objectContaining({ message: 'build failure' }),
          );
          resolve();
        });
      });
      watcherEmitter.emit('ready');
      await finishPromise;
      expect(logInfo).toHaveBeenCalledTimes(1);
    });
  });
});
