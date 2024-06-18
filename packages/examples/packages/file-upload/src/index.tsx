import type {
  OnRpcRequestHandler,
  OnUserInputHandler,
  File,
} from '@metamask/snaps-sdk';
import { UserInputEventType, MethodNotFoundError } from '@metamask/snaps-sdk';

import { UploadedFiles, UploadForm } from './components';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles one method:
 *
 * - `dialog`: Create a `snap_dialog` with an interactive interface. This demonstrates
 * that a snap can show an interactive `snap_dialog` that the user can interact with.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'dialog': {
      await snap.request({
        method: 'snap_manageState',
        params: {
          operation: 'update',
          newState: {
            files: [],
          },
        },
      });

      return await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: <UploadForm files={[]} />,
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
 * Handle incoming user events coming from the MetaMask clients open interfaces.
 *
 * @param params - The event parameters.
 * @param params.id - The Snap interface ID where the event was fired.
 * @param params.event - The event object containing the event type, name, and
 * value.
 * @see https://docs.metamask.io/snaps/reference/exports/#onuserinput
 */
export const onUserInput: OnUserInputHandler = async ({ id, event }) => {
  if (
    event.type === UserInputEventType.ButtonClickEvent &&
    event.name === 'back'
  ) {
    await snap.request({
      method: 'snap_updateInterface',
      params: {
        id,
        ui: <UploadForm files={[]} />,
      },
    });
    return;
  }

  if (
    event.type === UserInputEventType.FileUploadEvent &&
    event.file !== null
  ) {
    const { files } = (await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'get',
      },
    })) as { files: File[] };

    await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'update',
        newState: {
          files: [...files, event.file],
        },
      },
    });

    await snap.request({
      method: 'snap_updateInterface',
      params: {
        id,
        ui: <UploadForm files={[...files, event.file]} />,
      },
    });
    return;
  }

  if (event.type === UserInputEventType.FormSubmitEvent) {
    await snap.request({
      method: 'snap_updateInterface',
      params: {
        id,
        ui: <UploadedFiles file={event.files.file} />,
      },
    });
  }
};
