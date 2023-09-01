import type { OnInstallHandler, OnUpdateHandler } from '@metamask/snaps-types';
import { heading, panel, text } from '@metamask/snaps-ui';

/**
 * Handle installation of the snap. This handler is called when the snap is
 * installed, and can be used to perform any initialization that is required.'
 *
 * This handler is optional. If it is not provided, the snap will be installed
 * as usual.
 *
 * @see https://docs.metamask.io/snaps/reference/exports/#oninstall
 */
export const onInstall: OnInstallHandler = async () => {
  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: panel([
        heading('Installation successful'),
        text(
          'The snap was installed successfully, and the "onInstall" handler was called.',
        ),
      ]),
    },
  });
};

/**
 * Handle updates to the snap. This handler is called when the snap is updated,
 * and can be used to, for example, perform any migrations that are required.
 *
 * This handler is optional. If it is not provided, the snap will be updated
 * as usual.
 *
 * @see https://docs.metamask.io/snaps/reference/exports/#onupdate
 */
export const onUpdate: OnUpdateHandler = async () => {
  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: panel([
        heading('Update successful'),
        text(
          'The snap was updated successfully, and the "onUpdate" handler was called.',
        ),
      ]),
    },
  });
};
