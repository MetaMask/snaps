import { assertIsSnapIcon } from './icon';
import { validateSnapManifestLocalizations } from './localization';
import { assertIsSnapManifest } from './manifest/validation';
import { validateSnapShasum } from './snaps';
import type { FetchedSnapFiles } from './types';

/**
 * Validates the files contained in a fetched snap.
 *
 * @param files - All potentially included files in a fetched snap.
 * @throws If any of the files are considered invalid.
 */
export function validateFetchedSnap(files: FetchedSnapFiles): void {
  assertIsSnapManifest(files.manifest.result);
  validateSnapShasum(files);
  validateSnapManifestLocalizations(
    files.manifest.result,
    files.localizationFiles.map((file) => file.result),
  );

  if (files.svgIcon) {
    assertIsSnapIcon(files.svgIcon);
  }
}
