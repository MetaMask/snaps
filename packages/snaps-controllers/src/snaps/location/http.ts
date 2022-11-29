import {
  SnapManifest,
  assertIsSnapManifest,
  VFile,
  HttpSnapIdStruct,
} from '@metamask/snaps-utils';
import { assert, assertStruct } from '@metamask/utils';

import { ensureRelative } from '../../utils';
import { SnapLocation } from './location';

export default class HttpLocation implements SnapLocation {
  // We keep contents separate because then we can use only one Blob in cache,
  // which we convert to Uint8Array when actually returning the file.
  //
  // That avoids deepCloning file contents.
  // I imagine ArrayBuffers are copy-on-write optimized, meaning
  // in most often case we'll only have one file contents in common case.
  private readonly cache = new Map<string, { file: VFile; contents: Blob }>();

  private validatedManifest?: VFile<SnapManifest>;

  private readonly url: URL;

  constructor(url: URL) {
    assertStruct(url.toString(), HttpSnapIdStruct, 'Invalid Snap Id: ');
    this.url = url;
  }

  async manifest(): Promise<VFile<SnapManifest>> {
    if (this.validatedManifest) {
      return this.validatedManifest.clone();
    }

    // jest-fetch-mock doesn't handle new URL(), we need to convert this.url.toString()
    const contents = await (await fetch(this.url.toString())).text();
    const manifest = JSON.parse(contents);
    assertIsSnapManifest(manifest);
    const vfile = new VFile<SnapManifest>({
      value: contents,
      result: manifest,
      path: './snap.manifest.json',
      data: { canonicalPath: this.url.toString() },
    });
    this.validatedManifest = vfile;

    return this.manifest();
  }

  async fetch(path: string): Promise<VFile> {
    const relativePath = ensureRelative(path);
    const cached = this.cache.get(relativePath);
    if (cached !== undefined) {
      const { file, contents } = cached;
      const value = new Uint8Array(await contents.arrayBuffer());
      const vfile = file.clone();
      vfile.value = value;
      return vfile;
    }

    const canonicalPath = this.toCanonical(relativePath).toString();
    const response = await fetch(canonicalPath);
    const vfile = new VFile({
      value: '',
      path: relativePath,
      data: { canonicalPath },
    });
    const blob = await response.blob();
    assert(
      !this.cache.has(relativePath),
      'Corrupted cache, multiple files with same path.',
    );
    this.cache.set(relativePath, { file: vfile, contents: blob });

    return this.fetch(relativePath);
  }

  get root(): URL {
    return new URL(this.url);
  }

  private toCanonical(path: string): URL {
    assert(!path.startsWith('/'), 'Tried to parse absolute path.');
    return new URL(path, this.url);
  }
}
