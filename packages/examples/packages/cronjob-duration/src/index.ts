import type { OnCronjobHandler } from '@metamask/snaps-sdk';
import { NotificationType, MethodNotFoundError } from '@metamask/snaps-sdk';

/**
 * Handle cronjob execution requests from MetaMask. This handler handles one
 * method:
 *
 * - `execute`: The JSON-RPC method that is called by MetaMask when the cronjob
 * is triggered. This method is specified in the Snap manifest under the
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
      // Cronjobs can execute any method that is available to the Snap.
      return await snap.request({
        method: 'snap_notify',
        params: {
          // We're using the `NotificationType` enum here, but you can also use
          // the string values directly, e.g. `type: 'inApp'`.
          type: NotificationType.InApp,
          message:
            'This notification was triggered by a cronjob using an ISO 8601 duration.',
        },
      });
    default:
      throw new MethodNotFoundError({ method: request.method });
  }
};
