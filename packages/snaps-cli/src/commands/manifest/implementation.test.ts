import {
  DEFAULT_SNAP_BUNDLE,
  getPackageJson,
  getSnapManifest,
} from '@metamask/snaps-utils/test-utils';
import normalFs from 'fs';
import ora from 'ora';

import type * as webpack from '../../webpack';
import { manifest } from './implementation';

const { promises: fs } = normalFs;

jest.mock('fs');

jest.mock('../../webpack', () => ({
  ...jest.requireActual('../../webpack'),
  getCompiler: jest.fn<
    ReturnType<typeof webpack.getCompiler>,
    Parameters<typeof webpack.getCompiler>
  >(async (...args) => {
    const compiler = await jest
      .requireActual<typeof webpack>('../../webpack')
      .getCompiler(...args);

    compiler.inputFileSystem = normalFs;
    compiler.outputFileSystem = normalFs;

    return compiler;
  }),
}));

describe('manifest', () => {
  beforeEach(async () => {
    await fs.mkdir('/snap/dist', { recursive: true });
    await fs.writeFile('/snap/dist/bundle.js', DEFAULT_SNAP_BUNDLE);
    await fs.writeFile(
      '/snap/snap.manifest.json',
      JSON.stringify(
        getSnapManifest({
          shasum: 'G/W5b2JZVv+epgNX9pkN63X6Lye9EJVJ4NLSgAw/afc=',
        }),
      ),
    );
    await fs.writeFile('/snap/package.json', JSON.stringify(getPackageJson()));
    await fs.mkdir('/snap/images');
    await fs.writeFile('/snap/images/icon.svg', '<svg></svg>');
  });

  afterEach(async () => {
    await fs.rm('/snap', { force: true, recursive: true });
  });

  it('validates a snap manifest', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation();
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const log = jest.spyOn(console, 'log').mockImplementation();

    const spinner = ora();
    const result = await manifest('/snap/snap.manifest.json', false, spinner);
    expect(result).toBe(true);

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it('validates a snap manifest with errors', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation();
    const warn = jest.spyOn(console, 'warn').mockImplementation();

    const packageJson = getPackageJson();
    delete packageJson.repository;

    await fs.writeFile('/snap/package.json', JSON.stringify(packageJson));

    const spinner = ora();
    const result = await manifest('/snap/snap.manifest.json', false, spinner);
    expect(result).toBe(false);

    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(
        '• Missing recommended package.json property: "repository"',
      ),
    );
    expect(spinner.stop).toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      expect.stringMatching('The snap manifest file is invalid.'),
    );
    expect(error).toHaveBeenCalledWith(
      expect.stringMatching(
        '• "snap.manifest.json" "repository" field does not match the "package.json" "repository" field.',
      ),
    );
  });

  it('validates a snap manifest with warnings', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation();
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const log = jest.spyOn(console, 'log').mockImplementation();

    const packageJson = getPackageJson();
    delete packageJson.repository;

    await fs.writeFile('/snap/package.json', JSON.stringify(packageJson));

    const spinner = ora();
    const result = await manifest('/snap/snap.manifest.json', true, spinner);
    expect(result).toBe(true);

    expect(error).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(
        '• Missing recommended package.json property: "repository"',
      ),
    );
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching('The snap manifest file has been updated.'),
    );
  });

  it('formats a snap manifest with Prettier', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation();
    const log = jest.spyOn(console, 'log').mockImplementation();

    await fs.writeFile(
      '/snap/snap.manifest.json',
      JSON.stringify(
        getSnapManifest({
          shasum: 'G/W5b2JZVv+epgNX9pkN63X6Lye9EJVJ4NLSgAw/afd=',
          initialPermissions: {
            'endowment:name-lookup': {
              chains: ['eip155:1', 'eip155:2', 'eip155:3'],
            },
          },
        }),
      ),
    );

    const spinner = ora();
    const result = await manifest('/snap/snap.manifest.json', true, spinner);
    expect(result).toBe(true);

    expect(error).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching('The snap manifest file has been updated.'),
    );

    expect(await fs.readFile('/snap/snap.manifest.json', 'utf8'))
      .toMatchInlineSnapshot(`
      "{
        "version": "1.0.0",
        "description": "The test example snap!",
        "proposedName": "@metamask/example-snap",
        "repository": {
          "type": "git",
          "url": "https://github.com/MetaMask/example-snap.git"
        },
        "source": {
          "shasum": "d4W7f1lzpVGMj8jjCn1lYhhHmKc/9TSk5QLH5ldKQoI=",
          "location": {
            "npm": {
              "filePath": "dist/bundle.js",
              "packageName": "@metamask/example-snap",
              "registry": "https://registry.npmjs.org",
              "iconPath": "images/icon.svg"
            }
          }
        },
        "initialPermissions": {
          "endowment:name-lookup": {
            "chains": ["eip155:1", "eip155:2", "eip155:3"]
          }
        },
        "manifestVersion": "0.1"
      }
      "
    `);
  });
});
