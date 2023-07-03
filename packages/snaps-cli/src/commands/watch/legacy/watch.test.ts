import { getMockConfig } from '@metamask/snaps-cli/test-utils';
import { NpmSnapFileNames } from '@metamask/snaps-utils';
import {
  DEFAULT_SNAP_BUNDLE,
  getPackageJson,
  getSnapManifest,
} from '@metamask/snaps-utils/test-utils';
import chokidar from 'chokidar';
import EventEmitter from 'events';
import { promises as fs } from 'fs';

import { CONFIG_FILE, TS_CONFIG_FILE } from '../../../utils';
import { legacyBuild } from '../../build/legacy';
import { evaluate } from '../../eval';
import { manifest } from '../../manifest';
import { serveHandler } from '../../serve/serve';
import { legacyWatch } from './watch';

type MockWatcher = {
  add: () => void;
} & EventEmitter;

/**
 * Get a mocked chokidar watcher, with Jest spies attached to some of its
 * methods.
 *
 * @returns The mocked watcher.
 */
function getMockWatcher(): MockWatcher {
  const watcher: MockWatcher = new EventEmitter() as any;
  watcher.add = () => undefined;
  jest.spyOn(watcher, 'on');
  jest.spyOn(watcher, 'add');
  return watcher;
}

jest.mock('fs');
jest.mock('chokidar', () => ({
  watch: jest.fn().mockImplementation(() => getMockWatcher()),
}));

jest.mock('../../build/legacy');
jest.mock('../../eval');
jest.mock('../../manifest');
jest.mock('../../serve/serve');

