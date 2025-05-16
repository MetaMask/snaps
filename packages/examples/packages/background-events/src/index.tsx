import type {
  OnCronjobHandler,
  OnRpcRequestHandler,
} from '@metamask/snaps-sdk';
import { MethodNotFoundError } from '@metamask/snaps-sdk';
import { Box, Text } from '@metamask/snaps-sdk/jsx';

import type {
  CancelDialogParams,
  ScheduleDialogParamsWithDate,
  ScheduleDialogParamsWithDuration,
} from './types';

/**
 * Handle background event execution requests from MetaMask. This handler handles one
 * method:
 *
 * - `fireDialog`: The JSON-RPC method that is called by MetaMask when the
 * background event is triggered. This method call is scheduled by the `scheduleNotification`
 * method in the `onRpcRequest` handler.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#oncronjob
 */
export const onCronjob: OnCronjobHandler = async ({ request }) => {
  switch (request.method) {
    case 'fireDialog':
      return snap.request({
        method: 'snap_dialog',
        params: {
          content: (
            <Box>
              <Text>This dialog was triggered by a background event</Text>
            </Box>
          ),
        },
      });
    default:
      throw new MethodNotFoundError({ method: request.method });
  }
};

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles four methods:
 *
 * - `scheduleDialogWithDate`: Schedule a dialog in the future with the `date` param.
 * - `scheduleDialogWithDuration`: Schedule a dialog in the future with the `duration` param.
 * - `cancelDialog`: Cancel a dialog.
 * - `getBackgroundEvents`: Get the Snap's background events.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'scheduleDialogWithDate':
      return snap.request({
        method: 'snap_scheduleBackgroundEvent',
        params: {
          date: (request.params as ScheduleDialogParamsWithDate).date,
          request: {
            method: 'fireDialog',
          },
        },
      });
    case 'scheduleDialogWithDuration':
      return snap.request({
        method: 'snap_scheduleBackgroundEvent',
        params: {
          duration: (request.params as ScheduleDialogParamsWithDuration)
            .duration,
          request: {
            method: 'fireDialog',
          },
        },
      });
    case 'cancelDialog':
      return snap.request({
        method: 'snap_cancelBackgroundEvent',
        params: {
          id: (request.params as CancelDialogParams).id,
        },
      });
    case 'getBackgroundEvents':
      return snap.request({
        method: 'snap_getBackgroundEvents',
      });
    default:
      throw new MethodNotFoundError({ method: request.method });
  }
};
