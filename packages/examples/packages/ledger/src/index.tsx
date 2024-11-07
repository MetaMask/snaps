import type {
  OnRpcRequestHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';
import { Box, Button } from '@metamask/snaps-sdk/jsx';
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

export const onUserInput: OnUserInputHandler = async () => {
  try {
    const transport = await TransportSnapsHID.request();
    const eth = new Eth(transport);
    console.log(
      await eth.signPersonalMessage(
        "44'/60'/0'/0/0",
        Buffer.from('test').toString('hex'),
      ),
    );
  } catch (error) {
    console.error(error);
  }
};
