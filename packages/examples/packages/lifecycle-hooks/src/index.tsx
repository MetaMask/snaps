import type {
  OnActiveHandler,
  OnInstallHandler,
  OnStartHandler,
  OnUpdateHandler,
} from '@metamask/snaps-sdk';
import { Box, Text } from '@metamask/snaps-sdk/jsx';

/**
 * Handle starting of the client. This handler is called when the client is
 * started, and can be used to perform any initialization that is required.
 *
 * This handler is optional. If it is not provided, the Snap will be started
 * as usual.
 *
 * @see https://docs.metamask.io/snaps/reference/entry-points/#onstart
 * @returns The JSON-RPC response.
 */
export const onStart: OnStartHandler = async () => {
  return await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: (
        <Box>
          <Text>
            The client was started successfully, and the "onStart" handler was
            called.
          </Text>
        </Box>
      ),
    },
  });
};

/**
 * Handle installation of the snap. This handler is called when the snap is
 * installed, and can be used to perform any initialization that is required.'
 *
 * This handler is optional. If it is not provided, the snap will be installed
 * as usual.
 *
 * @see https://docs.metamask.io/snaps/reference/entry-points/#oninstall
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
 * @see https://docs.metamask.io/snaps/reference/entry-points/#onupdate
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

/**
 * Handle activation of the client. This handler is called when the client is
 * activated, and can be used to perform any initialization that is required.
 *
 * This handler is optional.
 *
 * @see https://docs.metamask.io/snaps/reference/entry-points/#onactive
 * @returns The JSON-RPC response.
 */
export const onActive: OnActiveHandler = async () => {
  return await snap.request({
    method: 'snap_notify',
    params: {
      type: 'inApp',
      message:
        'The client was activated, and the "onActive" handler was called.',
    },
  });
};

/**
 * Handle deactivation of the client. This handler is called when the client
 * is deactivated, and can be used to perform any cleanup that is required.
 *
 * This handler is optional.
 *
 * @see https://docs.metamask.io/snaps/reference/entry-points/#oninactive
 * @returns The JSON-RPC response.
 */
export const onInactive = async () => {
  return await snap.request({
    method: 'snap_notify',
    params: {
      type: 'inApp',
      message:
        'The client was deactivated, and the "onInactive" handler was called.',
    },
  });
};
