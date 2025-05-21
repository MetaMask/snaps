import { evalBundle } from '@metamask/snaps-utils/node';
import { getSnapManifest } from '@metamask/snaps-utils/test-utils';
import { promises as fs } from 'fs';
import ora from 'ora';

import { manifest } from './implementation';
import * as implementation from './implementation';
import { manifestHandler } from './manifest';
import { getMockConfig } from '../../test-utils';

jest.mock('fs');
jest.mock('./implementation');
jest.mock('@metamask/snaps-utils/node', () => ({
  ...jest.requireActual('@metamask/snaps-utils/node'),
  evalBundle: jest.fn(),
}));

describe('manifestHandler', () => {
  beforeAll(async () => {
    await fs.writeFile(
      '/snap.manifest.json',
      JSON.stringify(getSnapManifest()),
    );
  });

  it('checks the manifest file', async () => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(implementation, 'manifest').mockResolvedValue(true);

    const config = getMockConfig({
      input: '/input.js',
      manifest: {
        path: '/snap.manifest.json',
      },
    });

    await manifestHandler(config, {
      eval: false,
    });

    const { mock } = ora as jest.MockedFunction<typeof ora>;
    const spinner = mock.results[0].value;

    expect(manifest).toHaveBeenCalledWith(
      expect.stringMatching(/.*snap\.manifest\.json.*/u),
      false,
      undefined,
      spinner,
    );

    expect(spinner.succeed).toHaveBeenCalledWith(
      'The Snap manifest file is valid.',
    );
  });

  it('fixes the manifest file', async () => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(implementation, 'manifest').mockResolvedValue(true);

    const config = getMockConfig({
      input: '/input.js',
      manifest: {
        path: '/snap.manifest.json',
      },
    });

    await manifestHandler(config, {
      fix: true,
      eval: false,
    });

    const { mock } = ora as jest.MockedFunction<typeof ora>;
    const spinner = mock.results[0].value;

    expect(manifest).toHaveBeenCalledWith(
      expect.stringMatching(/.*snap\.manifest\.json.*/u),
      true,
      undefined,
      spinner,
    );

    expect(spinner.succeed).toHaveBeenCalledWith(
      'The Snap manifest file is valid.',
    );
  });

  it('logs a message if the manifest file does not exist', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation();

    const config = getMockConfig({
      input: '/input.js',
      manifest: {
        path: '/invalid.json',
      },
    });

    await manifestHandler(config, {
      eval: false,
    });

    expect(manifest).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(
        /Manifest file not found: ".+"\. Make sure that the `snap\.manifest\.json` file exists\./u,
      ),
    );
  });

  it('does not log when the manifest is invalid', async () => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(implementation, 'manifest').mockResolvedValue(false);

    const config = getMockConfig({
      input: '/input.js',
      manifest: {
        path: '/snap.manifest.json',
      },
    });

    await manifestHandler(config, {
      eval: false,
    });

    const { mock } = ora as jest.MockedFunction<typeof ora>;
    const spinner = mock.results[0].value;

    expect(manifest).toHaveBeenCalledWith(
      expect.stringMatching(/.*snap\.manifest\.json.*/u),
      false,
      undefined,
      spinner,
    );

    expect(spinner.succeed).not.toHaveBeenCalledWith(
      'The snap manifest file is valid.',
    );
  });

  it('evaluates the bundle and checks the exports', async () => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.mocked(evalBundle).mockResolvedValue({
      stdout: '',
      stderr: '',
      exports: ['foo', 'bar'],
    });

    const config = getMockConfig({
      input: '/input.js',
      output: {
        path: '/dist',
      },
      manifest: {
        path: '/snap.manifest.json',
      },
    });

    await manifestHandler(config, {
      eval: true,
    });

    const { mock } = ora as jest.MockedFunction<typeof ora>;
    const spinner = mock.results[0].value;

    expect(manifest).toHaveBeenCalledWith(
      expect.stringMatching(/.*snap\.manifest\.json.*/u),
      false,
      ['foo', 'bar'],
      spinner,
    );
  });
});
