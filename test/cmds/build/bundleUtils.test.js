const EventEmitter = require('events');
const fs = require('fs');
const {
  createBundleStream,
  closeBundleStream,
  postProcess,
} = require('../../../dist/src/cmds/build/bundleUtils');
const miscUtils = require('../../../dist/src/utils/misc');

jest.mock('fs', () => ({
  createWriteStream: jest.fn(),
}));

describe('bundleUtils', () => {
  describe('createBundleStream', () => {
    let mockStream;

    beforeEach(() => {
      jest.spyOn(fs, 'createWriteStream').mockImplementation(() => {
        mockStream = new EventEmitter();
        mockStream.end = () => undefined;
        jest.spyOn(mockStream, 'on');
        jest.spyOn(mockStream, 'end');
        return mockStream;
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('writes error on error event', async () => {
      const mockWriteError = jest
        .spyOn(miscUtils, 'writeError')
        .mockImplementation();
      createBundleStream('foo');
      const finishPromise = new Promise((resolve, _reject) => {
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
    let mockStream;

    beforeEach(() => {
      mockStream = new EventEmitter();
      mockStream.end = () => undefined;
      jest.spyOn(mockStream, 'on');
      jest.spyOn(mockStream, 'end');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('writes to console error if there is a bundle Error', async () => {
      const writeErrorMock = jest
        .spyOn(miscUtils, 'writeError')
        .mockImplementation(() => {
          throw new Error('error message');
        });
      await expect(closeBundleStream({ bundleError: true })).rejects.toThrow(
        'error message',
      );
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
      });
      expect(writeErrorMock).not.toHaveBeenCalled();
      expect(mockStream.end).toHaveBeenCalled();
      expect(logMock).toHaveBeenCalled();
      expect(resolveMock).toHaveBeenCalled();
    });

    it('catches error if failed to close bundle stream', async () => {
      const logMock = jest.spyOn(console, 'log').mockImplementation();
      mockStream.end.mockImplementation(() => {
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
        }),
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

    it('applies regeneratorRuntime hack', () => {
      expect(postProcess('(regeneratorRuntime)')).toStrictEqual(
        'var regeneratorRuntime;\n(regeneratorRuntime)',
      );
    });

    it('throws an error if the postprocessed string is empty', () => {
      expect(() => postProcess(' ')).toThrow(/^Bundled code is empty/u);
    });
  });
});
