import fs from 'fs';
import pathUtils from 'path';
import {
  booleanStringToBoolean,
  trimPathString,
  logError,
  logWarning,
  sanitizeInputs,
  setSnapGlobals,
  writeError,
} from './misc';

jest.mock('fs', () => ({
  promises: {
    unlink: jest.fn(),
  },
}));

describe('misc', () => {
  global.snaps = {
    verboseErrors: false,
    suppressWarnings: false,
    isWatching: false,
  };

  // this is the yargs object created with cli command: mm-snap init
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

  // this is the yargs object created with cli command:
  //   mm-snap watch -verboseErrors --suppressWarnings
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

  const setVerboseErrors = (bool: boolean) => {
    global.snaps.verboseErrors = bool;
  };

  const setSuppressWarnings = (bool: boolean) => {
    global.snaps.suppressWarnings = bool;
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
      expect(global.snaps.isWatching).toStrictEqual(true);
      expect(global.snaps.verboseErrors).toStrictEqual(true);
      expect(global.snaps.suppressWarnings).toStrictEqual(true);
    });

    it('does not set global variables incorrectly', () => {
      setSnapGlobals(defaultArgv);
      expect(global.snaps.isWatching).toStrictEqual(false);
      expect(global.snaps.verboseErrors).toStrictEqual(true);
      expect(global.snaps.suppressWarnings).toStrictEqual(false);
    });

    it('does not set global variables if they are not in argv', () => {
      global.snaps = { isWatching: false };
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
  });

  describe('logWarning', () => {
    it('logs a warning and error message to console', () => {
      setSuppressWarnings(false);
      setVerboseErrors(true);

      jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(console, 'error').mockImplementation();

      logWarning('custom warning message', new Error('verbose'));
      expect(global.console.warn).toHaveBeenCalledWith(
        'custom warning message',
      );
      expect(global.console.error).toHaveBeenCalledWith(new Error('verbose'));
    });

    it('if verbose errors is set to false, just logs a warning message to console', () => {
      setSuppressWarnings(false);
      setVerboseErrors(false);

      jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(console, 'error').mockImplementation();

      logWarning('custom warning message', new Error('verbose'));
      expect(global.console.warn).toHaveBeenCalledWith(
        'custom warning message',
      );
      expect(global.console.error).not.toHaveBeenCalled();
    });

    it('given no error, just logs a warning message to console', () => {
      setSuppressWarnings(false);
      setVerboseErrors(false);

      jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(console, 'error').mockImplementation();

      logWarning('custom warning message');
      expect(global.console.warn).toHaveBeenCalledWith(
        'custom warning message',
      );
      expect(global.console.error).not.toHaveBeenCalled();
    });

    it('logs no message to console', () => {
      setSuppressWarnings(true);
      setVerboseErrors(true);

      jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(console, 'error').mockImplementation();

      logWarning('custom warning message', new Error('verbose'));
      expect(global.console.warn).not.toHaveBeenCalled();
      expect(global.console.error).not.toHaveBeenCalled();
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
      expect(trimPathString('./hello')).toStrictEqual('hello');
      expect(trimPathString('hello')).toStrictEqual('hello');
      expect(trimPathString('hello/')).toStrictEqual('hello');
      expect(trimPathString('')).toStrictEqual('');
      expect(trimPathString('hello////')).toStrictEqual('hello');
      expect(trimPathString('../hello')).toStrictEqual('hello');
      expect(trimPathString('//////hello')).toStrictEqual('hello');
    });
  });
});
