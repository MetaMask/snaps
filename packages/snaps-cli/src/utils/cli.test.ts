import pathUtils, { resolve } from 'path';

import { getConfigWithManifest, sanitizeInputs, trimPathString } from './cli';
import { getMockConfig } from '../test-utils';

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

  describe('getConfigWithManifest', () => {
    it('returns the original config if no manifest path is provided', () => {
      const config = getMockConfig();
      expect(getConfigWithManifest(config)).toBe(config);
    });

    it('returns a config with the updated manifest path if provided', () => {
      const config = getMockConfig();
      const manifestPath = 'path/to/manifest.json';

      const updatedConfig = getConfigWithManifest(config, manifestPath);
      expect(updatedConfig.manifest.path).toBe(
        resolve(process.cwd(), manifestPath),
      );
    });
  });
});
