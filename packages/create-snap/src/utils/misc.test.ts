import fs from 'fs';

import {
  booleanStringToBoolean,
  logError,
  trimPathString,
  writeError,
  setSnapGlobals,
} from './misc';

jest.mock('fs');

describe('misc', () => {
  global.snaps = {
    verboseErrors: false,
  };

  // This is the yargs object created with cli command: `yarn create-snap init`.
  /* eslint-disable @typescript-eslint/naming-convention */
  const defaultArgv = {
    _: ['init'],
    verboseErrors: true,
    'verbose-errors': false,
    $0: '/usr/local/bin/create-snap',
  };

  // This is the yargs object created with cli command:
  //   `mm-snap init -verboseErrors
  const exampleArgv = {
    _: ['init'],
    verboseErrors: true,
    'verbose-errors': true,
    $0: '/usr/local/bin/create-snap',
  };
  /* eslint-enable @typescript-eslint/naming-convention */

  const setVerboseErrors = (bool: boolean) => {
    global.snaps.verboseErrors = bool;
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
      expect(global.snaps.verboseErrors).toBe(true);
    });

    it('does not set global variables incorrectly', () => {
      setSnapGlobals(defaultArgv);
      expect(global.snaps.verboseErrors).toBe(true);
    });

    it('does not set global variables if they are not in argv', () => {
      global.snaps = {};

      // eslint-disable-next-line @typescript-eslint/naming-convention
      const argv = { _: ['init'], $0: '/usr/local/bin/create-snap' };
      setSnapGlobals(argv);
      expect(global.snaps.verboseErrors).toBeUndefined();
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
