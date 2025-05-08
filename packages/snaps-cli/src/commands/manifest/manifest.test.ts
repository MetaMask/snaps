import { getSnapManifest } from '@metamask/snaps-utils/test-utils';
import { promises as fs } from 'fs';
import ora from 'ora';

import { manifest } from './implementation';
import * as implementation from './implementation';
import { manifestHandler, showManifestMessage } from './manifest';
import { getMockConfig } from '../../test-utils';
import { evaluate } from '../eval';

jest.mock('fs');
jest.mock('ora');
jest.mock('../eval');
jest.mock('./implementation');

describe('showManifestMessage', () => {
  it('logs the message when the manifest is valid', () => {
    const log = jest.spyOn(console, 'log').mockImplementation();

    const stats = {
      valid: true,
      errors: 0,
      warnings: 0,
      fixed: 0,
    };

    const spinner = ora();
    showManifestMessage(stats, false, spinner);

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining('The Snap manifest file is valid.'),
    );
  });

  it('logs the message when issues can be fixed', () => {
    const error = jest.spyOn(console, 'error').mockImplementation();

    const stats = {
      valid: false,
      errors: 0,
      warnings: 1,
      fixed: 1,
    };

    const spinner = ora();
    showManifestMessage(stats, false, spinner);

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining(
        'Use the `--fix` option to attempt to fix the manifest.',
      ),
    );
  });

  it('logs the message when the manifest is valid with warnings', () => {
    const log = jest.spyOn(console, 'log').mockImplementation();

    const stats = {
      valid: true,
      errors: 0,
      warnings: 1,
      fixed: 0,
    };

    const spinner = ora();
    showManifestMessage(stats, false, spinner);

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining(
        'The Snap manifest file is valid, but contains 1 warning.',
      ),
    );
  });

  it('logs the message when the manifest is valid with fixed issues', () => {
    const log = jest.spyOn(console, 'log').mockImplementation();

    const stats = {
      valid: true,
      errors: 0,
      warnings: 0,
      fixed: 1,
    };

    const spinner = ora();
    showManifestMessage(stats, true, spinner);

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining('1 issue was automatically fixed.'),
    );
  });

  it('logs the message when the manifest is invalid', () => {
    const log = jest.spyOn(console, 'error').mockImplementation();

    const stats = {
      valid: false,
      errors: 1,
      warnings: 0,
      fixed: 0,
    };

    const spinner = ora();
    showManifestMessage(stats, false, spinner);

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining(
        'The Snap manifest contains 1 error and 0 warnings.',
      ),
    );
  });

  it('logs the message when the manifest is invalid with fixed issues', () => {
    const log = jest.spyOn(console, 'error').mockImplementation();

    const stats = {
      valid: false,
      errors: 1,
      warnings: 0,
      fixed: 1,
    };

    const spinner = ora();
    showManifestMessage(stats, true, spinner);

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining('1 issue was automatically fixed.'),
    );
  });
});

describe('manifestHandler', () => {
  beforeAll(async () => {
    await fs.writeFile(
      '/snap.manifest.json',
      JSON.stringify(getSnapManifest()),
    );
  });

  it('checks the manifest file', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(implementation, 'manifest').mockResolvedValue({
      valid: true,
      errors: 0,
      warnings: 0,
      fixed: 0,
    });

    const config = getMockConfig({
      input: '/input.js',
      evaluate: false,
      manifest: {
        path: '/snap.manifest.json',
      },
    });

    await manifestHandler(config, {});

    const { mock } = ora as jest.MockedFunction<typeof ora>;
    const spinner = mock.results[0].value;

    expect(manifest).toHaveBeenCalledWith(
      config,
      expect.stringMatching(/.*snap\.manifest\.json.*/u),
      false,
      undefined,
      spinner,
    );

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining('The Snap manifest file is valid.'),
    );
  });

  it('fixes the manifest file', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(implementation, 'manifest').mockResolvedValue({
      valid: true,
      errors: 0,
      warnings: 0,
      fixed: 0,
    });

    const config = getMockConfig({
      input: '/input.js',
      evaluate: false,
      manifest: {
        path: '/snap.manifest.json',
      },
    });

    await manifestHandler(config, {
      fix: true,
    });

    const { mock } = ora as jest.MockedFunction<typeof ora>;
    const spinner = mock.results[0].value;

    expect(manifest).toHaveBeenCalledWith(
      config,
      expect.stringMatching(/.*snap\.manifest\.json.*/u),
      true,
      undefined,
      spinner,
    );

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining('The Snap manifest file is valid.'),
    );
  });

  it('evaluates the bundle', async () => {
    jest.mocked(evaluate).mockResolvedValue({
      exports: ['onRpcRequest'],
      stdout: '',
      stderr: '',
    });

    await fs.mkdir('/dist', { recursive: true });
    await fs.writeFile('/dist/bundle.js', '');

    const log = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(implementation, 'manifest').mockResolvedValue({
      valid: true,
      errors: 0,
      warnings: 0,
      fixed: 0,
    });

    const config = getMockConfig({
      input: '/input.js',
      output: {
        path: '/dist',
      },
      evaluate: true,
      manifest: {
        path: '/snap.manifest.json',
      },
    });

    await manifestHandler(config, {});

    const { mock } = ora as jest.MockedFunction<typeof ora>;
    const spinner = mock.results[0].value;

    expect(manifest).toHaveBeenCalledWith(
      config,
      expect.stringMatching(/.*snap\.manifest\.json.*/u),
      false,
      ['onRpcRequest'],
      spinner,
    );

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining('The Snap manifest file is valid.'),
    );
  });

  it('logs a message if the manifest file does not exist', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation();

    const config = getMockConfig({
      input: '/input.js',
      evaluate: false,
      manifest: {
        path: '/invalid.json',
      },
    });

    await manifestHandler(config, {});

    expect(manifest).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(
        /Manifest file not found: ".+"\. Make sure that the `snap\.manifest\.json` file exists\./u,
      ),
    );
  });

  it('does not log when the manifest is invalid', async () => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(implementation, 'manifest').mockResolvedValue({
      valid: false,
      errors: 1,
      warnings: 0,
      fixed: 0,
    });

    const config = getMockConfig({
      input: '/input.js',
      evaluate: false,
      manifest: {
        path: '/snap.manifest.json',
      },
    });

    await manifestHandler(config, {});

    const { mock } = ora as jest.MockedFunction<typeof ora>;
    const spinner = mock.results[0].value;

    expect(manifest).toHaveBeenCalledWith(
      config,
      expect.stringMatching(/.*snap\.manifest\.json.*/u),
      false,
      undefined,
      spinner,
    );

    expect(spinner.succeed).not.toHaveBeenCalled();
  });
});
