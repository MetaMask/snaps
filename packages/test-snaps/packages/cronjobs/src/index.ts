import { OnCronjobHandler } from '@metamask/snaps-types';
import { panel, text, heading } from '@metamask/snaps-ui';

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  switch (request.method) {
    case 'fireCronjob':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: panel([heading('Cronjob'), text('fired')]),
        },
      });
    default:
      throw new Error('Method not found.');
  }
};
