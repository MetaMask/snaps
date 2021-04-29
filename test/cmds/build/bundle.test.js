const browserify = require('browserify');
const { bundle } = require('../../../dist/src/cmds/build/bundle');
const bundleUtils = require('../../../dist/src/cmds/build/bundleUtils');

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

      const mockBrowserify = browserify.mockImplementation((_, __) => ({
        bundle: (cb) => {
          cb();
        },
      }));
      const createStreamMock = jest
        .spyOn(bundleUtils, 'createBundleStream')
        .mockImplementation();
      const closeStreamMock = jest
        .spyOn(bundleUtils, 'closeBundleStream')
        .mockImplementation(({ resolve }) => resolve());

      await bundle('src', 'dest', mockArgv);
      expect(mockBrowserify).toHaveBeenCalledWith('src', { debug: true });
      expect(createStreamMock).toHaveBeenCalled();
      expect(closeStreamMock).toHaveBeenCalled();
    });
  });
});
