import {
  LocalSnapIdStruct,
  SnapIdPrefixes,
  SnapManifest,
  VFile,
} from '@metamask/snaps-utils';
import { assert, assertStruct } from '@metamask/utils';

import HttpLocation from './http';
import { SnapLocation } from './location';

export default class LocalLocation implements SnapLocation {
  readonly #http: HttpLocation;

  constructor(url: URL) {
    assertStruct(url.toString(), LocalSnapIdStruct, 'Invalid Snap Id');
    this.#http = new HttpLocation(
      new URL(url.toString().slice(SnapIdPrefixes.local.length)),
    );
  }

  async manifest(): Promise<VFile<SnapManifest>> {
    const vfile = await this.#http.manifest();

    return convertCanonical(vfile);
  }

  async fetch(path: string): Promise<VFile> {
    return convertCanonical(await this.#http.fetch(path));
  }

  get shouldAlwaysReload() {
    return true;
  }
}

/**
 * Converts vfiles with canonical `http:` paths into `local:` paths.
 *
 * @param vfile - The {@link VFile} to convert.
 * @returns The same object with updated `.data.canonicalPath`.
 */
function convertCanonical<T>(vfile: VFile<T>): VFile<T> {
  assert(vfile.data.canonicalPath !== undefined);
  vfile.data.canonicalPath = `local:${vfile.data.canonicalPath}`;
  return vfile;
}
