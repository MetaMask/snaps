import { MethodNotFoundError, NotificationType } from '@metamask/snaps-sdk';
import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { Box, Row, Address } from '@metamask/snaps-sdk/jsx';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles three methods:
 *
 * - `inApp`: Show an in-app notification to the user.
 * - `native`: Show a desktop notification to the user.
 * - `inApp-expanded`: Show an expanded view in-app notification to the user.
 *
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_notify
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'inApp':
      return await snap.request({
        method: 'snap_notify',
        params: {
          // We're using the `NotificationType` enum here, but you can also use
          // the string values directly, e.g. `type: 'inApp'`.
          type: NotificationType.InApp,
          message: `Hello from within MetaMask! [This](https://snaps.metamask.io/) is a what a link looks like.`,
        },
      });

    case 'native':
      return await snap.request({
        method: 'snap_notify',
        params: {
          // We're using the `NotificationType` enum here, but you can also use
          // the string values directly, e.g. `type: 'native'`.
          type: NotificationType.Native,
          message: `Hello from the browser!`,
        },
      });

    case 'inApp-expanded':
      return await snap.request({
        method: 'snap_notify',
        params: {
          type: NotificationType.InApp,
          message: 'Hello from MetaMask, click here for an expanded view!',
          title: 'Hello World!',
          content: (
            <Box>
              <Row
                label="From"
                variant="warning"
                tooltip="This address has been deemed dangerous."
              >
                <Address address="0x1234567890123456789012345678901234567890" />
              </Row>
            </Box>
          ),
          footerLink: { text: 'Go home', href: 'metamask://client/' },
        },
      });

    default:
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw new MethodNotFoundError({ method: request.method });
  }
};
