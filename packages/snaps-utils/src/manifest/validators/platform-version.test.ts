import type { SemVerVersion } from '@metamask/utils';
import assert from 'assert';
import { createRequire } from 'module';

import { platformVersion } from './platform-version';
import { getMockSnapFiles, getSnapManifest } from '../../test-utils';

describe('platformVersion', () => {
  const require = createRequire(__filename);
  const packageJson = require.resolve('@metamask/snaps-sdk/package.json');
  // eslint-disable-next-line import-x/no-dynamic-require
  const sdkVersion = require(packageJson).version;

  it('does nothing if the version matches', async () => {
    const report = jest.fn();
    assert(platformVersion.semanticCheck);

    await platformVersion.semanticCheck(
      getMockSnapFiles({
        manifest: getSnapManifest({ platformVersion: sdkVersion }),
        manifestPath: __filename,
      }),
      { report },
    );

    expect(report).toHaveBeenCalledTimes(0);
  });

  it('reports if the version is not set', async () => {
    const report = jest.fn();
    assert(platformVersion.semanticCheck);

    const rawManifest = getSnapManifest();
    delete rawManifest.platformVersion;

    const files = getMockSnapFiles({
      manifest: rawManifest,
      manifestPath: __filename,
    });

    await platformVersion.semanticCheck(files, { report });

    expect(report).toHaveBeenCalledTimes(1);
    expect(report).toHaveBeenCalledWith(
      'platform-version-missing',
      expect.stringContaining(
        `The "platformVersion" field is missing from the manifest.`,
      ),
      expect.any(Function),
    );

    const fix = report.mock.calls[0][2];
    expect(fix).toBeInstanceOf(Function);
    assert(fix);

    const { manifest } = await fix(files);
    expect(manifest.platformVersion).toStrictEqual(sdkVersion);
  });

  it('reports if the version does not match', async () => {
    const report = jest.fn();
    assert(platformVersion.semanticCheck);

    const files = getMockSnapFiles({
      manifest: getSnapManifest({
        platformVersion: '1.2.3' as SemVerVersion,
      }),
      manifestPath: __filename,
    });

    await platformVersion.semanticCheck(files, { report });

    expect(report).toHaveBeenCalledTimes(1);
    expect(report).toHaveBeenCalledWith(
      'platform-version-mismatch',
      expect.stringContaining(
        `The "platformVersion" field in the manifest must match the version of the Snaps SDK. Got "1.2.3", expected "${sdkVersion}".`,
      ),
      expect.any(Function),
    );

    const fix = report.mock.calls[0][2];
    expect(fix).toBeInstanceOf(Function);
    assert(fix);

    const { manifest } = await fix(files);
    expect(manifest.platformVersion).toStrictEqual(sdkVersion);
  });
});
