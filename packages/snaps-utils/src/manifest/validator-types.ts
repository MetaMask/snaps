import type { SnapFiles, UnvalidatedSnapFiles } from 'src/types';

import type { SnapManifest } from '.';

export type ValidatorFix = () =>
  | { manifest: SnapManifest }
  | Promise<{ manifest: SnapManifest }>;

export type ValidatorSeverity = 'error' | 'warning';

export type ValidatorContext = {
  report: (message: string, fix?: ValidatorFix) => void;
};

export type ValidatorMeta = {
  severity: ValidatorSeverity;
  /**
   * Runs the validator on unverified files to ensure that the files are structurally sound.
   *
   * @param files - Files to be verified
   * @param context - Validator context to report errors
   */
  validationCheck?: (
    files: UnvalidatedSnapFiles,
    context: ValidatorContext,
  ) => void | Promise<void>;
  /**
   * Runs the validator after the files were checked to be structurally sound.
   *
   * @param files - Files to be verified
   * @param context - Validator context to report errors
   */
  validatedCheck?: (
    files: SnapFiles,
    context: ValidatorContext,
  ) => void | Promise<void>;
};
