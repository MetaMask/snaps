import {
  DEFAULT_SNAP_BUNDLE,
  getSnapManifest,
} from '@metamask/snaps-utils/test-utils';
import fetchMock from 'jest-fetch-mock';

import HttpLocation from './http';

fetchMock.enableMocks();

describe('HttpLocation', () => {
  it('loads the files', async () => {
    const base = 'http://foo.bar/foo/';
    const manifest = getSnapManifest();
    const manifestStr = JSON.stringify(manifest);

    fetchMock.mockResponses(manifestStr, DEFAULT_SNAP_BUNDLE);
    const location = new HttpLocation(new URL(base));

    expect(await location.manifest()).toStrictEqual(
      expect.objectContaining({ value: manifestStr, result: manifest }),
    );

    const bundle = await location.fetch(
      new URL(manifest.source.location.npm.filePath, base).toString(),
    );
    expect(bundle.toString()).toStrictEqual(DEFAULT_SNAP_BUNDLE);
  });
});
