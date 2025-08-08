import { validate } from '@metamask/superstruct';

import { LocalizationFileStruct } from '../../localization';
import { getStructFailureMessage } from '../../structs';
import type { ValidatorMeta } from '../validator-types';

/**
 * Verify the structure of localization files.
 */
export const isLocalizationFile: ValidatorMeta = {
  severity: 'error',
  structureCheck(files, context) {
    for (const file of files.localizationFiles) {
      const [error] = validate(file.result, LocalizationFileStruct);

      if (error) {
        for (const failure of error.failures()) {
          context.report(
            `is-localization-file-${file.path}`,
            `Failed to validate localization file "${
              file.path
            }": ${getStructFailureMessage(
              LocalizationFileStruct,
              failure,
              false,
            )}`,
          );
        }
      }
    }
  },
};
