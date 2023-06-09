import { DialogType } from '@metamask/rpc-methods';
import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text, heading } from '@metamask/snaps-ui';

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'dialogAlert':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: panel([heading('Alert Dialog'), text('Text here')]),
        },
      });
    case 'dialogConf':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Confirmation,
          content: panel([heading('Confirmation Dialog'), text('Text here')]),
        },
      });
    case 'dialogPrompt':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Prompt,
          content: panel([heading('Prompt Dialog'), text('Text here')]),
          placeholder: 'placeholder',
        },
      });
    default:
      throw new Error('Method not found.');
  }
};
