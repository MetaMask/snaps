import type { OnInstallHandler, OnUpdateHandler } from '@metamask/snaps-sdk';
import { Box, Text } from '@metamask/snaps-sdk/jsx';

/**
 * Handle installation of the snap. This handler is called when the snap is
 * installed, and can be used to perform any initialization that is required.'
 *
 * This handler is optional. If it is not provided, the snap will be installed
 * as usual.
 *
 * @see https://docs.metamask.io/snaps/reference/exports/#oninstall
 * @returns The JSON-RPC response.
 */
export const onInstall: OnInstallHandler = async () => {
  return await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: (
        <Box>
          <Text>
            The Snap was installed successfully, and the "onInstall" handler was
            called.
          </Text>
        </Box>
      ),
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
 * @returns The JSON-RPC response.
 */
export const onUpdate: OnUpdateHandler = async () => {
  return await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: (
        <Box>
          <Text>
            The Snap was updated successfully, and the "onUpdate" handler was
            called.
          </Text>
        </Box>
      ),
    },
  });
};
