import { getMockConfig } from '@metamask/snaps-cli/test-utils';
import { getSnapManifest } from '@metamask/snaps-utils/test-utils';
import { promises as fs } from 'fs';
import ora from 'ora';

import { manifest } from '../helpers';
import { manifestHandler } from './manifest';

jest.mock('fs');
jest.mock('../helpers');

describe('manifestHandler', () => {
  beforeAll(async () => {
    await fs.writeFile(
      '/snap.manifest.json',
      JSON.stringify(getSnapManifest()),
    );
  });

  it('checks the manifest file', async () => {
    jest.spyOn(console, 'log').mockImplementation();
    const config = getMockConfig('webpack', {
      input: '/input.js',
      manifest: {
        path: '/snap.manifest.json',
      },
    });

    await manifestHandler(config, {});

    const { mock } = ora as jest.MockedFunction<typeof ora>;
    const spinner = mock.results[0].value;

    expect(manifest).toHaveBeenCalledWith(config.manifest.path, false, spinner);
    expect(spinner.succeed).toHaveBeenCalledWith(
      'The snap manifest file is valid.',
    );
  });

  it('fixes the manifest file when using Webpack', async () => {
    jest.spyOn(console, 'log').mockImplementation();
    const config = getMockConfig('webpack', {
      input: '/input.js',
      manifest: {
        path: '/snap.manifest.json',
      },
    });

    await manifestHandler(config, {
      fix: true,
    });

    const { mock } = ora as jest.MockedFunction<typeof ora>;
    const spinner = mock.results[0].value;

    expect(manifest).toHaveBeenCalledWith(config.manifest.path, true, spinner);
    expect(spinner.succeed).toHaveBeenCalledWith(
      'The snap manifest file is valid.',
    );
  });

  it('fixes the manifest file when using Browserify', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/');
    jest.spyOn(console, 'log').mockImplementation();

    const config = getMockConfig('browserify', {
      cliOptions: {
        writeManifest: true,
      },
    });

    await manifestHandler(config, {});

    const { mock } = ora as jest.MockedFunction<typeof ora>;
    const spinner = mock.results[0].value;

    expect(manifest).toHaveBeenCalledWith('/snap.manifest.json', true, spinner);
    expect(spinner.succeed).toHaveBeenCalledWith(
      'The snap manifest file is valid.',
    );
  });

  it('logs a message if the manifest file does not exist', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation();

    const config = getMockConfig('webpack', {
      input: '/input.js',
      manifest: {
        path: '/invalid.json',
      },
    });

    await manifestHandler(config, {});

    expect(manifest).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(
        /Manifest file not found: "\/invalid.json"\. Make sure that the `snap.manifest.json` file exists\./u,
      ),
    );
  });
});
