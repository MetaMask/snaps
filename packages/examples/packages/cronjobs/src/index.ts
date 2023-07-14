import { rpcErrors } from '@metamask/rpc-errors';
import type { OnCronjobHandler } from '@metamask/snaps-types';
import { panel, text, heading } from '@metamask/snaps-ui';

/**
 * Handle cronjob execution requests from MetaMask. This handler handles one
 * method:
 *
 * - `execute`: The JSON-RPC method that is called by MetaMask when the cronjob
 * is triggered. This method is specified in the snap manifest under the
 * `endowment:cronjob` permission. If you want to support more methods (e.g.,
 * with different times), you can add them to the manifest there.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#oncronjob
 */
export const onCronjob: OnCronjobHandler = async ({ request }) => {
  switch (request.method) {
    case 'execute':
      // Cronjobs can execute any method that is available to the snap.
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: panel([
            heading('Cronjob'),
            text('This dialog was triggered by a cronjob.'),
          ]),
        },
      });
    default:
      throw rpcErrors.methodNotFound({
        data: {
          method: request.method,
        },
      });
  }
};
