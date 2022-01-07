import browserify from 'browserify';
import { bundle } from './bundle';
import * as bundleUtils from './bundleUtils';

jest.mock('browserify');

describe('bundle', () => {
  global.snaps = {
    verboseErrors: false,
    isWatching: false,
  };

  describe('bundle', () => {
    it('processes yargs properties correctly', async () => {
      const mockArgv = {
        sourceMaps: true,
      };

      const mockBrowserify = (browserify as jest.Mock).mockImplementation(
        () => ({
          transform: () => ({
            bundle: (cb: () => any) => {
              cb();
            },
          }),
        }),
      );
      const createStreamMock = jest
        .spyOn(bundleUtils, 'createBundleStream')
        .mockImplementation();
      const closeStreamMock = jest
        .spyOn(bundleUtils, 'closeBundleStream')
        .mockImplementation((({ resolve }: { resolve: () => any }) =>
          resolve()) as any);

      await bundle('src', 'dest', mockArgv as any);
      expect(mockBrowserify).toHaveBeenCalledWith('src', { debug: true });
      expect(createStreamMock).toHaveBeenCalled();
      expect(closeStreamMock).toHaveBeenCalled();
    });
  });
});
