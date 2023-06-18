import fs from 'fs';
import pathUtils from 'path';

import { sanitizeInputs, trimPathString, writeError } from './misc';

jest.mock('fs');

describe('misc', () => {
  /* eslint-disable @typescript-eslint/naming-convention */
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

  describe('sanitizeInputs', () => {
    it('correctly normalizes paths', () => {
      sanitizeInputs(unsanitizedArgv);
      expect(unsanitizedArgv).toStrictEqual(sanitizedArgv);
    });
  });

  describe('writeError', () => {
    it('calls console error once if filesystem unlink is successful', async () => {
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
