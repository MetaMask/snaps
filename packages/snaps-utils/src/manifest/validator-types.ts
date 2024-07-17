import type { SnapFiles, UnvalidatedSnapFiles } from '../types';
import type { SnapManifest } from './validation';

// TODO(ritave): Research using patch based fixing similar to eslint
//               https://eslint.org/docs/latest/extend/custom-rules#applying-fixes
export type ValidatorFix = (files: {
  manifest: SnapManifest;
}) => { manifest: SnapManifest } | Promise<{ manifest: SnapManifest }>;

export type ValidatorSeverity = 'error' | 'warning';

export type ValidatorContext = {
  report: (message: string, fix?: ValidatorFix) => void;
};

export type ValidatorReport = {
  severity: ValidatorSeverity;
  message: string;
  fix?: ValidatorFix;
};

export type ValidatorMeta = {
  severity: ValidatorSeverity;
  /**
   * Runs the validator on unverified files to ensure that the files are structurally sound.
   *
   * @param files - Files to be verified
   * @param context - Validator context to report errors
   */
  structureCheck?: (
    files: UnvalidatedSnapFiles,
    context: ValidatorContext,
  ) => void | Promise<void>;
  /**
   * Runs the validator after the files were checked to be structurally sound.
   *
   * @param files - Files to be verified
   * @param context - Validator context to report errors
   */
  semanticCheck?: (
    files: SnapFiles,
    context: ValidatorContext,
  ) => void | Promise<void>;
};
