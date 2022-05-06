import { promises as fs } from 'fs';
import { TranspilationModes } from '../../builders';
import * as miscUtils from '../../utils/misc';
import {
  writeBundleFile,
  sanitizeDependencyPaths,
  getDependencyRegExp,
  processDependencies,
  processInvalidTranspilation,
} from './utils';

describe('utils', () => {
  describe('writeBundleFile', () => {
    it('writes to console error if there is a bundle Error', async () => {
      const writeErrorMock = jest
        .spyOn(miscUtils, 'writeError')
        .mockImplementation(() => {
          throw new Error('error message');
        });
      await expect(
        writeBundleFile({ bundleError: true } as any),
      ).rejects.toThrow('error message');
      expect(writeErrorMock).toHaveBeenCalledTimes(1);
    });

    it('console logs after writing bundle to disk', async () => {
      const writeFileMock = jest.spyOn(fs, 'writeFile').mockImplementation();
      const writeErrorMock = jest
        .spyOn(miscUtils, 'writeError')
        .mockImplementation();
      const logMock = jest.spyOn(console, 'log').mockImplementation();
      const resolveMock = jest.fn();

      await writeBundleFile({
        bundleError: false,
        bundleBuffer: 'foo',
        src: 'src',
        dest: 'dest',
        argv: { stripComments: false },
        resolve: resolveMock,
      } as any);
      expect(writeErrorMock).not.toHaveBeenCalled();
      expect(writeFileMock).toHaveBeenCalled();
      expect(logMock).toHaveBeenCalled();
      expect(resolveMock).toHaveBeenCalled();
    });

    it('will fail if the bundleBuffer is null', async () => {
      const writeErrorMock = jest
        .spyOn(miscUtils, 'writeError')
        .mockImplementation(() => {
          throw new Error('error message');
        });
      await expect(
        writeBundleFile({
          bundleBuffer: null,
          src: 'src',
          dest: 'dest',
        } as any),
      ).rejects.toThrow('error message');
      expect(writeErrorMock).toHaveBeenCalledTimes(1);
    });

    it('catches error if writing bundle file fails', async () => {
      const logMock = jest.spyOn(console, 'log').mockImplementation();
      const writeFileMock = jest
        .spyOn(fs, 'writeFile')
        .mockImplementation(() => {
          throw new Error('error message 1');
        });
      const writeErrorMock = jest
        .spyOn(miscUtils, 'writeError')
        .mockImplementation(() => {
          throw new Error('error message 2');
        });

      await expect(
        writeBundleFile({
          bundleError: false,
          bundleBuffer: 'foo',
          src: 'src',
          dest: 'dest',
          argv: { stripComments: false },
        } as any),
      ).rejects.toThrow('error message 2');
      expect(logMock).not.toHaveBeenCalled();
      expect(writeFileMock).toHaveBeenCalledTimes(1);
      expect(writeErrorMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('sanitizeDependencyPaths', () => {
    it('properly removes leading and trailing back and forward slashes from a list of dependencies', () => {
      const unsanitizedPaths = [
        '///\\@airswap////',
        '/filsnap\\',
        '/promisify/',
      ];
      expect(sanitizeDependencyPaths(unsanitizedPaths)).toStrictEqual([
        '@airswap',
        'filsnap',
        'promisify',
      ]);
    });
  });

  describe('getDependencyRegExp', () => {
    it("returns null if there aren't any dependencies", () => {
      expect(getDependencyRegExp([])).toBeNull();
    });

    it('returns null for covering a wildcard', () => {
      expect(getDependencyRegExp(['.'])).toBeNull();
    });

    it('returns a valid regex statement for a single dependency', () => {
      expect(getDependencyRegExp(['@airswap'])).toStrictEqual(
        /\/node_modules\/(?!@airswap\/)/u,
      );
    });

    it('returns a valid regex statement for multiple dependencies', () => {
      expect(
        getDependencyRegExp([
          '@airswap',
          'filecoin',
          '@openzeppelin/contracts',
        ]),
      ).toStrictEqual(
        /\/node_modules\/(?!@airswap|filecoin|@openzeppelin\/contracts\/)/u,
      );
    });
  });

  describe('processDependencies', () => {
    it('will return an empty object if dependencies are not defined', () => {
      const depsToTranspile = undefined;
      const transpilationMode = TranspilationModes.localAndDeps;
      const argv: Record<string, any> = { depsToTranspile, transpilationMode };
      const babelifyOptions = processDependencies(argv as any);
      expect(babelifyOptions).toStrictEqual({});
    });

    it('will return an object with an ignore value if dependencies are specified', () => {
      const depsToTranspile = ['airswap', 'filecoin', 'pify'];
      const transpilationMode = TranspilationModes.localAndDeps;
      const argv: Record<string, any> = { depsToTranspile, transpilationMode };
      const babelifyOptions = processDependencies(argv as any);
      expect(babelifyOptions).toStrictEqual({
        ignore: [/\/node_modules\/(?!airswap|filecoin|pify\/)/u],
      });
    });
  });

  describe('processInvalidTranspilation', () => {
    it('will throw an error if argv has a depsToTranspile property and a transpilationMode of anything other than localAndDeps', () => {
      const depsToTranspile = ['airswap', 'filecoin', 'pify'];
      const transpilationMode = TranspilationModes.localOnly;
      const argv: Record<string, any> = { depsToTranspile, transpilationMode };
      expect(() => processInvalidTranspilation(argv as any)).toThrow(
        '"depsToTranspile" can only be specified if "transpilationMode" is set to "localAndDeps" .',
      );
    });
  });
});
