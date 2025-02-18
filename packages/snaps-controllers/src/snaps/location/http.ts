import type { SnapManifest } from '@metamask/snaps-utils';
import {
  VirtualFile,
  HttpSnapIdStruct,
  NpmSnapFileNames,
  createSnapManifest,
  normalizeRelative,
  parseJson,
} from '@metamask/snaps-utils';
import { assert, assertStruct } from '@metamask/utils';

import type { SnapLocation } from './location';

export type HttpOptions = {
  /**
   * @default fetch
   */
  fetch?: typeof fetch;
  fetchOptions?: RequestInit;
};

export class HttpLocation implements SnapLocation {
  private readonly cache = new Map<string, VirtualFile>();

  private validatedManifest?: VirtualFile<SnapManifest>;

  private readonly url: URL;

  private readonly fetchFn: typeof fetch;

  private readonly fetchOptions?: RequestInit;

  constructor(url: URL, opts: HttpOptions = {}) {
    assertStruct(url.toString(), HttpSnapIdStruct, 'Invalid Snap Id: ');
    this.fetchFn = opts.fetch ?? globalThis.fetch.bind(undefined);
    this.fetchOptions = opts.fetchOptions;
    this.url = url;
  }

  async manifest(): Promise<VirtualFile<SnapManifest>> {
    if (this.validatedManifest) {
      return this.validatedManifest.clone();
    }

    // jest-fetch-mock doesn't handle new URL(), we need to convert .toString()
    const canonicalPath = new URL(
      NpmSnapFileNames.Manifest,
      this.url,
    ).toString();

    const response = await this.fetchFn(canonicalPath, this.fetchOptions);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch "${canonicalPath}". Status code: ${response.status}.`,
      );
    }
    const contents = await response.text();
    const manifest = parseJson(contents);
    const vfile = new VirtualFile<SnapManifest>({
      value: contents,
      result: createSnapManifest(manifest),
      path: NpmSnapFileNames.Manifest,
      data: { canonicalPath },
    });
    this.validatedManifest = vfile;

    return this.manifest();
  }

  async fetch(path: string): Promise<VirtualFile> {
    const relativePath = normalizeRelative(path);
    const cached = this.cache.get(relativePath);
    if (cached !== undefined) {
      return cached.clone();
    }

    const canonicalPath = this.toCanonical(relativePath).toString();
    const response = await this.fetchFn(canonicalPath, this.fetchOptions);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch "${canonicalPath}". Status code: ${response.status}.`,
      );
    }
    const buffer = await response.arrayBuffer();
    const vfile = new VirtualFile({
      value: new Uint8Array(buffer),
      path: relativePath,
      data: { canonicalPath },
    });
    assert(
      !this.cache.has(relativePath),
      'Corrupted cache, multiple files with same path.',
    );
    this.cache.set(relativePath, vfile);

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
