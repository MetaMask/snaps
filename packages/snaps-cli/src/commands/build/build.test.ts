import { DEFAULT_SNAP_BUNDLE } from '@metamask/snaps-utils/test-utils';
import fs from 'fs';

import { getMockConfig } from '../../test-utils';
import { compile, evaluate } from '../helpers';
import { build } from './build';
import { legacyBuild } from './legacy';

jest.mock('fs');
jest.mock('../helpers');
jest.mock('./legacy');

describe('build', () => {
  it('builds a snap', async () => {
    await fs.promises.writeFile('/input.js', DEFAULT_SNAP_BUNDLE);

    jest.spyOn(console, 'log').mockImplementation();
    const config = getMockConfig('webpack', {
      input: '/input.js',
      output: {
        path: '/foo',
        filename: 'output.js',
      },
    });

    await build(config);

    expect(process.exitCode).not.toBe(1);
    expect(compile).toHaveBeenCalledWith(config, {
      evaluate: false,
      spinner: expect.any(Object),
    });

    expect(evaluate).toHaveBeenCalledWith('/foo/output.js');
  });

  it('does note evaluate if the evaluate option is set to false', async () => {
    await fs.promises.writeFile('/input.js', DEFAULT_SNAP_BUNDLE);

    jest.spyOn(console, 'log').mockImplementation();
    const config = getMockConfig('webpack', {
      input: '/input.js',
      output: {
        path: '/foo',
        filename: 'output.js',
      },
      evaluate: false,
    });

    await build(config);

    expect(process.exitCode).not.toBe(1);
    expect(compile).toHaveBeenCalled();
    expect(evaluate).not.toHaveBeenCalled();
  });

  it('checks if the input file exists', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation();
    const config = getMockConfig('webpack', {
      input: 'fake-input-file.js',
    });

    await build(config);

    expect(process.exitCode).toBe(1);
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(
        /Input file not found: ".*"\. Make sure that the "input" field in your snap config is correct\./u,
      ),
    );
  });

  it('calls `legacyBuild` if the bundler is set to browserify', async () => {
    const config = getMockConfig('browserify');
    await build(config);

    expect(legacyBuild).toHaveBeenCalledWith(config);
  });
});
