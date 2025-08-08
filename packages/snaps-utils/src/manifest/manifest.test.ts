import { promises as fs } from 'fs';
import fetchMock from 'jest-fetch-mock';
import { join } from 'path';

import {
  checkManifest,
  getSnapFilePaths,
  getSnapFiles,
  getSnapIcon,
  getSnapSourceCode,
  getWritableManifest,
  runFixes,
} from './manifest';
import type { SnapManifest } from './validation';
import { runValidators } from './validator';
import type { ValidatorMeta } from './validator-types';
import { readJsonFile } from '../fs';
import { getPlatformVersion } from '../platform-version';
import { getSnapChecksum } from '../snaps';
import {
  DEFAULT_SNAP_BUNDLE,
  DEFAULT_SNAP_ICON,
  MOCK_AUXILIARY_FILE,
  getPackageJson,
  getSnapManifest,
  getMockLocalizationFile,
  getMockSnapFilesWithUpdatedChecksum,
  getMockSnapFiles,
} from '../test-utils';
import { NpmSnapFileNames } from '../types';

jest.mock('fs');
jest.mock('../fs', () => ({
  ...jest.requireActual('../fs'),
  useFileSystemCache:
    <Type>(_key: string, _ttl: number, fn: () => Promise<Type>) =>
    async () =>
      fn(),
}));

const BASE_PATH = '/snap';
const MANIFEST_PATH = join(BASE_PATH, NpmSnapFileNames.Manifest);
const PACKAGE_JSON_PATH = join(BASE_PATH, NpmSnapFileNames.PackageJson);

const MOCK_GITHUB_RESPONSE = JSON.stringify({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  target_commitish: '5fceb7ed2ef18a3984786db1161a76ca5c8e15b9',
});

const MOCK_PACKAGE_JSON = JSON.stringify({
  dependencies: {
    '@metamask/snaps-sdk': getPlatformVersion(),
  },
});

/**
 * Get the default manifest for the current platform version.
 *
 * @returns The default manifest.
 */
// TODO: When we support top-level await, we can make this a constant variable,
//       and remove this function.
async function getDefaultManifest() {
  const { manifest } = await getMockSnapFilesWithUpdatedChecksum({
    manifest: getSnapManifest({
      platformVersion: getPlatformVersion(),
    }),
  });

  return manifest.result;
}

/**
 * Clears out all the files in the in-memory file system, and writes the default
 * files to the `BASE_PATH` folder, including sub-folders.
 */
async function resetFileSystem() {
  await fs.rm(BASE_PATH, { recursive: true, force: true });

  // Create `dist`, `src` and `images` folders.
  await fs.mkdir(join(BASE_PATH, 'dist'), { recursive: true });
  await fs.mkdir(join(BASE_PATH, 'images'), { recursive: true });
  await fs.mkdir(join(BASE_PATH, 'src'), { recursive: true });

  // Write default files.
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(await getDefaultManifest()));
  await fs.writeFile(PACKAGE_JSON_PATH, JSON.stringify(getPackageJson()));
  await fs.writeFile(join(BASE_PATH, 'dist/bundle.js'), DEFAULT_SNAP_BUNDLE);
  await fs.writeFile(join(BASE_PATH, 'images/icon.svg'), DEFAULT_SNAP_ICON);
  await fs.writeFile(join(BASE_PATH, 'src/foo.json'), MOCK_AUXILIARY_FILE);
}

