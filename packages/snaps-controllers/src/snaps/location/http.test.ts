import {
  DEFAULT_SNAP_BUNDLE,
  getSnapManifest,
} from '@metamask/snaps-utils/test-utils';
import fetchMock from 'jest-fetch-mock';

import { HttpLocation } from './http';

fetchMock.enableMocks();

describe('HttpLocation', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('loads the files', async () => {
    const base = 'http://foo.bar/foo/';
    const manifest = getSnapManifest();
    const manifestStr = JSON.stringify(manifest);

    fetchMock.mockResponses(manifestStr, DEFAULT_SNAP_BUNDLE);
    const location = new HttpLocation(new URL(base));

    expect(await location.manifest()).toStrictEqual(
      expect.objectContaining({ value: manifestStr, result: manifest }),
    );

    const bundle = await location.fetch(manifest.source.location.npm.filePath);
    expect(bundle.toString()).toStrictEqual(DEFAULT_SNAP_BUNDLE);
  });

  it('returns proper root', () => {
    const base = 'http://foo.bar/foo/';
    expect(new HttpLocation(new URL(base)).root.toString()).toStrictEqual(base);
  });

  it.each([
    [
      'http://foo.bar/foo',
      {
        manifest: 'http://foo.bar/snap.manifest.json',
        bundle: 'http://foo.bar/foo.js',
      },
    ],
    [
      'http://foo.bar/foo/',
      {
        manifest: 'http://foo.bar/foo/snap.manifest.json',
        bundle: 'http://foo.bar/foo/foo.js',
      },
    ],
  ])('sets paths properly', async (base, canonical) => {
    fetchMock.mockResponses(
      JSON.stringify(getSnapManifest()),
      DEFAULT_SNAP_BUNDLE,
    );

    const location = new HttpLocation(new URL(base));
    const manifest = await location.manifest();
    const bundle = await location.fetch('./foo.js');

    expect(manifest.path).toBe('./snap.manifest.json');
    expect(bundle.path).toBe('./foo.js');
    expect(manifest.data.canonicalPath).toBe(canonical.manifest);
    expect(bundle.data.canonicalPath).toBe(canonical.bundle);
  });

  it.each([
    ['http://foo.bar/foo', 'http://foo.bar/snap.manifest.json'],
    ['https://foo.bar/foo', 'https://foo.bar/snap.manifest.json'],
    ['http://foo.bar/foo/', 'http://foo.bar/foo/snap.manifest.json'],
  ])('fetches manifest from proper location', async (base, actuallyFetched) => {
    fetchMock.mockResponses(JSON.stringify(getSnapManifest()));

    await new HttpLocation(new URL(base)).manifest();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenNthCalledWith(1, actuallyFetched, undefined);
  });
});
