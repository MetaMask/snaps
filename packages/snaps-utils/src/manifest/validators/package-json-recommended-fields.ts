import type { ValidatorMeta } from '../validator-types';

const RECOMMENDED_FIELDS = ['repository'] as const;

/**
 * Checks if package.json contains recommended fields.
 */
export const packageJsonRecommendedFields: ValidatorMeta = {
  severity: 'warning',
  semanticCheck(files, context) {
    for (const recommendedField of RECOMMENDED_FIELDS) {
      if (!files.packageJson.result[recommendedField]) {
        context.report(
          `Missing recommended package.json property: "${recommendedField}"`,
        );
      }
    }
  },
};