describe('checkManifest', () => {
  beforeEach(async () => {
    fetchMock.enableMocks();
    fetchMock.mockResponses(MOCK_GITHUB_RESPONSE, MOCK_PACKAGE_JSON);

    await resetFileSystem();
  });

  afterAll(() => {
    fetchMock.disableMocks();
  });

  it('returns the status and warnings after processing', async () => {
    const { updated, reports } = await checkManifest(BASE_PATH);
    expect(reports).toHaveLength(0);
    expect(updated).toBe(false);
  });

  it('updates and writes the manifest', async () => {
    await fs.writeFile(
      MANIFEST_PATH,
      JSON.stringify(
        getSnapManifest({
          shasum: '29MYwcRiruhy9BEJpN/TBIhxoD3t0P4OdXztV9rW8tc=',
          platformVersion: getPlatformVersion(),
        }),
      ),
    );

    const { files, updated, reports } = await checkManifest(BASE_PATH);
    const unfixed = reports.filter((report) => !report.wasFixed);
    const fixed = reports.filter((report) => report.wasFixed);

    const defaultManifest = await getDefaultManifest();

    expect(files?.manifest.result).toStrictEqual(defaultManifest);
    expect(updated).toBe(true);
    expect(unfixed).toHaveLength(0);
    expect(fixed).toHaveLength(1);

    const file = await readJsonFile<SnapManifest>(MANIFEST_PATH);
    const { source } = file.result;
    expect(source.shasum).toBe(defaultManifest.source.shasum);
  });

  it('fixes multiple problems in the manifest', async () => {
    await fs.writeFile(
      MANIFEST_PATH,
      JSON.stringify(
        getSnapManifest({
          version: '0.0.1',
          shasum: '29MYwcRiruhy9BEJpN/TBIhxoD3t0P4OdXztV9rW8tc=',
          platformVersion: getPlatformVersion(),
        }),
      ),
    );

    const { files, updated, reports } = await checkManifest(BASE_PATH);
    const unfixed = reports.filter((report) => !report.wasFixed);
    const fixed = reports.filter((report) => report.wasFixed);

    const defaultManifest = await getDefaultManifest();

    expect(files?.manifest.result).toStrictEqual(defaultManifest);
    expect(updated).toBe(true);
    expect(unfixed).toHaveLength(0);
    expect(fixed).toHaveLength(2);

    const file = await readJsonFile<SnapManifest>(MANIFEST_PATH);
    const { source, version } = file.result;
    expect(source.shasum).toBe(defaultManifest.source.shasum);
    expect(version).toBe('1.0.0');
  });

  it('includes new validation warnings', async () => {
    fetchMock.mockResponseOnce(MOCK_GITHUB_RESPONSE).mockResponseOnce(
      JSON.stringify({
        dependencies: {
          '@metamask/snaps-sdk': '1.0.0',
        },
      }),
    );

    const manifest = getSnapManifest({
      shasum: '29MYwcRiruhy9BEJpN/TBIhxoD3t0P4OdXztV9rW8tc=',
    });
    delete manifest.platformVersion;

    await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest));

    const { files, updated, reports } = await checkManifest(BASE_PATH);
    const unfixed = reports.filter((report) => !report.wasFixed);
    const fixed = reports.filter((report) => report.wasFixed);

    const defaultManifest = await getDefaultManifest();

    expect(files?.manifest.result).toStrictEqual(defaultManifest);
    expect(updated).toBe(true);

    expect(unfixed).toHaveLength(1);
    expect(unfixed).toContainEqual({
      id: 'production-platform-version',
      severity: 'warning',
      message: expect.stringContaining(
        'The current maximum supported version is "1.0.0". To resolve this, downgrade `@metamask/snaps-sdk` to a compatible version.',
      ),
    });

    expect(fixed).toHaveLength(2);
    expect(fixed).toContainEqual({
      id: 'platform-version-missing',
      severity: 'error',
      message: expect.stringContaining(
        'The "platformVersion" field is missing from the manifest.',
      ),
      wasFixed: true,
    });

    expect(fixed).toContainEqual({
      id: 'checksum',
      severity: 'error',
      message: expect.stringContaining(
        '"snap.manifest.json" "shasum" field does not match computed shasum.',
      ),
      wasFixed: true,
    });

    const file = await readJsonFile<SnapManifest>(MANIFEST_PATH);
    const { source, version } = file.result;
    expect(source.shasum).toBe(defaultManifest.source.shasum);
    expect(version).toBe('1.0.0');
  });

  it('returns a warning if package.json is missing recommended fields', async () => {
    const { repository, ...packageJson } = getPackageJson();

    await fs.writeFile(PACKAGE_JSON_PATH, JSON.stringify(packageJson));

    const { updated, reports } = await checkManifest(BASE_PATH);

    const warnings = reports.filter(({ severity }) => severity === 'warning');

    expect(updated).toBe(true);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].message).toMatch(
      'Missing recommended package.json property: "repository"',
    );
  });

  it('returns a warning if manifest has no defined icon', async () => {
    const manifest = getSnapManifest();

    // Remove icon
    manifest.source.location.npm.iconPath = undefined;

    await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest));

    const { reports } = await checkManifest(BASE_PATH);
    const warnings = reports.filter(({ severity }) => severity === 'warning');
    expect(warnings).toHaveLength(1);
    expect(warnings[0].message).toMatch(
      'No icon found in the Snap manifest. It is recommended to include an icon for the Snap. See https://docs.metamask.io/snaps/how-to/design-a-snap/#guidelines-at-a-glance for more information.',
    );
  });

  it('returns a warning if manifest has with a non 1:1 ratio', async () => {
    const manifest = getSnapManifest({
      platformVersion: getPlatformVersion(),
    });

    await fs.writeFile(
      join(BASE_PATH, 'images/icon.svg'),
      '<svg height="24" width="25" />',
    );
    await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest));

    const { reports } = await checkManifest(BASE_PATH);
    const warnings = reports.filter(({ severity }) => severity === 'warning');
    expect(warnings).toHaveLength(1);
    expect(warnings[0].message).toMatch(
      'The icon in the Snap manifest is not square. It is recommended to use a square icon for the Snap.',
    );
  });

  it('return errors if the manifest is invalid', async () => {
    const manifest = getSnapManifest({
      version: '0.0.1',
      shasum: '1234567890123456789012345678901234567890123=',
      platformVersion: getPlatformVersion(),
    });

    await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest));

    const { reports } = await checkManifest(BASE_PATH, {
      updateAndWriteManifest: false,
    });

    const expectedChecksum = await getSnapChecksum(
      getMockSnapFiles({
        manifest,
      }),
    );

    expect(reports).toHaveLength(2);
    // Make this test order independent
    // eslint-disable-next-line jest/prefer-strict-equal
    expect(reports.map(({ message }) => message)).toEqual(
      expect.arrayContaining([
        '"snap.manifest.json" npm package version ("0.0.1") does not match the "package.json" "version" field ("1.0.0").',
        `"snap.manifest.json" "shasum" field does not match computed shasum. Got "1234567890123456789012345678901234567890123=", expected "${expectedChecksum}".`,
      ]),
    );
  });

  it('throws an error if the localization files cannot be loaded', async () => {
    await fs.writeFile(
      MANIFEST_PATH,
      JSON.stringify(
        getSnapManifest({
          locales: ['foo.json'],
          platformVersion: getPlatformVersion(),
        }),
      ),
    );

    await expect(checkManifest(BASE_PATH)).rejects.toThrow(
      "Failed to read snap files: ENOENT: no such file or directory, open '/snap/foo.json'",
    );
  });

  it('returns an error if the localization files are invalid', async () => {
    const localizationFile = getMockLocalizationFile({
      locale: 'en',
      // @ts-expect-error - Invalid type.
      messages: 'foo',
    });

    const { manifest } = await getMockSnapFilesWithUpdatedChecksum({
      manifest: getSnapManifest({
        locales: ['locales/en.json'],
        platformVersion: getPlatformVersion(),
      }),
      localizationFiles: [localizationFile],
    });

    await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest.result));
    await fs.mkdir(join(BASE_PATH, 'locales'));
    await fs.writeFile(
      join(BASE_PATH, 'locales/en.json'),
      JSON.stringify(localizationFile),
    );

    const { reports } = await checkManifest(BASE_PATH);
    expect(reports.map(({ message }) => message)).toStrictEqual([
      'Failed to validate localization file "/snap/locales/en.json": At path: messages — Expected a value of type record, but received: "foo".',
    ]);
  });

  it('returns an error if the localization files are missing translations', async () => {
    const localizationFile = getMockLocalizationFile({
      locale: 'en',
      messages: {},
    });

    const { manifest } = await getMockSnapFilesWithUpdatedChecksum({
      manifest: getSnapManifest({
        proposedName: '{{ name }}',
        locales: ['locales/en.json'],
        platformVersion: getPlatformVersion(),
      }),
      localizationFiles: [localizationFile],
    });

    await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest.result));
    await fs.mkdir(join(BASE_PATH, 'locales'));
    await fs.writeFile(
      join(BASE_PATH, 'locales/en.json'),
      JSON.stringify(localizationFile),
    );

    const { reports } = await checkManifest(BASE_PATH);
    expect(reports.map(({ message }) => message)).toStrictEqual([
      'Failed to localize Snap manifest: Failed to translate "{{ name }}": No translation found for "name" in "en" file.',
    ]);
  });

  it('throws an error if the localization file is not valid JSON', async () => {
    await fs.writeFile(
      MANIFEST_PATH,
      JSON.stringify(
        getSnapManifest({
          locales: ['locales/en.json'],
        }),
      ),
    );
    await fs.mkdir(join(BASE_PATH, 'locales'));
    await fs.writeFile(join(BASE_PATH, '/locales/en.json'), ',');

    await expect(checkManifest(BASE_PATH)).rejects.toThrow(
      'Failed to parse localization file "/snap/locales/en.json" as JSON.',
    );
  });

  it('throws an error if writing the manifest fails', async () => {
    const manifest = getSnapManifest({ version: '0.0.1' });
    await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest));

    jest.spyOn(fs, 'writeFile').mockImplementation(() => {
      throw new Error('foo');
    });

    await expect(checkManifest(BASE_PATH)).rejects.toThrow(
      'Failed to update "snap.manifest.json": foo',
    );
  });
});

