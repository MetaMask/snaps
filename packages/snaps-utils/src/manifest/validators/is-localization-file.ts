import { assert } from '@metamask/utils';
import { validate } from 'superstruct';

import { parseJson } from '../../json';
import { LocalizationFileStruct } from '../../localization';
import type { ValidatorMeta } from '../validator-types';

/**
 * Verifies the structure of localization files.
 */
export const isLocalizationFile: ValidatorMeta = {
  severity: 'error',
  structureCheck(files, context) {
    for (const file of files.localizationFiles) {
      try {
        const [error, localization] = validate(
          parseJson(file.toString()),
          LocalizationFileStruct,
        );
        // TODO(ritave): Validators shouldn't modify files, figure out a way
        //               to validate JSON as well as update the file
        file.result = localization;
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
