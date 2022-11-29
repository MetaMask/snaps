import { VFile, SnapManifest } from '@metamask/snaps-utils';
import {
  DEFAULT_SNAP_BUNDLE,
  DEFAULT_SNAP_ICON,
  getSnapManifest,
} from '@metamask/snaps-utils/test-utils';
import { assert } from '@metamask/utils';
import { SnapLocation } from 'src/snaps/location';

const MANIFEST_PATH = './snap.manifest.json';

type LoopbackOptions = {
  /**
   * @default getSnapManifest()
   */
  manifest?: SnapManifest | VFile<SnapManifest>;
  /**
   * @default [new VFile({ value: DEFAULT_SNAP_BUNDLE, path: manifest.source.location.npm.filePath }]
   */
  files?: VFile[];
  /**
   * @default false
   */
  shouldAlwaysReload?: boolean;
};

const isVfile = (obj: unknown): obj is VFile<unknown> => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).value === 'string'
  );
};

export class LoopbackLocation implements SnapLocation {
  #manifest: VFile<SnapManifest>;

  #files: VFile[];

  #shouldAlwaysReload: boolean;

  constructor(opts: LoopbackOptions = {}) {
    const shouldAlwaysReload = opts.shouldAlwaysReload ?? false;
    const manifest = isVfile(opts.manifest)
      ? opts.manifest
      : new VFile({
          value: '',
          result: opts.manifest ?? getSnapManifest(),
          path: './snap.manifest.json',
        });
    let files;
    if (opts.files === undefined) {
      files = [
        new VFile({
          value: DEFAULT_SNAP_BUNDLE,
          path: manifest.result.source.location.npm.filePath,
        }),
      ];

      if (manifest.result.source.location.npm.iconPath !== undefined) {
        files.push(
          new VFile({
            value: DEFAULT_SNAP_ICON,
            path: manifest.result.source.location.npm.iconPath,
          }),
        );
      }
    } else {
      files = opts.files;
      assert(
        files.find(
          (file) => file.path === manifest.result.source.location.npm.filePath,
        ) !== undefined,
        'Source bundle not found in files.',
      );

      assert(
        manifest.result.source.location.npm.iconPath === undefined ||
          files.find(
            (file) =>
              file.path === manifest.result.source.location.npm.iconPath,
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
    const file = this.#files.find((candidate) => candidate.path === path);
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
