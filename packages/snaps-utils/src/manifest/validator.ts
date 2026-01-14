import { assert } from '@metamask/utils';

import type {
  ValidatorContext,
  ValidatorContextOptions,
  ValidatorFix,
  ValidatorMeta,
  ValidatorReport,
  ValidatorSeverity,
} from './validator-types';
import * as defaultValidators from './validators';
import type { UnvalidatedSnapFiles, ExtendableSnapFiles } from '../types';

export type ValidatorResults = {
  files?: ExtendableSnapFiles;
  reports: ValidatorReport[];
};

class Context implements ValidatorContext {
  reports: ValidatorReport[] = [];

  readonly #options: ValidatorContextOptions = {};

  #nextSeverity?: ValidatorSeverity = undefined;

  /**
   * Construct a new validator context.
   *
   * @param options - The options for the validator context.
   * @param options.exports - Exports detected by evaluating the bundle.
   */
  constructor(options: ValidatorContextOptions) {
    this.#options = options;
  }

  /**
   * Report a validation error or warning.
   *
   * @param id - The unique identifier for the report.
   * @param message - The message describing the validation issue.
   * @param fix - An optional fix function that can be used to automatically
   * resolve the issue.
   */
  report(id: string, message: string, fix?: ValidatorFix): void {
    assert(this.#nextSeverity !== undefined);

    this.reports.push({
      id,
      message,
      fix,
      severity: this.#nextSeverity,
    });
  }

  prepareForValidator(settings: { severity: ValidatorSeverity }) {
    this.#nextSeverity = settings.severity;
  }

  get hasErrors() {
    return this.reports.some((report) => report.severity === 'error');
  }

  get options() {
    return this.#options;
  }
}

/**
 * Verify that snap files are completely valid.
 * First it runs validators on unparsed files to check structure.
 * Secondly it runs validators on parsed files to check semantics.
 *
 * @param files - All files required to run a snap.
 * @param rules - Validators to run.
 * @param options - Options for the validation.
 * @param options.exports - Exports detected by evaluating the bundle.
 * @returns The validation results.
 */
// TODO(ritave): snap.manifest.json and package.json should check
//               json parsing as well instead of assuming it's
//               already parsed
export async function runValidators(
  files: UnvalidatedSnapFiles,
  rules: ValidatorMeta[] = Object.values(defaultValidators),
  options: ValidatorContextOptions = {},
): Promise<ValidatorResults> {
  const context = new Context(options);

  for (const rule of rules) {
    context.prepareForValidator({
      severity: rule.severity,
    });

    await rule.structureCheck?.(files, context);
  }

  if (context.hasErrors) {
    return {
      reports: context.reports,
    };
  }

  for (const rule of rules) {
    context.prepareForValidator({
      severity: rule.severity,
    });

    await rule.semanticCheck?.(files as ExtendableSnapFiles, context);
  }

  return {
    files: files as ExtendableSnapFiles,
    reports: context.reports,
  };
}

/**
 * Check whether a report is fixable.
 *
 * @param report - The report to check.
 * @param errorsOnly - Whether to only consider errors for fixability.
 * @returns Whether the report is fixable.
 */
export function isReportFixable(report: ValidatorReport, errorsOnly?: boolean) {
  return Boolean(report.fix && (!errorsOnly || report.severity === 'error'));
}

/**
 * Get whether any reports have pending fixes.
 *
 * @param results - Results of the validation run.
 * @param errorsOnly - Whether to only consider errors for pending fixes.
 * @returns Whether there are fixes pending.
 */
export function hasFixes(
  results: ValidatorResults,
  errorsOnly?: boolean,
): boolean {
  return results.reports.some((report) => isReportFixable(report, errorsOnly));
}
