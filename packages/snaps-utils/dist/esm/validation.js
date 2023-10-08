import { assertIsSnapIcon } from './icon';
import { assertIsSnapManifest } from './manifest/validation';
import { validateSnapShasum } from './snaps';
/**
 * Validates the files contained in a fetched snap.
 *
 * @param files - All potentially included files in a fetched snap.
 * @throws If any of the files are considered invalid.
 */ export function validateFetchedSnap(files) {
    assertIsSnapManifest(files.manifest.result);
    validateSnapShasum(files);
    if (files.svgIcon) {
        assertIsSnapIcon(files.svgIcon);
    }
}

//# sourceMappingURL=validation.js.map