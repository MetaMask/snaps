import { getMockConfig } from '@metamask/snaps-cli/test-utils';
import {
  DEFAULT_SNAP_BUNDLE,
  getPackageJson,
  getSnapManifest,
} from '@metamask/snaps-utils/test-utils';
import { promises as fs } from 'fs';

import { evaluate } from '../../eval';
import { manifest } from '../../manifest';
import { legacyBuild } from './build';
import { bundle } from './bundle';

jest.mock('fs');
jest.mock('./bundle');
jest.mock('../../eval');
jest.mock('../../manifest');

describe('legacyBuild', () => {
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

  it('builds the snap with Browserify', async () => {
    const config = getMockConfig('browserify', {
      cliOptions: {
        src: '/snap/input.js',
        dist: '/snap',
        outfileName: 'bundle.js',
        eval: false,
        manifest: false,
      },
    });

    await legacyBuild(config);

    expect(bundle).toHaveBeenCalledWith(config);
    expect(evaluate).not.toHaveBeenCalled();
    expect(manifest).not.toHaveBeenCalled();
  });

  it('evaluates the bundle if configured', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/snap');
    const mock = bundle as jest.MockedFunction<typeof bundle>;
    mock.mockResolvedValueOnce(true);

    const config = getMockConfig('browserify', {
      cliOptions: {
        src: '/snap/input.js',
        dist: '/snap',
        outfileName: 'bundle.js',
        eval: true,
        manifest: false,
      },
    });

    await legacyBuild(config);

    expect(bundle).toHaveBeenCalledWith(config);
    expect(evaluate).toHaveBeenCalledWith(
      expect.stringMatching(/.*bundle\.js.*/u),
    );
  });

  it('checks the manifest if configured', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/snap');
    const mock = bundle as jest.MockedFunction<typeof bundle>;
    mock.mockResolvedValueOnce(true);

    const config = getMockConfig('browserify', {
      cliOptions: {
        src: '/snap/input.js',
        dist: '/snap',
        outfileName: 'bundle.js',
        eval: false,
        manifest: true,
      },
    });

    await legacyBuild(config);

    expect(bundle).toHaveBeenCalledWith(config);
    expect(manifest).toHaveBeenCalledWith(
      expect.stringMatching(/.*snap\.manifest\.json.*/u),
      true,
    );
  });
});
