import type {
  OnRpcRequestHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';
import { Box, Button, Text, Copyable } from '@metamask/snaps-sdk/jsx';
import { MethodNotFoundError } from '@metamask/snaps-sdk';
import Eth from '@ledgerhq/hw-app-eth';

import TransportSnapsHID from './transport';

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'request': {
      return snap.request({
        method: 'snap_dialog',
        params: {
          content: (
            <Box>
              <Button>Request Devices</Button>
            </Box>
          ),
        },
      });
    }

    default:
      throw new MethodNotFoundError({
        method: request.method,
      });
  }
};

function hexlifySignature(signature: { r: string; s: string; v: number }) {
  const adjustedV = signature.v - 27;
  let hexlifiedV = adjustedV.toString(16);
  if (hexlifiedV.length < 2) {
    hexlifiedV = '0' + hexlifiedV;
  }
  return `0x${signature.r}${signature.s}${hexlifiedV}`;
}

export const onUserInput: OnUserInputHandler = async ({ id }) => {
  try {
    const transport = await TransportSnapsHID.request();
    const eth = new Eth(transport);
    const msg = 'test';
    const { address } = await eth.getAddress("44'/60'/0'/0/0");
    const signature = await eth.signPersonalMessage(
      "44'/60'/0'/0/0",
      Buffer.from(msg).toString('hex'),
    );

    const signatureHex = hexlifySignature(signature);
    const message = {
      address,
      msg,
      sig: signatureHex,
      version: 2,
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
            <Copyable value={JSON.stringify(message, null, 2)} />
          </Box>
        ),
      },
    });
  } catch (error) {
    console.error(error);
  }
};
