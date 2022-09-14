import { HandlerType } from '@metamask/snap-utils';
import { SnapKeyring } from '@metamask/snap-types';

const VALIDATION_FUNCTIONS = {
  [HandlerType.OnRpcRequest]: validateFunctionExport,
  [HandlerType.OnTransaction]: validateFunctionExport,
  [HandlerType.SnapKeyring]: validateKeyringExport,
};

/**
 * Validates a function export.
 *
 * @param snapExport - The export itself.
 * @returns True if the export matches the expected shape, false otherwise.
 */
function validateFunctionExport(
  snapExport: unknown,
): snapExport is (...args: unknown[]) => unknown {
  return typeof snapExport === 'function';
}

/**
 * Validates a keyring export.
 *
 * @param snapExport - The export itself.
 * @returns True if the export matches the expected shape, false otherwise.
 */
function validateKeyringExport(snapExport: unknown): snapExport is SnapKeyring {
  // TODO Decide whether we want more validation
  return typeof snapExport === 'object';
}

/**
 * Validates a given snap export.
 *
 * @param type - The type of export expected.
 * @param snapExport - The export itself.
 * @returns True if the export matches the expected shape, false otherwise.
 */
export function validateExport(type: HandlerType, snapExport: unknown) {
  const validationFunction = VALIDATION_FUNCTIONS[type];
  return validationFunction?.(snapExport) ?? false;
}
