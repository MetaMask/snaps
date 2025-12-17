import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { DialogType, MethodNotFoundError } from '@metamask/snaps-sdk';
import { Box, Text, Image } from '@metamask/snaps-sdk/jsx';
import { renderSVG } from 'uqr';

import pngIcon from './images/icon.png';
import svgIcon from './images/icon.svg';

/**
 * The parameters for the `getQrCode` method.
 *
 * @property data - The data to encode in the QR code.
 */
type GetQrCodeParams = {
  data: string;
};

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles two methods:
 *
 * - `getQrCode`: Show a QR code to the user. The QR code is generated using
 * the `uqr` library, and rendered using the `Image` component.
 * - `getCat`: Show a cat to the user using an external image.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_dialog
 * @see https://docs.metamask.io/snaps/how-to/use-custom-ui/#image
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'getQrCode': {
      const { data } = request.params as GetQrCodeParams;

      // `renderSVG` returns a `<svg>` element as a string, which can be
      // rendered using the `Image` component.
      const qr = renderSVG(data);

      return await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: (
            <Box>
              <Text>The following is a QR code for the data "{data}":</Text>
              <Image src={qr} />
            </Box>
          ),
        },
      });
    }

    case 'getCat': {
      return await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: (
            <Box>
              <Text>Enjoy your cat!</Text>
              <Image src="https://cataas.com/cat" width={400} height={400} />
            </Box>
          ),
        },
      });
    }

    case 'getSvgIcon': {
      return await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,

          // `.svg` files are imported as strings, so they can be used directly
          // with the `Image` component.
          content: (
            <Box>
              <Text>Here is an SVG icon:</Text>
              <Image src={svgIcon} />
            </Box>
          ),
        },
      });
    }

    case 'getPngIcon': {
      return await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,

          // `.png` files are imported as SVGs containing an `<image>` tag,
          // so they can be used directly with the `Image` component.
          content: (
            <Box>
              <Text>Here is a PNG icon:</Text>
              <Image src={pngIcon} />
            </Box>
          ),
        },
      });
    }

    default:
      throw new MethodNotFoundError({ method: request.method });
  }
};
