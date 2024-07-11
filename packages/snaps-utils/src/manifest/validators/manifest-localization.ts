import { getErrorMessage } from '@metamask/snaps-sdk';
import { getLocalizedSnapManifest } from 'src/localization';

import type { ValidatorMeta } from '../validator-types';

/**
 * Verifies the localization files localize the manifest correctly.
 */
export const manifestLocalization: ValidatorMeta = {
  severity: 'error',
  validatedCheck(files, context) {
    const manifest = files.manifest.result;
    const localizations = files.localizationFiles.map((file) => file.result);
    const locales = [
      'en', // The manifest must be able to be localized in English.
      ...localizations
        .map(({ locale }) => locale)
        .filter((locale) => locale !== 'en'),
    ];

    for (const locale of locales) {
      try {
        getLocalizedSnapManifest(manifest, locale, localizations);
      } catch (error) {
        context.report(
          `Failed to localize Snap manifest: ${getErrorMessage(error)}`,
        );
      }
    }
  },
};