describe('legacyWatch', () => {
  beforeEach(async () => {
    await fs.mkdir('/snap');
    await fs.writeFile('/snap/input.js', DEFAULT_SNAP_BUNDLE);
    await fs.writeFile(
      '/snap/snap.manifest.json',
      JSON.stringify(getSnapManifest()),
    );
    await fs.writeFile('/snap/package.json', JSON.stringify(getPackageJson()));
    await fs.mkdir('/snap/images');
    await fs.writeFile('/snap/images/icon.svg', '<svg></svg>');
  });

  afterEach(async () => {
    await fs.rm('/snap', { force: true, recursive: true });
  });

  it('builds a snap and watches for changes', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation();
    const error = jest.spyOn(console, 'error').mockImplementation();

    const config = getMockConfig('browserify', {
      cliOptions: {
        src: '/snap/input.js',
        eval: false,
        manifest: false,
        serve: false,
      },
    });

    await legacyWatch(config);

    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/Watching .+ for changes\.\.\./u),
    );

    const watch = chokidar.watch as jest.MockedFunction<typeof chokidar.watch>;
    const watcher: MockWatcher = watch.mock.results[0].value;

    expect(watch).toHaveBeenCalledWith(
      ['/snap', NpmSnapFileNames.Manifest, CONFIG_FILE, TS_CONFIG_FILE],
      {
        ignoreInitial: true,
        ignored: expect.arrayContaining(['**/node_modules/**', '**/dist/**']),
      },
    );

    watcher.emit('ready');
    expect(legacyBuild).toHaveBeenCalledTimes(1);

    watcher.emit('change', '/snap/input.js');
    expect(log).toHaveBeenCalledWith('File changed: /snap/input.js');
    expect(legacyBuild).toHaveBeenCalledTimes(2);

    watcher.emit('add', '/snap/foo.js');
    expect(log).toHaveBeenCalledWith('File added: /snap/foo.js');
    expect(legacyBuild).toHaveBeenCalledTimes(3);

    watcher.emit('unlink', '/snap/input.js');
    expect(log).toHaveBeenCalledWith('File removed: /snap/input.js');
    expect(legacyBuild).toHaveBeenCalledTimes(3);

    const watchError = new Error('foo');
    watcher.emit('error', watchError);
    expect(error).toHaveBeenCalledWith('Watcher error: foo', watchError);
    expect(legacyBuild).toHaveBeenCalledTimes(3);

    expect(evaluate).not.toHaveBeenCalled();
    expect(manifest).not.toHaveBeenCalled();
    expect(serveHandler).not.toHaveBeenCalled();
  });

  it('evaluates the bundle if configured', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation();

    const config = getMockConfig('browserify', {
      cliOptions: {
        src: '/snap/input.js',
        dist: '/snap',
        outfileName: 'bundle.js',
        eval: true,
        manifest: false,
        serve: false,
      },
    });

    await legacyWatch(config);

    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/Watching .+ for changes\.\.\./u),
    );

    const watch = chokidar.watch as jest.MockedFunction<typeof chokidar.watch>;
    const watcher: MockWatcher = watch.mock.results[0].value;

    watcher.emit('ready');
    await new Promise((resolve) => setTimeout(resolve, 1));

    expect(legacyBuild).toHaveBeenCalledTimes(1);
    expect(evaluate).toHaveBeenCalledTimes(1);
    expect(evaluate).toHaveBeenCalledWith('/snap/bundle.js');
  });

  it('checks the manifest if configured', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/snap');
    const log = jest.spyOn(console, 'log').mockImplementation();

    const config = getMockConfig('browserify', {
      cliOptions: {
        src: '/snap/input.js',
        eval: false,
        manifest: true,
        serve: false,
      },
    });

    await legacyWatch(config);

    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/Watching .+ for changes\.\.\./u),
    );

    const watch = chokidar.watch as jest.MockedFunction<typeof chokidar.watch>;
    const watcher: MockWatcher = watch.mock.results[0].value;

    watcher.emit('ready');
    await new Promise((resolve) => setTimeout(resolve, 1));

    expect(legacyBuild).toHaveBeenCalledTimes(1);
    expect(manifest).toHaveBeenCalledTimes(1);
    expect(manifest).toHaveBeenCalledWith('/snap/snap.manifest.json', true);
  });

  it('serves the bundle if configured', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/snap');
    const log = jest.spyOn(console, 'log').mockImplementation();

    const config = getMockConfig('browserify', {
      cliOptions: {
        src: '/snap/input.js',
        eval: false,
        manifest: true,
        serve: true,
      },
    });

    await legacyWatch(config);

    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/Watching .+ for changes\.\.\./u),
    );

    const watch = chokidar.watch as jest.MockedFunction<typeof chokidar.watch>;
    const watcher: MockWatcher = watch.mock.results[0].value;

    watcher.emit('ready');
    await new Promise((resolve) => setTimeout(resolve, 1));

    expect(legacyBuild).toHaveBeenCalledTimes(1);
    expect(serveHandler).toHaveBeenCalledTimes(1);
    expect(serveHandler).toHaveBeenCalledWith(config);
  });

  it('logs errors during the initial build', async () => {
    jest.spyOn(console, 'log').mockImplementation();
    const error = jest.spyOn(console, 'error').mockImplementation();

    const buildError = new Error('foo');
    const mock = legacyBuild as jest.MockedFunction<typeof legacyBuild>;
    mock.mockRejectedValueOnce(buildError);

    const config = getMockConfig('browserify', {
      cliOptions: {
        src: '/snap/input.js',
        eval: false,
        manifest: true,
        serve: false,
      },
    });

    await legacyWatch(config);

    const watch = chokidar.watch as jest.MockedFunction<typeof chokidar.watch>;
    const watcher: MockWatcher = watch.mock.results[0].value;

    watcher.emit('ready');
    await new Promise((resolve) => setTimeout(resolve, 1));

    expect(error).toHaveBeenCalledWith(
      'Error during initial build.',
      buildError,
    );
  });

  it('logs errors during file changes', async () => {
    jest.spyOn(console, 'log').mockImplementation();
    const error = jest.spyOn(console, 'error').mockImplementation();

    const mock = legacyBuild as jest.MockedFunction<typeof legacyBuild>;

    const config = getMockConfig('browserify', {
      cliOptions: {
        src: '/snap/input.js',
        eval: false,
        manifest: true,
        serve: false,
      },
    });

    await legacyWatch(config);

    const watch = chokidar.watch as jest.MockedFunction<typeof chokidar.watch>;
    const watcher: MockWatcher = watch.mock.results[0].value;

    watcher.emit('ready');
    await new Promise((resolve) => setTimeout(resolve, 1));

    expect(error).not.toHaveBeenCalled();

    const changeError = new Error('Change error.');
    mock.mockRejectedValueOnce(changeError);
    watcher.emit('change', '/snap/input.js');
    await new Promise((resolve) => setTimeout(resolve, 1));

    expect(error).toHaveBeenCalledWith(
      'Error while processing "/snap/input.js".',
      changeError,
    );

    const addError = new Error('Add error.');
    mock.mockRejectedValueOnce(addError);
    watcher.emit('add', '/snap/foo.js');
    await new Promise((resolve) => setTimeout(resolve, 1));

    expect(error).toHaveBeenCalledWith(
      'Error while processing "/snap/foo.js".',
      addError,
    );
  });

  it('checks if the source file exists', async () => {
    const config = getMockConfig('browserify', {
      cliOptions: {
        src: '/snap/foo.js',
      },
    });

    await expect(legacyWatch(config)).rejects.toThrow(
      "Invalid params: '/snap/foo.js' is not a file or does not exist.",
    );
  });
});
