import assert from 'assert';
import { SnapManifest } from '@metamask/snaps-utils';
import { HttpLocation } from './http';
import { LocalLocation } from './local';
import { NpmLocation } from './npm';

export interface SnapLocation {
  // TODO(ritave): Package.json object
  manifest(): Promise<SnapManifest>;
  fetch(path: string): Promise<Blob>;

  readonly shouldAlwaysReload?: boolean;
}

/**
 * @param location
 * @param versionRange
 * @param opts
 */
export async function detectSnapLocation(
  location: string | URL,
  versionRange: string,
  opts = { allowHttp: false },
): Promise<SnapLocation> {
  const root = new URL(location);
  switch (root.protocol) {
    case 'npm:':
      return NpmLocation.create(root, versionRange);
    case 'local:':
      return new LocalLocation(root);
    case 'http:':
    case 'https:':
      assert(
        opts.allowHttp,
        new TypeError('Fetching snaps from external http/https is disabled.'),
      );
      return new HttpLocation(root);
    default:
      throw new TypeError(
        `Unrecognized "${root.protocol}" snap location protocol`,
      );
  }
}
