import Eth from '@ledgerhq/hw-app-eth';
import type {
  OnRpcRequestHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';
import { MethodNotFoundError } from '@metamask/snaps-sdk';
import { Box, Button, Text, Copyable } from '@metamask/snaps-sdk/jsx';
import { bytesToHex, stringToBytes } from '@metamask/utils';

import { ConnectHID, Unsupported } from './components';
import TransportSnapsHID from './transport';
import { signatureToHex } from './utils';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles one method:
 *
 * - `request`: Display a dialog with a button to request a Ledger device. This
 * demonstrates how to request a device using Snaps, and how to handle user
 * input events, in order to sign a message with the device.
 *
 * Note that this only works in browsers that support the WebHID API, and
 * the Ledger device must be connected and unlocked.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'request': {
      const Component = (await TransportSnapsHID.isSupported())
        ? ConnectHID
        : Unsupported;

      return snap.request({
        method: 'snap_dialog',
        params: {
          content: <Component />,
        },
      });
    }

    default:
      throw new MethodNotFoundError({
        method: request.method,
      });
  }
};

/**
 * Handle incoming user events coming from the Snap interface. This handler
 * handles one event:
 *
 * - `connect-hid`: Request a Ledger device, sign a message, and display the
 * signature in the Snap interface.
 *
 * @param params - The event parameters.
 * @param params.id - The Snap interface ID where the event was fired.
 * @see https://docs.metamask.io/snaps/reference/exports/#onuserinput
 */
export const onUserInput: OnUserInputHandler = async ({ id }) => {
  // TODO: Handle errors (i.e., Ledger locked, disconnected, etc.)
  const transport = await TransportSnapsHID.request();
  const eth = new Eth(transport);

  // TODO: Make this message configurable.
  const message = 'test';
  const { address } = await eth.getAddress("44'/60'/0'/0/0");

  const signature = await eth.signPersonalMessage(
    "44'/60'/0'/0/0",
    bytesToHex(stringToBytes(message)),
  );

  const signatureHex = signatureToHex(signature);
  const signatureObject = {
    address,
    message,
    signature: signatureHex,
  };

  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: (
        <Box>
          <Button>Request Devices</Button>
          <Text>Signature:</Text>
          <Copyable value={signatureHex} />
          <Text>JSON:</Text>
          <Copyable value={JSON.stringify(signatureObject, null, 2)} />
        </Box>
      ),
    },
  });
};
