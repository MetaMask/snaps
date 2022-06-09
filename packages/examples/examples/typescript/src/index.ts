import { OnMessageHandler } from '@metamask/snap-types';
import { getMessage } from './message';

export const onMessage: OnMessageHandler = (originString, requestObject) => {
  switch (requestObject.method) {
    case 'hello':
      return wallet.request({
        method: 'snap_notify',
        params: [
          {
            type: 'inapp',
            message: getMessage(originString),
          },
        ],
      });
    default:
      throw new Error('Method not found.');
  }
};
