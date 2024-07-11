import { assert } from '@metamask/utils';
import { parseJson } from 'src/json';
import { LocalizationFileStruct } from 'src/localization';
import { validate } from 'superstruct';

import type { ValidatorMeta } from '../validator-types';

/**
 * Verifies the structure of localization files.
 */
export const isLocalizationFile: ValidatorMeta = {
  severity: 'error',
  validationCheck(files, context) {
    for (const file of files.localizationFiles) {
      try {
        const [error] = validate(
          parseJson(file.toString()),
          LocalizationFileStruct,
        );
        if (error) {
          context.report(
            `Failed to validate localization file "${file.path}": ${error.message}.`,
          );
        }
      } catch (error) {
        assert(error instanceof SyntaxError);
        context.report(
          `Failed to parse localization file "${file.path}" as JSON.`,
        );
      }
    }
  },
};
