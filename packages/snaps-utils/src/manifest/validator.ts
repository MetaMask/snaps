import { assert } from '@metamask/utils';

import type { SnapFiles, UnvalidatedSnapFiles } from '../types';
import type {
  ValidatorContext,
  ValidatorFix,
  ValidatorMeta,
  ValidatorSeverity,
} from './validator-types';
import * as defaultValidators from './validators';

type ValidatorResults = {
  files?: SnapFiles;
  warnings: string[];
  errors: string[];
  fixes: ValidatorFix[];
};

class Context implements ValidatorContext {
  report(message: string, fix?: ValidatorFix): void {
    assert(this.nextSeverity !== undefined);
    if (this.nextSeverity === 'error') {
      this.#hasErrors = true;
    }
    this.#reports.push({ severity: this.nextSeverity, message, fix });
  }

  warnings(): string[] {
    return this.#reports
      .filter(({ severity }) => severity === 'warning')
      .map(({ message }) => message);
  }

  errors(): string[] {
    return this.#reports
      .filter(({ severity }) => severity === 'error')
      .map(({ message }) => message);
  }

  fixes(): ValidatorFix[] {
    return this.#reports
      .filter(({ fix }) => Boolean(fix))
      .map(({ fix }) => fix as ValidatorFix);
  }

  get hasErrors() {
    return this.#hasErrors;
  }

  nextSeverity: ValidatorSeverity | undefined = undefined;

  #hasErrors = false;

  #reports: {
    severity: ValidatorSeverity;
    message: string;
    fix?: ValidatorFix;
  }[] = [];
}

/**
 * Verifies that snap files are completely valid.
 * First it runs validators on unparsed files to check structure.
 * Secondly it runs validators on parsed files to check semantics.
 *
 * @param files - All files required to run a snap.
 * @param rules - Validators to run.
 */
// TODO(ritave): snap.manifest.json and package.json should check
//               json parsing as well instead of assuming it's
//               already parsed
export async function runValidators(
  files: UnvalidatedSnapFiles,
  rules: ValidatorMeta[] = Object.values(defaultValidators),
): Promise<ValidatorResults> {
  const context = new Context();

  for (const rule of rules) {
    context.nextSeverity = rule.severity;
    await rule.structureCheck?.(files, context);
  }
  if (context.hasErrors) {
    return {
      warnings: context.warnings(),
      errors: context.errors(),
      fixes: context.fixes(),
    };
  }

  for (const rule of rules) {
    context.nextSeverity = rule.severity;
    await rule.semanticCheck?.(files as SnapFiles, context);
  }
  return {
    files: files as SnapFiles,
    warnings: context.warnings(),
    errors: context.errors(),
    fixes: context.fixes(),
  };
}
