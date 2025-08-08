import type { InitialPermissions } from '@metamask/snaps-sdk';

import type { ValidatorMeta } from '../validator-types';

// Special case endowments that should be ignored.
const IGNORED_ENDOWMENTS = ['endowment:network-access'];

/**
 * Check if the Snap exports handlers that are not requested in the manifest, or
 * if the Snap requests permissions for handlers that are not exported.
 */
export const unusedExports: ValidatorMeta = {
  severity: 'warning',
  semanticCheck(files, context) {
    const { handlerEndowments, exports } = context.options ?? {};

    // The handler endowments or exports must be provided for this check to be
    // performed.
    if (!handlerEndowments || !exports) {
      return;
    }

    // Endowments used based on the exports from the Snap. This is used to
    // filter endowments that are used by multiple handlers, e.g., the lifecycle
    // handlers.
    const usedEndowments = Object.entries(handlerEndowments)
      .filter(
        ([handler, endowment]) =>
          endowment === null || exports.includes(handler),
      )
      .map(([, endowment]) => endowment);

    const unusedHandlers = Object.entries(handlerEndowments)
      .filter(([handler, endowment]) => {
        if (endowment === null) {
          return false;
        }

        return (
          exports.includes(handler) &&
          !files.manifest.result.initialPermissions[
            endowment as keyof InitialPermissions
          ]
        );
      })
      .map(([handler, endowment]) => `${handler} (${endowment})`);

    const unusedEndowments = Object.entries(handlerEndowments).filter(
      ([handler, endowment]) => {
        if (endowment === null || IGNORED_ENDOWMENTS.includes(endowment)) {
          return false;
        }

        return (
          !usedEndowments.includes(endowment) &&
          files.manifest.result.initialPermissions[
            endowment as keyof InitialPermissions
          ] &&
          !exports.includes(handler)
        );
      },
    );

    if (unusedHandlers.length > 0) {
      // We don't specify a fix function here, because:
      // 1. Removing the export from the Snap bundle is complicated, as it
      //    requires AST manipulation.
      // 2. Adding the permission to the manifest is not always possible, as it
      //    may require additional configuration in the manifest.
      context.report(
        `unused-exports`,
        `The Snap exports the following handlers, but does not request permission for them: ${unusedHandlers.join(
          ', ',
        )}.`,
      );
    }

    if (unusedEndowments.length > 0) {
      const formattedEndowments = unusedEndowments
        .map(([handler, endowment]) => `${handler} (${endowment})`)
        .join(', ');

      context.report(
        `unused-endowments`,
        `The Snap requests permission for the following handlers, but does not export them: ${formattedEndowments}.`,
        ({ manifest }) => {
          unusedEndowments.forEach(([, endowment]) => {
            delete manifest.initialPermissions[
              endowment as keyof InitialPermissions
            ];
          });

          return { manifest };
        },
      );
    }
  },
};
