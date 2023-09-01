import pathUtils from 'path';

import { sanitizeInputs, trimPathString } from './cli';

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