describe('runFixes', () => {
  it('returns correctly if fixing fails', async () => {
    // A rule that is fixable but always fails
    // This will force the runFixes to run more than MAX_ATTEMPTS
    const rule: ValidatorMeta = {
      severity: 'error',
      semanticCheck(_, context) {
        context.report('always-fail', 'Always fail', (files) => files);
      },
    };

    const files = getMockSnapFiles();

    const validatorResults = await runValidators(files, [rule]);
    const fixesResults = await runFixes(validatorResults, [rule]);

    expect(fixesResults).toStrictEqual({
      files,
      updated: false,
      reports: [
        { id: 'always-fail', severity: 'error', message: 'Always fail' },
      ],
    });
  });
});

describe('getSnapSourceCode', () => {
  beforeEach(async () => {
    await resetFileSystem();
  });

  it('returns the source code for a snap', async () => {
    const file = await getSnapSourceCode(BASE_PATH, getSnapManifest());
    expect(file?.value).toBe(DEFAULT_SNAP_BUNDLE);
  });

  it('returns the source code override if passed', async () => {
    const file = await getSnapSourceCode(BASE_PATH, getSnapManifest(), 'foo');
    expect(file?.value).toBe('foo');
  });

  it.each([
    [],
    {},
    undefined,
    null,
    { source: {} },
    { source: { location: {} } },
    { source: { location: { npm: {} } } },
  ])('returns undefined if an invalid manifest is passed', async (manifest) => {
    // @ts-expect-error Invalid manifest type.
    expect(await getSnapSourceCode(BASE_PATH, manifest)).toBeUndefined();
  });

  it('throws an error if the source code cannot be read', async () => {
    jest.spyOn(fs, 'readFile').mockImplementation(() => {
      throw new Error('foo');
    });

    await expect(
      getSnapSourceCode(BASE_PATH, getSnapManifest()),
    ).rejects.toThrow('Failed to read snap bundle file: foo');
  });
});

