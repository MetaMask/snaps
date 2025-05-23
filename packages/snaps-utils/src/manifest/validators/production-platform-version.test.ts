import type { SemVerVersion } from '@metamask/utils';
import assert from 'assert';
import fetchMock from 'jest-fetch-mock';

import { productionPlatformVersion } from './production-platform-version';
import { getMockSnapFiles, getSnapManifest } from '../../test-utils';

jest.mock('fs');

const MOCK_GITHUB_RESPONSE = JSON.stringify({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  target_commitish: '5fceb7ed2ef18a3984786db1161a76ca5c8e15b9',
});

const MOCK_PACKAGE_JSON = JSON.stringify({
  dependencies: {
    '@metamask/snaps-sdk': '6.1.0',
  },
});

describe('productionPlatformVersion', () => {
  beforeAll(() => {
    fetchMock.enableMocks();
  });

  afterAll(() => {
    fetchMock.disableMocks();
  });

  it('reports if the version is greater than the production version', async () => {
    fetchMock.mockResponses(MOCK_GITHUB_RESPONSE, MOCK_PACKAGE_JSON);

    const report = jest.fn();
    assert(productionPlatformVersion.semanticCheck);

    await productionPlatformVersion.semanticCheck(
      getMockSnapFiles({
        manifest: getSnapManifest({
          platformVersion: '6.5.0' as SemVerVersion,
        }),
      }),
      { report },
    );

    expect(report).toHaveBeenCalledTimes(1);
  });

  it('does nothing if the version is less than the production version', async () => {
    fetchMock.mockResponses(MOCK_GITHUB_RESPONSE, MOCK_PACKAGE_JSON);

    const report = jest.fn();
    assert(productionPlatformVersion.semanticCheck);

    await productionPlatformVersion.semanticCheck(
      getMockSnapFiles({
        manifest: getSnapManifest({
          platformVersion: '6.0.0' as SemVerVersion,
        }),
      }),
      { report },
    );

    expect(report).toHaveBeenCalledTimes(0);
  });

  it('does nothing if the version is equal to the production version', async () => {
    fetchMock.mockResponses(MOCK_GITHUB_RESPONSE, MOCK_PACKAGE_JSON);

    const report = jest.fn();
    assert(productionPlatformVersion.semanticCheck);

    await productionPlatformVersion.semanticCheck(
      getMockSnapFiles({
        manifest: getSnapManifest({
          platformVersion: '6.1.0' as SemVerVersion,
        }),
      }),
      { report },
    );

    expect(report).toHaveBeenCalledTimes(0);
  });

  it('does nothing if the version is not set', async () => {
    const report = jest.fn();
    assert(productionPlatformVersion.semanticCheck);

    const rawManifest = getSnapManifest();
    delete rawManifest.platformVersion;

    const files = getMockSnapFiles({
      manifest: rawManifest,
    });

    await productionPlatformVersion.semanticCheck(files, { report });

    expect(report).toHaveBeenCalledTimes(0);
  });

  it('does nothing if the request to check the production version fails', async () => {
    fetchMock.mockResponse('', { status: 404 });

    const report = jest.fn();
    assert(productionPlatformVersion.semanticCheck);

    const files = getMockSnapFiles();

    await productionPlatformVersion.semanticCheck(files, { report });

    expect(report).toHaveBeenCalledTimes(0);
  });
});
