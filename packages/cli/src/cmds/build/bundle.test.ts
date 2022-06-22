import browserify from 'browserify';
import { TranspilationModes } from '../../builders';
import { bundle } from './bundle';
import * as bundleUtils from './utils';

jest.mock('browserify');
jest.mock('babelify', () => 'mockBabelify');

describe('bundle', () => {
  global.snaps = {
    verboseErrors: false,
    isWatching: false,
  };

  describe('bundle', () => {
    it('handles all options enabled', async () => {
      const mockArgv = {
        sourceMaps: true,
        stripComments: true,
        transpilationMode: TranspilationModes.localOnly,
      };

      const mockTransform = jest.fn();
      const mockPlugin = jest.fn();
      const mockBrowserify = (browserify as jest.Mock).mockImplementation(
        () => ({
          transform: mockTransform,
          plugin: mockPlugin,
          bundle: (cb: () => any) => {
            cb();
          },
        }),
      );
      const mockBundlerTransform = jest.fn();
      const writeBundleFileMock = jest
        .spyOn(bundleUtils, 'writeBundleFile')
        .mockImplementation((({ resolve }: { resolve: () => any }) =>
          resolve()) as any);

      await bundle('src', 'dest', mockArgv as any, mockBundlerTransform);
      expect(mockBrowserify).toHaveBeenCalledWith(
        'src',
        expect.objectContaining({ debug: true }),
      );
      expect(mockTransform).toHaveBeenCalledTimes(1);
      expect(mockTransform).toHaveBeenCalledWith(
        'mockBabelify',
        expect.objectContaining({ global: false }),
      );
      expect(mockBundlerTransform).toHaveBeenCalledTimes(1);
      expect(mockPlugin).toHaveBeenCalledTimes(1);
      expect(mockPlugin).toHaveBeenCalledWith(expect.any(Function), {
        stripComments: true,
      });
      expect(writeBundleFileMock).toHaveBeenCalledTimes(1);
    });

    it('handles sourceMaps: false', async () => {
      const mockArgv = {
        sourceMaps: false,
        stripComments: true,
        transpilationMode: TranspilationModes.localOnly,
      };

      const mockTransform = jest.fn();
      const mockPlugin = jest.fn();
      const mockBrowserify = (browserify as jest.Mock).mockImplementation(
        () => ({
          transform: mockTransform,
          plugin: mockPlugin,
          bundle: (cb: () => any) => {
            cb();
          },
        }),
      );
      const writeBundleFileMock = jest
        .spyOn(bundleUtils, 'writeBundleFile')
        .mockImplementation((({ resolve }: { resolve: () => any }) =>
          resolve()) as any);

      await bundle('src', 'dest', mockArgv as any);
      expect(mockBrowserify).toHaveBeenCalledWith(
        'src',
        expect.objectContaining({ debug: false }),
      );
      expect(mockTransform).toHaveBeenCalledTimes(1);
      expect(mockTransform).toHaveBeenCalledWith(
        'mockBabelify',
        expect.objectContaining({ global: false }),
      );
      expect(mockPlugin).toHaveBeenCalledTimes(1);
      expect(mockPlugin).toHaveBeenCalledWith(expect.any(Function), {
        stripComments: true,
      });
      expect(writeBundleFileMock).toHaveBeenCalledTimes(1);
    });

    it('handles transpilationMode: localOnly', async () => {
      const mockArgv = {
        sourceMaps: true,
        stripComments: true,
        transpilationMode: TranspilationModes.localOnly,
      };

      const mockTransform = jest.fn();
      const mockPlugin = jest.fn();
      const mockBrowserify = (browserify as jest.Mock).mockImplementation(
        () => ({
          transform: mockTransform,
          plugin: mockPlugin,
          bundle: (cb: () => any) => {
            cb();
          },
        }),
      );
      const writeBundleFileMock = jest
        .spyOn(bundleUtils, 'writeBundleFile')
        .mockImplementation((({ resolve }: { resolve: () => any }) =>
          resolve()) as any);

      await bundle('src', 'dest', mockArgv as any);
      expect(mockBrowserify).toHaveBeenCalledWith(
        'src',
        expect.objectContaining({ debug: true }),
      );
      expect(mockTransform).toHaveBeenCalledTimes(1);
      expect(mockTransform).toHaveBeenCalledWith(
        'mockBabelify',
        expect.objectContaining({ global: false }),
      );
      expect(mockPlugin).toHaveBeenCalledTimes(1);
      expect(mockPlugin).toHaveBeenCalledWith(expect.any(Function), {
        stripComments: true,
      });
      expect(writeBundleFileMock).toHaveBeenCalledTimes(1);
    });

    it('handles transpilationMode: none', async () => {
      const mockArgv = {
        sourceMaps: true,
        stripComments: true,
        transpilationMode: TranspilationModes.none,
      };

      const mockTransform = jest.fn();
      const mockPlugin = jest.fn();
      const mockBrowserify = (browserify as jest.Mock).mockImplementation(
        () => ({
          transform: mockTransform,
          plugin: mockPlugin,
          bundle: (cb: () => any) => {
            cb();
          },
        }),
      );
      const writeBundleFileMock = jest
        .spyOn(bundleUtils, 'writeBundleFile')
        .mockImplementation((({ resolve }: { resolve: () => any }) =>
          resolve()) as any);

      await bundle('src', 'dest', mockArgv as any);
      expect(mockBrowserify).toHaveBeenCalledWith(
        'src',
        expect.objectContaining({ debug: true }),
      );
      expect(mockTransform).not.toHaveBeenCalled();
      expect(mockPlugin).toHaveBeenCalledTimes(1);
      expect(mockPlugin).toHaveBeenCalledWith(expect.any(Function), {
        stripComments: true,
      });
      expect(writeBundleFileMock).toHaveBeenCalledTimes(1);
    });

    it('handles transpilationMode: localAndDeps', async () => {
      const mockArgv = {
        sourceMaps: true,
        stripComments: true,
        transpilationMode: TranspilationModes.localAndDeps,
      };

      const mockTransform = jest.fn();
      const mockPlugin = jest.fn();
      const mockBrowserify = (browserify as jest.Mock).mockImplementation(
        () => ({
          transform: mockTransform,
          plugin: mockPlugin,
          bundle: (cb: () => any) => {
            cb();
          },
        }),
      );
      const writeBundleFileMock = jest
        .spyOn(bundleUtils, 'writeBundleFile')
        .mockImplementation((({ resolve }: { resolve: () => any }) =>
          resolve()) as any);

      await bundle('src', 'dest', mockArgv as any);
      expect(mockBrowserify).toHaveBeenCalledWith(
        'src',
        expect.objectContaining({ debug: true }),
      );
      expect(mockTransform).toHaveBeenCalledTimes(1);
      expect(mockTransform).toHaveBeenCalledWith(
        'mockBabelify',
        expect.objectContaining({
          global: true,
          parserOpts: {
            attachComment: false,
          },
        }),
      );
      expect(mockPlugin).toHaveBeenCalledTimes(1);
      expect(mockPlugin).toHaveBeenCalledWith(expect.any(Function), {
        stripComments: true,
      });
      expect(writeBundleFileMock).toHaveBeenCalledTimes(1);
    });
  });
});
