import { validate } from 'superstruct';

import { LocalizationFileStruct } from '../../localization';
import type { ValidatorMeta } from '../validator-types';

/**
 * Verifies the structure of localization files.
 */
export const isLocalizationFile: ValidatorMeta = {
  severity: 'error',
  structureCheck(files, context) {
    for (const file of files.localizationFiles) {
      const [error] = validate(file.result, LocalizationFileStruct);

      if (error) {
        context.report(
          `Failed to validate localization file "${file.path}": ${error.message}.`,
        );
      }
    }
  },
};
