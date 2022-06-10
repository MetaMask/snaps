import { OnRpcMessageHandler } from '@metamask/snap-types';
import { getMessage } from './message';

export const onRpcMessage: OnRpcMessageHandler = ({ origin, request }) => {
  switch (request.method) {
    case 'hello':
      return wallet.request({
        method: 'snap_notify',
        params: [
          {
            type: 'inapp',
            message: getMessage(origin),
          },
        ],
      });
    default:
      throw new Error('Method not found.');
  }
};
