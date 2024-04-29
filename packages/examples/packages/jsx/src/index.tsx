import { rpcErrors } from '@metamask/rpc-errors';
import type {
  OnRpcRequestHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';
import { UserInputEventType, DialogType } from '@metamask/snaps-sdk';
import { assert } from '@metamask/utils';

import { Counter } from './components';
import { getCurrent, increment } from './utils';

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'increment': {
      const count = await getCurrent();

      return await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: <Counter count={count} />,
        },
      });
    }

    default:
      throw rpcErrors.methodNotFound({
        data: {
          method: request.method,
        },
      });
  }
};

export const onUserInput: OnUserInputHandler = async ({ event, id }) => {
  assert(event.type === UserInputEventType.ButtonClickEvent);
  assert(event.name === 'increment');

  const count = await increment();

  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: <Counter count={count} />,
    },
  });
};
