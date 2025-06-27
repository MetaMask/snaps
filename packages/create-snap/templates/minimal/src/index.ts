import { OnRpcRequestHandler } from '@metamask/snaps-sdk';

export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
  console.log(`Received request from ${origin}:`, request);

  switch (request.method) {
    case 'method':
      return { result: 'This is an example response.' };

    default: {
      throw new Error(`Method not found: ${request.method}`);
    }
  }
};
