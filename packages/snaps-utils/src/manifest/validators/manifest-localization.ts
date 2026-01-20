import { getErrorMessage } from '@metamask/snaps-sdk';

import type { LocalizationFile } from '../../localization';
import { getLocalizedSnapManifest } from '../../localization';
import type { ValidatorMeta } from '../validator-types';

/**
 * Verify whether the localization files localize the manifest correctly.
 */
export const manifestLocalization: ValidatorMeta = {
  severity: 'error',
  semanticCheck(files, context) {
    const manifest = files.manifest.mergedManifest;
    const localizations: LocalizationFile[] = files.localizationFiles.map(
      (file) => file.result,
    );
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
          'manifest-localization',
          `Failed to localize Snap manifest: ${getErrorMessage(error)}`,
        );
      }
    }
  },
};
