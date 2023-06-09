import { OnRpcRequestHandler } from '@metamask/snaps-types';

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case 'inApp':
      return snap.request({
        method: 'snap_notify',
        params: {
          type: 'inApp',
          message: `TEST INAPP NOTIFICATION`,
        },
      });
    case 'native':
      return snap.request({
        method: 'snap_notify',
        params: {
          type: 'native',
          message: `Hello, ${origin}!`,
        },
      });
    default:
      throw new Error('Method not found.');
  }
};
