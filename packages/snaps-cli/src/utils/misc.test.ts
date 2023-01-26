import fs from 'fs';
import pathUtils from 'path';

import {
  booleanStringToBoolean,
  logError,
  sanitizeInputs,
  setSnapGlobals,
  trimPathString,
  writeError,
} from './misc';

jest.mock('fs');

describe('misc', () => {
  global.snaps = {
    verboseErrors: false,
    suppressWarnings: false,
    isWatching: false,
  };

  // This is the yargs object created with cli command: `mm-snap init`.
  /* eslint-disable @typescript-eslint/naming-convention */
  const defaultArgv = {
    _: ['init'],
    verboseErrors: true,
    'verbose-errors': false,
    suppressWarnings: false,
    'suppress-warnings': false,
    src: 'src/index.js',
    s: 'src/index.js',
    dist: 'dist',
    d: 'dist',
    outfileName: 'bundle.js',
    n: 'bundle.js',
    'outfile-name': 'bundle.js',
    port: 8081,
    p: 8081,
    $0: '/usr/local/bin/mm-snap',
  };

  // This is the yargs object created with cli command:
  //   `mm-snap watch -verboseErrors --suppressWarnings`
  const exampleArgv = {
    _: ['watch'],
    verboseErrors: true,
    'verbose-errors': true,
    suppressWarnings: true,
    'suppress-warnings': true,
    src: 'src/index.js',
    s: 'src/index.js',
    dist: 'dist',
    d: 'dist',
    outfileName: 'bundle.js',
    n: 'bundle.js',
    'outfile-name': 'bundle.js',
    sourceMaps: false,
    'source-maps': false,
    stripComments: false,
    strip: false,
    'strip-comments': false,
    $0: '/usr/local/bin/mm-snap',
  };

  const unsanitizedArgv = {
    _: ['init'],
    verboseErrors: true,
    'verbose-errors': false,
    suppressWarnings: false,
    'suppress-warnings': false,
    src: './',
    s: './src/index.js',
    dist: 'dist',
    d: 'dist',
    outfileName: 'bundle.js',
    n: 'bundle.js',
    'outfile-name': 'bundle.js',
    port: 8081,
    p: 8081,
    $0: '/usr/local/bin/mm-snap',
  };

  const sanitizedArgv = {
    _: ['init'],
    verboseErrors: true,
    'verbose-errors': false,
    suppressWarnings: false,
    'suppress-warnings': false,
    src: '.',
    s: pathUtils.normalize('src/index.js'),
    dist: 'dist',
    d: 'dist',
    outfileName: 'bundle.js',
    n: 'bundle.js',
    'outfile-name': 'bundle.js',
    port: 8081,
    p: 8081,
    $0: '/usr/local/bin/mm-snap',
  };
  /* eslint-enable @typescript-eslint/naming-convention */

  const setVerboseErrors = (bool: boolean) => {
    global.snaps.verboseErrors = bool;
  };

  const setIsWatching = (bool: boolean) => {
    global.snaps.isWatching = bool;
  };

  afterAll(() => {
    global.snaps = {};
  });

  describe('booleanStringToBoolean', () => {
    it('returns boolean values directly', () => {
      expect(booleanStringToBoolean(true)).toBe(true);
      expect(booleanStringToBoolean(false)).toBe(false);
    });

    it('converts "true"/"false" strings to their corresponding booleans', () => {
      expect(booleanStringToBoolean('true')).toBe(true);
      expect(booleanStringToBoolean('false')).toBe(false);
    });

    it('throws if the value cannot be converted', () => {
      expect(() => booleanStringToBoolean('foo')).toThrow(
        'Expected a boolean or the strings "true" or "false". Received: "foo"',
      );
    });
  });

  describe('setSnapGlobals', () => {
    it('sets global variables correctly', () => {
      setSnapGlobals(exampleArgv);
      expect(global.snaps.isWatching).toBe(true);
      expect(global.snaps.verboseErrors).toBe(true);
      expect(global.snaps.suppressWarnings).toBe(true);
    });

    it('does not set global variables incorrectly', () => {
      setSnapGlobals(defaultArgv);
      expect(global.snaps.isWatching).toBe(false);
      expect(global.snaps.verboseErrors).toBe(true);
      expect(global.snaps.suppressWarnings).toBe(false);
    });

    it('does not set global variables if they are not in argv', () => {
      global.snaps = { isWatching: false };

      // eslint-disable-next-line @typescript-eslint/naming-convention
      const argv = { _: ['w', 'watch'], $0: '/usr/local/bin/mm-snap' };
      setSnapGlobals(argv);
      expect(global.snaps.verboseErrors).toBeUndefined();
      expect(global.snaps.suppressWarnings).toBeUndefined();
    });
  });

  describe('sanitizeInputs', () => {
    it('correctly normalizes paths', () => {
      sanitizeInputs(unsanitizedArgv);
      expect(unsanitizedArgv).toStrictEqual(sanitizedArgv);
    });
  });

  describe('logError', () => {
    it('logs an error message to console', () => {
      setVerboseErrors(true);
      jest.spyOn(console, 'error').mockImplementation();
      logError('custom error message', new Error('verbose'));
      expect(global.console.error).toHaveBeenCalledWith('custom error message');
      expect(global.console.error).toHaveBeenCalledWith(new Error('verbose'));

      setVerboseErrors(false);
      jest.spyOn(console, 'error').mockImplementation();
      logError('error message');
      expect(global.console.error).toHaveBeenCalledWith('error message');
    });

    it("doesn't log null", () => {
      setVerboseErrors(true);
      jest.spyOn(console, 'error').mockImplementation();
      logError(null, new Error('verbose'));
      expect(global.console.error).toHaveBeenCalledWith(new Error('verbose'));

      setVerboseErrors(false);
      jest.spyOn(console, 'error').mockImplementation();
      logError(null);
      expect(global.console.error).toHaveBeenCalledWith('Unknown error.');

      jest.spyOn(console, 'error').mockImplementation();
      logError(null, new Error('verbose'));
      expect(global.console.error).toHaveBeenCalledWith('Unknown error.');
    });
  });

  describe('writeError', () => {
    it('calls console error once if filesystem unlink is successful', async () => {
      setVerboseErrors(false);
      setIsWatching(false);
      jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process exited');
      });
      jest.spyOn(fs.promises, 'unlink').mockResolvedValueOnce();
      const errorMock = jest.spyOn(console, 'error').mockImplementation();
      await expect(
        writeError('foo', 'bar', new Error('error message'), 'dest'),
      ).rejects.toThrow('process exited');
      expect(errorMock).toHaveBeenNthCalledWith(1, 'foo bar');
      expect(errorMock).toHaveBeenCalledTimes(1);
    });

    it('calls console error twice if filesystem unlink fails', async () => {
      setVerboseErrors(false);
      setIsWatching(false);
      jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process exited');
      });
      jest.spyOn(fs.promises, 'unlink').mockRejectedValueOnce(undefined);
      const errorMock = jest.spyOn(console, 'error').mockImplementation();
      await expect(
        writeError('foo', 'bar', new Error('error message'), 'dest'),
      ).rejects.toThrow('process exited');
      expect(errorMock).toHaveBeenNthCalledWith(1, 'foo bar');
      expect(errorMock).toHaveBeenCalledTimes(2);
    });

    it('will not process an already processed prefix', async () => {
      setIsWatching(true);
      const prefix = 'Custom Error ';
      const errorMock = jest.spyOn(console, 'error').mockImplementation();
      await writeError(prefix, 'bar', new Error('error message'));
      expect(errorMock).toHaveBeenCalledWith(`${prefix}bar`);
    });
  });

  describe('trimPathString', () => {
    it('trims a given path string', () => {
      expect(trimPathString('./hello')).toBe('hello');
      expect(trimPathString('hello')).toBe('hello');
      expect(trimPathString('hello/')).toBe('hello');
      expect(trimPathString('')).toBe('');
      expect(trimPathString('hello////')).toBe('hello');
      expect(trimPathString('../hello')).toBe('hello');
      expect(trimPathString('//////hello')).toBe('hello');
    });
  });
});
