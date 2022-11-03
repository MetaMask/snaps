import { assert } from '@metamask/utils';
import { SnapLocation } from './location';

export class HttpLocation implements SnapLocation {
  private cache = new Map<string, Blob>();
  private validatedManifest?: any;

  constructor(private url: URL) {
    assert(url.protocol === 'http:' || url.protocol === 'https:');
  }

  async manifest(): Promise<unknown> {
    if (this.validatedManifest) {
      return this.validatedManifest;
    }

    const manifest = await (await fetch(this.url)).json();
    this.validatedManifest = manifest;
    return manifest;
  }

  async fetch(path: string): Promise<Blob> {
    const canonical = this.toCanonical(path);
    const cached = this.cache.get(canonical.href);
    if (cached) {
      return cached;
    }
    const response = await fetch(canonical);
    const blob = await response.blob();
    this.cache.set(canonical.href, blob);
    return blob;
  }

  get root(): URL {
    return new URL(this.url);
  }

  private toCanonical(path: string): URL {
    return new URL(path, this.url);
  }
}
