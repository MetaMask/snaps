import type { SnapManifest } from './validation';
import type { Promisable } from '../promise';
import type { SnapFiles, UnvalidatedSnapFiles } from '../types';

export type ValidatorFix = (files: {
  manifest: SnapManifest;
}) => Promisable<{ manifest: SnapManifest }>;

/**
 * The options for the validator context.
 */
export type ValidatorContextOptions = {
  /**
   * An object containing the names of the handlers and their respective
   * permission name. This must be provided to avoid circular dependencies
   * between `@metamask/snaps-utils` and `@metamask/snaps-rpc-methods`.
   */
  handlerEndowments?: Record<string, string | null>;

  /**
   * Exports detected by evaluating the bundle. This may be used by one or more
   * validators to determine whether the snap is valid.
   */
  exports?: string[];
};

export type ValidatorSeverity = 'error' | 'warning';

export type ValidatorContext = {
  readonly report: (message: string, fix?: ValidatorFix) => void;
  readonly options: ValidatorContextOptions;
};

export type ValidatorReport = {
  severity: ValidatorSeverity;
  message: string;
  fix?: ValidatorFix;
};

export type ValidatorMeta = {
  severity: ValidatorSeverity;

  /**
   * 1. Run the validator on unverified files to ensure that the files are structurally sound.
   *
   * @param files - Files to be verified
   * @param context - Validator context to report errors
   */
  structureCheck?: (
    files: UnvalidatedSnapFiles,
    context: ValidatorContext,
  ) => void | Promise<void>;

  /**
   * 2. Run the validator after the files were checked to be structurally sound.
   *
   * @param files - Files to be verified
   * @param context - Validator context to report errors
   */
  semanticCheck?: (
    files: SnapFiles,
    context: ValidatorContext,
  ) => void | Promise<void>;
};
