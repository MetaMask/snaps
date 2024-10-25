import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { MethodNotFoundError } from '@metamask/snaps-sdk';

import TransportSnapsHID from './transport';

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'request':
      await TransportSnapsHID.request();
      return null;

    default:
      throw new MethodNotFoundError({
        method: request.method,
      });
  }
};
