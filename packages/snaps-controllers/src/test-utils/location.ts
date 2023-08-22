import type { SnapManifest } from '@metamask/snaps-utils';
import {
  VirtualFile,
  createSnapManifest,
  normalizeRelative,
} from '@metamask/snaps-utils';
import {
  DEFAULT_SNAP_BUNDLE,
  DEFAULT_SNAP_ICON,
  getSnapManifest,
} from '@metamask/snaps-utils/test-utils';
import { assert } from '@metamask/utils';

import type { SnapLocation } from '../snaps/location';

const MANIFEST_PATH = 'snap.manifest.json';

type LoopbackOptions = {
  /**
   * @default getSnapManifest()
   */
  manifest?: SnapManifest | VirtualFile<SnapManifest>;
  /**
   * @default [new VirtualFile({ value: DEFAULT_SNAP_BUNDLE, path: manifest.source.location.npm.filePath }]
   */
  files?: VirtualFile[];
  /**
   * @default false
   */
  shouldAlwaysReload?: boolean;
};

// Mirror NPM and HTTP implementation
const coerceManifest = (manifest: VirtualFile<SnapManifest>) => {
  manifest.result = createSnapManifest(manifest.result);
  return manifest;
};

export class LoopbackLocation implements SnapLocation {
  #manifest: VirtualFile<SnapManifest>;

  #files: VirtualFile[];

  #shouldAlwaysReload: boolean;

  constructor(opts: LoopbackOptions = {}) {
    const shouldAlwaysReload = opts.shouldAlwaysReload ?? false;
    const manifest = coerceManifest(
      opts.manifest instanceof VirtualFile
        ? opts.manifest
        : new VirtualFile({
            value: '',
            result: opts.manifest ?? getSnapManifest(),
            path: 'snap.manifest.json',
          }),
    );
    let files;
    if (opts.files === undefined) {
      files = [
        new VirtualFile({
          value: DEFAULT_SNAP_BUNDLE,
          path: normalizeRelative(manifest.result.source.location.npm.filePath),
        }),
      ];

      if (manifest.result.source.location.npm.iconPath !== undefined) {
        files.push(
          new VirtualFile({
            value: DEFAULT_SNAP_ICON,
            path: normalizeRelative(
              manifest.result.source.location.npm.iconPath,
            ),
          }),
        );
      }
    } else {
      files = opts.files;
      assert(
        files.find(
          (file) =>
            file.path ===
            normalizeRelative(manifest.result.source.location.npm.filePath),
        ) !== undefined,
        'Source bundle not found in files.',
      );

      assert(
        manifest.result.source.location.npm.iconPath === undefined ||
          files.find(
            (file) =>
              file.path ===
              normalizeRelative(
                manifest.result.source.location.npm.iconPath as string,
              ),
          ) !== undefined,
        'Icon not found in files.',
      );
    }

    assert(
      !files.find((file) => file.path === MANIFEST_PATH),
      'Manifest in fetch() files',
    );
    assert(manifest.path === MANIFEST_PATH, 'Manifest has wrong path.');

    this.#shouldAlwaysReload = shouldAlwaysReload;
    this.#manifest = manifest;
    this.#files = files;
  }

  /* eslint-disable @typescript-eslint/require-await */
  manifest = jest.fn(async () => this.#manifest);

  fetch = jest.fn(async (path: string) => {
    const relativePath = normalizeRelative(path);
    const file = this.#files.find(
      (candidate) => candidate.path === relativePath,
    );
    assert(
      file !== undefined,
      `Tried to access file "${path}" not found in loopback location mock.\nFile list:\n${this.#files
        .map((candidate) => `\t-> ${candidate.path}`)
        .join('\n')}`,
    );
    return file;
  });
  /* eslint-enable @typescript-eslint/require-await */

  get shouldAlwaysReload() {
    return this._shouldAlwaysReload();
  }

  _shouldAlwaysReload = jest.fn(() => this.#shouldAlwaysReload);
}

export const loopbackDetect = (
  opts: LoopbackOptions | LoopbackLocation = {},
) => {
  if (opts instanceof LoopbackLocation) {
    return jest.fn(() => opts);
  }
  return jest.fn(() => new LoopbackLocation(opts));
};
