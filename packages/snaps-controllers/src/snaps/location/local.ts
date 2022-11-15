import { SnapManifest } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import { HttpLocation } from './http';
import { SnapLocation } from './location';

export const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

export class LocalLocation implements SnapLocation {
  private http: HttpLocation;

  constructor(url: URL) {
    assert(url.protocol === 'local:');
    assert(
      isLocalHost(url),
      new TypeError('local: protocol, but hostname is not localhost'),
    );
    const httpUrl = new URL(url);
    httpUrl.protocol = 'http:';
    this.http = new HttpLocation(httpUrl);
  }

  manifest(): Promise<SnapManifest> {
    return this.http.manifest();
  }

  fetch(path: string): Promise<Blob> {
    return this.http.fetch(path);
  }

  get shouldAlwaysReload() {
    return true;
  }
}

/**
 * Returns whether the `url` param is local or not.
 *
 * @param url - Url to check.
 * @returns Whether the param is local.
 */
function isLocalHost(url: URL): boolean {
  return LOCALHOST_HOSTNAMES.has(url.hostname);
}
