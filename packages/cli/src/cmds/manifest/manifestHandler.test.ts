import { promises as fs } from 'fs';
import {
  NpmSnapFileNames,
  SnapValidationFailureReason,
} from '@metamask/snap-utils';
import {
  DEFAULT_SNAP_BUNDLE,
  FakeFsError,
  getPackageJson,
  getSnapManifest,
  resetSnapsGlobal,
} from '../../../test/utils';
import * as utils from '../../utils';
import * as manifestHandlerModule from './manifestHandler';
import manifestModule from '.';

jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
    readFile: jest.fn(),
  },
}));

jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  readJsonFile: jest.fn(),
}));

const getMockArgv = ({ writeManifest = true } = {}) => {
  return { writeManifest } as any;
};

const stringifyManifest = (manifest: any) =>
  `${JSON.stringify(
    manifestHandlerModule.getWritableManifest(manifest),
    null,
    2,
  )}\n`;

describe('manifest', () => {
  globalThis.console = {
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
  } as any;

  afterEach(resetSnapsGlobal);

  const { manifestHandler } = manifestHandlerModule;
  const readJsonFileMock = utils.readJsonFile as jest.Mock;

  it('manifest handler: success', async () => {
    const foobar = { foo: 'bar' };
    const manifestHandlerMock = jest
      .spyOn(manifestHandlerModule, 'manifestHandler')
      .mockImplementation();

    await (manifestModule as any).handler({ ...(foobar as any) });
    expect(manifestHandlerMock).toHaveBeenCalledWith(foobar);
  });

  it('manifest handler: failure', async () => {
    const foobar = { foo: 'bar' };
    const manifestHandlerMock = jest
      .spyOn(manifestHandlerModule, 'manifestHandler')
      .mockImplementation(() => {
        throw new Error('manifest failure');
      });

    jest.spyOn(console, 'error').mockImplementation();

    await expect(
      (manifestModule as any).handler({ ...(foobar as any) }),
    ).rejects.toThrow('manifest failure');
    expect(manifestHandlerMock).toHaveBeenCalledWith(foobar);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('successfully validates a snap.manifest.json file', async () => {
    readJsonFileMock
      .mockImplementationOnce(() => Promise.resolve(getSnapManifest()))
      .mockImplementationOnce(() => Promise.resolve(getPackageJson()));

    jest
      .spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(DEFAULT_SNAP_BUNDLE));

    jest.spyOn(fs, 'readFile').mockImplementationOnce(async () => 'sourceCode');

    await manifestHandler(getMockArgv());

    expect(readJsonFileMock).toHaveBeenCalledTimes(2);
    expect(readJsonFileMock).toHaveBeenNthCalledWith(
      1,
      NpmSnapFileNames.Manifest,
    );

    expect(readJsonFileMock).toHaveBeenNthCalledWith(
      2,
      NpmSnapFileNames.PackageJson,
    );

    expect(fs.readFile).toHaveBeenCalledTimes(2);
    expect(fs.readFile).toHaveBeenNthCalledWith(1, 'dist/bundle.js', 'utf8');

    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenNthCalledWith(
      1,
      NpmSnapFileNames.Manifest,
      stringifyManifest(getSnapManifest()),
    );

    expect(console.log).toHaveBeenLastCalledWith(
      `Manifest Success: Validated snap.manifest.json!`,
    );
  });

  it('successfully validates a snap.manifest.json file when writeManifest is false', async () => {
    readJsonFileMock
      .mockImplementationOnce(() => Promise.resolve(getSnapManifest()))
      .mockImplementationOnce(() => Promise.resolve(getPackageJson()));

    jest
      .spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(DEFAULT_SNAP_BUNDLE));

    jest.spyOn(fs, 'readFile').mockImplementationOnce(async () => 'sourceCode');

    await manifestHandler(getMockArgv({ writeManifest: false }));

    expect(readJsonFileMock).toHaveBeenCalledTimes(2);
    expect(readJsonFileMock).toHaveBeenNthCalledWith(
      1,
      NpmSnapFileNames.Manifest,
    );

    expect(readJsonFileMock).toHaveBeenNthCalledWith(
      2,
      NpmSnapFileNames.PackageJson,
    );

    expect(fs.readFile).toHaveBeenCalledTimes(2);
    expect(fs.readFile).toHaveBeenNthCalledWith(1, 'dist/bundle.js', 'utf8');

    expect(fs.writeFile).not.toHaveBeenCalled();

    expect(console.log).toHaveBeenLastCalledWith(
      `Manifest Success: Validated snap.manifest.json!`,
    );
  });

  it('successfully validates a snap.manifest.json file with warnings', async () => {
    readJsonFileMock
      .mockImplementationOnce(() =>
        Promise.resolve(getSnapManifest({ repository: null })),
      )
      .mockImplementationOnce(() =>
        Promise.resolve(getPackageJson({ repository: null })),
      );

    jest
      .spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(DEFAULT_SNAP_BUNDLE));

    jest.spyOn(fs, 'readFile').mockImplementationOnce(async () => 'sourceCode');

    await manifestHandler(getMockArgv());

    expect(readJsonFileMock).toHaveBeenCalledTimes(2);
    expect(readJsonFileMock).toHaveBeenNthCalledWith(
      1,
      NpmSnapFileNames.Manifest,
    );

    expect(readJsonFileMock).toHaveBeenNthCalledWith(
      2,
      NpmSnapFileNames.PackageJson,
    );

    expect(fs.readFile).toHaveBeenCalledTimes(2);
    expect(fs.readFile).toHaveBeenNthCalledWith(1, 'dist/bundle.js', 'utf8');

    const expectedManifest = getSnapManifest();
    delete expectedManifest.repository;

    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenNthCalledWith(
      1,
      NpmSnapFileNames.Manifest,
      stringifyManifest(expectedManifest),
    );

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenNthCalledWith(
      1,
      'Manifest Warning: Missing recommended package.json properties:\n\trepository\n',
    );

    expect(console.log).toHaveBeenLastCalledWith(
      `Manifest Warning: Validation of snap.manifest.json completed with warnings. See above.`,
    );
  });

  it('suppresses warnings if commanded', async () => {
    readJsonFileMock
      .mockImplementationOnce(() =>
        Promise.resolve(getSnapManifest({ repository: null })),
      )
      .mockImplementationOnce(() =>
        Promise.resolve(getPackageJson({ repository: null })),
      );

    jest
      .spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(DEFAULT_SNAP_BUNDLE));

    jest.spyOn(fs, 'readFile').mockImplementationOnce(async () => 'sourceCode');

    global.snaps.suppressWarnings = true;

    await manifestHandler(getMockArgv());

    expect(readJsonFileMock).toHaveBeenCalledTimes(2);
    expect(readJsonFileMock).toHaveBeenNthCalledWith(
      1,
      NpmSnapFileNames.Manifest,
    );

    expect(readJsonFileMock).toHaveBeenNthCalledWith(
      2,
      NpmSnapFileNames.PackageJson,
    );

    expect(fs.readFile).toHaveBeenCalledTimes(2);
    expect(fs.readFile).toHaveBeenNthCalledWith(1, 'dist/bundle.js', 'utf8');

    const expectedManifest = getSnapManifest();
    delete expectedManifest.repository;

    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenNthCalledWith(
      1,
      NpmSnapFileNames.Manifest,
      stringifyManifest(expectedManifest),
    );

    expect(console.warn).not.toHaveBeenCalled();

    expect(console.log).toHaveBeenLastCalledWith(
      `Manifest Success: Validated snap.manifest.json!`,
    );
  });

  describe('file and schema validation failures', () => {
    it('throws if a JSON file does not exist', async () => {
      readJsonFileMock.mockImplementationOnce(() =>
        Promise.reject(new FakeFsError('foo', 'ENOENT')),
      );

      await expect(manifestHandler(getMockArgv())).rejects.toThrow(
        /Could not find 'snap.manifest.json'/u,
      );

      expect(readJsonFileMock).toHaveBeenCalledTimes(1);
      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        1,
        NpmSnapFileNames.Manifest,
      );

      expect(fs.readFile).not.toHaveBeenCalled();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('throws if reading a JSON file fails for an unknown reason', async () => {
      readJsonFileMock.mockImplementationOnce(() =>
        Promise.reject(new Error('foo')),
      );

      await expect(manifestHandler(getMockArgv())).rejects.toThrow(
        /Manifest Error: foo/u,
      );

      expect(readJsonFileMock).toHaveBeenCalledTimes(1);
      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        1,
        NpmSnapFileNames.Manifest,
      );

      expect(fs.readFile).not.toHaveBeenCalled();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('throws on missing snap.manifest.json', async () => {
      readJsonFileMock.mockImplementationOnce(() => Promise.resolve(''));

      await expect(manifestHandler(getMockArgv())).rejects.toThrow(
        /Missing file "snap.manifest.json"/u,
      );

      expect(readJsonFileMock).toHaveBeenCalledTimes(2);
      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        1,
        NpmSnapFileNames.Manifest,
      );

      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        2,
        NpmSnapFileNames.PackageJson,
      );

      expect(fs.readFile).not.toHaveBeenCalled();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('throws on missing package.json', async () => {
      readJsonFileMock
        .mockImplementationOnce(() => Promise.resolve(getSnapManifest()))
        .mockImplementationOnce(() => Promise.resolve(''));

      jest
        .spyOn(fs, 'readFile')
        .mockImplementationOnce(() => Promise.resolve(DEFAULT_SNAP_BUNDLE));

      jest
        .spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => 'sourceCode');

      await expect(manifestHandler(getMockArgv())).rejects.toThrow(
        /Missing file "package.json"/u,
      );

      expect(readJsonFileMock).toHaveBeenCalledTimes(2);
      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        1,
        NpmSnapFileNames.Manifest,
      );

      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        2,
        NpmSnapFileNames.PackageJson,
      );

      expect(fs.readFile).toHaveBeenCalledTimes(2);
      expect(fs.readFile).toHaveBeenNthCalledWith(1, 'dist/bundle.js', 'utf8');
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('throws on missing Snap bundle (empty file)', async () => {
      readJsonFileMock
        .mockImplementationOnce(() => Promise.resolve(getSnapManifest()))
        .mockImplementationOnce(() => Promise.resolve(getPackageJson()));

      jest
        .spyOn(fs, 'readFile')
        .mockImplementationOnce(() => Promise.resolve(''));

      jest
        .spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => 'sourceCode');

      await expect(manifestHandler(getMockArgv())).rejects.toThrow(
        /Missing file "source code bundle"/u,
      );

      expect(readJsonFileMock).toHaveBeenCalledTimes(2);
      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        1,
        NpmSnapFileNames.Manifest,
      );

      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        2,
        NpmSnapFileNames.PackageJson,
      );

      expect(fs.readFile).toHaveBeenCalledTimes(2);
      expect(fs.readFile).toHaveBeenNthCalledWith(1, 'dist/bundle.js', 'utf8');
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('throws on missing Snap bundle (no path given in manifest)', async () => {
      const manifest = getSnapManifest();
      delete (manifest as any).source;

      readJsonFileMock
        .mockImplementationOnce(() => Promise.resolve(manifest))
        .mockImplementationOnce(() => Promise.resolve(getPackageJson()));

      await expect(manifestHandler(getMockArgv())).rejects.toThrow(
        /Missing file "source code bundle"/u,
      );

      expect(readJsonFileMock).toHaveBeenCalledTimes(2);
      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        1,
        NpmSnapFileNames.Manifest,
      );

      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        2,
        NpmSnapFileNames.PackageJson,
      );

      expect(fs.readFile).not.toHaveBeenCalled();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('throws if reading Snap bundle fails', async () => {
      readJsonFileMock
        .mockImplementationOnce(() => Promise.resolve(getSnapManifest()))
        .mockImplementationOnce(() => Promise.resolve(getPackageJson()));

      jest
        .spyOn(fs, 'readFile')
        .mockImplementationOnce(() => Promise.reject(new Error('foo')));

      await expect(manifestHandler(getMockArgv())).rejects.toThrow(
        /Failed to read Snap bundle file: foo/u,
      );

      expect(readJsonFileMock).toHaveBeenCalledTimes(2);
      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        1,
        NpmSnapFileNames.Manifest,
      );

      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        2,
        NpmSnapFileNames.PackageJson,
      );

      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(fs.readFile).toHaveBeenNthCalledWith(1, 'dist/bundle.js', 'utf8');
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('throws on invalid snap.manifest.json', async () => {
      const manifest = getSnapManifest();
      delete (manifest as any).initialPermissions;

      readJsonFileMock
        .mockImplementationOnce(() => Promise.resolve(manifest))
        .mockImplementationOnce(() => Promise.resolve(getPackageJson()));

      jest
        .spyOn(fs, 'readFile')
        .mockImplementationOnce(() => Promise.resolve(DEFAULT_SNAP_BUNDLE));

      jest
        .spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => 'sourceCode');

      await expect(manifestHandler(getMockArgv())).rejects.toThrow(
        /must have required property 'initialPermissions'/u,
      );

      expect(readJsonFileMock).toHaveBeenCalledTimes(2);
      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        1,
        NpmSnapFileNames.Manifest,
      );

      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        2,
        NpmSnapFileNames.PackageJson,
      );

      expect(fs.readFile).toHaveBeenCalledTimes(2);
      expect(fs.readFile).toHaveBeenNthCalledWith(1, 'dist/bundle.js', 'utf8');
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('throws on invalid package.json', async () => {
      readJsonFileMock
        .mockImplementationOnce(() => Promise.resolve(getSnapManifest()))
        .mockImplementationOnce(() => Promise.resolve({ name: 'foo' }));

      jest
        .spyOn(fs, 'readFile')
        .mockImplementationOnce(() => Promise.resolve(DEFAULT_SNAP_BUNDLE));

      jest
        .spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => 'sourceCode');

      await expect(manifestHandler(getMockArgv())).rejects.toThrow(
        /must have required property 'version'/u,
      );

      expect(readJsonFileMock).toHaveBeenCalledTimes(2);
      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        1,
        NpmSnapFileNames.Manifest,
      );

      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        2,
        NpmSnapFileNames.PackageJson,
      );

      expect(fs.readFile).toHaveBeenCalledTimes(2);
      expect(fs.readFile).toHaveBeenNthCalledWith(1, 'dist/bundle.js', 'utf8');
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });

  it('fixes programmatically fixable errors', async () => {
    const invalidInputs = [
      [
        getSnapManifest({ version: '1.0.0' }),
        getPackageJson({ version: '2.0.0' }),
        { version: '2.0.0' },
      ],
      [
        getSnapManifest({ packageName: '@metamask/foo' }),
        getPackageJson({ name: '@metamask/bar' }),
        { packageName: '@metamask/bar' },
      ],
      // package.json will get a repository value by default
      [getSnapManifest({ repository: null }), getPackageJson(), undefined],
      [
        getSnapManifest(),
        getPackageJson({ repository: null }),
        { repository: null },
        true,
      ],
      [
        getSnapManifest({
          // some arbitrary shasum
          shasum: 'E6zix83iLyn2rscE7YOrB7SMOZb8puugyVXY8utuUAA=',
        }),
        getPackageJson(),
        undefined,
      ],
    ] as const;

    for (const [
      manifest,
      packageJson,
      correctManifestParams,
      hasWarnings,
    ] of invalidInputs) {
      readJsonFileMock
        .mockImplementationOnce(() => Promise.resolve(manifest))
        .mockImplementationOnce(() => Promise.resolve(packageJson));

      jest
        .spyOn(fs, 'readFile')
        .mockImplementationOnce(() => Promise.resolve(DEFAULT_SNAP_BUNDLE));

      jest
        .spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => 'sourceCode');

      await manifestHandler(getMockArgv());

      expect(readJsonFileMock).toHaveBeenCalledTimes(2);
      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        1,
        NpmSnapFileNames.Manifest,
      );

      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        2,
        NpmSnapFileNames.PackageJson,
      );

      expect(fs.readFile).toHaveBeenCalledTimes(2);
      expect(fs.readFile).toHaveBeenNthCalledWith(1, 'dist/bundle.js', 'utf8');

      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenNthCalledWith(
        1,
        NpmSnapFileNames.Manifest,
        stringifyManifest(getSnapManifest(correctManifestParams)),
      );

      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenNthCalledWith(
        1,
        'Manifest: Updated snap.manifest.json',
      );

      expect(console.log).toHaveBeenNthCalledWith(
        2,
        hasWarnings
          ? expect.stringMatching(/^Manifest Warning: /u)
          : `Manifest Success: Validated snap.manifest.json!`,
      );
      jest.resetAllMocks();
    }
  });

  it('throws for programmatically fixable errors if writeManifest is false', async () => {
    const invalidInputs = [
      [
        getSnapManifest({ version: '1.0.0' }),
        getPackageJson({ version: '2.0.0' }),
        SnapValidationFailureReason.VersionMismatch,
      ],
      [
        getSnapManifest({ packageName: '@metamask/foo' }),
        getPackageJson({ name: '@metamask/bar' }),
        SnapValidationFailureReason.NameMismatch,
      ],
      // package.json will get a repository value by default
      [
        getSnapManifest({ repository: null }),
        getPackageJson(),
        SnapValidationFailureReason.RepositoryMismatch,
      ],
      [
        getSnapManifest({
          // some arbitrary shasum
          shasum: 'E6zix83iLyn2rscE7YOrB7SMOZb8puugyVXY8utuUAA=',
        }),
        getPackageJson(),
        SnapValidationFailureReason.ShasumMismatch,
      ],
    ];

    for (const [manifest, packageJson, failureReason] of invalidInputs) {
      readJsonFileMock
        .mockImplementationOnce(() => Promise.resolve(manifest))
        .mockImplementationOnce(() => Promise.resolve(packageJson));

      jest
        .spyOn(fs, 'readFile')
        .mockImplementationOnce(() => Promise.resolve(DEFAULT_SNAP_BUNDLE));

      jest
        .spyOn(fs, 'readFile')
        .mockImplementationOnce(async () => 'sourceCode');

      await expect(
        manifestHandler(getMockArgv({ writeManifest: false })),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.any(String),
          reason: failureReason,
        }),
      );

      expect(readJsonFileMock).toHaveBeenCalledTimes(2);
      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        1,
        NpmSnapFileNames.Manifest,
      );

      expect(readJsonFileMock).toHaveBeenNthCalledWith(
        2,
        NpmSnapFileNames.PackageJson,
      );

      expect(fs.readFile).toHaveBeenCalledTimes(2);
      expect(fs.readFile).toHaveBeenNthCalledWith(1, 'dist/bundle.js', 'utf8');

      expect(fs.writeFile).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();

      jest.resetAllMocks();
    }
  });

  it('throws if updating the manifest fails', async () => {
    readJsonFileMock
      .mockImplementationOnce(() => Promise.resolve(getSnapManifest()))
      .mockImplementationOnce(() => Promise.resolve(getPackageJson()));

    jest
      .spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(DEFAULT_SNAP_BUNDLE));

    jest.spyOn(fs, 'readFile').mockImplementationOnce(async () => 'sourceCode');

    jest.spyOn(fs, 'writeFile').mockImplementationOnce(() => {
      throw new Error('foo');
    });

    await expect(manifestHandler(getMockArgv())).rejects.toThrow(
      /Failed to update snap\.manifest\.json: foo/u,
    );

    expect(readJsonFileMock).toHaveBeenCalledTimes(2);
    expect(readJsonFileMock).toHaveBeenNthCalledWith(
      1,
      NpmSnapFileNames.Manifest,
    );

    expect(readJsonFileMock).toHaveBeenNthCalledWith(
      2,
      NpmSnapFileNames.PackageJson,
    );

    expect(fs.readFile).toHaveBeenCalledTimes(2);
    expect(fs.readFile).toHaveBeenNthCalledWith(1, 'dist/bundle.js', 'utf8');

    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenNthCalledWith(
      1,
      NpmSnapFileNames.Manifest,
      stringifyManifest(getSnapManifest()),
    );
  });
});
