import { getMockConfig } from '@metamask/snaps-cli/test-utils';
import { promises as fs } from 'fs';

import { TranspilationModes } from '../../../builders';
import {
  getDependencyRegExp,
  processDependencies,
  processInvalidTranspilation,
  sanitizeDependencyPaths,
  writeBundleFile,
} from './utils';

jest.mock('fs');

describe('writeBundleFile', () => {
  it('writes the bundle file and logs a message', async () => {
    await fs.mkdir('/snap', { recursive: true });
    const log = jest.spyOn(console, 'log').mockImplementation();

    const config = getMockConfig('browserify', {
      cliOptions: {
        src: '/snap/input.js',
        dist: '/snap',
        outfileName: 'bundle.js',
      },
    });

    await writeBundleFile(Buffer.from('test'), config);

    const file = await fs.readFile('/snap/bundle.js', 'utf-8');
    expect(file).toBe('test');

    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/Build success: '.+' bundled as '.+'!/u),
    );
  });
});

describe('processDependencies', () => {
  it('returns an empty object when `transpilationMode` is not `localAndDeps`', () => {
    const config = getMockConfig('browserify', {
      cliOptions: {
        transpilationMode: TranspilationModes.LocalOnly,
      },
    });

    const result = processDependencies(config);
    expect(result).toStrictEqual({});
  });

  it('returns an object with an `ignore` property when `transpilationMode` is `localAndDeps`', () => {
    const config = getMockConfig('browserify', {
      cliOptions: {
        transpilationMode: TranspilationModes.LocalAndDeps,
        depsToTranspile: ['@metamask/snaps'],
      },
    });

    const result = processDependencies(config);
    expect(result).toStrictEqual({
      ignore: [/\/node_modules\/(?!@metamask\/snaps)/u],
    });
  });

  it('returns an empty object when `depsToTranspile` is empty', () => {
    const config = getMockConfig('browserify', {
      cliOptions: {
        transpilationMode: TranspilationModes.LocalAndDeps,
        depsToTranspile: [],
      },
    });

    const result = processDependencies(config);
    expect(result).toStrictEqual({});
  });
});

describe('getDependencyRegExp', () => {
  it('returns null when `depsToTranspile` is empty', () => {
    const result = getDependencyRegExp([]);
    expect(result).toBeNull();
  });

  it('returns null when `depsToTranspile` includes a dot', () => {
    const result = getDependencyRegExp(['@metamask/snaps', '.']);
    expect(result).toBeNull();
  });

  it('returns null when `depsToTranspile` is undefined', () => {
    const result = getDependencyRegExp(undefined as any);
    expect(result).toBeNull();
  });

  it('returns a RegExp when `depsToTranspile` is not empty', () => {
    const result = getDependencyRegExp(['@metamask/snaps']);
    expect(result).toBeInstanceOf(RegExp);
  });

  it('returns a RegExp that matches the provided dependencies', () => {
    const result = getDependencyRegExp(['@metamask/snaps', 'foo']);
    expect(result?.test('/node_modules/@metamask/snaps/')).toBe(false);
    expect(result?.test('/node_modules/foo/')).toBe(false);
    expect(result?.test('/node_modules/bar/')).toBe(true);
  });
});

describe('sanitizeDependencyPaths', () => {
  it('removes leading and trailing slashes', () => {
    const result = sanitizeDependencyPaths(['/foo/', '/bar', 'baz/', 'qux']);
    expect(result).toStrictEqual(['foo', 'bar', 'baz', 'qux']);
  });
});

describe('processInvalidTranspilation', () => {
  it('throws an error when `depsToTranspile` is set, but `transpilationMode` is not `localAndDeps`', () => {
    const config = getMockConfig('browserify', {
      cliOptions: {
        transpilationMode: TranspilationModes.LocalOnly,
        depsToTranspile: ['@metamask/snaps'],
      },
    });

    expect(() =>
      // @ts-expect-error - Partial mock.
      processInvalidTranspilation({
        transpilationMode: config.cliOptions.transpilationMode,
        depsToTranspile: config.cliOptions.depsToTranspile,
      }),
    ).toThrow(
      '"depsToTranspile" can only be specified if "transpilationMode" is set to "localAndDeps".',
    );
  });
});