describe('getSnapIcon', () => {
  beforeEach(async () => {
    await resetFileSystem();
  });

  it('returns the icon for a snap', async () => {
    const file = await getSnapIcon(BASE_PATH, getSnapManifest());
    expect(file?.value).toBe(DEFAULT_SNAP_ICON);
  });

  it.each([
    [],
    {},
    undefined,
    null,
    { source: {} },
    { source: { location: {} } },
    { source: { location: { npm: {} } } },
  ])('returns undefined if an invalid manifest is passed', async (manifest) => {
    // @ts-expect-error Invalid manifest type.
    expect(await getSnapIcon(BASE_PATH, manifest)).toBeUndefined();
  });

  it('throws an error if the file cannot be read', async () => {
    jest.spyOn(fs, 'readFile').mockImplementation(() => {
      throw new Error('foo');
    });

    await expect(getSnapIcon(BASE_PATH, getSnapManifest())).rejects.toThrow(
      'Failed to read snap icon file: foo',
    );
  });
});

describe('getSnapFilePaths', () => {
  it.each([
    [],
    {},
    undefined,
    null,
    { source: {} },
    {
      source: {
        files: {},
      },
    },
    { source: { location: {} } },
    { source: { location: { npm: {} } } },
  ])('returns undefined if an invalid manifest is passed', async (manifest) => {
    expect(
      // @ts-expect-error - Invalid manifest type.
      getSnapFilePaths(manifest, ({ source }) => source?.files),
    ).toBeUndefined();
  });

  it('returns the snap file paths', async () => {
    expect(
      getSnapFilePaths(
        getSnapManifest({
          files: ['./src/foo.json'],
        }),
        ({ source }) => source?.files,
      ),
    ).toStrictEqual(['./src/foo.json']);
  });
});

describe('getSnapFiles', () => {
  beforeEach(async () => {
    await resetFileSystem();
  });

  it('returns the auxiliary files for a snap', async () => {
    const files = await getSnapFiles(BASE_PATH, ['./src/foo.json']);
    expect(files?.[0]?.value).toBe(MOCK_AUXILIARY_FILE);
  });

  it('returns the file in the specified encoding', async () => {
    const files = await getSnapFiles(BASE_PATH, ['./src/foo.json'], null);
    expect(files?.[0]?.value).toBeInstanceOf(Uint8Array);
    expect(files?.[0]?.value.toString()).toBe(MOCK_AUXILIARY_FILE);
  });

  it('throws an error if the file cannot be read', async () => {
    jest.spyOn(fs, 'readFile').mockImplementation(() => {
      throw new Error('foo');
    });

    await expect(getSnapFiles(BASE_PATH, ['./src/foo.json'])).rejects.toThrow(
      'Failed to read snap files: foo',
    );
  });
});

describe('getWritableManifest', () => {
  it('sorts the manifest keys', () => {
    // This reverses the order of the keys in the manifest.
    const manifest = Object.fromEntries(
      Object.entries(getSnapManifest()).reverse(),
    );

    const writableManifest = getWritableManifest(manifest as SnapManifest);
    expect(Object.keys(writableManifest)).toStrictEqual(
      Object.keys(getSnapManifest()),
    );
  });
});
