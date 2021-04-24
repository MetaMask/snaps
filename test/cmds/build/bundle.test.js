const mockBrowserify = require('browserify');
const {
  bundle,
  canCloseStream,
} = require('../../../dist/src/cmds/build/bundle');
const bundleUtils = require('../../../dist/src/cmds/build/bundleUtils');
const miscUtils = require('../../../dist/src/utils/misc');

jest.mock('browserify');

describe('bundle', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  global.snaps = {
    verboseErrors: false,
    isWatching: false,
  };

  describe('bundle', () => {
    it('processes yargs properties correctly', async () => {
      const mockArgv = {
        sourceMaps: true,
      };
      const checkBrowserify = mockBrowserify.mockImplementation((_, __) => ({
        bundle: () => {
          return Promise.resolve(true);
        },
      }));
      const createStreamMock = jest
        .spyOn(bundleUtils, 'createBundleStream')
        .mockImplementation();

      bundle('src', 'dest', mockArgv);
      expect(createStreamMock).toHaveBeenCalled();
      expect(checkBrowserify).toHaveBeenCalledWith('src', { debug: true });
    });
  });

  describe('canCloseStream', () => {
    it('writes to console error if there is a bundle Error', async () => {
      const writeErrorMock = jest
        .spyOn(miscUtils, 'writeError')
        .mockImplementation(() => {
          throw new Error('error message');
        });
      await expect(canCloseStream({ bundleError: true })).rejects.toThrow(
        'error message',
      );
      expect(writeErrorMock).toHaveBeenCalledTimes(1);
    });

    it('console logs if successfully closed bundle stream', async () => {
      const closeStreamMock = jest
        .spyOn(bundleUtils, 'closeBundleStream')
        .mockImplementation();
      jest.spyOn(miscUtils, 'writeError').mockImplementation();
      const logMock = jest.spyOn(console, 'log').mockImplementation();

      await canCloseStream({
        bundleError: false,
        bundleStream: {},
        bundleBuffer: 'foo',
        src: 'src',
        dest: 'dest',
        argv: { stripComments: false },
      });
      expect(closeStreamMock).toHaveBeenCalled();
      expect(logMock).toHaveBeenCalled();
    });

    it('catches error if failed to close bundle stream', async () => {
      const closeStreamMock = jest
        .spyOn(bundleUtils, 'closeBundleStream')
        .mockImplementation(() => {
          throw new Error('bundle failed to close');
        });
      const writeErrorMock = jest
        .spyOn(miscUtils, 'writeError')
        .mockImplementation(() => {
          throw new Error('error message');
        });

      await expect(
        canCloseStream({
          bundleError: false,
          bundleStream: {},
          bundleBuffer: 'foo',
          src: 'src',
          dest: 'dest',
          argv: { stripComments: false },
        }),
      ).rejects.toThrow('error message');
      expect(closeStreamMock).toHaveBeenCalled();
      expect(writeErrorMock).toHaveBeenCalled();
    });
  });
});
