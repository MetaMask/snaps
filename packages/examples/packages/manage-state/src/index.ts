import { rpcErrors } from '@metamask/rpc-errors';
import { OnRpcRequestHandler } from '@metamask/snaps-types';

import { SetStateParams } from './types';
import { clearState, getState, setState } from './utils';

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'setState': {
      const params = request.params as SetStateParams;
      const state = await getState();

      await setState({ ...state, ...params });
      return true;
    }

    case 'getState':
      return await getState();

    case 'clearState':
      await clearState();
      return true;

    default:
      throw rpcErrors.methodNotFound({
        data: {
          method: request.method,
        },
      });
  }
};
