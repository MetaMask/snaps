import EventEmitter from 'events';
import fs from 'fs';
import { TranspilationModes } from '../../builders';
import * as miscUtils from '../../utils/misc';
import {
  createBundleStream,
  closeBundleStream,
  postProcess,
  sanitizeDependencyPaths,
  getDependencyRegExp,
  processDependencies,
  processInvalidTranspilation,
} from './utils';

jest.mock('fs', () => ({
  createWriteStream: jest.fn(),
}));

type MockStream = {
  end: () => void;
} & EventEmitter;

function getMockStream(): MockStream {
  const stream: MockStream = new EventEmitter() as any;
  stream.end = () => undefined;
  jest.spyOn(stream, 'on');
  jest.spyOn(stream, 'end');
  return stream;
}

describe('utils', () => {
  describe('createBundleStream', () => {
    let mockStream: MockStream;

    beforeEach(() => {
      jest.spyOn(fs, 'createWriteStream').mockImplementation((() => {
        mockStream = getMockStream();
        return mockStream;
      }) as any);
    });

    it('writes error on error event', async () => {
      const mockWriteError = jest
        .spyOn(miscUtils, 'writeError')
        .mockImplementation();
      createBundleStream('foo');
      const finishPromise = new Promise<void>((resolve, _reject) => {
        mockStream.on('error', () => {
          expect(mockWriteError).toHaveBeenCalled();
          resolve();
        });
      });
      mockStream.emit('error', new Error('error'));
      await finishPromise;
    });
  });

  describe('closeBundleStream', () => {
    let mockStream: MockStream;

    beforeEach(() => {
      mockStream = getMockStream();
    });

    it('writes to console error if there is a bundle Error', async () => {
      const writeErrorMock = jest
        .spyOn(miscUtils, 'writeError')
        .mockImplementation(() => {
          throw new Error('error message');
        });
      await expect(
        closeBundleStream({ bundleError: true } as any),
      ).rejects.toThrow('error message');
      expect(writeErrorMock).toHaveBeenCalledTimes(1);
    });

    it('console logs if successfully closed bundle stream', async () => {
      const writeErrorMock = jest
        .spyOn(miscUtils, 'writeError')
        .mockImplementation();
      const logMock = jest.spyOn(console, 'log').mockImplementation();
      const resolveMock = jest.fn();

      await closeBundleStream({
        bundleError: false,
        bundleStream: mockStream,
        bundleBuffer: 'foo',
        src: 'src',
        dest: 'dest',
        argv: { stripComments: false },
        resolve: resolveMock,
      } as any);
      expect(writeErrorMock).not.toHaveBeenCalled();
      expect(mockStream.end).toHaveBeenCalled();
      expect(logMock).toHaveBeenCalled();
      expect(resolveMock).toHaveBeenCalled();
    });

    it('catches error if failed to close bundle stream', async () => {
      const logMock = jest.spyOn(console, 'log').mockImplementation();
      (mockStream.end as jest.Mock).mockImplementation(() => {
        throw new Error('error message 1');
      });
      const writeErrorMock = jest
        .spyOn(miscUtils, 'writeError')
        .mockImplementation(() => {
          throw new Error('error message 2');
        });

      await expect(
        closeBundleStream({
          bundleError: false,
          bundleStream: mockStream,
          bundleBuffer: 'foo',
          src: 'src',
          dest: 'dest',
          argv: { stripComments: false },
        } as any),
      ).rejects.toThrow('error message 2');
      expect(logMock).not.toHaveBeenCalled();
      expect(mockStream.end).toHaveBeenCalledTimes(1);
      expect(writeErrorMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('postProcess', () => {
    it('handles null input', () => {
      expect(postProcess(null)).toBeNull();
    });

    it('trims the string', () => {
      expect(postProcess(' trimMe ')).toStrictEqual('trimMe');
    });

    it('strips comments if configured to do so', () => {
      expect(
        postProcess('/* delete me */postProcessMe', { stripComments: true }),
      ).toStrictEqual('postProcessMe');
    });

    it('ignores comments if configured to do so', () => {
      expect(postProcess('/* leave me alone */postProcessMe')).toStrictEqual(
        '/* leave me alone */postProcessMe',
      );
    });

    it('breaks up HTML comment tokens', () => {
      [
        ['foo;\n<!--', 'foo;\n< !--'],
        ['-->\nbar', '-- >\nbar'],
      ].forEach(([input, output]) => {
        expect(
          postProcess(input, { transformHtmlComments: false }),
        ).toStrictEqual(input);

        expect(
          postProcess(input, { transformHtmlComments: true }),
        ).toStrictEqual(output);
      });
    });

    it('applies regeneratorRuntime hack', () => {
      expect(postProcess('(regeneratorRuntime)')).toStrictEqual(
        'var regeneratorRuntime;\n(regeneratorRuntime)',
      );
    });

    it('throws an error if the postprocessed string is empty', () => {
      expect(() => postProcess(' ')).toThrow(/^Bundled code is empty/u);
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
    it("returns a wildcard regex statement if there aren't any dependencies", () => {
      expect(getDependencyRegExp([])).toStrictEqual(/\/node_modules\/(?!.+)/u);
    });

    it('returns a valid regex statement for covering a wildcard', () => {
      expect(getDependencyRegExp(['.'])).toStrictEqual(
        /\/node_modules\/(?!.+)/u,
      );
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
    it('will return an object that with a wildcard ignore value if dependencies are not defined', () => {
      const depsToTranspile = undefined;
      const transpilationMode = TranspilationModes.localAndDeps;
      const argv: Record<string, any> = { depsToTranspile, transpilationMode };
      const babelifyOptions = processDependencies(argv as any);
      expect(babelifyOptions).toStrictEqual({
        ignore: [/\/node_modules\/(?!.+)/u],
      });
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
