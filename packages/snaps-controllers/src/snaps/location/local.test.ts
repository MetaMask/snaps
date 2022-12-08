import {
  DEFAULT_SNAP_BUNDLE,
  getSnapManifest,
} from '@metamask/snaps-utils/test-utils';
import fetchMock from 'jest-fetch-mock';

import { LocalLocation } from './local';

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
    [
      'local:http://localhost/foo',
      {
        manifest: 'local:http://localhost/snap.manifest.json',
        bundle: 'local:http://localhost/foo.js',
      },
    ],
    [
      'local:http://127.0.0.1/foo/',
      {
        manifest: 'local:http://127.0.0.1/foo/snap.manifest.json',
        bundle: 'local:http://127.0.0.1/foo/foo.js',
      },
    ],
    [
      'local:https://user:pass@[::1]:8080/foo/bar',
      {
        manifest: 'local:https://user:pass@[::1]:8080/foo/snap.manifest.json',
        bundle: 'local:https://user:pass@[::1]:8080/foo/foo.js',
      },
    ],
  ])('sets paths properly for %s', async (base, canonical) => {
    fetchMock.mockResponses(
      JSON.stringify(getSnapManifest()),
      DEFAULT_SNAP_BUNDLE,
    );
    const location = new LocalLocation(new URL(base));
    const manifest = await location.manifest();
    const bundle = await location.fetch('./foo.js');

    expect(manifest.path).toBe('snap.manifest.json');
    expect(bundle.path).toBe('foo.js');
    expect(manifest.data.canonicalPath).toBe(canonical.manifest);
    expect(bundle.data.canonicalPath).toBe(canonical.bundle);
  });

  it.each([
    ['local:http://localhost/foo', 'http://localhost/snap.manifest.json'],
    ['local:https://localhost/foo', 'https://localhost/snap.manifest.json'],
    ['local:http://localhost/foo/', 'http://localhost/foo/snap.manifest.json'],
  ])('fetches manifest from proper location', async (base, actuallyFetched) => {
    fetchMock.mockResponses(JSON.stringify(getSnapManifest()));

    await new LocalLocation(new URL(base)).manifest();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      actuallyFetched,
      expect.anything(),
    );
  });

  it.each(['local:http://localhost', 'local:https://localhost'])(
    'fetches with caching disabled',
    async (url) => {
      fetchMock.mockResponses(DEFAULT_SNAP_BUNDLE);

      await new LocalLocation(new URL(url)).fetch('./foo.js');

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.objectContaining({ cache: 'no-cache' }),
      );
    },
  );
});
