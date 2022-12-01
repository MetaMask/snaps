import {
  DEFAULT_SNAP_BUNDLE,
  getSnapManifest,
} from '@metamask/snaps-utils/test-utils';
import fetchMock from 'jest-fetch-mock';

import LocalLocation from './local';

fetchMock.enableMocks();

describe('LocalLocation', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('fetches files', async () => {
    const manifest = getSnapManifest();
    const manifestStr = JSON.stringify(manifest);
    fetchMock.mockResponses(manifestStr, DEFAULT_SNAP_BUNDLE);
    const location = new LocalLocation(new URL('local:http://localhost'));

    expect(await location.manifest()).toStrictEqual(
      expect.objectContaining({ value: manifestStr, result: manifest }),
    );
    const bundle = (
      await location.fetch(manifest.source.location.npm.filePath)
    ).toString();
    expect(bundle).toBe(DEFAULT_SNAP_BUNDLE);
  });

  it('signals that it should be reloaded', () => {
    expect(
      new LocalLocation(new URL('local:http://localhost')).shouldAlwaysReload,
    ).toBe(true);
  });

  it.each([
    ['local:http://localhost/foo', 'local:http://localhost/foo.js'],
    ['local:http://127.0.0.1/foo/', 'local:http://127.0.0.1/foo/foo.js'],
    [
      'local:https://user:pass@[::1]:8080/foo/bar',
      'local:https://user:pass@[::1]:8080/foo/foo.js',
    ],
  ])('sets canonical path properly', async (base, canonical) => {
    fetchMock.mockResponses(DEFAULT_SNAP_BUNDLE);
    const file = await new LocalLocation(new URL(base)).fetch('./foo.js');
    expect(file.data.canonicalPath).toBe(canonical);
  });
});
